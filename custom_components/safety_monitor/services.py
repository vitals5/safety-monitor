"""Service handlers for Safety Monitor."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
import homeassistant.helpers.config_validation as cv

from .const import (
    DATA_COORDINATOR,
    DOMAIN,
    SERVICE_RESET,
    SERVICE_SILENCE,
    SERVICE_TEST_MODE,
    SERVICE_TRIGGER,
)
from .coordinator import SafetyCoordinator

_LOGGER = logging.getLogger(__name__)

SCHEMA_SILENCE = vol.Schema(
    {
        vol.Optional("duration"): cv.positive_int,
    }
)

SCHEMA_RESET = vol.Schema(
    {
        vol.Optional("force", default=False): cv.boolean,
    }
)

SCHEMA_TEST_MODE = vol.Schema(
    {
        vol.Required("enabled"): cv.boolean,
        vol.Optional("duration"): cv.positive_int,
    }
)

SCHEMA_TRIGGER = vol.Schema(
    {
        vol.Optional("reason", default="Manual Evacuation Trigger"): cv.string,
    }
)


def _get_coordinator(hass: HomeAssistant) -> SafetyCoordinator | None:
    """Retrieve active SafetyCoordinator instance."""
    data = hass.data.get(DOMAIN, {})
    for entry_data in data.values():
        if isinstance(entry_data, dict) and DATA_COORDINATOR in entry_data:
            return entry_data[DATA_COORDINATOR]
    return None


async def async_register_services(hass: HomeAssistant) -> None:
    """Register custom services for Safety Monitor."""

    async def _handle_silence(call: ServiceCall) -> None:
        coordinator = _get_coordinator(hass)
        if coordinator:
            duration = call.data.get("duration")
            await coordinator.async_silence(duration=duration)
        else:
            _LOGGER.warning("Cannot silence: Safety Monitor coordinator not loaded")

    async def _handle_reset(call: ServiceCall) -> None:
        coordinator = _get_coordinator(hass)
        if coordinator:
            force = call.data.get("force", False)
            await coordinator.async_reset(force=force)
        else:
            _LOGGER.warning("Cannot reset: Safety Monitor coordinator not loaded")

    async def _handle_test_mode(call: ServiceCall) -> None:
        coordinator = _get_coordinator(hass)
        if coordinator:
            enabled = call.data.get("enabled", True)
            duration = call.data.get("duration")
            await coordinator.async_set_test_mode(enabled=enabled, duration=duration)
        else:
            _LOGGER.warning("Cannot toggle test mode: Safety Monitor coordinator not loaded")

    async def _handle_trigger(call: ServiceCall) -> None:
        coordinator = _get_coordinator(hass)
        if coordinator:
            reason = call.data.get("reason", "Manual Evacuation Trigger")
            await coordinator.async_trigger_manual(reason=reason)
        else:
            _LOGGER.warning("Cannot trigger: Safety Monitor coordinator not loaded")

    hass.services.async_register(DOMAIN, SERVICE_SILENCE, _handle_silence, schema=SCHEMA_SILENCE)
    hass.services.async_register(DOMAIN, SERVICE_RESET, _handle_reset, schema=SCHEMA_RESET)
    hass.services.async_register(DOMAIN, SERVICE_TEST_MODE, _handle_test_mode, schema=SCHEMA_TEST_MODE)
    hass.services.async_register(DOMAIN, SERVICE_TRIGGER, _handle_trigger, schema=SCHEMA_TRIGGER)


async def async_unregister_services(hass: HomeAssistant) -> None:
    """Unregister custom services for Safety Monitor."""
    for service in [SERVICE_SILENCE, SERVICE_RESET, SERVICE_TEST_MODE, SERVICE_TRIGGER]:
        if hass.services.has_service(DOMAIN, service):
            hass.services.async_remove(DOMAIN, service)
