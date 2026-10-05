"""Storage helper for Safety Monitor integration."""
from __future__ import annotations

from datetime import datetime, timezone
import logging
from typing import Any
import uuid

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import (
    DEFAULT_AUTO_SELF_TEST_DAY,
    DEFAULT_AUTO_SELF_TEST_STEP_SECONDS,
    DEFAULT_AUTO_SELF_TEST_TIME,
    DEFAULT_BATTERY_LOW_THRESHOLD,
    DEFAULT_DOUBLE_KNOCK_TIMEOUT,
    DEFAULT_OFFLINE_DEBOUNCE_SECONDS,
    DEFAULT_PRE_ALARM_DELAY,
    DEFAULT_SILENCE_DURATION,
    DEFAULT_STARTUP_GRACE_SECONDS,
    DEFAULT_TEST_MODE_DURATION,
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_CUTOFF,
    PHASE_NOTIFICATION,
    STORAGE_KEY,
    STORAGE_VERSION,
    TYPE_CO,
    TYPE_GAS,
    TYPE_HEAT,
    TYPE_MOISTURE,
    TYPE_SMOKE,
)

_LOGGER = logging.getLogger(__name__)


def _get_default_actions() -> list[dict[str, Any]]:
    """Return default escalation actions."""
    return [
        {
            "id": "default_cutoff_water",
            "name": "Emergency Water Shutoff",
            "trigger_types": [TYPE_MOISTURE],
            "phase": PHASE_CUTOFF,
            "enabled": True,
            "delay": 0,
            "service": "valve.close_valve",
            "target": {"entity_id": []},
            "data": {},
        },
        {
            "id": "default_cutoff_hvac",
            "name": "HVAC / Ventilation Shutdown",
            "trigger_types": [TYPE_SMOKE, TYPE_GAS, TYPE_CO],
            "phase": PHASE_CUTOFF,
            "enabled": True,
            "delay": 0,
            "service": "fan.turn_off",
            "target": {"entity_id": []},
            "data": {},
        },
        {
            "id": "default_open_covers",
            "name": "Open Escape Route Covers",
            "trigger_types": [TYPE_SMOKE, TYPE_GAS, TYPE_CO],
            "phase": PHASE_CUTOFF,
            "enabled": True,
            "delay": 0,
            "service": "cover.open_cover",
            "target": {"entity_id": []},
            "data": {},
        },
        {
            "id": "default_critical_push",
            "name": "Critical Push Notification",
            "trigger_types": [TYPE_SMOKE, TYPE_GAS, TYPE_CO, TYPE_HEAT, TYPE_MOISTURE],
            "phase": PHASE_NOTIFICATION,
            "enabled": True,
            "delay": 0,
            "service": "notify.notify",
            "target": {},
            "data": {
                "title": "🚨 HAZARD DETECTED: {{ hazard_type | upper }} in {{ zone }}!",
                "message": "Hazard detected by {{ sensor_name }} at {{ timestamp }}. Immediate verification required!",
                "data": {
                    "ttl": 0,
                    "priority": "high",
                    "channel": "alarm_stream",
                    "push": {
                        "sound": {
                            "name": "default",
                            "critical": 1,
                            "volume": 1.0,
                        }
                    },
                },
            },
        },
        {
            "id": "default_siren",
            "name": "Acoustic Alarm / Sirens",
            "trigger_types": [TYPE_SMOKE, TYPE_GAS, TYPE_CO, TYPE_HEAT],
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "enabled": True,
            "delay": 0,
            "service": "siren.turn_on",
            "target": {"entity_id": []},
            "data": {},
        },
        {
            "id": "default_emergency_lights",
            "name": "Emergency Red Illumination",
            "trigger_types": [TYPE_SMOKE, TYPE_GAS, TYPE_CO],
            "phase": PHASE_ACOUSTIC_OPTICAL,
            "enabled": True,
            "delay": 0,
            "service": "light.turn_on",
            "target": {"entity_id": []},
            "data": {
                "color_name": "red",
                "brightness": 255,
            },
        },
    ]


def _get_default_zones() -> dict[str, dict[str, Any]]:
    """Return default zones."""
    return {
        "kitchen": {
            "id": "kitchen",
            "name": "Kitchen",
            "double_knock_enabled": False,
            "double_knock_timeout": DEFAULT_DOUBLE_KNOCK_TIMEOUT,
        },
        "living_room": {
            "id": "living_room",
            "name": "Living Room",
            "double_knock_enabled": False,
            "double_knock_timeout": DEFAULT_DOUBLE_KNOCK_TIMEOUT,
        },
        "basement": {
            "id": "basement",
            "name": "Basement",
            "double_knock_enabled": False,
            "double_knock_timeout": DEFAULT_DOUBLE_KNOCK_TIMEOUT,
        },
        "utility_room": {
            "id": "utility_room",
            "name": "Utility / Heating Room",
            "double_knock_enabled": False,
            "double_knock_timeout": DEFAULT_DOUBLE_KNOCK_TIMEOUT,
        },
    }


def _get_default_settings() -> dict[str, Any]:
    """Return default global settings."""
    return {
        "language": "auto",
        "show_back_button": "auto",
        "admin_only_tabs": True,
        "test_mode": False,
        "test_mode_timeout": DEFAULT_TEST_MODE_DURATION,
        "silence_timeout": DEFAULT_SILENCE_DURATION,
        "double_knock_global_timeout": DEFAULT_DOUBLE_KNOCK_TIMEOUT,
        "heartbeat_alert_offline": True,
        "heartbeat_alert_battery": True,
        "offline_debounce_seconds": DEFAULT_OFFLINE_DEBOUNCE_SECONDS,
        "startup_grace_seconds": DEFAULT_STARTUP_GRACE_SECONDS,
        "battery_threshold": DEFAULT_BATTERY_LOW_THRESHOLD,
        "auto_self_test_enabled": False,
        "auto_self_test_day": DEFAULT_AUTO_SELF_TEST_DAY,
        "auto_self_test_time": DEFAULT_AUTO_SELF_TEST_TIME,
        "auto_self_test_step_seconds": DEFAULT_AUTO_SELF_TEST_STEP_SECONDS,
        "auto_self_test_notify": True,
        "last_auto_self_test_date": "",
        "history_default_time": "24h",
        "history_default_type": "all",
    }


class SafetyStorage:
    """Class to hold and manage Safety Monitor persistent data."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage helper."""
        self.hass = hass
        self._store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self.data: dict[str, Any] = {
            "sensors": {},
            "zones": _get_default_zones(),
            "actions": _get_default_actions(),
            "settings": _get_default_settings(),
            "history": [],
        }

    async def async_load(self) -> None:
        """Load stored data from disk or populate with defaults."""
        stored = await self._store.async_load()
        if stored:
            self.data = stored
            # Ensure all required root keys exist
            if "sensors" not in self.data:
                self.data["sensors"] = {}
            if "zones" not in self.data or not self.data["zones"]:
                self.data["zones"] = _get_default_zones()
            if "actions" not in self.data or not self.data["actions"]:
                self.data["actions"] = _get_default_actions()
            if "settings" not in self.data:
                self.data["settings"] = _get_default_settings()
            else:
                # Merge default keys if missing
                defaults = _get_default_settings()
                for key, val in defaults.items():
                    if key not in self.data["settings"]:
                        self.data["settings"][key] = val
            if "history" not in self.data:
                self.data["history"] = []
        else:
            _LOGGER.info("No existing Safety Monitor storage found; initializing with defaults")
            await self.async_save()

    async def async_save(self) -> None:
        """Save data to disk."""
        await self._store.async_save(self.data)

    # Sensors
    def async_get_sensors(self) -> dict[str, dict[str, Any]]:
        """Get all configured sensors."""
        return self.data.get("sensors", {})

    def async_get_sensor(self, entity_id: str) -> dict[str, Any] | None:
        """Get a single sensor configuration."""
        return self.data.get("sensors", {}).get(entity_id)

    async def async_save_sensor(self, sensor_data: dict[str, Any]) -> dict[str, Any]:
        """Create or update a sensor."""
        entity_id = sensor_data["entity_id"]
        existing = self.data["sensors"].get(entity_id, {})
        merged = {
            "entity_id": entity_id,
            "name": sensor_data.get("name", existing.get("name", entity_id)),
            "zone": sensor_data.get("zone", existing.get("zone", "general")),
            "type": sensor_data.get("type", existing.get("type", TYPE_SMOKE)),
            "enabled": sensor_data.get("enabled", existing.get("enabled", True)),
            "pre_alarm_delay": int(sensor_data.get("pre_alarm_delay", existing.get("pre_alarm_delay", DEFAULT_PRE_ALARM_DELAY))),
            "auto_ack_on_clear": bool(sensor_data.get("auto_ack_on_clear", existing.get("auto_ack_on_clear", False))),
            "double_knock": bool(sensor_data.get("double_knock", existing.get("double_knock", False))),
            "linked_shutoff": list(sensor_data.get("linked_shutoff", existing.get("linked_shutoff", []))),
            "silence_entity": (sensor_data.get("silence_entity", existing.get("silence_entity", "")) or "").strip(),
            "drill_entity": (sensor_data.get("drill_entity", existing.get("drill_entity", "")) or "").strip(),
            "test_entity": (sensor_data.get("test_entity", existing.get("test_entity", "")) or "").strip(),
            "battery_entity": (sensor_data.get("battery_entity", existing.get("battery_entity", "")) or "").strip(),
            "test_result_entity": (sensor_data.get("test_result_entity", existing.get("test_result_entity", "")) or "").strip(),
        }
        self.data["sensors"][entity_id] = merged
        await self.async_save()
        return merged

    async def async_delete_sensor(self, entity_id: str) -> bool:
        """Delete a sensor from storage."""
        if entity_id in self.data["sensors"]:
            del self.data["sensors"][entity_id]
            await self.async_save()
            return True
        return False

    # Zones
    def async_get_zones(self) -> dict[str, dict[str, Any]]:
        """Get all zones."""
        return self.data.get("zones", {})

    def async_get_zone(self, zone_id: str) -> dict[str, Any] | None:
        """Get a single zone."""
        return self.data.get("zones", {}).get(zone_id)

    async def async_save_zone(self, zone_data: dict[str, Any]) -> dict[str, Any]:
        """Create or update a zone."""
        zone_id = zone_data.get("id")
        if not zone_id:
            zone_id = str(uuid.uuid4())[:8]
        zone_name = (zone_data.get("name") or "").strip() or zone_id
        merged = {
            "id": zone_id,
            "name": zone_name,
            "double_knock_enabled": bool(zone_data.get("double_knock_enabled", False)),
            "double_knock_timeout": int(zone_data.get("double_knock_timeout", DEFAULT_DOUBLE_KNOCK_TIMEOUT)),
        }
        self.data["zones"][zone_id] = merged
        await self.async_save()
        return merged

    async def async_delete_zone(self, zone_id: str) -> bool:
        """Delete a zone."""
        if zone_id in self.data["zones"]:
            del self.data["zones"][zone_id]
            await self.async_save()
            return True
        return False

    # Actions
    def async_get_actions(self) -> list[dict[str, Any]]:
        """Get all configured escalation actions."""
        return self.data.get("actions", [])

    def async_get_action(self, action_id: str) -> dict[str, Any] | None:
        """Get a single action by id."""
        for act in self.data.get("actions", []):
            if act.get("id") == action_id:
                return act
        return None

    async def async_save_action(self, action_data: dict[str, Any]) -> dict[str, Any]:
        """Save or create an action."""
        action_id = action_data.get("id")
        if not action_id:
            action_id = f"action_{uuid.uuid4().hex[:8]}"

        merged = {
            "id": action_id,
            "name": action_data.get("name", "Custom Action"),
            "trigger_types": list(action_data.get("trigger_types", [TYPE_SMOKE])),
            "phase": action_data.get("phase", PHASE_NOTIFICATION),
            "enabled": bool(action_data.get("enabled", True)),
            "service": action_data.get("service", ""),
            "target": dict(action_data.get("target", {})),
            "data": dict(action_data.get("data", {})),
            "delay": int(action_data.get("delay", 0) or 0),
            "repeat_interval": int(action_data.get("repeat_interval", 0) or 0),
        }

        # Update in place if exists, else append
        actions = self.data["actions"]
        found = False
        for idx, act in enumerate(actions):
            if act.get("id") == action_id:
                actions[idx] = merged
                found = True
                break
        if not found:
            actions.append(merged)

        await self.async_save()
        return merged

    async def async_delete_action(self, action_id: str) -> bool:
        """Delete an action."""
        initial_len = len(self.data["actions"])
        self.data["actions"] = [
            act for act in self.data["actions"] if act.get("id") != action_id
        ]
        if len(self.data["actions"]) < initial_len:
            await self.async_save()
            return True
        return False

    # Settings
    def async_get_settings(self) -> dict[str, Any]:
        """Get global settings."""
        return self.data.get("settings", _get_default_settings())

    async def async_update_settings(self, new_settings: dict[str, Any]) -> dict[str, Any]:
        """Update global settings."""
        self.data["settings"].update(new_settings)
        await self.async_save()
        return self.data["settings"]

    # History
    def async_get_history(self, limit: int = 100) -> list[dict[str, Any]]:
        """Get recent history entries."""
        return self.data.get("history", [])[-limit:]

    async def async_add_history(self, entry: dict[str, Any]) -> None:
        """Add entry to history (capped at 100 items)."""
        if "timestamp" not in entry:
            entry["timestamp"] = datetime.now(timezone.utc).isoformat()
        if "id" not in entry:
            entry["id"] = uuid.uuid4().hex[:8]

        history = self.data.setdefault("history", [])
        history.append(entry)
        if len(history) > 100:
            self.data["history"] = history[-100:]
        await self.async_save()
