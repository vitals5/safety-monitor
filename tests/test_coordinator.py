"""Tests for SafetyCoordinator and Hazard State Machine."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.actions import ActionEngine
from custom_components.safety_monitor.const import (
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_RESTORE,
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
        """Test resetting alarm back to normal triggers restore phase."""
        self.coordinator._set_state(STATE_TRIGGERED)
        self.coordinator._active_triggers["sensor.smoke"] = {"name": "Smoke"}

        ok = await self.coordinator.async_reset(force=True)
        self.assertTrue(ok)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        # Restore phase should be called with all_clear
        restore_call = next(
            (c for c in self.actions.async_execute_phase.call_args_list if c[0][0] == PHASE_RESTORE),
            None,
        )
        self.assertIsNotNone(restore_call)
        self.assertEqual(restore_call[0][1].get("hazard_type"), "all_clear")

    async def test_repeating_actions_lifecycle(self) -> None:
        """Test repeating actions are scheduled on alarm and cancelled on silence/reset."""
        await self.storage.async_save_action({
            "id": "repeat_siren_test",
            "name": "Repeat Siren",
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "service": "siren.turn_on",
            "target": {"entity_id": "siren.test"},
            "repeat_interval": 30,
            "enabled": True,
            "trigger_types": [TYPE_SMOKE],
        })

        # Trigger alarm
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_rep",
            "name": "Smoke Rep",
            "zone": "kitchen",
            "type": TYPE_SMOKE,
            "pre_alarm_delay": 0,
            "enabled": True,
        })
        st = MagicMock()
        st.state = "on"
        st.attributes = {"friendly_name": "Smoke Rep"}
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.smoke_rep", st)

        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)
        self.assertIn("repeat_siren_test", self.coordinator._repeating_action_timers)

        # Silence alarm should cancel acoustic repeating timer
        await self.coordinator.async_silence(duration=300)
        self.assertNotIn("repeat_siren_test", self.coordinator._repeating_action_timers)

        # Reset alarm cancels everything
        await self.coordinator.async_reset(force=True)
        self.assertEqual(len(self.coordinator._repeating_action_timers), 0)

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


    async def test_sensor_silence_button_triggered_on_silence(self) -> None:
        """Test silencing alarm triggers sensor's silence_entity."""
        self.hass.services.async_call = AsyncMock()
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_hallway",
            "name": "Hallway Smoke",
            "zone": "hallway",
            "type": TYPE_SMOKE,
            "silence_entity": "button.smoke_hallway_silence",
            "enabled": True,
        })

        st = MagicMock()
        st.state = "on"
        st.attributes = {"friendly_name": "Hallway Smoke"}
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.smoke_hallway", st)
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)

        # Now silence
        await self.coordinator.async_silence(duration=600)
        self.assertEqual(self.coordinator.state, STATE_SILENCED)

        # Verify button.press was called for silence_entity
        calls = self.hass.services.async_call.call_args_list
        button_call = next(
            (c for c in calls if c[0][0] == "button" and c[0][1] == "press" and c[1]["target"]["entity_id"] == ["button.smoke_hallway_silence"]),
            None,
        )
        self.assertIsNotNone(button_call)

    async def test_sensor_trigger_button_test_and_drill(self) -> None:
        """Test triggering self-test and drill buttons via coordinator."""
        self.hass.services.async_call = AsyncMock()
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_bedroom",
            "name": "Bedroom Smoke",
            "zone": "bedroom",
            "test_entity": "button.smoke_bedroom_self_test",
            "drill_entity": "button.smoke_bedroom_drill",
            "enabled": True,
        })

        # Trigger self-test
        res_test = await self.coordinator.async_trigger_sensor_button("binary_sensor.smoke_bedroom", "test")
        self.assertTrue(res_test)

        # Trigger drill
        res_drill = await self.coordinator.async_trigger_sensor_button("binary_sensor.smoke_bedroom", "drill")
        self.assertTrue(res_drill)

        calls = self.hass.services.async_call.call_args_list
        called_targets = [c[1]["target"]["entity_id"][0] for c in calls if c[0][0] == "button" and c[0][1] == "press"]
        self.assertIn("button.smoke_bedroom_self_test", called_targets)
        self.assertIn("button.smoke_bedroom_drill", called_targets)

    async def test_sensor_temporary_ignore_and_auto_clear(self) -> None:
        """Test temporarily ignoring a sensor mutes alarm until sensor clears."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.kitchen_smoke",
            "name": "Kitchen Smoke Alarm",
            "zone": "kitchen",
            "type": TYPE_SMOKE,
            "enabled": True,
        })

        st_on = MagicMock()
        st_on.state = "on"
        st_on.attributes = {"friendly_name": "Kitchen Smoke Alarm"}
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.kitchen_smoke", st_on)
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)

        # Ignore triggered sensor
        await self.coordinator.async_set_sensor_ignored("binary_sensor.kitchen_smoke", True)
        self.assertIn("binary_sensor.kitchen_smoke", self.coordinator.ignored_sensors)
        self.assertTrue(self.coordinator.active_triggers["binary_sensor.kitchen_smoke"]["ignored"])
        # Sirens silenced, state transitions to SILENCED
        self.assertEqual(self.coordinator.state, STATE_SILENCED)

        # Sensor returns to OFF (smoke cleared) -> should auto-remove from ignored_sensors
        st_off = MagicMock()
        st_off.state = "off"
        await self.coordinator._async_handle_sensor_clear("binary_sensor.kitchen_smoke", st_off)
        self.assertNotIn("binary_sensor.kitchen_smoke", self.coordinator.ignored_sensors)

    async def test_sensor_battery_monitoring_and_threshold(self) -> None:
        """Test battery monitoring from entity and attributes with low threshold flag."""
        # Setup mock states in hass
        bat_sensor_state = MagicMock()
        bat_sensor_state.state = "12.0"
        bat_sensor_state.attributes = {}

        normal_sensor_state = MagicMock()
        normal_sensor_state.state = "off"
        normal_sensor_state.attributes = {"battery_level": 85.0}

        def mock_get(eid):
            if eid == "sensor.detector_battery":
                return bat_sensor_state
            if eid == "binary_sensor.normal_detector":
                return normal_sensor_state
            return None

        self.hass.states.get = mock_get

        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.low_detector",
            "name": "Low Battery Detector",
            "battery_entity": "sensor.detector_battery",
            "enabled": True,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.normal_detector",
            "name": "Normal Battery Detector",
            "enabled": True,
        })

        self.coordinator._async_check_all_batteries()

        batteries = self.coordinator.sensor_batteries
        low_batteries = self.coordinator.low_battery_sensors

        self.assertIn("binary_sensor.low_detector", batteries)
        self.assertEqual(batteries["binary_sensor.low_detector"]["level"], 12.0)
        self.assertTrue(batteries["binary_sensor.low_detector"]["low"])
        self.assertIn("binary_sensor.low_detector", low_batteries)

        self.assertIn("binary_sensor.normal_detector", batteries)
        self.assertEqual(batteries["binary_sensor.normal_detector"]["level"], 85.0)
        self.assertFalse(batteries["binary_sensor.normal_detector"]["low"])
        self.assertNotIn("binary_sensor.normal_detector", low_batteries)


if __name__ == "__main__":
    unittest.main()
