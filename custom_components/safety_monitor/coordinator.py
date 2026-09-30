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

from .actions import ActionEngine
from .const import (
    DEFAULT_BATTERY_LOW_THRESHOLD,
    DEFAULT_DOUBLE_KNOCK_TIMEOUT,
    DEFAULT_SILENCE_DURATION,
    DEFAULT_TEST_MODE_DURATION,
    EVENT_SAFETY_ALARM_RESET,
    EVENT_SAFETY_ALARM_SILENCED,
    EVENT_SAFETY_ALARM_TRIGGERED,
    EVENT_SAFETY_SENSOR_TRIGGERED,
    EVENT_SAFETY_STATE_CHANGED,
    EVENT_SAFETY_TEST_MODE_CHANGED,
    HAZARD_DEVICE_CLASSES,
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_CUTOFF,
    PHASE_NOTIFICATION,
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

        # State tracking listeners
        self._sensor_unsub: CALLBACK_TYPE | None = None
        self._offline_sensors: set[str] = set()
        self._low_battery_sensors: dict[str, float] = {}

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
    def low_battery_sensors(self) -> dict[str, float]:
        """Return sensors reporting low battery levels."""
        return self._low_battery_sensors

    async def async_setup(self) -> None:
        """Set up listeners and perform initial state scan."""
        await self.async_update_listeners()
        # Scan initial states of monitored sensors
        self._async_scan_initial_states()

    async def async_update_listeners(self) -> None:
        """Re-bind event listener to all configured sensors."""
        if self._sensor_unsub is not None:
            self._sensor_unsub()
            self._sensor_unsub = None

        monitored_sensors = self.store.async_get_sensors()
        entities = [
            entity_id
            for entity_id, cfg in monitored_sensors.items()
            if cfg.get("enabled", True)
        ]

        if entities:
            self._sensor_unsub = async_track_state_change_event(
                self.hass, entities, self._async_on_sensor_state_change
            )
            _LOGGER.debug(
                "Tracking state changes for %d safety sensors: %s",
                len(entities),
                entities,
            )

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
        """Handle state change event for a monitored sensor."""
        entity_id = event.data.get("entity_id")
        new_state = event.data.get("new_state")
        if new_state is None:
            return

        # Check offline condition
        if new_state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
            if entity_id not in self._offline_sensors:
                self._offline_sensors.add(entity_id)
                _LOGGER.warning("Monitored safety sensor became offline: %s", entity_id)
                self._async_notify_update()
            return
        elif entity_id in self._offline_sensors:
            self._offline_sensors.discard(entity_id)
            _LOGGER.info("Monitored safety sensor came back online: %s", entity_id)
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
            await self.actions.async_execute_phase(
                PHASE_NOTIFICATION,
                {
                    "sensor_name": trigger_data["name"],
                    "entity_id": entity_id,
                    "zone": zone_id,
                    "hazard_type": sensor_type,
                    "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
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
        context = {
            "sensor_name": trigger_data.get("name", entity_id),
            "entity_id": entity_id,
            "zone": trigger_data.get("zone", "general"),
            "hazard_type": trigger_data.get("type", TYPE_GENERIC),
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
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

        self._async_notify_update()

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
        if self._state not in (STATE_TRIGGERED, STATE_PRE_ALARM):
            _LOGGER.info("Cannot silence alarm when state is '%s'", self._state)
            return False

        _LOGGER.info("Silencing Safety Monitor acoustic alarms")
        self._set_state(STATE_SILENCED)

        # Execute silence actions (stop sirens, restore lights)
        await self.actions.async_execute_silence()

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

        # Stop any active sirens
        await self.actions.async_execute_silence()

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
