"""Constants for the Safety Monitor integration."""
from __future__ import annotations

import os

DOMAIN = "safety_monitor"
NAME = "Safety Monitor"
VERSION = "1.0.0"
MANUFACTURER = "Safety Monitor"

# Storage
STORAGE_KEY = "safety_monitor.storage"
STORAGE_VERSION = 1

# URLs and static paths
URL_BASE = "/safety_monitor_static"
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "frontend")

# Platforms
PLATFORMS: list[str] = ["alarm_control_panel", "binary_sensor", "sensor"]

# Safety State Machine states
STATE_NORMAL = "normal"
STATE_PRE_ALARM = "pre_alarm"
STATE_TRIGGERED = "triggered"
STATE_SILENCED = "silenced"
STATE_TESTING = "testing"

ALL_SAFETY_STATES = [
    STATE_NORMAL,
    STATE_PRE_ALARM,
    STATE_TRIGGERED,
    STATE_SILENCED,
    STATE_TESTING,
]

# Sensor Types & Device Classes
TYPE_SMOKE = "smoke"
TYPE_GAS = "gas"
TYPE_CO = "carbon_monoxide"
TYPE_HEAT = "heat"
TYPE_MOISTURE = "moisture"
TYPE_GENERIC = "generic"

DEVICE_CLASSES_LIFE_SAFETY = [
    TYPE_SMOKE,
    TYPE_GAS,
    TYPE_CO,
    TYPE_HEAT,
]

DEVICE_CLASSES_PROPERTY = [
    TYPE_MOISTURE,
]

HAZARD_DEVICE_CLASSES = DEVICE_CLASSES_LIFE_SAFETY + DEVICE_CLASSES_PROPERTY

# Escalation Phases
PHASE_CUTOFF = "cutoff"
PHASE_NOTIFICATION = "notification"
PHASE_ACOUSTIC_OPTICAL = "acoustic_optical"
PHASE_RESTORE = "restore"

ESCALATION_PHASES = [
    PHASE_CUTOFF,
    PHASE_NOTIFICATION,
    PHASE_ACOUSTIC_OPTICAL,
    PHASE_RESTORE,
]

# Default Timeouts and Limits (in seconds)
DEFAULT_PRE_ALARM_DELAY = 0
DEFAULT_TEST_MODE_DURATION = 900  # 15 minutes
DEFAULT_SILENCE_DURATION = 600    # 10 minutes
DEFAULT_DOUBLE_KNOCK_TIMEOUT = 60 # 60 seconds
DEFAULT_BATTERY_LOW_THRESHOLD = 15

# Home Assistant Bus Events
EVENT_SAFETY_STATE_CHANGED = "safety_monitor_state_changed"
EVENT_SAFETY_SENSOR_TRIGGERED = "safety_monitor_sensor_triggered"
EVENT_SAFETY_ALARM_TRIGGERED = "safety_monitor_alarm_triggered"
EVENT_SAFETY_ALARM_SILENCED = "safety_monitor_alarm_silenced"
EVENT_SAFETY_ALARM_RESET = "safety_monitor_alarm_reset"
EVENT_SAFETY_TEST_MODE_CHANGED = "safety_monitor_test_mode_changed"

# Dispatcher Signals
SIGNAL_SAFETY_MONITOR_UPDATED = "safety_monitor_updated"
SIGNAL_SAFETY_MONITOR_STATE_CHANGED = "safety_monitor_state_changed_signal"

# Services
SERVICE_SILENCE = "silence"
SERVICE_RESET = "reset"
SERVICE_TEST_MODE = "test_mode"
SERVICE_TRIGGER = "trigger"

# Keys for hass.data
DATA_COORDINATOR = "coordinator"
DATA_STORAGE = "storage"
DATA_ACTIONS = "actions"
