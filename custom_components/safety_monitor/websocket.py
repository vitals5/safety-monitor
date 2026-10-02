"""WebSocket API endpoints for Safety Monitor."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.const import ATTR_DEVICE_CLASS, ATTR_FRIENDLY_NAME
from homeassistant.core import HomeAssistant, callback
import homeassistant.helpers.config_validation as cv

from .const import (
    DOMAIN,
    HAZARD_DEVICE_CLASSES,
)
from .coordinator import SafetyCoordinator
from .store import SafetyStorage

_LOGGER = logging.getLogger(__name__)


def _get_integration_instances(hass: HomeAssistant) -> tuple[SafetyStorage, SafetyCoordinator] | tuple[None, None]:
    """Get active storage and coordinator."""
    data = hass.data.get(DOMAIN, {})
    for entry_data in data.values():
        if isinstance(entry_data, dict) and "storage" in entry_data and "coordinator" in entry_data:
            return entry_data["storage"], entry_data["coordinator"]
    return None, None


@callback
def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Register WebSocket handlers for the Safety Monitor UI."""
    websocket_api.async_register_command(hass, ws_get_config)
    websocket_api.async_register_command(hass, ws_update_settings)
    websocket_api.async_register_command(hass, ws_list_candidate_sensors)
    websocket_api.async_register_command(hass, ws_save_sensor)
    websocket_api.async_register_command(hass, ws_delete_sensor)
    websocket_api.async_register_command(hass, ws_save_zone)
    websocket_api.async_register_command(hass, ws_delete_zone)
    websocket_api.async_register_command(hass, ws_save_action)
    websocket_api.async_register_command(hass, ws_delete_action)
    websocket_api.async_register_command(hass, ws_test_action)
    websocket_api.async_register_command(hass, ws_silence_alarm)
    websocket_api.async_register_command(hass, ws_reset_alarm)
    websocket_api.async_register_command(hass, ws_set_test_mode)
    websocket_api.async_register_command(hass, ws_trigger_alarm)
    websocket_api.async_register_command(hass, ws_get_status)


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/config/get",
    }
)
@websocket_api.async_response
async def ws_get_config(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return all configuration data."""
    store, coordinator = _get_integration_instances(hass)
    if not store:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    connection.send_result(
        msg["id"],
        {
            "sensors": store.async_get_sensors(),
            "zones": store.async_get_zones(),
            "actions": store.async_get_actions(),
            "settings": store.async_get_settings(),
            "history": store.async_get_history(limit=50),
            "state": coordinator.state if coordinator else "normal",
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/config/update_settings",
        vol.Required("settings"): dict,
    }
)
@websocket_api.async_response
async def ws_update_settings(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Update global settings."""
    store, coordinator = _get_integration_instances(hass)
    if not store:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    updated = await store.async_update_settings(msg["settings"])
    connection.send_result(msg["id"], {"settings": updated})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/sensors/list_candidates",
    }
)
@websocket_api.async_response
async def ws_list_candidate_sensors(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List candidate hazard sensors from HA states."""
    store, _ = _get_integration_instances(hass)
    monitored = store.async_get_sensors() if store else {}

    candidates: list[dict[str, Any]] = []
    for state_obj in hass.states.async_all("binary_sensor"):
        dev_class = state_obj.attributes.get(ATTR_DEVICE_CLASS, "")
        is_hazard_class = dev_class in HAZARD_DEVICE_CLASSES or any(
            hz in state_obj.entity_id for hz in ["smoke", "rauch", "water", "wasser", "leak", "gas", "co_", "heat"]
        )

        candidates.append({
            "entity_id": state_obj.entity_id,
            "name": state_obj.attributes.get(ATTR_FRIENDLY_NAME, state_obj.entity_id),
            "device_class": dev_class,
            "state": state_obj.state,
            "is_hazard_class": is_hazard_class,
            "monitored": state_obj.entity_id in monitored,
        })

    # Sort hazard candidates to top
    candidates.sort(key=lambda x: (not x["is_hazard_class"], x["monitored"], x["name"]))
    connection.send_result(msg["id"], {"candidates": candidates})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/sensor/save",
        vol.Required("sensor"): vol.Schema(
            {
                vol.Required("entity_id"): cv.entity_id,
                vol.Optional("name"): cv.string,
                vol.Optional("zone"): cv.string,
                vol.Optional("type"): cv.string,
                vol.Optional("enabled"): cv.boolean,
                vol.Optional("pre_alarm_delay"): cv.positive_int,
                vol.Optional("auto_ack_on_clear"): cv.boolean,
                vol.Optional("double_knock"): cv.boolean,
                vol.Optional("linked_shutoff"): list,
            }
        ),
    }
)
@websocket_api.async_response
async def ws_save_sensor(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Save or update a sensor."""
    store, coordinator = _get_integration_instances(hass)
    if not store or not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    saved = await store.async_save_sensor(msg["sensor"])
    await coordinator.async_update_listeners()
    connection.send_result(msg["id"], {"sensor": saved})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/sensor/delete",
        vol.Required("entity_id"): cv.entity_id,
    }
)
@websocket_api.async_response
async def ws_delete_sensor(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a monitored sensor."""
    store, coordinator = _get_integration_instances(hass)
    if not store or not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    success = await store.async_delete_sensor(msg["entity_id"])
    if success:
        await coordinator.async_update_listeners()
    connection.send_result(msg["id"], {"success": success})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/zone/save",
        vol.Required("zone"): dict,
    }
)
@websocket_api.async_response
async def ws_save_zone(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Save or update a zone."""
    store, _ = _get_integration_instances(hass)
    if not store:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    zone_data = dict(msg["zone"])
    if not (zone_data.get("name") or "").strip():
        zone_data["name"] = zone_data.get("id")

    saved = await store.async_save_zone(zone_data)
    connection.send_result(msg["id"], {"zone": saved})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/zone/delete",
        vol.Required("zone_id"): cv.string,
    }
)
@websocket_api.async_response
async def ws_delete_zone(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a zone."""
    store, _ = _get_integration_instances(hass)
    if not store:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    success = await store.async_delete_zone(msg["zone_id"])
    connection.send_result(msg["id"], {"success": success})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/action/save",
        vol.Required("action"): dict,
    }
)
@websocket_api.async_response
async def ws_save_action(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Save or update an action."""
    store, _ = _get_integration_instances(hass)
    if not store:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    saved = await store.async_save_action(msg["action"])
    connection.send_result(msg["id"], {"action": saved})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/action/delete",
        vol.Required("action_id"): cv.string,
    }
)
@websocket_api.async_response
async def ws_delete_action(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete an action."""
    store, _ = _get_integration_instances(hass)
    if not store:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    success = await store.async_delete_action(msg["action_id"])
    connection.send_result(msg["id"], {"success": success})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/action/test",
        vol.Optional("action_id"): cv.string,
        vol.Optional("action"): dict,
        vol.Optional("context"): dict,
    }
)
@websocket_api.async_response
async def ws_test_action(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Test fire a configured action or unsaved draft action."""
    store, coordinator = _get_integration_instances(hass)
    if not store or not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    action_id = msg.get("action_id")
    action_dict = msg.get("action")
    context = msg.get("context")

    if not action_id and not action_dict:
        connection.send_error(
            msg["id"],
            "invalid_format",
            "Either action_id or action dictionary must be provided",
        )
        return

    try:
        if action_dict:
            success = await coordinator.actions.async_test_action_dict(
                action_dict, context=context
            )
        else:
            success = await coordinator.actions.async_test_action(
                action_id, context=context
            )
        connection.send_result(msg["id"], {"success": bool(success)})
    except Exception as err:
        connection.send_result(msg["id"], {"success": False, "error": str(err)})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/action/silence",
        vol.Optional("duration"): cv.positive_int,
    }
)
@websocket_api.async_response
async def ws_silence_alarm(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Silence acoustic/optical alarms."""
    _, coordinator = _get_integration_instances(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    duration = msg.get("duration")
    success = await coordinator.async_silence(duration=duration)
    connection.send_result(msg["id"], {"success": success, "state": coordinator.state})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/action/reset",
        vol.Optional("force", default=False): cv.boolean,
    }
)
@websocket_api.async_response
async def ws_reset_alarm(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Reset alarm to normal."""
    _, coordinator = _get_integration_instances(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    force = msg.get("force", False)
    success = await coordinator.async_reset(force=force)
    connection.send_result(msg["id"], {"success": success, "state": coordinator.state})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/action/test_mode",
        vol.Required("enabled"): cv.boolean,
        vol.Optional("duration"): cv.positive_int,
    }
)
@websocket_api.async_response
async def ws_set_test_mode(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Toggle maintenance/test mode."""
    _, coordinator = _get_integration_instances(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    enabled = msg.get("enabled", True)
    duration = msg.get("duration")
    success = await coordinator.async_set_test_mode(enabled=enabled, duration=duration)
    connection.send_result(msg["id"], {"success": success, "state": coordinator.state})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/action/trigger",
        vol.Optional("reason", default="Manual UI Trigger"): cv.string,
    }
)
@websocket_api.async_response
async def ws_trigger_alarm(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Manually trigger emergency alarm."""
    _, coordinator = _get_integration_instances(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    reason = msg.get("reason", "Manual UI Trigger")
    await coordinator.async_trigger_manual(reason=reason)
    connection.send_result(msg["id"], {"success": True, "state": coordinator.state})


@websocket_api.websocket_command(
    {
        vol.Required("type"): "safety_monitor/status",
    }
)
@websocket_api.async_response
async def ws_get_status(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return live status of the safety monitor."""
    _, coordinator = _get_integration_instances(hass)
    if not coordinator:
        connection.send_error(msg["id"], "not_found", "Safety Monitor not initialized")
        return

    connection.send_result(
        msg["id"],
        {
            "state": coordinator.state,
            "active_triggers": coordinator.active_triggers,
            "last_trigger": coordinator.last_trigger,
            "offline_sensors": coordinator.offline_sensors,
            "low_battery_sensors": coordinator.low_battery_sensors,
        },
    )
