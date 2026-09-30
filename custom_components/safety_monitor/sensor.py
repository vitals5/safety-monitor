"""Status sensors for Safety Monitor."""
from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.entity_platform import AddEntitiesCallback

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


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Safety Monitor sensor platform."""
    coordinator: SafetyCoordinator = hass.data[DOMAIN][entry.entry_id][DATA_COORDINATOR]
    async_add_entities([
        SafetyStatusSensor(coordinator, entry),
        SafetyLastHazardSensor(coordinator, entry),
    ])


class SafetyStatusSensor(SensorEntity):
    """Reflects current safety status (normal, pre_alarm, triggered, silenced, testing)."""

    _attr_has_entity_name = True
    _attr_name = "Status"

    def __init__(
        self, coordinator: SafetyCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize the status sensor."""
        self._coordinator = coordinator
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_safety_status"
        self.entity_id = "sensor.safety_monitor_status"

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
    def native_value(self) -> str:
        """Return current coordinator state."""
        return self._coordinator.state

    @property
    def icon(self) -> str:
        """Return icon according to current state."""
        state = self._coordinator.state
        if state == STATE_TRIGGERED:
            return "mdi:fire-alert"
        elif state == STATE_PRE_ALARM:
            return "mdi:alert"
        elif state == STATE_SILENCED:
            return "mdi:volume-off"
        elif state == STATE_TESTING:
            return "mdi:flask-outline"
        return "mdi:shield-check"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return attributes."""
        return {
            "active_triggers": list(self._coordinator.active_triggers.values()),
            "offline_sensors": self._coordinator.offline_sensors,
        }

    async def async_added_to_hass(self) -> None:
        """Connect to dispatcher updates."""
        await super().async_added_to_hass()

        @callback
        def _update() -> None:
            self.async_write_ha_state()

        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_SAFETY_MONITOR_UPDATED, _update)
        )
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_SAFETY_MONITOR_STATE_CHANGED, lambda _: _update()
            )
        )


class SafetyLastHazardSensor(SensorEntity):
    """Displays information on the most recently detected hazard."""

    _attr_has_entity_name = True
    _attr_name = "Last Hazard"
    _attr_icon = "mdi:history"

    def __init__(
        self, coordinator: SafetyCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize the last hazard sensor."""
        self._coordinator = coordinator
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_last_hazard"
        self.entity_id = "sensor.safety_monitor_last_hazard"

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
    def native_value(self) -> str:
        """Return name of last triggered hazard."""
        last = self._coordinator.last_trigger
        if last:
            return str(last.get("name", "Unknown Hazard"))
        return "None"

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return details of the last hazard."""
        last = self._coordinator.last_trigger
        if not last:
            return {}
        return {
            "entity_id": last.get("entity_id"),
            "hazard_type": last.get("type"),
            "zone": last.get("zone"),
            "timestamp": last.get("timestamp"),
        }

    async def async_added_to_hass(self) -> None:
        """Connect to dispatcher updates."""
        await super().async_added_to_hass()

        @callback
        def _update() -> None:
            self.async_write_ha_state()

        self.async_on_remove(
            async_dispatcher_connect(self.hass, SIGNAL_SAFETY_MONITOR_UPDATED, _update)
        )
        self.async_on_remove(
            async_dispatcher_connect(
                self.hass, SIGNAL_SAFETY_MONITOR_STATE_CHANGED, lambda _: _update()
            )
        )
