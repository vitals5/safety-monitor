"""Config flow for Safety Monitor integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.const import ATTR_DEVICE_CLASS, ATTR_FRIENDLY_NAME
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult

from .const import DOMAIN, HAZARD_DEVICE_CLASSES, NAME

_LOGGER = logging.getLogger(__name__)


class SafetyMonitorConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Safety Monitor."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle initial step."""
        # Single instance guard
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        if user_input is not None:
            return self.async_create_entry(title=NAME, data={})

        # Scan for existing candidate hazard sensors to inform the user
        detected_count = 0
        for state_obj in self.hass.states.async_all("binary_sensor"):
            dev_class = state_obj.attributes.get(ATTR_DEVICE_CLASS, "")
            if dev_class in HAZARD_DEVICE_CLASSES or any(
                hz in state_obj.entity_id
                for hz in ["smoke", "rauch", "water", "wasser", "leak", "gas", "co_", "heat"]
            ):
                detected_count += 1

        description_placeholders = {
            "sensors_found": str(detected_count),
        }

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({}),
            description_placeholders=description_placeholders,
        )
