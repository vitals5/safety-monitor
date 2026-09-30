"""Tests for SafetyCoordinator and Hazard State Machine."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.actions import ActionEngine
from custom_components.safety_monitor.const import (
    STATE_NORMAL,
    STATE_PRE_ALARM,
    STATE_SILENCED,
    STATE_TESTING,
    STATE_TRIGGERED,
    TYPE_SMOKE,
)
from custom_components.safety_monitor.coordinator import SafetyCoordinator
from custom_components.safety_monitor.store import SafetyStorage


class TestSafetyCoordinator(unittest.IsolatedAsyncioTestCase):
    """Test suite for SafetyCoordinator."""

    async def asyncSetUp(self) -> None:
        self.hass = MagicMock()
        self.hass.bus.async_fire = MagicMock()
        self.storage = SafetyStorage(self.hass)
        self.storage._store.async_load = AsyncMock(return_value=None)
        self.storage._store.async_save = AsyncMock()
        await self.storage.async_load()

        self.actions = ActionEngine(self.hass, self.storage)
        self.actions.async_execute_phase = AsyncMock(return_value=["action_ok"])
        self.actions.async_execute_silence = AsyncMock()

        self.coordinator = SafetyCoordinator(self.hass, self.storage, self.actions)

    async def test_initial_state(self) -> None:
        """Test initial state is normal."""
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        self.assertEqual(len(self.coordinator.active_triggers), 0)

    async def test_instant_sensor_trigger(self) -> None:
        """Test immediate escalation to TRIGGERED for sensors with 0 delay."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_kitchen",
            "name": "Kitchen Smoke",
            "zone": "kitchen",
            "type": TYPE_SMOKE,
            "pre_alarm_delay": 0,
            "enabled": True,
        })

        mock_state = MagicMock()
        mock_state.state = "on"
        mock_state.attributes = {"friendly_name": "Kitchen Smoke"}

        await self.coordinator._async_handle_sensor_trigger(
            "binary_sensor.smoke_kitchen", mock_state
        )

        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)
        self.assertIn("binary_sensor.smoke_kitchen", self.coordinator.active_triggers)
        self.assertEqual(self.actions.async_execute_phase.call_count, 3)

    async def test_pre_alarm_delay(self) -> None:
        """Test entering PRE_ALARM when sensor has pre_alarm_delay > 0."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.heat_workshop",
            "name": "Workshop Heat",
            "zone": "workshop",
            "type": "heat",
            "pre_alarm_delay": 30,
            "enabled": True,
        })

        mock_state = MagicMock()
        mock_state.state = "on"
        mock_state.attributes = {"friendly_name": "Workshop Heat"}

        await self.coordinator._async_handle_sensor_trigger(
            "binary_sensor.heat_workshop", mock_state
        )

        self.assertEqual(self.coordinator.state, STATE_PRE_ALARM)
        self.assertIn("binary_sensor.heat_workshop", self.coordinator.active_triggers)

    async def test_double_knock_verification(self) -> None:
        """Test multi-sensor verification logic."""
        await self.storage.async_save_zone({
            "id": "warehouse",
            "name": "Warehouse",
            "double_knock_enabled": True,
            "double_knock_timeout": 60,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_1",
            "name": "Smoke 1",
            "zone": "warehouse",
            "type": TYPE_SMOKE,
            "enabled": True,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_2",
            "name": "Smoke 2",
            "zone": "warehouse",
            "type": TYPE_SMOKE,
            "enabled": True,
        })

        st1 = MagicMock()
        st1.state = "on"
        st1.attributes = {"friendly_name": "Smoke 1"}

        # 1st sensor trips -> Enters PRE_ALARM
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.smoke_1", st1)
        self.assertEqual(self.coordinator.state, STATE_PRE_ALARM)

        # 2nd distinct sensor in same zone trips -> Confirms and enters TRIGGERED
        st2 = MagicMock()
        st2.state = "on"
        st2.attributes = {"friendly_name": "Smoke 2"}

        await self.coordinator._async_handle_sensor_trigger("binary_sensor.smoke_2", st2)
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)

    async def test_silence_alarm(self) -> None:
        """Test silencing active sirens."""
        self.coordinator._set_state(STATE_TRIGGERED)
        self.coordinator._active_triggers["sensor.smoke"] = {"name": "Smoke"}

        ok = await self.coordinator.async_silence(duration=600)
        self.assertTrue(ok)
        self.assertEqual(self.coordinator.state, STATE_SILENCED)
        self.actions.async_execute_silence.assert_called_once()

    async def test_reset_alarm(self) -> None:
        """Test resetting alarm back to normal."""
        self.coordinator._set_state(STATE_TRIGGERED)
        self.coordinator._active_triggers["sensor.smoke"] = {"name": "Smoke"}

        ok = await self.coordinator.async_reset(force=True)
        self.assertTrue(ok)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)

    async def test_auto_ack_on_clear(self) -> None:
        """Test auto-acknowledge reset when sensor returns to off."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.water_sensor",
            "name": "Water Sensor",
            "zone": "kitchen",
            "type": "moisture",
            "auto_ack_on_clear": True,
            "enabled": True,
        })

        st_on = MagicMock()
        st_on.state = "on"
        st_on.attributes = {"friendly_name": "Water Sensor"}
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.water_sensor", st_on)
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)

        st_off = MagicMock()
        st_off.state = "off"
        await self.coordinator._async_handle_sensor_clear("binary_sensor.water_sensor", st_off)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)

    async def test_test_mode(self) -> None:
        """Test test/maintenance mode."""
        await self.coordinator.async_set_test_mode(True, duration=900)
        self.assertEqual(self.coordinator.state, STATE_TESTING)

        # Trigger sensor during test mode
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_test",
            "name": "Smoke Test",
            "zone": "general",
            "type": TYPE_SMOKE,
            "enabled": True,
        })
        st = MagicMock()
        st.state = "on"
        st.attributes = {"friendly_name": "Smoke Test"}

        await self.coordinator._async_handle_sensor_trigger("binary_sensor.smoke_test", st)
        # Should stay in TESTING, NOT escalate to TRIGGERED
        self.assertEqual(self.coordinator.state, STATE_TESTING)

        await self.coordinator.async_set_test_mode(False)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)

    async def test_manual_trigger(self) -> None:
        """Test manual trigger."""
        await self.coordinator.async_trigger_manual("Evacuation Test")
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)
        self.assertIn("manual.alarm", self.coordinator.active_triggers)


if __name__ == "__main__":
    unittest.main()
