"""Safety Monitor Alarm Control Panel entity."""
from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.alarm_control_panel import (
    AlarmControlPanelEntity,
    AlarmControlPanelEntityFeature,
    AlarmControlPanelState,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import (
    DATA_COORDINATOR,
    DOMAIN,
    NAME,
    SIGNAL_SAFETY_MONITOR_STATE_CHANGED,
    SIGNAL_SAFETY_MONITOR_UPDATED,
    STATE_NORMAL,
    STATE_PRE_ALARM,
    STATE_SILENCED,
    STATE_TESTING,
    STATE_TRIGGERED,
    VERSION,
)
from .coordinator import SafetyCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up the Safety Monitor alarm control panel entity."""
    coordinator: SafetyCoordinator = hass.data[DOMAIN][entry.entry_id][DATA_COORDINATOR]
    async_add_entities([SafetyMonitorAlarmControlPanel(coordinator, entry)])


class SafetyMonitorAlarmControlPanel(AlarmControlPanelEntity, RestoreEntity):
    """Representation of the Safety Monitor as an Alarm Control Panel."""

    _attr_has_entity_name = True
    _attr_name = "Safety Monitor"
    _attr_icon = "mdi:shield-alert"

    def __init__(
        self, coordinator: SafetyCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize the alarm control panel."""
        self._coordinator = coordinator
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_alarm_control_panel"
        self.entity_id = "alarm_control_panel.safety_monitor"

    @property
    def device_info(self) -> dict[str, Any]:
        """Return device registry information."""
        return {
            "identifiers": {(DOMAIN, self._config_entry.entry_id)},
            "name": NAME,
            "model": "Hazard & Life Safety Monitoring System",
            "sw_version": VERSION,
            "manufacturer": NAME,
        }

    @property
    def supported_features(self) -> int:
        """Return the supported features."""
        # Always-on life safety: no arming modes required, supports trigger & disarm/reset
        return AlarmControlPanelEntityFeature.TRIGGER

    @property
    def alarm_state(self) -> AlarmControlPanelState | None:
        """Return the state of the device mapped to Home Assistant alarm state."""
        state = self._coordinator.state
        if state == STATE_TRIGGERED:
            return AlarmControlPanelState.TRIGGERED
        elif state == STATE_PRE_ALARM:
            return AlarmControlPanelState.PENDING
        elif state in (STATE_NORMAL, STATE_SILENCED, STATE_TESTING):
            return AlarmControlPanelState.DISARMED
        return AlarmControlPanelState.DISARMED

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return the state attributes."""
        triggers = self._coordinator.active_triggers
        active_zones = list({t.get("zone", "") for t in triggers.values() if t.get("zone")})
        monitored_sensors = self._coordinator.store.async_get_sensors()

        return {
            "safety_state": self._coordinator.state,
            "active_sensors": list(triggers.values()),
            "active_zones": active_zones,
            "last_trigger": self._coordinator.last_trigger,
            "test_mode": self._coordinator.state == STATE_TESTING,
            "silenced": self._coordinator.state == STATE_SILENCED,
            "monitored_sensors_count": len(
                [s for s in monitored_sensors.values() if s.get("enabled", True)]
            ),
            "offline_sensors": self._coordinator.offline_sensors,
        }

    async def async_alarm_trigger(self, code: str | None = None) -> None:
        """Trigger alarm manually."""
        await self._coordinator.async_trigger_manual("Triggered via Alarm Control Panel")

    async def async_alarm_disarm(self, code: str | None = None) -> None:
        """Reset / Acknowledge active alarm back to normal."""
        await self._coordinator.async_reset()

    async def async_added_to_hass(self) -> None:
        """Subscribe to coordinator dispatcher updates."""
        await super().async_added_to_hass()

        @callback
        def _update() -> None:
            self.async_write_ha_state()

        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_SAFETY_MONITOR_UPDATED, _update
            )
        )
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_SAFETY_MONITOR_STATE_CHANGED, lambda _: _update()
            )
        )
