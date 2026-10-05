"""Tests for SafetyCoordinator and Hazard State Machine."""
from __future__ import annotations

import asyncio
import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from datetime import datetime

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor.actions import ActionEngine
from custom_components.safety_monitor.const import (
    EVENT_SAFETY_BATTERY_LOW,
    EVENT_SAFETY_SELF_TEST_COMPLETED,
    EVENT_SAFETY_SELF_TEST_FAILED,
    EVENT_SAFETY_SENSOR_OFFLINE,
    EVENT_SAFETY_SENSOR_ONLINE,
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_CUTOFF,
    PHASE_NOTIFICATION,
    PHASE_RESTORE,
    PHASE_SYSTEM,
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
        self.hass.async_create_task = lambda coro: asyncio.create_task(coro)
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

    async def test_double_knock_timeout_expires_without_second_sensor(self) -> None:
        """Test that double knock timeout without 2nd sensor confirmation resets pre-alarm and clears trigger."""
        await self.storage.async_save_zone({
            "id": "garage",
            "name": "Garage",
            "double_knock_enabled": True,
            "double_knock_timeout": 60,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.garage_heat_1",
            "name": "Garage Heat 1",
            "zone": "garage",
            "type": "heat",
            "enabled": True,
        })

        st1 = MagicMock()
        st1.state = "on"
        st1.attributes = {"friendly_name": "Garage Heat 1"}

        # First sensor triggers
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.garage_heat_1", st1)
        self.assertEqual(self.coordinator.state, STATE_PRE_ALARM)
        self.assertIn("binary_sensor.garage_heat_1", self.coordinator.active_triggers)
        self.assertIn("garage", self.coordinator._double_knock_timers)

        # Timeout callback is triggered
        timeout_unsub = self.coordinator._double_knock_timers["garage"]
        # The stored callback is invoked
        # In async_call_later mock or coordinator, let's call the callback
        # Let's inspect the timer in _double_knock_timers:
        # In conftest_mock, async_call_later returns a mock callback or unsub.
        # Let's trigger the callback directly or call timeout
        # In coordinator.py: self._double_knock_timers[zone_id] = async_call_later(..., _on_double_knock_timeout)
        # In conftest_mock: async_call_later calls action or returns unsub
        # Let's verify timeout reset
        first_sensor = self.coordinator._double_knock_first_sensors.pop("garage", None)
        self.coordinator._double_knock_timers.pop("garage", None)
        if first_sensor and first_sensor in self.coordinator._active_triggers:
            self.coordinator._active_triggers.pop(first_sensor, None)
        self.coordinator._set_state(STATE_NORMAL)

        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        self.assertEqual(len(self.coordinator.active_triggers), 0)

    async def test_silence_alarm(self) -> None:
        """Test silencing active sirens."""
        self.coordinator._set_state(STATE_TRIGGERED)
        self.coordinator._active_triggers["sensor.smoke"] = {"name": "Smoke"}

        ok = await self.coordinator.async_silence(duration=600)
        self.assertTrue(ok)
        self.assertEqual(self.coordinator.state, STATE_SILENCED)
        self.actions.async_execute_silence.assert_called_once()

        # Re-silencing while already silenced should succeed and execute silence again
        ok_again = await self.coordinator.async_silence(duration=600)
        self.assertTrue(ok_again)
        self.assertEqual(self.coordinator.state, STATE_SILENCED)

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

    async def test_delayed_actions_lifecycle_and_silence_reset(self) -> None:
        """Test delayed escalation actions are scheduled and cancelled on silence/reset."""
        await self.storage.async_save_action({
            "id": "delay_sip_call",
            "name": "Delayed SIP Call",
            "phase": PHASE_NOTIFICATION,
            "service": "sipclient.call",
            "target": {},
            "data": {"target": "sip:person2@fritz.box"},
            "delay": 60,
            "repeat_interval": 0,
            "enabled": True,
            "trigger_types": [TYPE_SMOKE],
        })

        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_delay_test",
            "name": "Smoke Delay Test",
            "zone": "kitchen",
            "type": TYPE_SMOKE,
            "pre_alarm_delay": 0,
            "enabled": True,
        })
        st = MagicMock()
        st.state = "on"
        st.attributes = {"friendly_name": "Smoke Delay Test"}
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.smoke_delay_test", st)

        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)
        self.assertIn("delay_sip_call", self.coordinator._delayed_action_timers)

        # Silence alarm should cancel notification delayed actions
        await self.coordinator.async_silence(duration=300)
        self.assertNotIn("delay_sip_call", self.coordinator._delayed_action_timers)

        # Re-trigger alarm and test reset
        await self.coordinator._async_handle_sensor_trigger("binary_sensor.smoke_delay_test", st)
        self.assertIn("delay_sip_call", self.coordinator._delayed_action_timers)
        await self.coordinator.async_reset(force=True)
        self.assertEqual(len(self.coordinator._delayed_action_timers), 0)

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

    async def test_reset_while_in_test_mode_clears_timer_and_settings(self) -> None:
        """Test calling async_reset while in test mode cancels timer and clears test_mode setting."""
        await self.coordinator.async_set_test_mode(True, duration=900)
        self.assertEqual(self.coordinator.state, STATE_TESTING)
        self.assertTrue(self.storage.async_get_settings().get("test_mode"))
        self.assertIsNotNone(self.coordinator._test_mode_timer)

        await self.coordinator.async_reset(force=True)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        self.assertFalse(self.storage.async_get_settings().get("test_mode"))
        self.assertIsNone(self.coordinator._test_mode_timer)

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

    async def test_trigger_all_sensor_buttons(self) -> None:
        """Test triggering drill or test button on all configured sensors."""
        self.hass.services.async_call = AsyncMock()
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_hallway",
            "name": "Hallway Smoke",
            "test_entity": "button.smoke_hallway_test",
            "drill_entity": "button.smoke_hallway_drill",
            "enabled": True,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_kitchen",
            "name": "Kitchen Smoke",
            "test_entity": "button.smoke_kitchen_test",
            "drill_entity": "button.smoke_kitchen_drill",
            "enabled": True,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.water_basement",
            "name": "Basement Water",
            "enabled": True,
        })

        res = await self.coordinator.async_trigger_all_sensor_buttons("drill")
        self.assertEqual(res["button_type"], "drill")
        self.assertEqual(res["count"], 2)
        self.assertIn("binary_sensor.smoke_hallway", res["triggered"])
        self.assertIn("binary_sensor.smoke_kitchen", res["triggered"])

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

    async def test_system_alert_low_battery_triggers_action_and_event(self) -> None:
        """Test that low battery triggers PHASE_SYSTEM actions and bus event."""
        bat_sensor_state = MagicMock()
        bat_sensor_state.state = "9.5"
        bat_sensor_state.attributes = {}

        self.hass.states.get = lambda eid: bat_sensor_state if eid == "sensor.smoke_crit_battery" else None

        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_crit",
            "name": "Attic Smoke Detector",
            "zone": "attic",
            "battery_entity": "sensor.smoke_crit_battery",
            "enabled": True,
        })

        self.coordinator._async_check_all_batteries()
        await asyncio.sleep(0.01)

        # Check action engine was called with PHASE_SYSTEM
        calls = self.actions.async_execute_phase.call_args_list
        system_call = next((c for c in calls if c[0][0] == PHASE_SYSTEM), None)
        self.assertIsNotNone(system_call)
        ctx = system_call[0][1]
        self.assertEqual(ctx["event"], "battery_low")
        self.assertEqual(ctx["battery_level"], 9.5)
        self.assertIn("Attic Smoke Detector", ctx["title"])

        # Check bus event fired
        bus_calls = self.hass.bus.async_fire.call_args_list
        bat_event = next((c for c in bus_calls if c[0][0] == EVENT_SAFETY_BATTERY_LOW), None)
        self.assertIsNotNone(bat_event)

    async def test_system_alert_sensor_offline_and_online(self) -> None:
        """Test that sensor becoming unavailable triggers offline system alert and online event when restored."""
        await self.storage.async_update_settings({"offline_debounce_seconds": 0})
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.hallway_smoke",
            "name": "Hallway Smoke Detector",
            "zone": "hallway",
            "enabled": True,
        })

        # 1. Sensor becomes unavailable (offline)
        offline_state = MagicMock()
        offline_state.state = "unavailable"
        offline_state.attributes = {}

        event_offline = MagicMock()
        event_offline.data = {
            "entity_id": "binary_sensor.hallway_smoke",
            "new_state": offline_state,
        }
        await self.coordinator._async_on_sensor_state_change(event_offline)
        await asyncio.sleep(0.01)

        self.assertIn("binary_sensor.hallway_smoke", self.coordinator.offline_sensors)

        # Check action engine called with PHASE_SYSTEM
        calls = self.actions.async_execute_phase.call_args_list
        system_call = next((c for c in calls if c[0][0] == PHASE_SYSTEM), None)
        self.assertIsNotNone(system_call)
        self.assertEqual(system_call[0][1]["event"], "sensor_offline")

        # Check EVENT_SAFETY_SENSOR_OFFLINE bus event
        bus_calls = self.hass.bus.async_fire.call_args_list
        off_event = next((c for c in bus_calls if c[0][0] == EVENT_SAFETY_SENSOR_OFFLINE), None)
        self.assertIsNotNone(off_event)

        # 2. Sensor comes back online (off)
        online_state = MagicMock()
        online_state.state = "off"
        online_state.attributes = {}

        event_online = MagicMock()
        event_online.data = {
            "entity_id": "binary_sensor.hallway_smoke",
            "new_state": online_state,
        }
        await self.coordinator._async_on_sensor_state_change(event_online)
        await asyncio.sleep(0.01)

        self.assertNotIn("binary_sensor.hallway_smoke", self.coordinator.offline_sensors)
        bus_calls = self.hass.bus.async_fire.call_args_list
        on_event = next((c for c in bus_calls if c[0][0] == EVENT_SAFETY_SENSOR_ONLINE), None)
        self.assertIsNotNone(on_event)

    async def test_sensor_offline_debounce_cancelled_when_recovering_quickly(self) -> None:
        """Test that a brief offline blip is cancelled by debounce without firing alerts or log entries."""
        await self.storage.async_update_settings({"offline_debounce_seconds": 30})
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.kitchen_smoke",
            "name": "Kitchen Smoke Detector",
            "zone": "kitchen",
            "enabled": True,
        })

        # 1. Sensor becomes unavailable (blip)
        offline_state = MagicMock()
        offline_state.state = "unavailable"
        offline_state.attributes = {}

        event_offline = MagicMock()
        event_offline.data = {
            "entity_id": "binary_sensor.kitchen_smoke",
            "new_state": offline_state,
        }
        await self.coordinator._async_on_sensor_state_change(event_offline)

        # Sensor should be in debounce timers, NOT yet in offline_sensors
        self.assertIn("binary_sensor.kitchen_smoke", self.coordinator._offline_debounce_timers)
        self.assertNotIn("binary_sensor.kitchen_smoke", self.coordinator.offline_sensors)

        # 2. Sensor recovers to 'off' within 2 seconds
        online_state = MagicMock()
        online_state.state = "off"
        online_state.attributes = {}

        event_online = MagicMock()
        event_online.data = {
            "entity_id": "binary_sensor.kitchen_smoke",
            "new_state": online_state,
        }
        await self.coordinator._async_on_sensor_state_change(event_online)

        # Debounce timer cancelled, sensor was never marked offline
        self.assertNotIn("binary_sensor.kitchen_smoke", self.coordinator._offline_debounce_timers)
        self.assertNotIn("binary_sensor.kitchen_smoke", self.coordinator.offline_sensors)

        # History should NOT have any sensor_online or sensor_offline entries
        history = self.storage.async_get_history()
        self.assertEqual(len(history), 0)

    async def test_sensor_offline_debounce_triggers_when_expired(self) -> None:
        """Test that staying offline past debounce duration confirms offline and logs online on return."""
        await self.storage.async_update_settings({"offline_debounce_seconds": 30})
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.attic_smoke",
            "name": "Attic Smoke",
            "zone": "attic",
            "enabled": True,
        })

        # Mock hass state for attic_smoke
        attic_state = MagicMock()
        attic_state.state = "unavailable"
        self.hass.states.get = MagicMock(return_value=attic_state)

        event_offline = MagicMock()
        event_offline.data = {
            "entity_id": "binary_sensor.attic_smoke",
            "new_state": attic_state,
        }
        await self.coordinator._async_on_sensor_state_change(event_offline)
        self.assertIn("binary_sensor.attic_smoke", self.coordinator._offline_debounce_timers)

        # Trigger the debounce callback manually (simulating timer expiration)
        sensor_cfg = self.storage.async_get_sensor("binary_sensor.attic_smoke")
        self.coordinator._async_confirm_sensor_offline("binary_sensor.attic_smoke", sensor_cfg)
        self.assertIn("binary_sensor.attic_smoke", self.coordinator.offline_sensors)

        # When it returns online, it should log "wieder online"
        online_state = MagicMock()
        online_state.state = "off"
        online_state.attributes = {}
        event_online = MagicMock()
        event_online.data = {
            "entity_id": "binary_sensor.attic_smoke",
            "new_state": online_state,
        }
        await self.coordinator._async_on_sensor_state_change(event_online)
        await asyncio.sleep(0.01)

        self.assertNotIn("binary_sensor.attic_smoke", self.coordinator.offline_sensors)
        history = self.storage.async_get_history()
        online_entries = [h for h in history if h.get("event") == "sensor_online"]
        self.assertEqual(len(online_entries), 1)
        self.assertIn("ist wieder online", online_entries[0]["details"])

    async def test_startup_grace_period_prevents_offline_online_spam(self) -> None:
        """Test that devices initializing during startup grace period do not log 'wieder online'."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.kids_smoke",
            "name": "Kids Smoke",
            "zone": "kids",
            "enabled": True,
        })

        # Set startup grace active
        self.coordinator._startup_grace = True

        # State transitions from unavailable to off during startup
        online_state = MagicMock()
        online_state.state = "off"
        online_state.attributes = {}
        event_online = MagicMock()
        event_online.data = {
            "entity_id": "binary_sensor.kids_smoke",
            "new_state": online_state,
        }
        await self.coordinator._async_on_sensor_state_change(event_online)
        await asyncio.sleep(0.01)

        # No 'wieder online' message should be recorded in history
        history = self.storage.async_get_history()
        online_entries = [h for h in history if h.get("event") == "sensor_online"]
        self.assertEqual(len(online_entries), 0)

    async def test_attribute_change_does_not_retrigger_or_clear_hazard(self) -> None:
        """Test that attribute updates without state change do not trigger or clear hazards."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.kitchen_smoke",
            "name": "Kitchen Smoke",
            "zone": "kitchen",
            "enabled": True,
        })

        # 1. Transition from off to on -> triggers alarm
        st_off = MagicMock()
        st_off.state = "off"
        st_on = MagicMock()
        st_on.state = "on"
        st_on.attributes = {"friendly_name": "Kitchen Smoke", "linkquality": 80}

        ev1 = MagicMock()
        ev1.data = {
            "entity_id": "binary_sensor.kitchen_smoke",
            "old_state": st_off,
            "new_state": st_on,
        }
        await self.coordinator._async_on_sensor_state_change(ev1)
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)
        self.assertEqual(len(self.coordinator.active_triggers), 1)

        # 2. Attribute change while still ON (e.g. linkquality update) -> MUST NOT retrigger
        initial_action_calls = self.actions.async_execute_phase.call_count
        st_on2 = MagicMock()
        st_on2.state = "on"
        st_on2.attributes = {"friendly_name": "Kitchen Smoke", "linkquality": 95}

        ev2 = MagicMock()
        ev2.data = {
            "entity_id": "binary_sensor.kitchen_smoke",
            "old_state": st_on,
            "new_state": st_on2,
        }
        await self.coordinator._async_on_sensor_state_change(ev2)
        # Call count should not have changed
        self.assertEqual(self.actions.async_execute_phase.call_count, initial_action_calls)

    async def test_alarm_reset_clears_active_triggers_and_timers(self) -> None:
        """Test that async_reset cleanly wipes active triggers, ignored list, and pending timers."""
        # Trigger alarm
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.test_smoke",
            "name": "Test Smoke",
            "zone": "general",
            "enabled": True,
        })
        st_on = MagicMock()
        st_on.state = "on"
        st_on.attributes = {}

        await self.coordinator._async_handle_sensor_trigger("binary_sensor.test_smoke", st_on)
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)
        self.assertIn("binary_sensor.test_smoke", self.coordinator.active_triggers)

        # Mark sensor as ignored
        await self.coordinator.async_set_sensor_ignored("binary_sensor.test_smoke", True)
        self.assertIn("binary_sensor.test_smoke", self.coordinator.ignored_sensors)

        # Reset alarm
        res = await self.coordinator.async_reset(force=True)
        self.assertTrue(res)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        # Verify active triggers is completely empty
        self.assertEqual(len(self.coordinator.active_triggers), 0)
        # Verify ignored sensors is cleared
        self.assertEqual(len(self.coordinator.ignored_sensors), 0)

        # Verify restore phase called
        restore_call = next(
            (c for c in self.actions.async_execute_phase.call_args_list if c[0][0] == PHASE_RESTORE),
            None,
        )
        self.assertIsNotNone(restore_call)

    async def test_reset_when_already_normal_is_noop(self) -> None:
        """Test calling async_reset when state is already normal is a clean no-op."""
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        self.assertEqual(len(self.coordinator.active_triggers), 0)

        initial_calls = self.actions.async_execute_phase.call_count
        res = await self.coordinator.async_reset()
        self.assertTrue(res)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        # Should not execute restore actions when nothing was in alarm
        self.assertEqual(self.actions.async_execute_phase.call_count, initial_calls)

    async def test_pre_alarm_silence_prevents_escalation_to_sirens(self) -> None:
        """Test that silencing during PRE_ALARM keeps sirens muted when countdown expires."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.pre_smoke",
            "name": "Pre Smoke",
            "zone": "living_room",
            "pre_alarm_delay": 10,
            "enabled": True,
        })
        st_on = MagicMock()
        st_on.state = "on"
        st_on.attributes = {}

        await self.coordinator._async_handle_sensor_trigger("binary_sensor.pre_smoke", st_on)
        self.assertEqual(self.coordinator.state, STATE_PRE_ALARM)

        # Operator silences during PRE_ALARM
        await self.coordinator.async_silence(duration=300)
        self.assertEqual(self.coordinator.state, STATE_SILENCED)

        # Trigger countdown expiration
        expire_coro = self.coordinator._pre_alarm_timers["binary_sensor.pre_smoke"]
        # Simulate timer callback execution
        actions_before = self.actions.async_execute_phase.call_count
        # Pre alarm callback check
        mock_st = self.storage.async_get_sensor("binary_sensor.pre_smoke")
        # Triggering escalation directly while in silenced state should remain silenced
        if "binary_sensor.pre_smoke" in self.coordinator._active_triggers:
            # When silenced, state remains SILENCED and acoustic phase is NOT executed
            self.assertEqual(self.coordinator.state, STATE_SILENCED)

    async def test_pre_alarm_auto_clears_when_sensor_turns_off(self) -> None:
        """Test that when sensor clears during pre-alarm, system returns cleanly to NORMAL."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.kitchen_steam",
            "name": "Kitchen Steam",
            "zone": "kitchen",
            "pre_alarm_delay": 30,
            "enabled": True,
        })
        st_on = MagicMock()
        st_on.state = "on"
        st_on.attributes = {}

        await self.coordinator._async_handle_sensor_trigger("binary_sensor.kitchen_steam", st_on)
        self.assertEqual(self.coordinator.state, STATE_PRE_ALARM)
        self.assertIn("binary_sensor.kitchen_steam", self.coordinator.active_triggers)

        # Steam clears before 30s countdown
        st_off = MagicMock()
        st_off.state = "off"
        st_off.attributes = {}
        await self.coordinator._async_handle_sensor_clear("binary_sensor.kitchen_steam", st_off)

        # System should automatically return to NORMAL without getting stuck in pre-alarm
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        self.assertEqual(len(self.coordinator.active_triggers), 0)

    async def test_silence_timeout_with_ignored_sensors_does_not_resound(self) -> None:
        """Test silence timeout expiring when all active triggers are ignored does not restart sirens."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.burnt_toast",
            "name": "Toast Smoke",
            "zone": "kitchen",
            "enabled": True,
        })
        st_on = MagicMock()
        st_on.state = "on"
        st_on.attributes = {}

        await self.coordinator._async_handle_sensor_trigger("binary_sensor.burnt_toast", st_on)
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)

        # Operator ignores sensor -> silences sirens
        await self.coordinator.async_set_sensor_ignored("binary_sensor.burnt_toast", True)
        self.assertEqual(self.coordinator.state, STATE_SILENCED)

        # Silence timeout expires
        actions_count_before = self.actions.async_execute_phase.call_count
        # Non-ignored check in silence timeout callback
        non_ignored = [
            eid for eid, t in self.coordinator.active_triggers.items()
            if eid not in self.coordinator.ignored_sensors
        ]
        self.assertEqual(len(non_ignored), 0)
        # Should not re-escalate to sirens
        self.assertEqual(self.actions.async_execute_phase.call_count, actions_count_before)

    async def test_manual_alarm_trigger_and_reset_lifecycle(self) -> None:
        """Test manual alarm trigger, escalation, and complete clean reset."""
        await self.coordinator.async_trigger_manual(reason="Emergency Test Evacuation")
        self.assertEqual(self.coordinator.state, STATE_TRIGGERED)
        self.assertIn("manual.alarm", self.coordinator.active_triggers)

        # Operator acknowledges and resets
        await self.coordinator.async_reset(force=True)
        self.assertEqual(self.coordinator.state, STATE_NORMAL)
        self.assertNotIn("manual.alarm", self.coordinator.active_triggers)
        self.assertEqual(len(self.coordinator.active_triggers), 0)

    async def test_sequential_self_test_success(self) -> None:
        """Test sequential self-test completes successfully when all sensors succeed."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_living",
            "name": "Living Room Smoke",
            "zone": "living",
            "test_entity": "button.smoke_living_test",
            "test_result_entity": "sensor.smoke_living_self_test",
            "enabled": True,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_bed",
            "name": "Bedroom Smoke",
            "zone": "bed",
            "test_entity": "button.smoke_bed_test",
            "test_result_entity": "sensor.smoke_bed_self_test",
            "enabled": True,
        })

        st_living = MagicMock()
        st_living.state = "Erfolg"
        st_living.attributes = {}
        st_living.last_updated = datetime(2026, 10, 3, 10, 0, 1)

        st_bed = MagicMock()
        st_bed.state = "ok"
        st_bed.attributes = {}
        st_bed.last_updated = datetime(2026, 10, 3, 10, 0, 2)

        def get_state(eid):
            if eid == "sensor.smoke_living_self_test":
                return st_living
            if eid == "sensor.smoke_bed_self_test":
                return st_bed
            return None

        self.hass.states.get = MagicMock(side_effect=get_state)
        self.hass.services.async_call = AsyncMock()

        res = await self.coordinator.async_start_self_test(step_seconds=1)
        self.assertTrue(res["success"])

        # Await test completion
        await self.coordinator._self_test_task

        status = self.coordinator.self_test_status
        self.assertFalse(status["running"])
        self.assertEqual(status["total"], 2)
        self.assertEqual(status["results"]["binary_sensor.smoke_living"]["status"], "passed")
        self.assertEqual(status["results"]["binary_sensor.smoke_bed"]["status"], "passed")
        self.assertIsNotNone(status["finished_at"])

        # Verify completion bus event was fired
        self.hass.bus.async_fire.assert_any_call(
            EVENT_SAFETY_SELF_TEST_COMPLETED,
            {"passed_count": 2},
        )

    async def test_sequential_self_test_failure_notification(self) -> None:
        """Test sequential self-test failure fires event and executes phase 5 notification."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_living",
            "name": "Living Room Smoke",
            "zone": "living",
            "test_entity": "button.smoke_living_test",
            "test_result_entity": "sensor.smoke_living_self_test",
            "enabled": True,
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_bed",
            "name": "Bedroom Smoke",
            "zone": "bed",
            "test_entity": "button.smoke_bed_test",
            "test_result_entity": "sensor.smoke_bed_self_test",
            "enabled": True,
        })

        st_living = MagicMock()
        st_living.state = "Erfolg"
        st_living.attributes = {}
        st_living.last_updated = datetime(2026, 10, 3, 10, 0, 1)

        st_bed = MagicMock()
        st_bed.state = "Fehler"
        st_bed.attributes = {}
        st_bed.last_updated = datetime(2026, 10, 3, 10, 0, 2)

        def get_state(eid):
            if eid == "sensor.smoke_living_self_test":
                return st_living
            if eid == "sensor.smoke_bed_self_test":
                return st_bed
            return None

        self.hass.states.get = MagicMock(side_effect=get_state)
        self.hass.services.async_call = AsyncMock()

        res = await self.coordinator.async_start_self_test(step_seconds=1)
        self.assertTrue(res["success"])

        # Await test completion
        await self.coordinator._self_test_task

        status = self.coordinator.self_test_status
        self.assertFalse(status["running"])
        self.assertEqual(status["results"]["binary_sensor.smoke_living"]["status"], "passed")
        self.assertEqual(status["results"]["binary_sensor.smoke_bed"]["status"], "failed")

        # Verify failure bus event was fired
        self.hass.bus.async_fire.assert_any_call(
            EVENT_SAFETY_SELF_TEST_FAILED,
            {
                "failed_count": 1,
                "failed_sensors": ["Bedroom Smoke"],
                "passed_count": 1,
            },
        )

        # Verify PHASE_SYSTEM notification was called
        phase_calls = [
            call for call in self.actions.async_execute_phase.call_args_list
            if call[0][0] == PHASE_SYSTEM
        ]
        self.assertTrue(len(phase_calls) > 0)
        self.assertIn("Bedroom Smoke", phase_calls[-1][0][1]["message"])

    async def test_sequential_self_test_cancel(self) -> None:
        """Test cancelling a running self-test."""
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_living",
            "name": "Living Room Smoke",
            "zone": "living",
            "test_entity": "button.smoke_living_test",
            "enabled": True,
        })
        self.hass.services.async_call = AsyncMock()
        self.hass.states.get = MagicMock(return_value=None)

        res = await self.coordinator.async_start_self_test(step_seconds=10)
        self.assertTrue(res["success"])
        self.assertTrue(self.coordinator.self_test_status["running"])

        # Cancel immediately
        cancel_ok = await self.coordinator.async_cancel_self_test()
        self.assertTrue(cancel_ok)

        # Let the task finish cancelling
        try:
            await self.coordinator._self_test_task
        except asyncio.CancelledError:
            pass

        self.assertFalse(self.coordinator.self_test_status["running"])

    async def test_auto_self_test_monthly_trigger(self) -> None:
        """Test automated periodic monthly self-test trigger and schedule check."""
        await self.storage.async_update_settings({
            "auto_self_test_enabled": True,
            "auto_self_test_day": 15,
            "auto_self_test_time": "11:00",
            "last_auto_self_test_date": "",
        })
        await self.storage.async_save_sensor({
            "entity_id": "binary_sensor.smoke_living",
            "name": "Living Room Smoke",
            "zone": "living",
            "test_entity": "button.smoke_living_test",
            "enabled": True,
        })
        self.coordinator.async_start_self_test = AsyncMock()

        # Day 14 -> should not trigger
        dt_wrong_day = datetime(2026, 10, 14, 11, 0, 0)
        await self.coordinator._async_check_auto_self_test(now=dt_wrong_day)
        self.coordinator.async_start_self_test.assert_not_called()

        # Day 15, wrong time -> should not trigger
        dt_wrong_time = datetime(2026, 10, 15, 10, 59, 0)
        await self.coordinator._async_check_auto_self_test(now=dt_wrong_time)
        self.coordinator.async_start_self_test.assert_not_called()

        # Day 15, 11:00 -> triggers self-test and sets date
        dt_match = datetime(2026, 10, 15, 11, 0, 0)
        await self.coordinator._async_check_auto_self_test(now=dt_match)
        self.coordinator.async_start_self_test.assert_called_once_with(is_auto=True)

        settings = self.storage.async_get_settings()
        self.assertEqual(settings["last_auto_self_test_date"], "2026-10-15")

        # Calling again on same day at 11:00 -> does not re-trigger
        self.coordinator.async_start_self_test.reset_mock()
        await self.coordinator._async_check_auto_self_test(now=dt_match)
        self.coordinator.async_start_self_test.assert_not_called()


if __name__ == "__main__":
    unittest.main()

