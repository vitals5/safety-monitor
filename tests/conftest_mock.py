"""Mock setup for Home Assistant testing without full HA installation."""
from __future__ import annotations

from datetime import datetime, timezone
import importlib.util
from pathlib import Path
import re
import sys
from typing import Any
from unittest.mock import AsyncMock, MagicMock

# Function mocks
def dummy_callback(func):
    return func

def mock_slugify(val):
    return re.sub(r"[^a-zA-Z0-9_]+", "_", str(val).lower()).strip("_")

class MockVoluptuous:
    class Schema:
        def __init__(self, schema, *args, **kwargs):
            self.schema = schema
        def __call__(self, val):
            return val
    @staticmethod
    def Required(key, *args, **kwargs):
        return key
    @staticmethod
    def Optional(key, *args, **kwargs):
        return key

vol_mock = MockVoluptuous()
sys.modules["voluptuous"] = vol_mock

# Base Mock Classes
class MockRestoreEntity:
    """Mock for RestoreEntity."""
    async def async_get_last_state(self):
        return None

class MockAlarmControlPanelEntity:
    """Mock for AlarmControlPanelEntity."""
    _attr_has_entity_name = True
    _attr_name = None
    _attr_icon = None

    async def async_added_to_hass(self):
        pass

    def async_write_ha_state(self):
        pass

    def async_on_remove(self, cb):
        pass

class MockBinarySensorEntity:
    """Mock for BinarySensorEntity."""
    _attr_has_entity_name = True
    _attr_name = None
    _attr_device_class = None

    async def async_added_to_hass(self):
        pass

    def async_write_ha_state(self):
        pass

    def async_on_remove(self, cb):
        pass

class MockSensorEntity:
    """Mock for SensorEntity."""
    _attr_has_entity_name = True
    _attr_name = None

    async def async_added_to_hass(self):
        pass

    def async_write_ha_state(self):
        pass

    def async_on_remove(self, cb):
        pass

class MockTemplate:
    """Mock for Template helper."""
    def __init__(self, template, hass=None):
        self.template = template
        self.hass = hass

    def async_render(self, context=None, parse_result=False):
        res = self.template
        if context:
            for k, v in context.items():
                res = res.replace("{{" + f" {k} " + "}}", str(v)).replace("{{" + str(k) + "}}", str(v))
                res = res.replace("{{" + f" {k} | upper " + "}}", str(v).upper()).replace("{{" + f"{k} | upper" + "}}", str(v).upper())
        return res

# Enums and constants
class MockAlarmControlPanelState:
    DISARMED = "disarmed"
    PENDING = "pending"
    TRIGGERED = "triggered"

class MockAlarmControlPanelEntityFeature:
    TRIGGER = 1

class MockBinarySensorDeviceClass:
    SAFETY = "safety"
    PROBLEM = "problem"

# Setup modules in sys.modules
ha_mock = MagicMock()
ha_mock.callback = dummy_callback

core_mock = MagicMock()
core_mock.callback = dummy_callback
core_mock.HomeAssistant = MagicMock
core_mock.Event = MagicMock
core_mock.CALLBACK_TYPE = Any

const_mock = MagicMock()
const_mock.STATE_ON = "on"
const_mock.STATE_OFF = "off"
const_mock.STATE_UNAVAILABLE = "unavailable"
const_mock.STATE_UNKNOWN = "unknown"
const_mock.ATTR_DEVICE_CLASS = "device_class"
const_mock.ATTR_FRIENDLY_NAME = "friendly_name"

components_mock = MagicMock()
acp_mock = MagicMock()
acp_mock.AlarmControlPanelEntity = MockAlarmControlPanelEntity
acp_mock.AlarmControlPanelState = MockAlarmControlPanelState
acp_mock.AlarmControlPanelEntityFeature = MockAlarmControlPanelEntityFeature
components_mock.alarm_control_panel = acp_mock

bs_mock = MagicMock()
bs_mock.BinarySensorEntity = MockBinarySensorEntity
bs_mock.BinarySensorDeviceClass = MockBinarySensorDeviceClass
components_mock.binary_sensor = bs_mock

s_mock = MagicMock()
s_mock.SensorEntity = MockSensorEntity
components_mock.sensor = s_mock

ws_registered_commands = {}
def mock_ws_register_cmd(hass, handler):
    name = getattr(handler, "__name__", str(handler))
    ws_registered_commands[name] = handler

ws_mock = MagicMock()
ws_mock.async_register_command = mock_ws_register_cmd
ws_mock.websocket_command = lambda schema: (lambda func: func)
ws_mock.async_response = lambda func: func
components_mock.websocket_api = ws_mock

panel_mock = MagicMock()
panel_mock.async_register_panel = AsyncMock()
components_mock.panel_custom = panel_mock

http_mock = MagicMock()
class MockStaticPathConfig:
    def __init__(self, path, directory, cache_headers=False):
        self.path = path
        self.directory = directory
        self.cache_headers = cache_headers

http_mock.StaticPathConfig = MockStaticPathConfig
components_mock.http = http_mock

helpers_mock = MagicMock()
helpers_mock.restore_state = MagicMock()
helpers_mock.restore_state.RestoreEntity = MockRestoreEntity
helpers_mock.template = MagicMock()
helpers_mock.template.Template = MockTemplate
helpers_mock.config_validation = MagicMock()
helpers_mock.config_validation.entity_id = lambda v: str(v)
helpers_mock.config_validation.string = lambda v: str(v)
helpers_mock.config_validation.boolean = lambda v: bool(v)
helpers_mock.config_validation.positive_int = lambda v: int(v)
helpers_mock.config_validation.config_entry_only_config_schema = lambda domain: lambda v: v
helpers_mock.config_validation.empty_config_schema = lambda domain: lambda v: v

ha_mock.__path__ = []
core_mock.__path__ = []
components_mock.__path__ = []
helpers_mock.__path__ = []

typing_mock = MagicMock()
typing_mock.ConfigType = dict[str, Any]
helpers_mock.typing = typing_mock

sys.modules["homeassistant"] = ha_mock
sys.modules["homeassistant.core"] = core_mock
sys.modules["homeassistant.const"] = const_mock
sys.modules["homeassistant.components"] = components_mock
sys.modules["homeassistant.components.alarm_control_panel"] = acp_mock
sys.modules["homeassistant.components.binary_sensor"] = bs_mock
sys.modules["homeassistant.components.sensor"] = s_mock
sys.modules["homeassistant.components.websocket_api"] = ws_mock
sys.modules["homeassistant.components.panel_custom"] = panel_mock
sys.modules["homeassistant.components.http"] = http_mock
sys.modules["homeassistant.helpers"] = helpers_mock
sys.modules["homeassistant.helpers.typing"] = typing_mock
sys.modules["homeassistant.helpers.restore_state"] = helpers_mock.restore_state
sys.modules["homeassistant.helpers.template"] = helpers_mock.template
sys.modules["homeassistant.helpers.config_validation"] = helpers_mock.config_validation
storage_mock = MagicMock()
class MockStore:
    async_load = AsyncMock(return_value=None)
    async_save = AsyncMock()
    def __init__(self, hass=None, version=None, key=None):
        pass

storage_mock.Store = MockStore

sys.modules["homeassistant.helpers.storage"] = storage_mock
sys.modules["homeassistant.helpers.dispatcher"] = MagicMock()
sys.modules["homeassistant.helpers.event"] = MagicMock()
sys.modules["homeassistant.helpers.entity_platform"] = MagicMock()
class MockConfigFlow:
    def __init__(self, *args, **kwargs):
        self.hass = None

    def __init_subclass__(cls, domain=None, **kwargs):
        super().__init_subclass__(**kwargs)
        cls.DOMAIN = domain

    def _async_current_entries(self):
        return []

    async def async_step_user(self, user_input=None):
        pass

    def async_show_form(self, step_id, data_schema=None, description_placeholders=None):
        return {"type": "form", "step_id": step_id, "description_placeholders": description_placeholders}

    def async_create_entry(self, title, data):
        return {"type": "create_entry", "title": title, "data": data}

    def async_abort(self, reason):
        return {"type": "abort", "reason": reason}

config_entries_mock = MagicMock()
config_entries_mock.ConfigFlow = MockConfigFlow
ha_mock.config_entries = config_entries_mock

data_entry_flow_mock = MagicMock()
data_entry_flow_mock.FlowResult = dict[str, Any]

sys.modules["homeassistant.config_entries"] = config_entries_mock
sys.modules["homeassistant.data_entry_flow"] = data_entry_flow_mock
sys.modules["homeassistant.exceptions"] = MagicMock()
sys.modules["homeassistant.exceptions"].HomeAssistantError = Exception

util_mock = MagicMock()
util_mock.__path__ = []
dt_mock = MagicMock()
dt_mock.now = lambda: datetime.now()
util_mock.dt = dt_mock
sys.modules["homeassistant.util"] = util_mock
sys.modules["homeassistant.util.dt"] = dt_mock
ha_mock.util = util_mock

# Add custom_components to path
project_root = Path(__file__).parent.parent
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
