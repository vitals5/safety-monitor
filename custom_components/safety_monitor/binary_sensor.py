"""Binary sensors for Safety Monitor."""
from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
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
    STATE_PRE_ALARM,
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
    """Set up Safety Monitor binary sensor platform."""
    coordinator: SafetyCoordinator = hass.data[DOMAIN][entry.entry_id][DATA_COORDINATOR]
    async_add_entities([
        SafetyHazardBinarySensor(coordinator, entry),
        SafetyTestModeBinarySensor(coordinator, entry),
    ])


class SafetyHazardBinarySensor(BinarySensorEntity):
    """Indicates if an active hazard or pre-alarm is present."""

    _attr_has_entity_name = True
    _attr_name = "Hazard Detected"
    _attr_device_class = BinarySensorDeviceClass.SAFETY

    def __init__(
        self, coordinator: SafetyCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize the hazard binary sensor."""
        self._coordinator = coordinator
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_hazard_detected"
        self.entity_id = "binary_sensor.safety_monitor_hazard_detected"

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
    def is_on(self) -> bool:
        """Return true if a hazard is currently triggered or in pre-alarm."""
        return self._coordinator.state in (STATE_TRIGGERED, STATE_PRE_ALARM)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return state attributes."""
        triggers = self._coordinator.active_triggers
        return {
            "active_triggers_count": len(triggers),
            "safety_state": self._coordinator.state,
            "active_sensors": list(triggers.keys()),
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


class SafetyTestModeBinarySensor(BinarySensorEntity):
    """Indicates whether the safety monitor is currently in test mode."""

    _attr_has_entity_name = True
    _attr_name = "Test Mode Active"
    _attr_icon = "mdi:flask-outline"

    def __init__(
        self, coordinator: SafetyCoordinator, config_entry: ConfigEntry
    ) -> None:
        """Initialize the test mode binary sensor."""
        self._coordinator = coordinator
        self._config_entry = config_entry
        self._attr_unique_id = f"{config_entry.entry_id}_test_mode_active"
        self.entity_id = "binary_sensor.safety_monitor_test_mode_active"

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
    def is_on(self) -> bool:
        """Return true if test mode is active."""
        return self._coordinator.state == STATE_TESTING

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
