"""Escalation and Action Execution Engine for Safety Monitor."""
from __future__ import annotations

import copy
from datetime import datetime, timezone
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.template import Template

from .const import (
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_CUTOFF,
    PHASE_NOTIFICATION,
    PHASE_RESTORE,
)
from .store import SafetyStorage

_LOGGER = logging.getLogger(__name__)


def _render_value(val: Any, hass: HomeAssistant, context: dict[str, Any]) -> Any:
    """Recursively render templates or format strings."""
    if isinstance(val, str):
        if "{{" in val or "{%" in val:
            try:
                tpl = Template(val, hass)
                return tpl.async_render(context, parse_result=False)
            except Exception as err:
                _LOGGER.warning("Failed to render template '%s': %s", val, err)
                # Fallback to simple replace
                res = val
                for k, v in context.items():
                    res = res.replace("{{" + f" {k} " + "}}", str(v)).replace("{{" + str(k) + "}}", str(v))
                return res
        return val
    elif isinstance(val, dict):
        return {k: _render_value(v, hass, context) for k, v in val.items()}
    elif isinstance(val, list):
        return [_render_value(item, hass, context) for item in val]
    return val


class ActionEngine:
    """Dispatches emergency actions, notifications, cutoffs, and sirens."""

    def __init__(self, hass: HomeAssistant, store: SafetyStorage) -> None:
        """Initialize the Action Engine."""
        self.hass = hass
        self.store = store

    async def async_execute_phase(
        self,
        phase: str,
        context: dict[str, Any],
        sensor_config: dict[str, Any] | None = None,
    ) -> list[str]:
        """Execute all configured actions for a given phase and hazard type."""
        settings = self.store.async_get_settings()
        is_test_mode = settings.get("test_mode", False)
        hazard_type = context.get("hazard_type", "smoke")
        executed_actions: list[str] = []

        # 1. Handle sensor-specific linked cutoffs during PHASE_CUTOFF
        if phase == PHASE_CUTOFF and sensor_config:
            linked_shutoffs = sensor_config.get("linked_shutoff", [])
            for entity_id in linked_shutoffs:
                if not entity_id:
                    continue
                if is_test_mode:
                    _LOGGER.info(
                        "[TEST MODE] Simulating linked shutoff for entity %s",
                        entity_id,
                    )
                    continue

                domain = entity_id.split(".")[0]
                service = "turn_off"
                if domain == "valve":
                    service = "close_valve"
                elif domain == "cover":
                    service = "open_cover"

                try:
                    await self.hass.services.async_call(
                        domain,
                        service,
                        {},
                        target={"entity_id": entity_id},
                        blocking=False,
                    )
                    _LOGGER.info(
                        "Executed emergency linked shutoff %s.%s on %s",
                        domain,
                        service,
                        entity_id,
                    )
                    executed_actions.append(f"linked_shutoff:{entity_id}")
                except Exception as err:
                    _LOGGER.error(
                        "Failed to execute emergency linked shutoff on %s: %s",
                        entity_id,
                        err,
                    )

        # 2. Iterate through configured escalation actions
        actions = self.store.async_get_actions()
        for action in actions:
            if not action.get("enabled", True):
                continue
            if action.get("phase") != phase:
                continue

            trigger_types = action.get("trigger_types", [])
            if trigger_types and hazard_type not in trigger_types and hazard_type != "all_clear":
                continue

            # In test mode: skip physical cutoffs and acoustic sirens
            if is_test_mode:
                if phase in (PHASE_CUTOFF, PHASE_ACOUSTIC_OPTICAL):
                    _LOGGER.info(
                        "[TEST MODE] Suppressed action '%s' (%s) during test mode",
                        action.get("name"),
                        action.get("service"),
                    )
                    continue
                elif phase == PHASE_NOTIFICATION:
                    # Modify notification context to indicate test
                    context = copy.deepcopy(context)
                    context["hazard_type"] = f"TEST: {context.get('hazard_type')}"

            # Execute the action
            action_id = action.get("id", "unknown")
            await self._async_call_action(action, context, blocking=False)
            executed_actions.append(action_id)

        return executed_actions

    async def async_call_single_action(
        self, action: dict[str, Any], context: dict[str, Any], blocking: bool = False
    ) -> bool:
        """Call a single action."""
        return await self._async_call_action(action, context, blocking=blocking)

    async def _async_call_action(
        self, action: dict[str, Any], context: dict[str, Any], blocking: bool = False
    ) -> bool:
        """Render and execute a single service call."""
        service_raw = action.get("service", "")
        if not service_raw or "." not in service_raw:
            _LOGGER.warning("Invalid action service format: %s", service_raw)
            if blocking:
                raise HomeAssistantError(f"Ungültiges Dienstformat: '{service_raw}'")
            return False

        domain, service = service_raw.split(".", 1)
        raw_target = action.get("target", {})
        raw_data = action.get("data", {})

        rendered_target = _render_value(raw_target, self.hass, context)
        rendered_data = _render_value(raw_data, self.hass, context)

        # Clean empty target keys
        target = {k: v for k, v in rendered_target.items() if v} if isinstance(rendered_target, dict) else {}

        # Validate if target is required and missing
        requires_target = domain in [
            "valve", "switch", "light", "siren", "fan", "cover",
            "lock", "climate", "media_player", "input_boolean"
        ]
        target_entities = target.get("entity_id") if isinstance(target, dict) else None
        if isinstance(target_entities, list):
            target_entities = [e for e in target_entities if e]
        elif isinstance(target_entities, str):
            target_entities = [target_entities] if target_entities.strip() else []

        if blocking and requires_target and not target_entities:
            _LOGGER.warning("Action '%s' (%s) skipped: No target entity configured", action.get("name"), service_raw)
            raise HomeAssistantError(f"Keine Ziel-Entität für '{service_raw}' hinterlegt! Bitte Aktion bearbeiten und ein Ziel festlegen.")


        try:
            await self.hass.services.async_call(
                domain,
                service,
                rendered_data if isinstance(rendered_data, dict) else {},
                target=target if target else None,
                blocking=blocking,
            )
            _LOGGER.info(
                "Successfully dispatched safety action '%s' (%s.%s)",
                action.get("name"),
                domain,
                service,
            )
            return True
        except Exception as err:
            _LOGGER.error(
                "Error executing safety action '%s' (%s.%s): %s",
                action.get("name"),
                domain,
                service,
                err,
            )
            if blocking:
                raise
            return False

    async def async_execute_silence(self) -> None:
        """Turn off active sirens and optical devices."""
        actions = self.store.async_get_actions()
        for action in actions:
            if action.get("phase") != PHASE_ACOUSTIC_OPTICAL:
                continue

            service_raw = action.get("service", "")
            target = action.get("target", {})
            entity_id = target.get("entity_id")
            if not entity_id:
                continue

            if service_raw.startswith("siren."):
                try:
                    await self.hass.services.async_call(
                        "siren",
                        "turn_off",
                        {},
                        target={"entity_id": entity_id},
                        blocking=False,
                    )
                    _LOGGER.info("Silenced siren: %s", entity_id)
                except Exception as err:
                    _LOGGER.debug("Could not silence siren %s: %s", entity_id, err)
            elif service_raw.startswith("light."):
                try:
                    await self.hass.services.async_call(
                        "light",
                        "turn_off",
                        {},
                        target={"entity_id": entity_id},
                        blocking=False,
                    )
                    _LOGGER.info("Turned off emergency light: %s", entity_id)
                except Exception as err:
                    _LOGGER.debug("Could not turn off light %s: %s", entity_id, err)

    async def async_test_action(
        self, action_id: str, context: dict[str, Any] | None = None
    ) -> bool:
        """Manually trigger an action for testing."""
        action = self.store.async_get_action(action_id)
        if not action:
            raise HomeAssistantError(f"Action '{action_id}' not found")

        ctx = context or {
            "sensor_name": "Test-Sensor (Manuell)",
            "entity_id": "binary_sensor.test_sensor",
            "zone": "Test-Zone",
            "hazard_type": "smoke",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            "state": "triggered",
        }
        return await self._async_call_action(action, ctx, blocking=True)
