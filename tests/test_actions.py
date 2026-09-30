"""Tests for Safety Monitor ActionEngine."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.actions import ActionEngine
from custom_components.safety_monitor.const import (
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_CUTOFF,
    PHASE_NOTIFICATION,
    TYPE_MOISTURE,
    TYPE_SMOKE,
)
from custom_components.safety_monitor.store import SafetyStorage


class TestActionEngine(unittest.IsolatedAsyncioTestCase):
    """Test suite for ActionEngine."""

    async def asyncSetUp(self) -> None:
        self.hass = MagicMock()
        self.hass.services.async_call = AsyncMock()
        self.storage = SafetyStorage(self.hass)
        self.storage._store.async_load = AsyncMock(return_value=None)
        self.storage._store.async_save = AsyncMock()
        await self.storage.async_load()
        self.engine = ActionEngine(self.hass, self.storage)

    async def test_execute_cutoff_phase_with_linked_shutoff(self) -> None:
        """Test executing cutoff phase triggers linked valves."""
        sensor_cfg = {
            "entity_id": "binary_sensor.washing_machine_leak",
            "linked_shutoff": ["valve.main_water", "switch.washing_machine_power"],
        }
        context = {
            "sensor_name": "Washing Machine Leak",
            "hazard_type": TYPE_MOISTURE,
            "zone": "basement",
        }

        executed = await self.engine.async_execute_phase(
            PHASE_CUTOFF, context, sensor_config=sensor_cfg
        )
        self.assertTrue(len(executed) >= 2)

        # Verify async_call was called for valve.close_valve and switch.turn_off
        calls = self.hass.services.async_call.call_args_list
        called_services = [(call[0][0], call[0][1]) for call in calls]
        self.assertIn(("valve", "close_valve"), called_services)
        self.assertIn(("switch", "turn_off"), called_services)

    async def test_execute_notification_phase_with_template(self) -> None:
        """Test notification rendering with context placeholders."""
        context = {
            "sensor_name": "Kitchen Smoke Alarm",
            "hazard_type": TYPE_SMOKE,
            "zone": "kitchen",
            "timestamp": "2026-09-30 20:00:00",
        }

        executed = await self.engine.async_execute_phase(PHASE_NOTIFICATION, context)
        self.assertTrue(len(executed) >= 1)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in calls if c[0][0] == "notify"), None)
        self.assertIsNotNone(notify_call)

        payload = notify_call[0][2]
        self.assertIn("SMOKE", payload.get("title", ""))
        self.assertIn("kitchen", payload.get("title", ""))
        self.assertIn("Kitchen Smoke Alarm", payload.get("message", ""))

    async def test_execute_acoustic_optical_phase(self) -> None:
        """Test sirens and emergency lights trigger during acoustic phase."""
        context = {
            "sensor_name": "Living Room Smoke",
            "hazard_type": TYPE_SMOKE,
            "zone": "living_room",
        }
        executed = await self.engine.async_execute_phase(
            PHASE_ACOUSTIC_OPTICAL, context
        )
        self.assertTrue(len(executed) >= 1)

        calls = self.hass.services.async_call.call_args_list
        called_services = [(call[0][0], call[0][1]) for call in calls]
        self.assertIn(("siren", "turn_on"), called_services)
        self.assertIn(("light", "turn_on"), called_services)

    async def test_execute_silence(self) -> None:
        """Test silencing turns off sirens and lights."""
        # Add acoustic action with target entity
        await self.storage.async_save_action({
            "id": "action_test_siren",
            "name": "Siren Action",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "siren.turn_on",
            "target": {"entity_id": "siren.indoor"},
            "enabled": True,
            "trigger_types": [TYPE_SMOKE],
        })

        await self.engine.async_execute_silence()

        calls = self.hass.services.async_call.call_args_list
        silence_call = next((c for c in calls if c[0][0] == "siren" and c[0][1] == "turn_off"), None)
        self.assertIsNotNone(silence_call)
        self.assertEqual(silence_call[1].get("target"), {"entity_id": "siren.indoor"})

    async def test_test_mode_suppression(self) -> None:
        """Test that in test mode, cutoffs and sirens are suppressed."""
        await self.storage.async_update_settings({"test_mode": True})

        sensor_cfg = {
            "entity_id": "binary_sensor.smoke_test",
            "linked_shutoff": ["valve.main"],
        }
        context = {
            "sensor_name": "Test Detector",
            "hazard_type": TYPE_SMOKE,
            "zone": "kitchen",
        }

        # Cutoff phase should be suppressed
        executed_cutoff = await self.engine.async_execute_phase(
            PHASE_CUTOFF, context, sensor_cfg
        )
        self.assertEqual(executed_cutoff, [])

        # Acoustic phase should be suppressed
        executed_acoustic = await self.engine.async_execute_phase(
            PHASE_ACOUSTIC_OPTICAL, context
        )
        self.assertEqual(executed_acoustic, [])

    async def test_manual_test_action(self) -> None:
        """Test manual trigger of single action."""
        await self.storage.async_save_action({
            "id": "my_single_action",
            "name": "Custom Notify",
            "phase": PHASE_NOTIFICATION,
            "service": "notify.mobile_app",
            "target": {},
            "data": {"message": "Test Message"},
            "enabled": True,
            "trigger_types": [TYPE_SMOKE],
        })

        res = await self.engine.async_test_action("my_single_action")
        self.assertTrue(res)


if __name__ == "__main__":
    unittest.main()
