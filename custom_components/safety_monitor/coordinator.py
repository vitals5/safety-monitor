"""Sensor Coordinator and Hazard State Machine for Safety Monitor."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import logging
from typing import Any, Callable

from homeassistant.const import (
    ATTR_DEVICE_CLASS,
    ATTR_FRIENDLY_NAME,
    STATE_OFF,
    STATE_ON,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_call_later, async_track_state_change_event

from .actions import ActionEngine, SmartHazardType, HAZARD_DISPLAY_NAMES

try:
    from homeassistant.util import dt as dt_util
except Exception:
    dt_util = None
from .const import (
    DEFAULT_BATTERY_LOW_THRESHOLD,
    DEFAULT_DOUBLE_KNOCK_TIMEOUT,
    DEFAULT_SILENCE_DURATION,
    DEFAULT_TEST_MODE_DURATION,
    EVENT_SAFETY_ALARM_RESET,
    EVENT_SAFETY_ALARM_SILENCED,
    EVENT_SAFETY_ALARM_TRIGGERED,
    EVENT_SAFETY_BATTERY_LOW,
    EVENT_SAFETY_SENSOR_OFFLINE,
    EVENT_SAFETY_SENSOR_ONLINE,
    EVENT_SAFETY_SENSOR_TRIGGERED,
    EVENT_SAFETY_STATE_CHANGED,
    EVENT_SAFETY_TEST_MODE_CHANGED,
    HAZARD_DEVICE_CLASSES,
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_CUTOFF,
    PHASE_NOTIFICATION,
    PHASE_RESTORE,
    PHASE_SYSTEM,
    SIGNAL_SAFETY_MONITOR_STATE_CHANGED,
    SIGNAL_SAFETY_MONITOR_UPDATED,
    STATE_NORMAL,
    STATE_PRE_ALARM,
    STATE_SILENCED,
    STATE_TESTING,
    STATE_TRIGGERED,
    TYPE_GENERIC,
)
from .store import SafetyStorage

_LOGGER = logging.getLogger(__name__)


class SafetyCoordinator:
    """Central hazard coordinator and state machine."""

    def __init__(
        self, hass: HomeAssistant, store: SafetyStorage, actions: ActionEngine
    ) -> None:
        """Initialize the coordinator."""
        self.hass = hass
        self.store = store
        self.actions = actions

        self._state: str = STATE_NORMAL
        self._active_triggers: dict[str, dict[str, Any]] = {}
        self._last_trigger: dict[str, Any] | None = None

        # Timers
        self._pre_alarm_timers: dict[str, CALLBACK_TYPE] = {}
        self._pre_alarm_expires: dict[str, float] = {}
        self._double_knock_timers: dict[str, CALLBACK_TYPE] = {}
        self._double_knock_first_sensors: dict[str, str] = {}
        self._silence_timer: CALLBACK_TYPE | None = None
        self._test_mode_timer: CALLBACK_TYPE | None = None
        self._repeating_action_timers: dict[str, tuple[CALLBACK_TYPE, str]] = {}

        # State tracking listeners
        self._sensor_unsub: CALLBACK_TYPE | None = None
        self._offline_sensors: set[str] = set()
        self._ignored_sensors: set[str] = set()
        self._sensor_batteries: dict[str, dict[str, Any]] = {}
        self._low_battery_sensors: dict[str, dict[str, Any]] = {}
        self._notified_low_batteries: set[str] = set()

    @property
    def state(self) -> str:
        """Return the current hazard state."""
        return self._state

    @property
    def active_triggers(self) -> dict[str, dict[str, Any]]:
        """Return currently active triggered sensors."""
        return self._active_triggers

    @property
    def last_trigger(self) -> dict[str, Any] | None:
        """Return details of the last triggered hazard."""
        return self._last_trigger

    @property
    def offline_sensors(self) -> list[str]:
        """Return list of unavailable monitored sensors."""
        return list(self._offline_sensors)

    @property
    def ignored_sensors(self) -> list[str]:
        """Return list of currently ignored/muted sensor entity IDs."""
        return list(self._ignored_sensors)

    @property
    def sensor_batteries(self) -> dict[str, dict[str, Any]]:
        """Return cached battery states for all monitored sensors."""
        return self._sensor_batteries

    @property
    def low_battery_sensors(self) -> dict[str, dict[str, Any]]:
        """Return sensors reporting low battery levels."""
        return self._low_battery_sensors

    async def async_setup(self) -> None:
        """Set up listeners and perform initial state scan."""
        await self.async_update_listeners()
        # Scan initial states of monitored sensors
        self._async_scan_initial_states()
        self._async_check_all_batteries()

    async def async_update_listeners(self) -> None:
        """Re-bind event listener to all configured sensors and battery entities."""
        if self._sensor_unsub is not None:
            self._sensor_unsub()
            self._sensor_unsub = None

        monitored_sensors = self.store.async_get_sensors()
        entities: set[str] = set()
        for entity_id, cfg in monitored_sensors.items():
            if cfg.get("enabled", True):
                entities.add(entity_id)
                bat_eid = cfg.get("battery_entity")
                if bat_eid:
                    entities.add(bat_eid)

        if entities:
            self._sensor_unsub = async_track_state_change_event(
                self.hass, list(entities), self._async_on_sensor_state_change
            )
            _LOGGER.debug(
                "Tracking state changes for %d safety entities: %s",
                len(entities),
                entities,
            )
        self._async_check_all_batteries()

    def _async_check_sensor_battery(
        self, entity_id: str, sensor_cfg: dict[str, Any] | None = None
    ) -> None:
        """Scan and cache battery level for a monitored sensor."""
        if sensor_cfg is None:
            sensor_cfg = self.store.async_get_sensor(entity_id) or {}

        battery_eid = sensor_cfg.get("battery_entity")
        battery_level: float | None = None

        # If sensor entity itself is unavailable or unknown, skip battery check
        main_st = self.hass.states.get(entity_id)
        if main_st and main_st.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            return

        # 1. Configured battery entity
        if battery_eid:
            st = self.hass.states.get(battery_eid)
            if st and st.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN) and isinstance(st.state, (int, float, str)):
                try:
                    battery_level = float(st.state)
                except (ValueError, TypeError):
                    pass

        # 2. Check attributes of sensor entity itself
        if battery_level is None:
            st = self.hass.states.get(entity_id)
            if st and st.attributes:
                for attr in ("battery_level", "battery", "battery_state"):
                    val = st.attributes.get(attr)
                    if val is not None and isinstance(val, (int, float, str)):
                        try:
                            battery_level = float(val)
                            battery_eid = f"{entity_id} ({attr})"
                            break
                        except (ValueError, TypeError):
                            pass

        # 3. Automatic sibling entity search in HA states
        if battery_level is None:
            base_name = entity_id.split(".")[-1]
            try:
                for s in self.hass.states.async_all("sensor"):
                    s_eid = s.entity_id
                    s_dev_class = s.attributes.get(ATTR_DEVICE_CLASS)
                    if (s_dev_class == "battery" or s_eid.endswith("_battery") or s_eid.endswith("_batterie")) and (
                        base_name in s_eid
                    ):
                        if s.state not in (STATE_UNAVAILABLE, STATE_UNKNOWN) and isinstance(s.state, (int, float, str)):
                            try:
                                battery_level = float(s.state)
                                battery_eid = s_eid
                                break
                            except (ValueError, TypeError):
                                pass
            except Exception:
                pass

        settings = self.store.async_get_settings()
        threshold = float(settings.get("battery_threshold", DEFAULT_BATTERY_LOW_THRESHOLD))

        if battery_level is not None:
            is_low = battery_level < threshold
            self._sensor_batteries[entity_id] = {
                "level": round(battery_level, 1),
                "battery_entity": battery_eid or entity_id,
                "low": is_low,
            }
            if is_low:
                self._low_battery_sensors[entity_id] = {
                    "level": round(battery_level, 1),
                    "name": sensor_cfg.get("name", entity_id),
                    "battery_entity": battery_eid or entity_id,
                }
                if (
                    entity_id not in self._notified_low_batteries
                    and settings.get("heartbeat_alert_battery", True)
                ):
                    self._notified_low_batteries.add(entity_id)
                    self.hass.async_create_task(
                        self._async_notify_system_alert(
                            event_type="battery_low",
                            entity_id=entity_id,
                            sensor_cfg=sensor_cfg,
                            battery_level=round(battery_level, 1),
                            threshold=threshold,
                            battery_eid=battery_eid,
                        )
                    )
            else:
                self._low_battery_sensors.pop(entity_id, None)
                self._notified_low_batteries.discard(entity_id)
        else:
            self._sensor_batteries.pop(entity_id, None)
            self._low_battery_sensors.pop(entity_id, None)
            self._notified_low_batteries.discard(entity_id)

    def _async_check_all_batteries(self) -> None:
        """Scan battery levels for all monitored sensors."""
        monitored = self.store.async_get_sensors()
        for entity_id, cfg in monitored.items():
            if cfg.get("enabled", True):
                self._async_check_sensor_battery(entity_id, cfg)

    @callback
    def _async_scan_initial_states(self) -> None:
        """Check initial states of all monitored sensors upon startup."""
        monitored = self.store.async_get_sensors()
        for entity_id, cfg in monitored.items():
            if not cfg.get("enabled", True):
                continue
            st = self.hass.states.get(entity_id)
            if not st:
                self._offline_sensors.add(entity_id)
                continue
            if st.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
                self._offline_sensors.add(entity_id)
            elif st.state == STATE_ON:
                # Sensor is already ON at startup
                self.hass.async_create_task(
                    self._async_handle_sensor_trigger(entity_id, st)
                )

    async def _async_on_sensor_state_change(self, event: Event) -> None:
        """Handle state change event for a monitored sensor or battery entity."""
        entity_id = event.data.get("entity_id")
        new_state = event.data.get("new_state")
        if new_state is None:
            return

        monitored = self.store.async_get_sensors()
        is_monitored_hazard = entity_id in monitored

        if not is_monitored_hazard:
            # Check if this is a battery entity belonging to one of our monitored sensors
            updated_any = False
            for m_eid, cfg in monitored.items():
                if cfg.get("battery_entity") == entity_id:
                    self._async_check_sensor_battery(m_eid, cfg)
                    updated_any = True
            if updated_any:
                self._async_notify_update()
            return

        # Monitored hazard sensor: Update battery if reporting via attribute
        sensor_cfg = monitored.get(entity_id) or {}
        self._async_check_sensor_battery(entity_id, sensor_cfg)

        # Check offline condition
        if new_state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            if entity_id not in self._offline_sensors:
                self._offline_sensors.add(entity_id)
                _LOGGER.warning("Monitored safety sensor became offline: %s", entity_id)
                settings = self.store.async_get_settings()
                if settings.get("heartbeat_alert_offline", True):
                    self.hass.async_create_task(
                        self._async_notify_system_alert(
                            event_type="sensor_offline",
                            entity_id=entity_id,
                            sensor_cfg=sensor_cfg,
                        )
                    )
                self._async_notify_update()
            return
        elif entity_id in self._offline_sensors:
            self._offline_sensors.discard(entity_id)
            _LOGGER.info("Monitored safety sensor came back online: %s", entity_id)
            sensor_name = sensor_cfg.get("name", entity_id)
            self.hass.bus.async_fire(
                EVENT_SAFETY_SENSOR_ONLINE,
                {"entity_id": entity_id, "name": sensor_name},
            )
            self.hass.async_create_task(
                self.store.async_add_history(
                    {
                        "event": "sensor_online",
                        "entity_id": entity_id,
                        "name": sensor_name,
                        "details": f"Melder {sensor_name} ist wieder online",
                    }
                )
            )
            self._async_notify_update()

        # Check hazard state transitions
        if new_state.state == STATE_ON:
            await self._async_handle_sensor_trigger(entity_id, new_state)
        elif new_state.state == STATE_OFF:
            await self._async_handle_sensor_clear(entity_id, new_state)

    async def _async_handle_sensor_trigger(
        self, entity_id: str, state_obj: Any
    ) -> None:
        """Process sensor entering STATE_ON (hazard detected)."""
        sensor_cfg = self.store.async_get_sensor(entity_id)
        if not sensor_cfg or not sensor_cfg.get("enabled", True):
            return

        zone_id = sensor_cfg.get("zone", "general")
        sensor_type = sensor_cfg.get("type", TYPE_GENERIC)
        sensor_name = sensor_cfg.get("name", entity_id)
        friendly_name = (
            state_obj.attributes.get(ATTR_FRIENDLY_NAME)
            if state_obj
            else sensor_name
        )

        # Operator ignore check: if sensor is marked as ignored, record trigger but do NOT escalate alarm
        if entity_id in self._ignored_sensors:
            _LOGGER.info(
                "Sensor %s triggered, but is currently marked as IGNORED by operator. Skipping alarm escalation.",
                entity_id,
            )
            trigger_data = {
                "entity_id": entity_id,
                "name": friendly_name or sensor_name,
                "type": sensor_type,
                "zone": zone_id,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ignored": True,
            }
            self._active_triggers[entity_id] = trigger_data
            self._last_trigger = trigger_data
            self._async_notify_update()
            return

        trigger_data = {
            "entity_id": entity_id,
            "name": friendly_name or sensor_name,
            "type": sensor_type,
            "zone": zone_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._active_triggers[entity_id] = trigger_data
        self._last_trigger = trigger_data

        # Record in history
        await self.store.async_add_history(
            {
                "event": "sensor_triggered",
                "entity_id": entity_id,
                "name": trigger_data["name"],
                "type": sensor_type,
                "zone": zone_id,
                "details": f"Hazard detected by {trigger_data['name']}",
            }
        )

        # Fire HA bus event
        self.hass.bus.async_fire(EVENT_SAFETY_SENSOR_TRIGGERED, trigger_data)

        # 1. Test Mode check
        if self._state == STATE_TESTING:
            _LOGGER.info(
                "[TEST MODE] Hazard detected on %s (%s). Suppressing emergency sirens and cutoffs.",
                entity_id,
                sensor_type,
            )
            # Send simulated test notification
            zone_cfg = self.store.async_get_zone(zone_id) or {}
            zone_name = zone_cfg.get("name", zone_id)
            display_hazard = HAZARD_DISPLAY_NAMES.get(sensor_type, sensor_type)
            smart_hazard = SmartHazardType(f"TEST: {display_hazard}", sensor_type)
            now = dt_util.now() if dt_util else datetime.now()
            await self.actions.async_execute_phase(
                PHASE_NOTIFICATION,
                {
                    "sensor_name": trigger_data["name"],
                    "entity_id": entity_id,
                    "zone": zone_name,
                    "zone_id": zone_id,
                    "hazard_type": smart_hazard,
                    "timestamp": now.strftime("%d.%m.%Y %H:%M:%S"),
                    "time": now.strftime("%H:%M:%S"),
                    "date": now.strftime("%d.%m.%Y"),
                    "state": STATE_TESTING,
                },
                sensor_cfg,
            )
            self._async_notify_update()
            return

        # 2. Zone / Sensor Double-Knock verification check
        zone_cfg = self.store.async_get_zone(zone_id) or {}
        double_knock_enabled = (
            sensor_cfg.get("double_knock", False)
            or zone_cfg.get("double_knock_enabled", False)
        )

        if double_knock_enabled:
            first_sensor = self._double_knock_first_sensors.get(zone_id)
            if not first_sensor:
                # First sensor triggered in this zone: Enter pre-alarm and start verification window
                _LOGGER.info(
                    "Double-knock verification: First hazard detected by %s in zone '%s'. Waiting for confirmation.",
                    entity_id,
                    zone_id,
                )
                self._double_knock_first_sensors[zone_id] = entity_id
                timeout = zone_cfg.get("double_knock_timeout", DEFAULT_DOUBLE_KNOCK_TIMEOUT)

                @callback
                def _on_double_knock_timeout(_now: Any = None) -> None:
                    _LOGGER.info(
                        "Double-knock timeout expired for zone '%s' without second confirmation. Cancelling pre-alarm.",
                        zone_id,
                    )
                    self._double_knock_first_sensors.pop(zone_id, None)
                    self._double_knock_timers.pop(zone_id, None)
                    if self._state == STATE_PRE_ALARM and not self._pre_alarm_timers:
                        self._set_state(STATE_NORMAL)

                self._double_knock_timers[zone_id] = async_call_later(
                    self.hass, timeout, _on_double_knock_timeout
                )
                self._set_state(STATE_PRE_ALARM)
                self._async_notify_update()
                return
            elif first_sensor != entity_id:
                # Second distinct sensor in the same zone confirmed within timeout!
                _LOGGER.warning(
                    "Double-knock CONFIRMED by 2nd sensor %s in zone '%s'! Escalating to TRIGGERED.",
                    entity_id,
                    zone_id,
                )
                # Cancel double-knock timer
                if zone_id in self._double_knock_timers:
                    self._double_knock_timers[zone_id]()
                    self._double_knock_timers.pop(zone_id, None)
                self._double_knock_first_sensors.pop(zone_id, None)

        # 3. Pre-Alarm Delay check
        pre_alarm_delay = sensor_cfg.get("pre_alarm_delay", 0)
        if pre_alarm_delay > 0 and self._state != STATE_TRIGGERED:
            _LOGGER.info(
                "Sensor %s has pre_alarm_delay of %d seconds. Entering PRE_ALARM.",
                entity_id,
                pre_alarm_delay,
            )
            self._set_state(STATE_PRE_ALARM)

            async def _escalate_later(_now: Any = None) -> None:
                self._pre_alarm_timers.pop(entity_id, None)
                self._pre_alarm_expires.pop(entity_id, None)
                if entity_id in self._active_triggers:
                    _LOGGER.warning(
                        "Pre-alarm countdown for %s expired! Escalating to TRIGGERED.",
                        entity_id,
                    )
                    await self._async_escalate_to_triggered(entity_id, sensor_cfg)

            self._pre_alarm_timers[entity_id] = async_call_later(
                self.hass,
                pre_alarm_delay,
                lambda now: self.hass.async_create_task(_escalate_later(now)),
            )
            self._async_notify_update()
            return

        # 4. Immediate Escalation to TRIGGERED
        await self._async_escalate_to_triggered(entity_id, sensor_cfg)

    async def _async_escalate_to_triggered(
        self, entity_id: str, sensor_cfg: dict[str, Any]
    ) -> None:
        """Escalate state to TRIGGERED and execute full action phases."""
        self._set_state(STATE_TRIGGERED)

        trigger_data = self._active_triggers.get(entity_id, {})
        raw_hazard = trigger_data.get("type", TYPE_GENERIC)
        zone_id = trigger_data.get("zone", "general")
        zone_cfg = self.store.async_get_zone(zone_id) or {}
        zone_name = zone_cfg.get("name", zone_id)

        display_hazard = HAZARD_DISPLAY_NAMES.get(raw_hazard, raw_hazard)
        smart_hazard = SmartHazardType(display_hazard, raw_hazard)
        now = dt_util.now() if dt_util else datetime.now()

        context = {
            "sensor_name": trigger_data.get("name", entity_id),
            "entity_id": entity_id,
            "zone": zone_name,
            "zone_id": zone_id,
            "hazard_type": smart_hazard,
            "timestamp": now.strftime("%d.%m.%Y %H:%M:%S"),
            "time": now.strftime("%H:%M:%S"),
            "date": now.strftime("%d.%m.%Y"),
            "state": STATE_TRIGGERED,
        }

        # Fire HA alarm triggered event
        self.hass.bus.async_fire(EVENT_SAFETY_ALARM_TRIGGERED, context)

        # Execute Escalation Phases:
        # Phase 1: Cutoff (Valves, HVAC, Emergency Blinds)
        await self.actions.async_execute_phase(PHASE_CUTOFF, context, sensor_cfg)
        # Phase 2: High-Priority Notifications
        await self.actions.async_execute_phase(PHASE_NOTIFICATION, context, sensor_cfg)
        # Phase 3: Acoustic & Optical (Sirens, Flashing Red Lights)
        await self.actions.async_execute_phase(PHASE_ACOUSTIC_OPTICAL, context, sensor_cfg)

        # Start repeating action loop for actions with repeat_interval > 0
        self._async_start_repeating_actions(context)

        self._async_notify_update()

    def _cancel_repeating_actions(self, phases: list[str] | None = None) -> None:
        """Cancel repeating action timers."""
        to_remove = []
        for aid, (unsub, phase) in self._repeating_action_timers.items():
            if phases is None or phase in phases:
                unsub()
                to_remove.append(aid)
        for aid in to_remove:
            self._repeating_action_timers.pop(aid, None)

    def _async_start_repeating_actions(self, context: dict[str, Any]) -> None:
        """Schedule and run repeating actions while alarm is active."""
        self._cancel_repeating_actions()
        actions = self.store.async_get_actions()
        hazard_type = context.get("hazard_type", "smoke")

        for action in actions:
            if not action.get("enabled", True):
                continue
            repeat_interval = int(action.get("repeat_interval", 0) or 0)
            if repeat_interval <= 0:
                continue
            trigger_types = action.get("trigger_types", [])
            if trigger_types and hazard_type not in trigger_types:
                continue

            aid = action.get("id")
            phase = action.get("phase")

            def _make_runner(act: dict[str, Any], intv: int, p: str):
                async def _run_repeat(_now: Any = None) -> None:
                    if self._state != STATE_TRIGGERED:
                        self._cancel_repeating_actions()
                        return
                    # In test mode: don't repeat cutoffs or sirens
                    settings = self.store.async_get_settings()
                    if settings.get("test_mode") and p in (PHASE_CUTOFF, PHASE_ACOUSTIC_OPTICAL):
                        return
                    _LOGGER.info("Executing repeating action '%s' (every %ds)", act.get("name"), intv)
                    await self.actions.async_call_single_action(act, context, blocking=False)
                    if self._state == STATE_TRIGGERED:
                        unsub = async_call_later(
                            self.hass, intv, lambda now: self.hass.async_create_task(_run_repeat(now))
                        )
                        self._repeating_action_timers[act.get("id")] = (unsub, p)

                return _run_repeat

            runner = _make_runner(action, repeat_interval, phase)
            unsub = async_call_later(
                self.hass, repeat_interval, lambda now, r=runner: self.hass.async_create_task(r(now))
            )
            self._repeating_action_timers[aid] = (unsub, phase)

    async def _async_handle_sensor_clear(
        self, entity_id: str, state_obj: Any
    ) -> None:
        """Process sensor returning to STATE_OFF."""
        self._active_triggers.pop(entity_id, None)

        # Cancel any pre-alarm timer for this entity
        if entity_id in self._pre_alarm_timers:
            self._pre_alarm_timers[entity_id]()
            self._pre_alarm_timers.pop(entity_id, None)
            self._pre_alarm_expires.pop(entity_id, None)

        # Automatically clear temporary ignore status when sensor returns to OFF (ok)
        if entity_id in self._ignored_sensors:
            self._ignored_sensors.discard(entity_id)
            _LOGGER.info(
                "Sensor %s returned to OFF; temporary ignore status removed.",
                entity_id,
            )

        sensor_cfg = self.store.async_get_sensor(entity_id) or {}
        auto_ack = sensor_cfg.get("auto_ack_on_clear", False)

        if auto_ack and len(self._active_triggers) == 0:
            _LOGGER.info(
                "Sensor %s cleared and auto_ack_on_clear is True with no remaining hazards. Resetting to NORMAL.",
                entity_id,
            )
            await self.async_reset(force=True)
        else:
            self._async_notify_update()

    async def async_silence(self, duration: int | None = None) -> bool:
        """Silence active acoustic/optical alarms."""
        if self._state not in (STATE_TRIGGERED, STATE_PRE_ALARM, STATE_SILENCED):
            _LOGGER.info("Cannot silence alarm when state is '%s'", self._state)
            return False

        _LOGGER.info("Silencing Safety Monitor acoustic alarms")
        self._set_state(STATE_SILENCED)

        # Stop repeating acoustic/optical actions
        self._cancel_repeating_actions([PHASE_ACOUSTIC_OPTICAL])

        # Execute silence actions (stop sirens, restore lights)
        await self.actions.async_execute_silence()

        # Also trigger silence_entity on any active hazard sensors if configured
        for eid in list(self._active_triggers.keys()):
            sensor_cfg = self.store.async_get_sensor(eid)
            if sensor_cfg and sensor_cfg.get("silence_entity"):
                await self.async_trigger_sensor_button(eid, "silence")

        # Start silence timer
        settings = self.store.async_get_settings()
        timeout = duration or settings.get("silence_timeout", DEFAULT_SILENCE_DURATION)

        if self._silence_timer is not None:
            self._silence_timer()
            self._silence_timer = None

        if timeout > 0:
            async def _on_silence_expired(_now: Any = None) -> None:
                self._silence_timer = None
                if self._state == STATE_SILENCED and self._active_triggers:
                    _LOGGER.warning(
                        "Silence timeout of %ds expired while hazards are still active! Re-triggering sirens.",
                        timeout,
                    )
                    # Pick any active trigger context to re-trigger
                    active_item = next(iter(self._active_triggers.values()))
                    sensor_cfg = self.store.async_get_sensor(active_item["entity_id"]) or {}
                    await self._async_escalate_to_triggered(active_item["entity_id"], sensor_cfg)

            self._silence_timer = async_call_later(
                self.hass,
                timeout,
                lambda now: self.hass.async_create_task(_on_silence_expired(now)),
            )

        # Bus event and history
        self.hass.bus.async_fire(EVENT_SAFETY_ALARM_SILENCED, {"timestamp": datetime.now(timezone.utc).isoformat()})
        await self.store.async_add_history(
            {
                "event": "silenced",
                "details": f"Alarms silenced for {timeout} seconds",
            }
        )

        self._async_notify_update()
        return True

    async def async_reset(self, force: bool = False) -> bool:
        """Reset alarm back to NORMAL."""
        if not force and len(self._active_triggers) > 0:
            active_names = [t.get("name", k) for k, t in self._active_triggers.items()]
            _LOGGER.warning(
                "Reset requested, but sensors are still active: %s. Resetting anyway as requested by operator.",
                active_names,
            )

        _LOGGER.info("Resetting Safety Monitor to NORMAL")
        self._set_state(STATE_NORMAL)

        # Clear ignored sensor flags on reset
        self._ignored_sensors.clear()

        # Cancel all pending timers
        for unsub in self._pre_alarm_timers.values():
            unsub()
        self._pre_alarm_timers.clear()
        self._pre_alarm_expires.clear()

        for unsub in self._double_knock_timers.values():
            unsub()
        self._double_knock_timers.clear()
        self._double_knock_first_sensors.clear()

        if self._silence_timer is not None:
            self._silence_timer()
            self._silence_timer = None

        # Stop repeating actions
        self._cancel_repeating_actions()

        # Stop any active sirens
        await self.actions.async_execute_silence()

        # Phase 4: Restore / Nach-Alarm actions (e.g. lights off, push all clear)
        now = dt_util.now() if dt_util else datetime.now()
        context = {
            "sensor_name": "Safety Monitor",
            "entity_id": "safety_monitor",
            "zone": "Alle Zonen",
            "zone_id": "all",
            "hazard_type": SmartHazardType("Entwarnung", "all_clear"),
            "timestamp": now.strftime("%d.%m.%Y %H:%M:%S"),
            "time": now.strftime("%H:%M:%S"),
            "date": now.strftime("%d.%m.%Y"),
            "state": STATE_NORMAL,
        }
        await self.actions.async_execute_phase(PHASE_RESTORE, context)

        # Bus event and history
        self.hass.bus.async_fire(EVENT_SAFETY_ALARM_RESET, {"timestamp": datetime.now(timezone.utc).isoformat()})
        await self.store.async_add_history(
            {
                "event": "reset",
                "details": "Safety monitor acknowledged and reset to normal",
            }
        )

        self._async_notify_update()
        return True

    async def async_set_test_mode(
        self, enabled: bool, duration: int | None = None
    ) -> bool:
        """Toggle maintenance/test mode."""
        settings = self.store.async_get_settings()
        timeout = duration or settings.get(
            "test_mode_timeout", DEFAULT_TEST_MODE_DURATION
        )

        if self._test_mode_timer is not None:
            self._test_mode_timer()
            self._test_mode_timer = None

        if enabled:
            _LOGGER.info("Enabling Safety Monitor Test Mode for %ds", timeout)
            self._set_state(STATE_TESTING)
            await self.store.async_update_settings({"test_mode": True})

            async def _on_test_mode_expired(_now: Any = None) -> None:
                self._test_mode_timer = None
                _LOGGER.info("Test Mode timeout expired. Automatically resetting to NORMAL.")
                await self.async_set_test_mode(False)

            self._test_mode_timer = async_call_later(
                self.hass,
                timeout,
                lambda now: self.hass.async_create_task(_on_test_mode_expired(now)),
            )
        else:
            _LOGGER.info("Disabling Safety Monitor Test Mode")
            self._set_state(STATE_NORMAL)
            await self.store.async_update_settings({"test_mode": False})

        self.hass.bus.async_fire(
            EVENT_SAFETY_TEST_MODE_CHANGED,
            {"test_mode": enabled, "duration": timeout if enabled else 0},
        )
        await self.store.async_add_history(
            {
                "event": "test_mode",
                "details": f"Test mode {'enabled' if enabled else 'disabled'}",
            }
        )

        self._async_notify_update()
        return True

    async def async_trigger_manual(self, reason: str = "Manual Evacuation Trigger") -> None:
        """Manually trigger the safety monitor alarm."""
        _LOGGER.warning("Manual alarm triggered: %s", reason)
        fake_cfg = {
            "name": reason,
            "zone": "manual",
            "type": "smoke",
            "linked_shutoff": [],
        }
        self._active_triggers["manual.alarm"] = {
            "entity_id": "manual.alarm",
            "name": reason,
            "type": "smoke",
            "zone": "manual",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        await self._async_escalate_to_triggered("manual.alarm", fake_cfg)

    async def async_trigger_sensor_button(
        self, sensor_entity_id: str, button_type: str
    ) -> bool:
        """Trigger a physical sensor button (silence, test, or drill)."""
        sensor_cfg = self.store.async_get_sensor(sensor_entity_id)
        if not sensor_cfg:
            _LOGGER.warning("Cannot trigger button: Sensor '%s' not configured", sensor_entity_id)
            return False

        target_entity = None
        action_name = button_type
        if button_type == "silence":
            target_entity = sensor_cfg.get("silence_entity")
            action_name = "Stummschaltung"
        elif button_type == "test":
            target_entity = sensor_cfg.get("test_entity")
            action_name = "Selbsttest"
        elif button_type == "drill":
            target_entity = sensor_cfg.get("drill_entity")
            action_name = "Alarmübung"

        if not target_entity:
            _LOGGER.warning(
                "Sensor '%s' has no '%s' entity configured",
                sensor_entity_id,
                button_type,
            )
            return False

        domain = target_entity.split(".")[0]
        service = "press" if domain == "button" else "turn_on"
        try:
            await self.hass.services.async_call(
                domain,
                service,
                {},
                target={"entity_id": [target_entity]},
                blocking=True,
            )
            _LOGGER.info(
                "Successfully triggered %s (%s.%s on %s) for sensor %s",
                action_name,
                domain,
                service,
                target_entity,
                sensor_entity_id,
            )
            await self.store.async_add_history(
                {
                    "event": f"sensor_{button_type}",
                    "entity_id": sensor_entity_id,
                    "name": sensor_cfg.get("name", sensor_entity_id),
                    "details": f"{action_name} ausgelöst über {target_entity}",
                }
            )
            self._async_notify_update()
            return True
        except Exception as err:
            _LOGGER.error(
                "Failed to trigger %s for sensor %s via %s: %s",
                action_name,
                sensor_entity_id,
                target_entity,
                err,
            )
            return False

    async def async_set_sensor_ignored(
        self, entity_id: str, ignored: bool = True
    ) -> bool:
        """Temporarily ignore/mute a triggered sensor until it clears."""
        sensor_cfg = self.store.async_get_sensor(entity_id)
        sensor_name = sensor_cfg.get("name", entity_id) if sensor_cfg else entity_id

        if ignored:
            self._ignored_sensors.add(entity_id)
            if entity_id in self._active_triggers:
                self._active_triggers[entity_id]["ignored"] = True

            # Cancel pre-alarm timers for this sensor if active
            if entity_id in self._pre_alarm_timers:
                self._pre_alarm_timers[entity_id]()
                self._pre_alarm_timers.pop(entity_id, None)
                self._pre_alarm_expires.pop(entity_id, None)

            await self.store.async_add_history(
                {
                    "event": "sensor_ignored",
                    "entity_id": entity_id,
                    "name": sensor_name,
                    "details": "Melder temporär ignoriert (bis Sensor wieder OK meldet)",
                }
            )
            _LOGGER.info("Sensor '%s' temporarily ignored by operator until clear.", entity_id)

            # If all active triggers are now ignored, silence sirens
            non_ignored = [
                eid for eid, t in self._active_triggers.items()
                if eid not in self._ignored_sensors
            ]
            if len(non_ignored) == 0:
                if self._state in (STATE_TRIGGERED, STATE_PRE_ALARM):
                    _LOGGER.info(
                        "All active hazard triggers are ignored. Silencing sirens."
                    )
                    self._cancel_repeating_actions([PHASE_ACOUSTIC_OPTICAL])
                    await self.actions.async_execute_silence()
                    self._set_state(STATE_SILENCED)
        else:
            self._ignored_sensors.discard(entity_id)
            if entity_id in self._active_triggers:
                self._active_triggers[entity_id]["ignored"] = False
            await self.store.async_add_history(
                {
                    "event": "sensor_unignored",
                    "entity_id": entity_id,
                    "name": sensor_name,
                    "details": "Ignorieren des Melders aufgehoben",
                }
            )
            _LOGGER.info("Sensor '%s' un-ignored by operator.", entity_id)
            # If sensor is currently ON, re-trigger
            st = self.hass.states.get(entity_id)
            if st and st.state == STATE_ON:
                await self._async_handle_sensor_trigger(entity_id, st)

        self._async_notify_update()
        return True

    async def _async_notify_system_alert(
        self,
        event_type: str,
        entity_id: str,
        sensor_cfg: dict[str, Any],
        battery_level: float | None = None,
        threshold: float | None = None,
        battery_eid: str | None = None,
    ) -> None:
        """Dispatch system notification / action for maintenance events (battery or offline)."""
        sensor_name = sensor_cfg.get("name", entity_id)
        zone_id = sensor_cfg.get("zone", "general")
        zone_cfg = self.store.async_get_zone(zone_id) or {}
        zone_name = zone_cfg.get("name", zone_id)

        now = dt_util.now() if dt_util else datetime.now()
        formatted_timestamp = now.strftime("%d.%m.%Y %H:%M:%S")
        formatted_time = now.strftime("%H:%M:%S")
        formatted_date = now.strftime("%d.%m.%Y")

        if event_type == "battery_low":
            display_hazard = "Batteriewarnung"
            smart_hazard = SmartHazardType(display_hazard, "battery_low")
            title = f"🪫 Schwache Batterie: {sensor_name}"
            msg = (
                f"Der Sicherheitsmelder '{sensor_name}' in Zone '{zone_name}' "
                f"meldet einen schwachen Batteriestand von {battery_level}%!"
            )
            event_name = EVENT_SAFETY_BATTERY_LOW
            history_event = "battery_low"
            history_details = f"Schwache Batterie ({battery_level}%) bei {sensor_name}"
        else:  # "sensor_offline"
            display_hazard = "Offline-Warnung"
            smart_hazard = SmartHazardType(display_hazard, "sensor_offline")
            title = f"⚠️ Melder offline: {sensor_name}"
            msg = (
                f"Der Sicherheitsmelder '{sensor_name}' in Zone '{zone_name}' "
                "ist offline / nicht erreichbar!"
            )
            event_name = EVENT_SAFETY_SENSOR_OFFLINE
            history_event = "sensor_offline"
            history_details = f"Melder {sensor_name} ist offline / nicht erreichbar"

        context = {
            "sensor_name": sensor_name,
            "entity_id": entity_id,
            "zone": zone_name,
            "zone_id": zone_id,
            "hazard_type": smart_hazard,
            "event": event_type,
            "event_type": event_type,
            "battery_level": battery_level,
            "threshold": threshold,
            "battery_entity": battery_eid or entity_id,
            "title": title,
            "message": msg,
            "timestamp": formatted_timestamp,
            "time": formatted_time,
            "date": formatted_date,
            "state": event_type,
        }

        # 1. Fire Home Assistant bus event
        self.hass.bus.async_fire(event_name, context)

        # 2. Add history record
        await self.store.async_add_history(
            {
                "event": history_event,
                "entity_id": entity_id,
                "name": sensor_name,
                "details": history_details,
            }
        )

        # 3. Execute configured Phase 5 (PHASE_SYSTEM) actions
        await self.actions.async_execute_phase(PHASE_SYSTEM, context, sensor_cfg)

    def _set_state(self, new_state: str) -> None:
        """Update internal state and fire state changed event."""
        if self._state != new_state:
            old_state = self._state
            self._state = new_state
            _LOGGER.info("Safety Monitor state transition: %s -> %s", old_state, new_state)
            self.hass.bus.async_fire(
                EVENT_SAFETY_STATE_CHANGED,
                {"old_state": old_state, "new_state": new_state},
            )
            async_dispatcher_send(self.hass, SIGNAL_SAFETY_MONITOR_STATE_CHANGED, new_state)

    def _async_notify_update(self) -> None:
        """Notify listeners (Lovelace entities, UI panel, WebSocket) of updates."""
        async_dispatcher_send(self.hass, SIGNAL_SAFETY_MONITOR_UPDATED)
