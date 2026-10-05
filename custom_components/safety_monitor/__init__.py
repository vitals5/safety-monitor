"""The Safety Monitor integration."""
from __future__ import annotations

import logging
import os
from typing import Any

from homeassistant.components import panel_custom
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .actions import ActionEngine
from .const import (
    DATA_ACTIONS,
    DATA_COORDINATOR,
    DATA_STORAGE,
    DOMAIN,
    FRONTEND_DIR,
    NAME,
    PLATFORMS,
    URL_BASE,
    VERSION,
)
from .coordinator import SafetyCoordinator
from .services import async_register_services, async_unregister_services
from .store import SafetyStorage
from .websocket import async_register_websocket_api

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up the Safety Monitor component."""
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Safety Monitor from a config entry."""
    storage = SafetyStorage(hass)
    await storage.async_load()

    actions = ActionEngine(hass, storage)
    coordinator = SafetyCoordinator(hass, storage, actions)

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {
        DATA_STORAGE: storage,
        DATA_COORDINATOR: coordinator,
        DATA_ACTIONS: actions,
    }

    # Register WebSocket API & Action Services
    async_register_websocket_api(hass)
    await async_register_services(hass)

    # Set up platforms (alarm_control_panel, binary_sensor, sensor)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    # Start coordinator listeners and initial scan
    await coordinator.async_setup()

    # Set up static HTTP frontend assets & custom sidebar panel
    await _async_setup_frontend(hass)

    _LOGGER.info("Safety Monitor integration initialized successfully (v%s)", VERSION)
    return True


async def _async_setup_frontend(hass: HomeAssistant) -> None:
    """Register HTTP static path and sidebar custom panel."""
    # 1. Register static path for frontend assets
    if hasattr(hass.http, "async_register_static_paths"):
        from homeassistant.components.http import StaticPathConfig
        await hass.http.async_register_static_paths([
            StaticPathConfig(URL_BASE, FRONTEND_DIR, cache_headers=False)
        ])
    else:
        hass.http.register_static_path(URL_BASE, FRONTEND_DIR, cache_headers=False)

    version_str = VERSION
    try:
        panel_file = os.path.join(FRONTEND_DIR, "safety-panel.js")
        if os.path.exists(panel_file):
            version_str = f"{version_str}.{int(os.path.getmtime(panel_file))}"
    except Exception:
        pass

    # 2. Register custom sidebar panel
    if not hass.data.get(f"{DOMAIN}_panel_registered"):
        hass.data[f"{DOMAIN}_panel_registered"] = True
        try:
            await panel_custom.async_register_panel(
                hass=hass,
                frontend_url_path="safety-monitor",
                webcomponent_name="safety-monitor-panel",
                sidebar_title="Safety Monitor",
                sidebar_icon="mdi:shield-alert",
                module_url=f"{URL_BASE}/safety-panel.js?v={version_str}",
                embed_iframe=False,
                require_admin=False,
            )
            _LOGGER.info(
                "Registered Safety Monitor sidebar panel at /safety-monitor (v=%s)",
                version_str,
            )
        except Exception as err:
            _LOGGER.error("Failed to register Safety Monitor sidebar panel: %s", err)


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a Safety Monitor config entry."""
    entry_data = hass.data.get(DOMAIN, {}).get(entry.entry_id, {})
    coordinator: SafetyCoordinator | None = entry_data.get(DATA_COORDINATOR)

    if coordinator:
        # Cancel any active timers, debounces and listeners
        await coordinator.async_reset(force=True)
        coordinator.async_unload()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id, None)
        if not hass.data[DOMAIN]:
            await async_unregister_services(hass)
            if hass.data.get(f"{DOMAIN}_panel_registered"):
                try:
                    frontend = hass.components.frontend
                    frontend.async_remove_panel(hass, "safety-monitor")
                    hass.data[f"{DOMAIN}_panel_registered"] = False
                except Exception as err:
                    _LOGGER.debug("Could not remove panel: %s", err)

    return unload_ok
