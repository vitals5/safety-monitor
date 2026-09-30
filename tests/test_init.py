"""Tests for Safety Monitor lifecycle and __init__.py."""
from __future__ import annotations

import unittest
from unittest.mock import AsyncMock, MagicMock, patch

from tests import conftest_mock  # noqa: F401
from custom_components.safety_monitor import (
    async_setup,
    async_setup_entry,
    async_unload_entry,
)
from custom_components.safety_monitor.const import DOMAIN


class TestInitLifecycle(unittest.IsolatedAsyncioTestCase):
    """Test suite for setup and teardown lifecycle."""

    async def asyncSetUp(self) -> None:
        self.hass = MagicMock()
        self.hass.data = {}
        self.hass.services.has_service.return_value = True
        self.hass.services.async_register = MagicMock()
        self.hass.services.async_remove = MagicMock()
        self.hass.config_entries.async_forward_entry_setups = AsyncMock(return_value=True)
        self.hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
        self.hass.http.async_register_static_paths = AsyncMock()

        self.entry = MagicMock()
        self.entry.entry_id = "test_entry_xyz"

    async def test_async_setup(self) -> None:
        """Test component level setup."""
        ok = await async_setup(self.hass, {})
        self.assertTrue(ok)

    async def test_async_setup_and_unload_entry(self) -> None:
        """Test full setup and unload of config entry."""
        with patch(
            "custom_components.safety_monitor.store.Store.async_load",
            AsyncMock(return_value=None),
        ), patch(
            "custom_components.safety_monitor.store.Store.async_save",
            AsyncMock(),
        ):
            # Setup
            ok = await async_setup_entry(self.hass, self.entry)
            self.assertTrue(ok)
            self.assertIn(DOMAIN, self.hass.data)
            self.assertIn(self.entry.entry_id, self.hass.data[DOMAIN])

            # Unload
            unload_ok = await async_unload_entry(self.hass, self.entry)
            self.assertTrue(unload_ok)
            self.assertNotIn(self.entry.entry_id, self.hass.data[DOMAIN])


if __name__ == "__main__":
    unittest.main()
