# 🛡️ Safety Monitor for Home Assistant

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/default)
[![GitHub Release](https://img.shields.io/github/v/release/vitals5/safety-monitor?include_prereleases)](https://github.com/vitals5/safety-monitor/releases)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Validate](https://github.com/vitals5/safety-monitor/actions/workflows/validate.yml/badge.svg)](https://github.com/vitals5/safety-monitor/actions/workflows/validate.yml)

**Safety Monitor** is a dedicated **24/7 Hazard & Life Safety Monitoring System** for Home Assistant, inspired by [Alarmo](https://github.com/nielsfaber/alarmo).

While intrusion alarm systems (like Alarmo) are built around manual arming modes (*Armed Away*, *Armed Home*, *Exit Delay*), life safety and property protection sensors (**Smoke, Water Leakage, Gas, Carbon Monoxide, and Heat**) require **24/7 Always-On** vigilance, differentiated warning levels, multi-sensor verification, and phased emergency actions (such as emergency shutoff valves or ventilation cutoffs).

---

## 🌟 Key Features

* **🛡️ 24/7 Always-On State Machine**: Never accidentally disarmed. Manages hazard levels:
  * `normal`: All monitored sensors safe.
  * `pre_alarm`: Pre-warning and verification countdown (e.g. heat before smoke, moisture thresholds, or awaiting double-knock verification).
  * `triggered`: Acute hazard confirmed! Sirens, emergency cutoffs, and critical push notifications are executed.
  * `silenced`: Acoustic sirens temporarily muted (e.g., cooking smoke false alarm) while sensor monitoring remains 24/7 active.
  * `testing`: Maintenance mode for testing physical detectors without triggering loud external sirens or emergency shutoffs (auto-resets after a configurable timeout).
* **⚡ 3-Phase Emergency Escalation Engine**:
  * **Phase 1 (Immediate Cutoff)**: Close main water valves (`valve.close_valve`), halt ventilation/HVAC (`fan.turn_off`), raise shutters (`cover.open_cover`) for escape routes.
  * **Phase 2 (Critical Notifications)**: High-priority mobile app alerts with alarm stream sound bypass (`ttl: 0`, `priority: high`, `channel: alarm_stream`).
  * **Phase 3 (Acoustic & Optical)**: Trigger loud Zigbee/Z-Wave sirens, emergency red flashing lights, and TTS announcements.
* **🔍 Auto-Discovery of Hazard Sensors**: Automatically scans Home Assistant for `binary_sensor` entities with device classes `smoke`, `moisture`, `gas`, `carbon_monoxide`, and `heat`.
* **🏠 Zones & Double-Knock Verification**: Group sensors into zones (Kitchen, Basement, Technical Room). Configurable multi-sensor verification prevents false alarms by requiring a second detector confirmation within a time window before escalating to full alarm.
* **💻 Dedicated Custom Sidebar Panel**: Beautiful Lit / Web Component dashboard in Home Assistant's sidebar for complete sensor, zone, and action configuration without YAML or restarts.
* **🚨 Native Alarm Control Panel**: Exposes `alarm_control_panel.safety_monitor` with `safety_state`, active hazards, and manual trigger/reset capabilities.
* **🔋 Heartbeat & Offline Monitoring**: Warns when safety sensors go offline (`unavailable`/`unknown`) or drop below low battery thresholds.

---

## 🏛️ Architecture Overview

The system follows a three-tier architecture modeled after modern Home Assistant custom integrations:

```
┌────────────────────────────────────────────────────────┐
│            Frontend (Lit / Web Component Panel)        │
│   [Overview]  |  [Sensors]  |  [Actions]  |  [Zones]   │
└──────────────────────────┬─────────────────────────────┘
                           │ WebSocket API
┌──────────────────────────▼─────────────────────────────┐
│                 HA Custom Component Core                │
│  ┌───────────────────┐       ┌──────────────────────┐  │
│  │   Safety Storage  │       │     State Machine    │  │
│  │ (.storage/safety) │       │ (Normal/Warn/Alarm)  │  │
│  └─────────┬─────────┘       └──────────┬───────────┘  │
│            │                            │              │
│  ┌─────────▼────────────────────────────▼───────────┐  │
│  │                Sensor Coordinator                │  │
│  │ (binary_sensor: smoke, moisture, gas, co, heat)  │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │                             │
│  ┌───────────────────────▼──────────────────────────┐  │
│  │                 Action Engine                    │  │
│  │   (Cutoff Valves, Fans, Push Alerts, Sirens)     │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────┘
                           │
             Home Assistant Event Bus / State Engine
```

---

## 📦 Directory Structure

```
custom_components/safety_monitor/
├── __init__.py               # Integration setup, static path & sidebar panel registration
├── manifest.json             # Integration metadata
├── config_flow.py            # Initial UI onboarding flow
├── const.py                  # Constants, event names, default timeouts
├── coordinator.py            # Event listener & hazard state machine
├── store.py                  # Persistent JSON storage (.storage/safety_monitor.storage)
├── alarm_control_panel.py    # Exposes alarm_control_panel.safety_monitor
├── sensor.py                 # Status and last hazard sensors
├── binary_sensor.py          # Hazard active & test mode binary sensors
├── actions.py                # Escalation and action execution engine
├── websocket.py              # WebSocket API for live panel communication
├── services.py               # Custom services (silence, reset, test_mode, trigger)
├── services.yaml             # Home Assistant service descriptions
├── frontend/
│   └── safety-panel.js       # Lit / Web Component dashboard
├── brand/
│   ├── icon.png
│   └── logo.png
└── translations/
    ├── de.json               # German translations
    └── en.json               # English translations
```

---

## 🚀 Installation

### Option 1: HACS (Recommended)

1. Open **HACS** in your Home Assistant sidebar.
2. Click on the three dots in the top right corner and select **Custom repositories**.
3. Add the repository URL:
   ```
   https://github.com/vitals5/safety-monitor
   ```
   Type: **Integration**
4. Click **Add**, find **Safety Monitor**, and click **Download**.
5. Restart Home Assistant.
6. Go to **Settings -> Devices & Services -> Add Integration** and search for **Safety Monitor**.

### Option 2: Manual Installation

1. Download the latest release `safety_monitor.zip` from the [Releases](https://github.com/vitals5/safety-monitor/releases) page.
2. Unzip and copy the `safety_monitor` folder into your Home Assistant `<config>/custom_components/` directory:
   ```
   <config>/custom_components/safety_monitor/
   ```
3. Restart Home Assistant.
4. Add the integration via **Settings -> Devices & Services -> Add Integration -> Safety Monitor**.

---

## ⚙️ Configuration & Usage

### 1. Sidebar Panel
Once installed, a new item **Safety Monitor** (🛡️) will appear in your Home Assistant sidebar:

* **Tab 1: Overview & Status**:
  * Large visual status banner (Green = Safe, Amber = Pre-Alarm/Silenced, Red = Triggered, Cyan = Test Mode).
  * Active hazard cards with sensor name, zone badge, and trigger timestamp.
  * Quick buttons: *Silence Sirens*, *Acknowledge / Reset*, *Test Mode*, and *Manual Emergency Trigger*.
  * Event history log.
* **Tab 2: Sensors**:
  * Auto-discovery banner showing candidate safety sensors in your house.
  * Table of monitored sensors with status badges (Normal / Hazard / Offline).
  * Configure pre-alarm delays, double-knock verification, auto-acknowledge, and linked cutoff entities per sensor.
* **Tab 3: Emergency Actions**:
  * Matrix of Phase 1 (Cutoff), Phase 2 (Notifications), and Phase 3 (Sirens & Lights).
  * Add, edit, or test-fire actions with live verification.
* **Tab 4: Zones & Settings**:
  * Create and manage zones with independent double-knock timeouts.
  * Configure test mode duration, silence duration, and heartbeat alerts.

### 2. Available Services

| Service | Parameters | Description |
| :--- | :--- | :--- |
| `safety_monitor.silence` | `duration` *(optional int, seconds)* | Silences acoustic sirens without disarming 24/7 monitoring. |
| `safety_monitor.reset` | `force` *(optional bool)* | Acknowledges alerts and returns system to Normal. |
| `safety_monitor.test_mode` | `enabled` *(bool)*, `duration` *(optional int)* | Toggles test mode (suppresses sirens and cutoffs). |
| `safety_monitor.trigger` | `reason` *(optional str)* | Manually triggers the full emergency sequence. |

---

## 📡 WebSocket API

The integration provides WebSocket endpoints for real-time control without Home Assistant restarts:

* `safety_monitor/config/get`: Fetches full configuration, sensors, zones, actions, and settings.
* `safety_monitor/config/update_settings`: Updates global settings.
* `safety_monitor/sensors/list_candidates`: Discovers all candidate hazard sensors in HA.
* `safety_monitor/sensor/save` & `safety_monitor/sensor/delete`: Manages monitored sensors.
* `safety_monitor/zone/save` & `safety_monitor/zone/delete`: Manages zones and double-knock settings.
* `safety_monitor/action/save` & `safety_monitor/action/delete`: Manages escalation actions.
* `safety_monitor/action/test`: Test-fires a single action.
* `safety_monitor/action/silence`: Silences active alarms.
* `safety_monitor/action/reset`: Resets system state back to normal.
* `safety_monitor/action/test_mode`: Toggles maintenance/test mode.
* `safety_monitor/status`: Fetches live state and active triggers.

---

## 🧪 Testing

The integration includes a complete unit test suite covering storage, coordinator state machine, actions engine, alarm control panel, config flow, and WebSocket API:

```bash
python3 -m unittest discover -s tests -v
```

All 36 unit tests execute in under 1 second without requiring an external Home Assistant installation.

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
