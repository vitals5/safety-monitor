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
    PHASE_RESTORE,
    PHASE_SYSTEM,
    TYPE_MOISTURE,
    TYPE_SMOKE,
)
from homeassistant.exceptions import HomeAssistantError
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

    async def test_manual_test_missing_target_raises(self) -> None:
        """Test manual testing of an action without target entity raises HomeAssistantError."""
        await self.storage.async_save_action({
            "id": "action_no_target",
            "name": "Targetless Siren",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "siren.turn_on",
            "target": {"entity_id": []},
            "data": {},
            "enabled": True,
            "trigger_types": [TYPE_SMOKE],
        })

        with self.assertRaises(HomeAssistantError) as ctx:
            await self.engine.async_test_action("action_no_target")
        self.assertIn("Keine Ziel-Entität", str(ctx.exception))

    async def test_execute_restore_phase(self) -> None:
        """Test executing restore phase triggers restore actions for all_clear context."""
        await self.storage.async_save_action({
            "id": "action_restore_lights",
            "name": "Restore Lights Off",
            "phase": PHASE_RESTORE,
            "service": "light.turn_off",
            "target": {"entity_id": "light.emergency"},
            "data": {},
            "enabled": True,
            "trigger_types": [TYPE_SMOKE],
        })

        context = {
            "hazard_type": "all_clear",
            "sensor_name": "Safety Monitor",
            "zone": "all",
        }
        executed = await self.engine.async_execute_phase(PHASE_RESTORE, context)
        self.assertIn("action_restore_lights", executed)

        calls = self.hass.services.async_call.call_args_list
        restore_call = next((c for c in calls if c[0][0] == "light" and c[0][1] == "turn_off"), None)
        self.assertIsNotNone(restore_call)
        self.assertEqual(restore_call[1].get("target"), {"entity_id": "light.emergency"})

    async def test_smart_hazard_type_behavior(self) -> None:
        """Test SmartHazardType equality and formatting."""
        from custom_components.safety_monitor.actions import SmartHazardType
        h = SmartHazardType("Wasserleckage", "moisture")
        self.assertEqual(str(h), "Wasserleckage")
        self.assertEqual(h, "Wasserleckage")
        self.assertEqual(h, "moisture")
        self.assertEqual(h, "MOISTURE")
        self.assertEqual(h.upper(), "WASSERLECKAGE")

    async def test_manual_test_action_renders_realistic_moisture_sample(self) -> None:
        """Test testing an action uses realistic localized moisture sample data."""
        await self.storage.async_save_action({
            "id": "water_test_act",
            "name": "Wasser Benachrichtigung",
            "phase": PHASE_NOTIFICATION,
            "service": "notify.mobile_app",
            "target": {},
            "data": {
                "message": "Alarm: {{ hazard_type }} in {{ zone }} durch {{ sensor_name }}!",
            },
            "enabled": True,
            "trigger_types": [TYPE_MOISTURE],
        })

        res = await self.engine.async_test_action("water_test_act")
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in reversed(calls) if c[0][0] == "notify"), None)
        self.assertIsNotNone(notify_call)
        msg = notify_call[0][2]["message"]
        self.assertIn("Wasserleckage", msg)
        self.assertIn("Waschküche", msg)

    async def test_manual_test_action_uses_configured_sensors_and_zones(self) -> None:
        """Test test context prioritizes real configured sensors and zones from storage."""
        await self.storage.async_save_zone({
            "id": "zone_attic",
            "name": "Dachboden Studio",
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.attic_smoke",
            "name": "Dachboden Rauchmelder",
            "type": TYPE_SMOKE,
            "zone": "zone_attic",
        })
        await self.storage.async_save_action({
            "id": "smoke_attic_act",
            "name": "Rauch Benachrichtigung",
            "phase": PHASE_NOTIFICATION,
            "service": "notify.mobile_app",
            "target": {},
            "data": {
                "message": "{{ sensor_name }} in {{ zone }}: {{ hazard_type }}",
            },
            "enabled": True,
            "trigger_types": [TYPE_SMOKE],
        })

        res = await self.engine.async_test_action("smoke_attic_act")
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in reversed(calls) if c[0][0] == "notify"), None)
        self.assertIsNotNone(notify_call)
        msg = notify_call[0][2]["message"]
        self.assertEqual(msg, "Dachboden Rauchmelder in Dachboden Studio: Rauch")

    async def test_manual_test_action_dict_unsaved(self) -> None:
        """Test testing an unsaved action dict directly via async_test_action_dict."""
        action_dict = {
            "name": "Unsaved Draft Action",
            "phase": PHASE_NOTIFICATION,
            "service": "notify.mobile_app",
            "target": {},
            "data": {
                "message": "Test Draft: {{ hazard_type }} (Status: {{ state }})",
            },
            "trigger_types": [TYPE_MOISTURE],
        }
        res = await self.engine.async_test_action_dict(action_dict)
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in reversed(calls) if c[0][0] == "notify"), None)
        self.assertIsNotNone(notify_call)
        msg = notify_call[0][2]["message"]
        self.assertIn("Wasserleckage", msg)
        self.assertIn("triggered", msg)

    async def test_manual_test_action_restore_phase(self) -> None:
        """Test test context for restore phase generates Entwarnung and normal state."""
        action_dict = {
            "name": "Restore Push",
            "phase": PHASE_RESTORE,
            "service": "notify.mobile_app",
            "target": {},
            "data": {
                "message": "{{ hazard_type }} gemeldet. Status ist {{ state }}.",
            },
            "trigger_types": [],
        }
        res = await self.engine.async_test_action_dict(action_dict)
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in reversed(calls) if c[0][0] == "notify"), None)
        self.assertIsNotNone(notify_call)
        msg = notify_call[0][2]["message"]
        self.assertIn("Entwarnung", msg)
        self.assertIn("normal", msg)

    async def test_script_turn_on_auto_wraps_variables(self) -> None:
        """Test script.turn_on automatically wraps flat parameters under variables dict."""
        action_dict = {
            "name": "Script Call via turn_on",
            "phase": PHASE_NOTIFICATION,
            "service": "script.turn_on",
            "target": {"entity_id": ["script.notfall_ansage"]},
            "data": {
                "text": "Achtung: {{ hazard_type }} in {{ zone }}!",
            },
            "trigger_types": [TYPE_SMOKE],
        }
        res = await self.engine.async_test_action_dict(action_dict)
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        script_call = next((c for c in reversed(calls) if c[0][0] == "script" and c[0][1] == "turn_on"), None)
        self.assertIsNotNone(script_call)
        call_data = script_call[0][2]
        self.assertIn("variables", call_data)
        self.assertIn("text", call_data["variables"])
        self.assertIn("Rauch", call_data["variables"]["text"])
        self.assertEqual(script_call[1].get("target"), {"entity_id": ["script.notfall_ansage"]})

    async def test_direct_script_call_suppresses_target(self) -> None:
        """Test calling direct script service suppresses target to avoid voluptuous errors."""
        action_dict = {
            "name": "Direct Script Call",
            "phase": PHASE_NOTIFICATION,
            "service": "script.notfall_ansage",
            "target": {"entity_id": ["script.notfall_ansage"]},
            "data": {
                "text": "Achtung: {{ hazard_type }} in {{ zone }}!",
            },
            "trigger_types": [TYPE_SMOKE],
        }
        res = await self.engine.async_test_action_dict(action_dict)
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        script_call = next((c for c in reversed(calls) if c[0][0] == "script" and c[0][1] == "notfall_ansage"), None)
        self.assertIsNotNone(script_call)
        # Direct script services in HA do not take target
        self.assertIsNone(script_call[1].get("target"))
        self.assertIn("Rauch", script_call[0][2]["text"])

    async def test_notify_notify_suppresses_target(self) -> None:
        """Test notify.notify suppresses target to avoid voluptuous 'not a valid option at target'."""
        action_dict = {
            "name": "Notify Action",
            "phase": PHASE_NOTIFICATION,
            "service": "notify.notify",
            "target": {"entity_id": ["notify.notify"]},
            "data": {
                "title": "🚨 Safety Monitor Alarm",
                "message": "Achtung: {{ hazard_type }} erkannt durch {{ sensor_name }} in Zone {{ zone }} um {{ timestamp }}!",
            },
            "trigger_types": [TYPE_SMOKE],
        }
        res = await self.engine.async_test_action_dict(action_dict)
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in reversed(calls) if c[0][0] == "notify" and c[0][1] == "notify"), None)
        self.assertIsNotNone(notify_call)
        # Target must be None so HA does not fail validation
        self.assertIsNone(notify_call[1].get("target"))
        payload = notify_call[0][2]
        self.assertEqual(payload["title"], "🚨 Safety Monitor Alarm")
        self.assertIn("Achtung: Rauch erkannt durch", payload["message"])

    async def test_execute_system_phase(self) -> None:
        """Test executing PHASE_SYSTEM actions on low battery or offline event."""
        await self.storage.async_save_action({
            "name": "System Push Alert",
            "phase": PHASE_SYSTEM,
            "service": "notify.notify",
            "data": {
                "title": "{{ title }}",
                "message": "{{ message }} (Batterie: {{ battery_level }}%)",
            },
            "enabled": True,
        })

        context = {
            "sensor_name": "Keller Rauchmelder",
            "entity_id": "binary_sensor.smoke_basement",
            "zone": "Keller",
            "event": "battery_low",
            "battery_level": 11.5,
            "title": "🪫 Schwache Batterie: Keller Rauchmelder",
            "message": "Batteriestand kritisch!",
        }

        executed = await self.engine.async_execute_phase(PHASE_SYSTEM, context)
        self.assertEqual(len(executed), 1)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in reversed(calls) if c[0][0] == "notify" and c[0][1] == "notify"), None)
        self.assertIsNotNone(notify_call)
        payload = notify_call[0][2]
        self.assertEqual(payload["title"], "🪫 Schwache Batterie: Keller Rauchmelder")
        self.assertIn("Batteriestand kritisch! (Batterie: 11.5%)", payload["message"])

    async def test_manual_test_action_system_phase(self) -> None:
        """Test testing a system action generates realistic battery sample context."""
        action_dict = {
            "name": "Test System Warning",
            "phase": PHASE_SYSTEM,
            "service": "notify.notify",
            "data": {
                "title": "{{ title }}",
                "message": "{{ message }} - Event: {{ event }}",
            },
        }

        res = await self.engine.async_test_action_dict(action_dict)
        self.assertTrue(res)

        calls = self.hass.services.async_call.call_args_list
        notify_call = next((c for c in reversed(calls) if c[0][0] == "notify" and c[0][1] == "notify"), None)
        self.assertIsNotNone(notify_call)
        payload = notify_call[0][2]
        self.assertIn("Schwache Batterie", payload["title"])
        self.assertIn("Event: battery_low", payload["message"])


    async def test_silence_turns_off_all_acoustic_optical_devices(self) -> None:
        """Test that async_execute_silence turns off sirens, lights, switches, media players, and booleans."""
        await self.storage.async_save_action({
            "id": "act_siren",
            "name": "Siren Alarm",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "siren.turn_on",
            "target": {"entity_id": "siren.alarm_horn"},
            "enabled": True,
        })
        await self.storage.async_save_action({
            "id": "act_light",
            "name": "Red Light",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "light.turn_on",
            "target": {"entity_id": "light.beacon_red"},
            "enabled": True,
        })
        await self.storage.async_save_action({
            "id": "act_switch",
            "name": "Buzzer Plug",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "switch.turn_on",
            "target": {"entity_id": "switch.plug_buzzer"},
            "enabled": True,
        })
        await self.storage.async_save_action({
            "id": "act_media",
            "name": "TTS Audio Siren",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "media_player.play_media",
            "target": {"entity_id": "media_player.living_room_speaker"},
            "enabled": True,
        })
        await self.storage.async_save_action({
            "id": "act_boolean",
            "name": "Alarm Flag",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "input_boolean.turn_on",
            "target": {"entity_id": "input_boolean.alarm_active"},
            "enabled": True,
        })

        await self.engine.async_execute_silence()

        calls = self.hass.services.async_call.call_args_list

        # Check siren turned off
        siren_call = next((c for c in calls if c[0][0] == "siren" and c[0][1] == "turn_off"), None)
        self.assertIsNotNone(siren_call)
        self.assertEqual(siren_call[1]["target"]["entity_id"], "siren.alarm_horn")

        # Check light turned off
        light_call = next((c for c in calls if c[0][0] == "light" and c[0][1] == "turn_off"), None)
        self.assertIsNotNone(light_call)
        self.assertEqual(light_call[1]["target"]["entity_id"], "light.beacon_red")

        # Check switch turned off
        switch_call = next((c for c in calls if c[0][0] == "switch" and c[0][1] == "turn_off"), None)
        self.assertIsNotNone(switch_call)
        self.assertEqual(switch_call[1]["target"]["entity_id"], "switch.plug_buzzer")

        # Check media_player stopped
        media_call = next((c for c in calls if c[0][0] == "media_player" and c[0][1] == "media_stop"), None)
        self.assertIsNotNone(media_call)
        self.assertEqual(media_call[1]["target"]["entity_id"], "media_player.living_room_speaker")

        # Check input_boolean turned off
        bool_call = next((c for c in calls if c[0][0] == "input_boolean" and c[0][1] == "turn_off"), None)
        self.assertIsNotNone(bool_call)
        self.assertEqual(bool_call[1]["target"]["entity_id"], "input_boolean.alarm_active")


if __name__ == "__main__":
    unittest.main()



