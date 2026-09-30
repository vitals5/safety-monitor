"""Tests for Safety Monitor WebSocket API."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.const import DOMAIN, STATE_NORMAL
from custom_components.safety_monitor.store import SafetyStorage
from custom_components.safety_monitor.websocket import (
    ws_delete_action,
    ws_delete_sensor,
    ws_delete_zone,
    ws_get_config,
    ws_get_status,
    ws_list_candidate_sensors,
    ws_reset_alarm,
    ws_save_action,
    ws_save_sensor,
    ws_save_zone,
    ws_set_test_mode,
    ws_silence_alarm,
    ws_update_settings,
)


class TestWebSocketAPI(unittest.IsolatedAsyncioTestCase):
    """Test suite for Safety Monitor WebSocket API handlers."""

    async def asyncSetUp(self) -> None:
        self.hass = MagicMock()
        self.connection = MagicMock()
        self.connection.send_result = MagicMock()
        self.connection.send_error = MagicMock()

        self.storage = SafetyStorage(self.hass)
        self.storage._store.async_load = AsyncMock(return_value=None)
        self.storage._store.async_save = AsyncMock()
        await self.storage.async_load()

        self.coordinator = MagicMock()
        self.coordinator.state = STATE_NORMAL
        self.coordinator.active_triggers = {}
        self.coordinator.last_trigger = None
        self.coordinator.offline_sensors = []
        self.coordinator.low_battery_sensors = {}
        self.coordinator.async_update_listeners = AsyncMock()
        self.coordinator.async_silence = AsyncMock(return_value=True)
        self.coordinator.async_reset = AsyncMock(return_value=True)
        self.coordinator.async_set_test_mode = AsyncMock(return_value=True)

        self.hass.data = {
            DOMAIN: {
                "test_entry": {
                    "storage": self.storage,
                    "coordinator": self.coordinator,
                }
            }
        }

    async def test_ws_get_config(self) -> None:
        """Test fetching full config."""
        msg = {"id": 1, "type": "safety_monitor/config/get"}
        await ws_get_config(self.hass, self.connection, msg)
        self.connection.send_result.assert_called_once()
        args = self.connection.send_result.call_args[0]
        self.assertEqual(args[0], 1)
        self.assertIn("sensors", args[1])
        self.assertIn("zones", args[1])
        self.assertIn("actions", args[1])

    async def test_ws_update_settings(self) -> None:
        """Test updating settings."""
        msg = {
            "id": 2,
            "type": "safety_monitor/config/update_settings",
            "settings": {"test_mode_timeout": 600},
        }
        await ws_update_settings(self.hass, self.connection, msg)
        self.connection.send_result.assert_called_once()
        res = self.connection.send_result.call_args[0][1]
        self.assertEqual(res["settings"]["test_mode_timeout"], 600)

    async def test_ws_list_candidates(self) -> None:
        """Test scanning candidate sensors."""
        st1 = MagicMock()
        st1.entity_id = "binary_sensor.smoke_detector"
        st1.state = "off"
        st1.attributes = {"device_class": "smoke", "friendly_name": "Smoke Detector"}

        st2 = MagicMock()
        st2.entity_id = "binary_sensor.motion_hallway"
        st2.state = "off"
        st2.attributes = {"device_class": "motion", "friendly_name": "Motion Sensor"}

        self.hass.states.async_all.return_value = [st1, st2]

        msg = {"id": 3, "type": "safety_monitor/sensors/list_candidates"}
        await ws_list_candidate_sensors(self.hass, self.connection, msg)
        self.connection.send_result.assert_called_once()
        candidates = self.connection.send_result.call_args[0][1]["candidates"]
        self.assertEqual(len(candidates), 2)
        # Smoke detector is recognized as hazard
        smoke_cand = next(c for c in candidates if c["entity_id"] == "binary_sensor.smoke_detector")
        self.assertTrue(smoke_cand["is_hazard_class"])

    async def test_ws_sensor_save_and_delete(self) -> None:
        """Test saving and deleting a sensor via WS."""
        msg_save = {
            "id": 4,
            "type": "safety_monitor/sensor/save",
            "sensor": {
                "entity_id": "binary_sensor.gas_detector",
                "name": "Gas Detector",
                "zone": "kitchen",
                "type": "gas",
                "pre_alarm_delay": 0,
                "enabled": True,
            },
        }
        await ws_save_sensor(self.hass, self.connection, msg_save)
        self.assertIsNotNone(self.storage.async_get_sensor("binary_sensor.gas_detector"))

        msg_del = {
            "id": 5,
            "type": "safety_monitor/sensor/delete",
            "entity_id": "binary_sensor.gas_detector",
        }
        await ws_delete_sensor(self.hass, self.connection, msg_del)
        self.assertIsNone(self.storage.async_get_sensor("binary_sensor.gas_detector"))

    async def test_ws_zone_save_default_name_to_id(self) -> None:
        """Test saving a zone via WS defaults name to ID when omitted or empty."""
        msg_save_empty_name = {
            "id": 10,
            "type": "safety_monitor/zone/save",
            "zone": {
                "id": "workshop",
                "name": "",
            },
        }
        await ws_save_zone(self.hass, self.connection, msg_save_empty_name)
        zone = self.storage.async_get_zone("workshop")
        self.assertIsNotNone(zone)
        self.assertEqual(zone["name"], "workshop")

        # Delete zone via WS
        msg_del = {
            "id": 11,
            "type": "safety_monitor/zone/delete",
            "zone_id": "workshop",
        }
        await ws_delete_zone(self.hass, self.connection, msg_del)
        self.assertIsNone(self.storage.async_get_zone("workshop"))

    async def test_ws_actions_control(self) -> None:
        """Test silence, reset and test mode via WS."""
        # Silence
        await ws_silence_alarm(self.hass, self.connection, {"id": 6, "type": "safety_monitor/action/silence", "duration": 300})
        self.coordinator.async_silence.assert_called_once_with(duration=300)

        # Reset
        await ws_reset_alarm(self.hass, self.connection, {"id": 7, "type": "safety_monitor/action/reset", "force": True})
        self.coordinator.async_reset.assert_called_once_with(force=True)

        # Test Mode
        await ws_set_test_mode(self.hass, self.connection, {"id": 8, "type": "safety_monitor/action/test_mode", "enabled": True, "duration": 600})
        self.coordinator.async_set_test_mode.assert_called_once_with(enabled=True, duration=600)

    async def test_ws_get_status(self) -> None:
        """Test getting live status."""
        msg = {"id": 9, "type": "safety_monitor/status"}
        await ws_get_status(self.hass, self.connection, msg)
        self.connection.send_result.assert_called_once()
        res = self.connection.send_result.call_args[0][1]
        self.assertEqual(res["state"], STATE_NORMAL)


if __name__ == "__main__":
    unittest.main()
