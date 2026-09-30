"""Tests for Safety Monitor config flow."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.config_flow import SafetyMonitorConfigFlow
from custom_components.safety_monitor.const import DOMAIN, NAME


class TestConfigFlow(unittest.IsolatedAsyncioTestCase):
    """Test suite for SafetyMonitorConfigFlow."""

    async def asyncSetUp(self) -> None:
        self.flow = SafetyMonitorConfigFlow()
        self.hass = MagicMock()
        self.flow.hass = self.hass

    async def test_step_user_shows_form_with_candidates(self) -> None:
        """Test initial form shows detected hazard sensors."""
        st = MagicMock()
        st.entity_id = "binary_sensor.smoke_hallway"
        st.attributes = {"device_class": "smoke"}
        self.hass.states.async_all.return_value = [st]

        self.flow._async_current_entries = MagicMock(return_value=[])

        res = await self.flow.async_step_user(user_input=None)
        self.assertEqual(res["type"], "form")
        self.assertEqual(res["step_id"], "user")
        self.assertEqual(res["description_placeholders"]["sensors_found"], "1")

    async def test_step_user_creates_entry(self) -> None:
        """Test submitting form creates config entry."""
        self.flow._async_current_entries = MagicMock(return_value=[])

        res = await self.flow.async_step_user(user_input={})
        self.assertEqual(res["type"], "create_entry")
        self.assertEqual(res["title"], NAME)

    async def test_abort_if_already_configured(self) -> None:
        """Test single instance guard aborts if already configured."""
        self.flow._async_current_entries = MagicMock(return_value=[MagicMock()])

        res = await self.flow.async_step_user(user_input=None)
        self.assertEqual(res["type"], "abort")
        self.assertEqual(res["reason"], "already_configured")


if __name__ == "__main__":
    unittest.main()
