"""Tests for Safety Monitor WebSocket API."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.const import DOMAIN, STATE_NORMAL
from custom_components.safety_monitor.store import SafetyStorage
from custom_components.safety_monitor.websocket import (
    ws_cancel_self_test,
    ws_delete_action,
    ws_delete_sensor,
    ws_delete_zone,
    ws_get_config,
    ws_get_status,
    ws_ignore_sensor,
    ws_list_candidate_sensors,
    ws_reset_alarm,
    ws_save_action,
    ws_save_sensor,
    ws_save_zone,
    ws_set_test_mode,
    ws_silence_alarm,
    ws_start_self_test,
    ws_test_action,
    ws_trigger_all_sensor_buttons,
    ws_trigger_sensor_button,
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
        self.coordinator.self_test_status = {"running": False, "total": 0}
        self.coordinator.async_update_listeners = AsyncMock()
        self.coordinator.async_silence = AsyncMock(return_value=True)
        self.coordinator.async_reset = AsyncMock(return_value=True)
        self.coordinator.async_set_test_mode = AsyncMock(return_value=True)
        self.coordinator.async_trigger_all_sensor_buttons = AsyncMock(
            return_value={"button_type": "test", "count": 2, "triggered": ["binary_sensor.smoke_1", "binary_sensor.smoke_2"]}
        )
        self.coordinator.actions = MagicMock()
        self.coordinator.actions.async_test_action = AsyncMock(return_value=True)
        self.coordinator.actions.async_test_action_dict = AsyncMock(return_value=True)

        self.hass.data = {
            DOMAIN: {
                "test_entry": {
                    "storage": self.storage,
                    "coordinator": self.coordinator,
                }
            }
        }

    async def test_ws_get_config(self) -> None:
        """Test fetching full config including history up to 100 items."""
        # Add 75 history items
        for i in range(75):
            await self.storage.async_add_history({"event": "sensor_triggered", "details": f"Evt {i}"})

        msg = {"id": 1, "type": "safety_monitor/config/get"}
        await ws_get_config(self.hass, self.connection, msg)
        self.connection.send_result.assert_called_once()
        args = self.connection.send_result.call_args[0]
        self.assertEqual(args[0], 1)
        self.assertIn("sensors", args[1])
        self.assertIn("zones", args[1])
        self.assertIn("actions", args[1])
        self.assertIn("history", args[1])
        # Verify limit is at least 75 (previously was capped at 50)
        self.assertEqual(len(args[1]["history"]), 75)
        self.assertEqual(args[1]["settings"].get("history_default_time"), "24h")
        self.assertEqual(args[1]["settings"].get("history_default_type"), "all")

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
        """Test scanning candidate sensors including None friendly_name and battery sibling."""
        st1 = MagicMock()
        st1.entity_id = "binary_sensor.smoke_detector"
        st1.domain = "binary_sensor"
        st1.state = "off"
        # Test friendly_name being None (as can happen in HA)
        st1.attributes = {"device_class": "smoke", "friendly_name": None}

        st2 = MagicMock()
        st2.entity_id = "binary_sensor.motion_hallway"
        st2.domain = "binary_sensor"
        st2.state = "off"
        st2.attributes = {"device_class": "motion", "friendly_name": "Motion Sensor"}

        st3 = MagicMock()
        st3.entity_id = "sensor.smoke_detector_battery"
        st3.domain = "sensor"
        st3.state = "92"
        st3.attributes = {"device_class": "battery", "friendly_name": "Smoke Detector Battery"}

        def mock_async_all(domain=None):
            if domain == "binary_sensor":
                return [st1, st2]
            return [st1, st2, st3]

        self.hass.states.async_all = MagicMock(side_effect=mock_async_all)

        msg = {"id": 3, "type": "safety_monitor/sensors/list_candidates"}
        await ws_list_candidate_sensors(self.hass, self.connection, msg)
        self.connection.send_result.assert_called_once()
        candidates = self.connection.send_result.call_args[0][1]["candidates"]
        self.assertEqual(len(candidates), 2)
        # Smoke detector is recognized as hazard and matched sibling battery
        smoke_cand = next(c for c in candidates if c["entity_id"] == "binary_sensor.smoke_detector")
        self.assertTrue(smoke_cand["is_hazard_class"])
        self.assertEqual(smoke_cand["suggested_battery"], "sensor.smoke_detector_battery")
        self.assertEqual(smoke_cand["battery_level"], 92.0)

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
        self.assertIn("self_test_status", res)
        self.assertEqual(res["self_test_status"], {"running": False, "total": 0})

    async def test_ws_trigger_sensor_button(self) -> None:
        """Test triggering a sensor button via WS."""
        self.coordinator.async_trigger_sensor_button = AsyncMock(return_value=True)
        msg = {
            "id": 12,
            "type": "safety_monitor/sensor/trigger_button",
            "entity_id": "binary_sensor.smoke_kitchen",
            "button_type": "test",
        }
        await ws_trigger_sensor_button(self.hass, self.connection, msg)
        self.coordinator.async_trigger_sensor_button.assert_called_once_with(
            "binary_sensor.smoke_kitchen", "test"
        )
        self.connection.send_result.assert_called_once_with(12, {"success": True})

    async def test_ws_trigger_sensor_button_with_sensor_entity_id_fallback(self) -> None:
        """Test triggering a sensor button via WS with legacy sensor_entity_id key."""
        self.coordinator.async_trigger_sensor_button = AsyncMock(return_value=True)
        msg = {
            "id": 122,
            "type": "safety_monitor/sensor/trigger_button",
            "sensor_entity_id": "binary_sensor.smoke_garage",
            "button_type": "drill",
        }
        await ws_trigger_sensor_button(self.hass, self.connection, msg)
        self.coordinator.async_trigger_sensor_button.assert_called_once_with(
            "binary_sensor.smoke_garage", "drill"
        )
        self.connection.send_result.assert_called_once_with(122, {"success": True})

    async def test_ws_ignore_sensor(self) -> None:
        """Test ignoring a sensor via WS."""
        self.coordinator.async_set_sensor_ignored = AsyncMock(return_value=True)
        msg = {
            "id": 13,
            "type": "safety_monitor/sensor/ignore",
            "entity_id": "binary_sensor.smoke_kitchen",
            "ignored": True,
        }
        await ws_ignore_sensor(self.hass, self.connection, msg)
        self.coordinator.async_set_sensor_ignored.assert_called_once_with(
            "binary_sensor.smoke_kitchen", True
        )
        self.connection.send_result.assert_called_once_with(13, {"success": True})

    async def test_ws_action_save_and_delete(self) -> None:
        """Test saving and deleting an action via WS."""
        msg_save = {
            "id": 14,
            "type": "safety_monitor/action/save",
            "action": {
                "name": "Sirene Test",
                "service": "siren.turn_on",
                "target": {"entity_id": ["siren.alarm"]},
                "data": {},
                "phase": "acoustic_optical",
                "trigger_types": ["smoke"],
            },
        }
        await ws_save_action(self.hass, self.connection, msg_save)
        self.coordinator.async_update_listeners.assert_called_once()
        self.connection.send_result.assert_called_once()
        res = self.connection.send_result.call_args[0][1]
        self.assertIn("action", res)
        saved_action = res["action"]
        self.assertEqual(saved_action["name"], "Sirene Test")
        action_id = saved_action["id"]

        # Delete
        self.connection.send_result.reset_mock()
        self.coordinator.async_update_listeners.reset_mock()
        msg_del = {
            "id": 15,
            "type": "safety_monitor/action/delete",
            "action_id": action_id,
        }
        await ws_delete_action(self.hass, self.connection, msg_del)
        self.coordinator.async_update_listeners.assert_called_once()
        self.connection.send_result.assert_called_once_with(15, {"success": True})
        self.assertIsNone(self.storage.async_get_action(action_id))

    async def test_ws_action_test(self) -> None:
        """Test executing action test via WS with action_id and unsaved draft action dict."""
        # Test with draft action dict (from modal test button)
        msg_dict = {
            "id": 16,
            "type": "safety_monitor/action/test",
            "action": {
                "name": "Draft Notify",
                "service": "notify.notify",
                "target": {},
                "data": {"message": "Test"},
                "trigger_types": ["smoke"],
            },
        }
        await ws_test_action(self.hass, self.connection, msg_dict)
        self.coordinator.actions.async_test_action_dict.assert_called_once()
        self.connection.send_result.assert_called_once_with(16, {"success": True})

        # Test with action_id (from actions tab card button)
        self.connection.send_result.reset_mock()
        msg_id = {
            "id": 17,
            "type": "safety_monitor/action/test",
            "action_id": "act_existing",
        }
        await ws_test_action(self.hass, self.connection, msg_id)
        self.coordinator.actions.async_test_action.assert_called_once_with("act_existing", context=None)
        self.connection.send_result.assert_called_once_with(17, {"success": True})

    async def test_ws_trigger_all_sensor_buttons(self) -> None:
        """Test triggering test or drill buttons on all sensors."""
        msg = {
            "id": 18,
            "type": "safety_monitor/action/trigger_all_sensor_buttons",
            "button_type": "test",
        }
        await ws_trigger_all_sensor_buttons(self.hass, self.connection, msg)
        self.coordinator.async_trigger_all_sensor_buttons.assert_called_once_with("test")
        self.connection.send_result.assert_called_once()
        res = self.connection.send_result.call_args[0][1]
        self.assertEqual(res["count"], 2)

    async def test_ws_self_test_start_and_cancel(self) -> None:
        """Test starting and cancelling sequential self-test via WS."""
        self.coordinator.async_start_self_test = AsyncMock(
            return_value={"success": True, "status": {"running": True, "total": 1}}
        )
        self.coordinator.async_cancel_self_test = AsyncMock(return_value=True)

        msg_start = {
            "id": 20,
            "type": "safety_monitor/self_test/start",
            "step_seconds": 45,
        }
        await ws_start_self_test(self.hass, self.connection, msg_start)
        self.coordinator.async_start_self_test.assert_called_once_with(step_seconds=45)
        self.connection.send_result.assert_called_once_with(
            20, {"success": True, "status": {"running": True, "total": 1}}
        )

        self.connection.send_result.reset_mock()
        msg_cancel = {
            "id": 21,
            "type": "safety_monitor/self_test/cancel",
        }
        await ws_cancel_self_test(self.hass, self.connection, msg_cancel)
        self.coordinator.async_cancel_self_test.assert_called_once()
        self.connection.send_result.assert_called_once_with(
            21, {"success": True, "status": {"running": False, "total": 0}}
        )


if __name__ == "__main__":
    unittest.main()
