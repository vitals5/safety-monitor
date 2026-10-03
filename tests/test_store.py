"""Tests for Safety Monitor storage layer."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.store import SafetyStorage


class TestSafetyStorage(unittest.IsolatedAsyncioTestCase):
    """Test suite for SafetyStorage."""

    async def asyncSetUp(self) -> None:
        self.hass = MagicMock()
        self.storage = SafetyStorage(self.hass)
        # Mock underlying HA Store
        self.storage._store.async_load = AsyncMock(return_value=None)
        self.storage._store.async_save = AsyncMock()

    async def test_init_and_load_defaults(self) -> None:
        """Test initializing defaults when storage is empty."""
        await self.storage.async_load()

        # Check default zones
        zones = self.storage.async_get_zones()
        self.assertIn("kitchen", zones)
        self.assertIn("basement", zones)

        # Check default actions
        actions = self.storage.async_get_actions()
        self.assertTrue(len(actions) >= 5)
        cutoff_action = next((a for a in actions if a["phase"] == "cutoff"), None)
        self.assertIsNotNone(cutoff_action)

        # Check default settings
        settings = self.storage.async_get_settings()
        self.assertEqual(settings.get("language"), "auto")
        self.assertEqual(settings.get("show_back_button"), "auto")
        self.assertEqual(settings.get("admin_only_tabs"), True)
        self.assertEqual(settings.get("test_mode"), False)
        self.assertEqual(settings.get("test_mode_timeout"), 900)
        self.assertEqual(settings.get("history_default_time"), "24h")
        self.assertEqual(settings.get("history_default_type"), "all")

    async def test_sensor_crud(self) -> None:
        """Test creating, reading, updating and deleting sensors."""
        await self.storage.async_load()

        # Create
        sensor_data = {
            "entity_id": "binary_sensor.kitchen_smoke",
            "name": "Kitchen Smoke Alarm",
            "zone": "kitchen",
            "type": "smoke",
            "enabled": True,
            "pre_alarm_delay": 10,
            "auto_ack_on_clear": True,
            "double_knock": False,
            "linked_shutoff": ["fan.kitchen_exhaust"],
        }
        saved = await self.storage.async_save_sensor(sensor_data)
        self.assertEqual(saved["entity_id"], "binary_sensor.kitchen_smoke")
        self.assertEqual(saved["pre_alarm_delay"], 10)

        # Read
        retrieved = self.storage.async_get_sensor("binary_sensor.kitchen_smoke")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["name"], "Kitchen Smoke Alarm")

        # Update
        update_data = {
            "entity_id": "binary_sensor.kitchen_smoke",
            "pre_alarm_delay": 0,
        }
        updated = await self.storage.async_save_sensor(update_data)
        self.assertEqual(updated["pre_alarm_delay"], 0)
        self.assertEqual(updated["name"], "Kitchen Smoke Alarm")  # Preserved

        # Delete
        success = await self.storage.async_delete_sensor("binary_sensor.kitchen_smoke")
        self.assertTrue(success)
        self.assertIsNone(self.storage.async_get_sensor("binary_sensor.kitchen_smoke"))

    async def test_zone_crud(self) -> None:
        """Test creating, getting and deleting zones."""
        await self.storage.async_load()

        zone_data = {
            "id": "attic",
            "name": "Attic / Dachgeschoss",
            "double_knock_enabled": True,
            "double_knock_timeout": 45,
        }
        saved = await self.storage.async_save_zone(zone_data)
        self.assertEqual(saved["id"], "attic")
        self.assertEqual(saved["double_knock_timeout"], 45)

        retrieved = self.storage.async_get_zone("attic")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["name"], "Attic / Dachgeschoss")

        del_ok = await self.storage.async_delete_zone("attic")
        self.assertTrue(del_ok)
        self.assertIsNone(self.storage.async_get_zone("attic"))

    async def test_zone_default_name_to_id(self) -> None:
        """Test that zone name defaults to zone id when name is empty or omitted."""
        await self.storage.async_load()

        # Omitted name
        zone_without_name = {
            "id": "garage",
        }
        saved = await self.storage.async_save_zone(zone_without_name)
        self.assertEqual(saved["id"], "garage")
        self.assertEqual(saved["name"], "garage")

        # Empty string name
        zone_with_empty_name = {
            "id": "garden_shed",
            "name": "   ",
        }
        saved2 = await self.storage.async_save_zone(zone_with_empty_name)
        self.assertEqual(saved2["id"], "garden_shed")
        self.assertEqual(saved2["name"], "garden_shed")

    async def test_action_crud(self) -> None:
        """Test action save, get, and delete."""
        await self.storage.async_load()

        action_data = {
            "id": "custom_action_test",
            "name": "Test Action",
            "phase": "cutoff",
            "service": "valve.close_valve",
            "target": {"entity_id": "valve.main"},
            "data": {},
            "enabled": True,
            "trigger_types": ["moisture"],
            "repeat_interval": 45,
        }
        saved = await self.storage.async_save_action(action_data)
        self.assertEqual(saved["id"], "custom_action_test")
        self.assertEqual(saved["repeat_interval"], 45)

        retrieved = self.storage.async_get_action("custom_action_test")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved["name"], "Test Action")
        self.assertEqual(retrieved["repeat_interval"], 45)

        del_ok = await self.storage.async_delete_action("custom_action_test")
        self.assertTrue(del_ok)
        self.assertIsNone(self.storage.async_get_action("custom_action_test"))

    async def test_settings_update(self) -> None:
        """Test updating global settings."""
        await self.storage.async_load()

        updated = await self.storage.async_update_settings({
            "test_mode_timeout": 1200,
            "silence_timeout": 300,
            "admin_only_tabs": False,
        })
        self.assertEqual(updated["test_mode_timeout"], 1200)
        self.assertEqual(updated["silence_timeout"], 300)
        self.assertFalse(updated["admin_only_tabs"])

    async def test_history_capping(self) -> None:
        """Test history entries addition and capping at 100."""
        await self.storage.async_load()

        for i in range(120):
            await self.storage.async_add_history({
                "event": "sensor_triggered",
                "details": f"Test trigger {i}",
            })

        history = self.storage.async_get_history()
        self.assertEqual(len(history), 100)
        self.assertEqual(history[-1]["details"], "Test trigger 119")

    async def test_sensor_buttons_and_result_entity(self) -> None:
        """Test saving and retrieving sensor button entities and test_result_entity."""
        await self.storage.async_load()

        sensor_data = {
            "entity_id": "binary_sensor.smoke_hallway",
            "name": "Hallway Smoke",
            "zone": "kitchen",
            "type": "smoke",
            "silence_entity": "button.smoke_hallway_silence",
            "drill_entity": "button.smoke_hallway_drill",
            "test_entity": "button.smoke_hallway_test",
            "test_result_entity": "sensor.smoke_hallway_last_self_test",
            "battery_entity": "sensor.smoke_hallway_battery",
        }
        saved = await self.storage.async_save_sensor(sensor_data)
        self.assertEqual(saved["silence_entity"], "button.smoke_hallway_silence")
        self.assertEqual(saved["drill_entity"], "button.smoke_hallway_drill")
        self.assertEqual(saved["test_entity"], "button.smoke_hallway_test")
        self.assertEqual(saved["test_result_entity"], "sensor.smoke_hallway_last_self_test")
        self.assertEqual(saved["battery_entity"], "sensor.smoke_hallway_battery")

        retrieved = self.storage.async_get_sensor("binary_sensor.smoke_hallway")
        self.assertEqual(retrieved["test_result_entity"], "sensor.smoke_hallway_last_self_test")

    async def test_auto_self_test_settings(self) -> None:
        """Test default settings and updating auto self-test configuration."""
        await self.storage.async_load()

        defaults = self.storage.async_get_settings()
        self.assertFalse(defaults["auto_self_test_enabled"])
        self.assertEqual(defaults["auto_self_test_day"], 1)
        self.assertEqual(defaults["auto_self_test_time"], "11:00")
        self.assertEqual(defaults["auto_self_test_step_seconds"], 60)
        self.assertTrue(defaults["auto_self_test_notify"])
        self.assertEqual(defaults["last_auto_self_test_date"], "")

        updated = await self.storage.async_update_settings({
            "auto_self_test_enabled": True,
            "auto_self_test_day": 15,
            "auto_self_test_time": "14:30",
            "auto_self_test_step_seconds": 120,
            "auto_self_test_notify": False,
            "last_auto_self_test_date": "2026-10-15",
        })
        self.assertTrue(updated["auto_self_test_enabled"])
        self.assertEqual(updated["auto_self_test_day"], 15)
        self.assertEqual(updated["auto_self_test_time"], "14:30")
        self.assertEqual(updated["auto_self_test_step_seconds"], 120)
        self.assertFalse(updated["auto_self_test_notify"])
        self.assertEqual(updated["last_auto_self_test_date"], "2026-10-15")


if __name__ == "__main__":
    unittest.main()

