"""Tests for SafetyMonitorAlarmControlPanel."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.alarm_control_panel import SafetyMonitorAlarmControlPanel
from custom_components.safety_monitor.const import (
    STATE_NORMAL,
    STATE_PRE_ALARM,
    STATE_SILENCED,
    STATE_TESTING,
    STATE_TRIGGERED,
)


class TestAlarmControlPanel(unittest.IsolatedAsyncioTestCase):
    """Test suite for SafetyMonitorAlarmControlPanel entity."""

    async def asyncSetUp(self) -> None:
        self.coordinator = MagicMock()
        self.coordinator.state = STATE_NORMAL
        self.coordinator.active_triggers = {}
        self.coordinator.last_trigger = None
        self.coordinator.offline_sensors = []
        self.coordinator.store = MagicMock()
        self.coordinator.store.async_get_sensors.return_value = {}

        self.config_entry = MagicMock()
        self.config_entry.entry_id = "test_entry_123"

        self.panel = SafetyMonitorAlarmControlPanel(self.coordinator, self.config_entry)

    def test_state_mapping(self) -> None:
        """Test mapping from safety states to Home Assistant alarm states."""
        self.coordinator.state = STATE_NORMAL
        self.assertEqual(self.panel.alarm_state, "disarmed")

        self.coordinator.state = STATE_PRE_ALARM
        self.assertEqual(self.panel.alarm_state, "pending")

        self.coordinator.state = STATE_TRIGGERED
        self.assertEqual(self.panel.alarm_state, "triggered")

        self.coordinator.state = STATE_SILENCED
        self.assertEqual(self.panel.alarm_state, "disarmed")

        self.coordinator.state = STATE_TESTING
        self.assertEqual(self.panel.alarm_state, "disarmed")

    def test_extra_state_attributes(self) -> None:
        """Test attributes reflect coordinator data."""
        self.coordinator.state = STATE_TRIGGERED
        self.coordinator.active_triggers = {
            "binary_sensor.kitchen_smoke": {
                "name": "Kitchen Smoke",
                "type": "smoke",
                "zone": "kitchen",
            }
        }
        self.coordinator.last_trigger = {"name": "Kitchen Smoke"}

        attrs = self.panel.extra_state_attributes
        self.assertEqual(attrs["safety_state"], STATE_TRIGGERED)
        self.assertEqual(attrs["active_zones"], ["kitchen"])
        self.assertEqual(len(attrs["active_sensors"]), 1)
        self.assertFalse(attrs["test_mode"])
        self.assertFalse(attrs["silenced"])

    async def test_alarm_trigger(self) -> None:
        """Test manual trigger from alarm control panel."""
        self.coordinator.async_trigger_manual = AsyncMock()
        await self.panel.async_alarm_trigger()
        self.coordinator.async_trigger_manual.assert_called_once()

    async def test_alarm_disarm(self) -> None:
        """Test disarm/reset from alarm control panel."""
        self.coordinator.async_reset = AsyncMock()
        await self.panel.async_alarm_disarm()
        self.coordinator.async_reset.assert_called_once()


if __name__ == "__main__":
    unittest.main()
