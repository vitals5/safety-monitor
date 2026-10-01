/**
 * Safety Monitor - 24/7 Life Safety & Hazard Monitoring Dashboard
 * Custom Panel for Home Assistant
 *
 * Inspired by Alarmo, dedicated to Life Safety & Property Protection:
 * Smoke, Moisture, Gas, Carbon Monoxide, and Heat monitoring.
 */

(function () {
  const TRANSLATIONS = {
    de: {
      appName: "Safety Monitor",
      subtitle: "24/7 Gefahrenmeldeanlage (Rauch, Wasser, Gas, CO)",
      tabOverview: "Übersicht & Status",
      tabSensors: "Sensoren",
      tabActions: "Notfall-Aktionen",
      tabSettings: "Zonen & Einstellungen",
      statusNormal: "Alles Sicher",
      statusNormalDesc: "Alle überwachten Sensoren sind unauffällig. Die 24/7 Schutzüberwachung ist aktiv.",
      statusPreAlarm: "Voralarm / Verifikation",
      statusPreAlarmDesc: "Mögliche Gefahr erkannt! Countdown läuft vor Auslösen der Hauptsirenen.",
      statusTriggered: "AKUTE GEFAHR - ALARM AKTIV!",
      statusTriggeredDesc: "Hauptalarm ausgelöst! Sirenen, Notabschaltungen und Benachrichtigungen laufen.",
      statusSilenced: "Alarm Stummgeschaltet",
      statusSilencedDesc: "Akustische Sirenen vorübergehend pausiert. Die 24/7 Gefahrenüberwachung bleibt aktiv!",
      statusTesting: "Test- & Wartungsmodus",
      statusTestingDesc: "Wartungsmodus aktiv: Sirenen und Notfall-Abschaltungen sind vorübergehend unterdrückt.",
      btnSilence: "Sirenen stummschalten",
      btnReset: "Quittieren / Zurücksetzen",
      btnTestMode: "Test-Modus",
      btnExitTestMode: "Test-Modus beenden",
      btnManualTrigger: "Notfall-Alarm auslösen",
      confirmManualTrigger: "Möchten Sie wirklich manuell den vollen Notfall-Alarm (Sirenen & Benachrichtigungen) auslösen?",
      activeHazardsTitle: "Aktive Gefahrenmeldungen",
      noActiveHazards: "Keine aktiven Gefahrenmeldungen vorhanden.",
      eventHistoryTitle: "Ereignis-Protokoll",
      noEvents: "Bisher keine Ereignisse protokolliert.",
      searchSensorsPlaceholder: "Sensoren durchsuchen...",
      filterAll: "Alle",
      btnAddSensor: "Sensor hinzufügen",
      btnAddZone: "Zone hinzufügen",
      btnAddAction: "Aktion hinzufügen",
      candidateBanner: "{count} kompatible Gefahrensensoren in Home Assistant gefunden:",
      addCandidate: "Überwachen",
      thSensor: "Sensor",
      thZone: "Zone",
      thType: "Gefahrentyp",
      thPreAlarm: "Voralarm-Verzögerung",
      thFeatures: "Eigenschaften",
      thStatus: "Zustand",
      thActions: "Aktionen",
      typeSmoke: "Rauch",
      typeMoisture: "Wasserleckage",
      typeGas: "Gas",
      typeCO: "Kohlenmonoxid (CO)",
      typeHeat: "Hitze",
      typeGeneric: "Sonstiges",
      phaseCutoff: "Stufe 1: Notabschaltung (Cutoff)",
      phaseCutoffDesc: "Sofortiges Schließen von Hauptventilen, Abschalten von Lüftungen oder Öffnen von Fluchtwegen.",
      phaseNotification: "Stufe 2: Prioritäre Benachrichtigung",
      phaseNotificationDesc: "Kritische Push-Nachrichten mit Sound-Bypass an Smartphones.",
      phaseAcoustic: "Stufe 3: Akustisch & Optisch",
      phaseAcousticDesc: "Auslösen lauter Sirenen, rotes Notfall-Licht und TTS-Sprachausgabe.",
      testAction: "Testen",
      edit: "Bearbeiten",
      delete: "Löschen",
      save: "Speichern",
      cancel: "Abbrechen",
      settingsTitle: "Globale Systemeinstellungen",
      lblTestDuration: "Test-Modus Dauer (Minuten):",
      lblSilenceDuration: "Stummschaltung Dauer (Minuten):",
      lblDoubleKnockTimeout: "Globaler Double-Knock Timeout (Sekunden):",
      lblOfflineAlerts: "Warnung bei offline / nicht erreichbaren Sensoren",
      lblBatteryAlerts: "Warnung bei schwachem Batteriestand (< 15%)",
      zonesTitle: "Gefahrenzonen & Räume",
      zoneName: "Zonen-Name",
      doubleKnockEnabled: "Multi-Sensor-Verifikation (Double-Knock)",
      doubleKnockHelp: "Löst erst bei Bestätigung durch einen 2. Sensor in der Zone den Hauptalarm aus.",
      autoAckHelp: "Setzt Alarm automatisch zurück, sobald der Sensor wieder OFF meldet.",
      linkedShutoffs: "Verknüpfte Notfall-Aktoren (z. B. valve.hauptwasser, fan.lueftung):",
      preAlarmDelaySec: "Voralarm-Verzögerung (Sekunden, 0 = sofort):",
      actionService: "Home Assistant Dienst (z. B. valve.close_valve):",
      actionTarget: "Ziel-Entität (z. B. valve.hauptwasser):",
      actionPayload: "Dienst-Daten (JSON mit {{ sensor_name }}, {{ zone }}):",
      actionTriggerTypes: "Auslösen bei folgenden Gefahrentypen:",
      toggleMenu: "Home Assistant Seitenmenü öffnen / schließen",
    },
    en: {
      appName: "Safety Monitor",
      subtitle: "24/7 Life Safety & Hazard Monitoring (Smoke, Water, Gas, CO)",
      tabOverview: "Overview & Status",
      tabSensors: "Sensors",
      tabActions: "Emergency Actions",
      tabSettings: "Zones & Settings",
      statusNormal: "All Clear & Safe",
      statusNormalDesc: "All monitored sensors are normal. 24/7 hazard monitoring is fully active.",
      statusPreAlarm: "Pre-Alarm / Verification",
      statusPreAlarmDesc: "Potential hazard detected! Countdown active before main sirens trigger.",
      statusTriggered: "ACUTE HAZARD - ALARM ACTIVE!",
      statusTriggeredDesc: "Full emergency alarm! Sirens, cutoffs, and critical notifications are running.",
      statusSilenced: "Alarms Silenced",
      statusSilencedDesc: "Acoustic sirens temporarily silenced. 24/7 hazard monitoring remains active!",
      statusTesting: "Test & Maintenance Mode",
      statusTestingDesc: "Maintenance mode active: External sirens and emergency shutoffs are suppressed.",
      btnSilence: "Silence Sirens",
      btnReset: "Acknowledge / Reset",
      btnTestMode: "Test Mode",
      btnExitTestMode: "Exit Test Mode",
      btnManualTrigger: "Trigger Emergency Alarm",
      confirmManualTrigger: "Are you sure you want to manually trigger the full emergency alarm sequence?",
      activeHazardsTitle: "Active Hazard Alerts",
      noActiveHazards: "No active hazard alerts at this time.",
      eventHistoryTitle: "Event Log",
      noEvents: "No events recorded yet.",
      searchSensorsPlaceholder: "Search sensors...",
      filterAll: "All",
      btnAddSensor: "Add Sensor",
      btnAddZone: "Add Zone",
      btnAddAction: "Add Action",
      candidateBanner: "{count} hazard-capable sensor(s) discovered in Home Assistant:",
      addCandidate: "Monitor",
      thSensor: "Sensor",
      thZone: "Zone",
      thType: "Hazard Type",
      thPreAlarm: "Pre-Alarm Delay",
      thFeatures: "Features",
      thStatus: "Status",
      thActions: "Actions",
      typeSmoke: "Smoke",
      typeMoisture: "Water Leak",
      typeGas: "Gas",
      typeCO: "Carbon Monoxide (CO)",
      typeHeat: "Heat",
      typeGeneric: "Generic",
      phaseCutoff: "Phase 1: Emergency Cutoff",
      phaseCutoffDesc: "Immediate closing of main shutoff valves, HVAC shutdown, or opening escape routes.",
      phaseNotification: "Phase 2: Critical Notifications",
      phaseNotificationDesc: "High-priority push notifications with alarm stream bypass to mobile apps.",
      phaseAcoustic: "Phase 3: Acoustic & Optical",
      phaseAcousticDesc: "Trigger loud sirens, flashing emergency red lighting, and TTS announcements.",
      testAction: "Test",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      settingsTitle: "Global System Settings",
      lblTestDuration: "Test Mode Duration (Minutes):",
      lblSilenceDuration: "Silence Duration (Minutes):",
      lblDoubleKnockTimeout: "Global Double-Knock Timeout (Seconds):",
      lblOfflineAlerts: "Alert on offline / unavailable sensors",
      lblBatteryAlerts: "Alert on low sensor battery (< 15%)",
      zonesTitle: "Hazard Zones & Areas",
      zoneName: "Zone Name",
      doubleKnockEnabled: "Multi-Sensor Verification (Double-Knock)",
      doubleKnockHelp: "Requires confirmation from a 2nd sensor in the zone before full alarm triggers.",
      autoAckHelp: "Automatically reset alarm once the sensor returns to OFF state.",
      linkedShutoffs: "Linked Shutoff Entities (e.g. valve.main_water, fan.ventilation):",
      preAlarmDelaySec: "Pre-alarm delay (seconds, 0 = instant):",
      actionService: "Home Assistant Service (e.g. valve.close_valve):",
      actionTarget: "Target Entity (e.g. valve.main_water):",
      actionPayload: "Service Data (JSON with {{ sensor_name }}, {{ zone }}):",
      actionTriggerTypes: "Trigger for following hazard types:",
      toggleMenu: "Toggle Home Assistant sidebar menu",
    }
  };

  class SafetyMonitorPanel extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._hass = null;
      this._activeTab = "overview";
      this._config = { sensors: {}, zones: {}, actions: [], settings: {}, history: [] };
      this._candidates = [];
      this._searchFilter = "";
      this._typeFilter = "all";
      this._zoneFilter = "all";
      this._editingSensor = null;
      this._editingZone = null;
      this._editingAction = null;
      this._modalOpen = null; // 'sensor' | 'zone' | 'action'
      this._statusPollInterval = null;
      this._lang = "en";
    }

    set hass(hass) {
      const oldHass = this._hass;
      this._hass = hass;
      if (!oldHass && hass) {
        this._lang = (hass.language && hass.language.startsWith("de")) ? "de" : "en";
        this._loadData();
        this._startStatusPolling();
      }
    }

    connectedCallback() {
      this._render();
    }

    disconnectedCallback() {
      if (this._statusPollInterval) {
        clearInterval(this._statusPollInterval);
        this._statusPollInterval = null;
      }
    }

    _t(key, placeholders = {}) {
      const dict = TRANSLATIONS[this._lang] || TRANSLATIONS.en;
      let text = dict[key] || TRANSLATIONS.en[key] || key;
      for (const [k, v] of Object.entries(placeholders)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, "g"), v);
      }
      return text;
    }

    async _loadData() {
      if (!this._hass) return;
      try {
        const config = await this._hass.callWS({ type: "safety_monitor/config/get" });
        this._config = config || this._config;
        const candResult = await this._hass.callWS({ type: "safety_monitor/sensors/list_candidates" });
        this._candidates = (candResult && candResult.candidates) || [];
        this._render();
      } catch (err) {
        console.error("Error loading Safety Monitor data:", err);
      }
    }

    _startStatusPolling() {
      this._statusPollInterval = setInterval(async () => {
        if (!this._hass) return;
        try {
          const status = await this._hass.callWS({ type: "safety_monitor/status" });
          if (status) {
            let changed = false;
            if (this._config.state !== status.state) {
              this._config.state = status.state;
              changed = true;
            }
            this._config.active_triggers = status.active_triggers || {};
            this._config.offline_sensors = status.offline_sensors || [];
            if (changed || Object.keys(this._config.active_triggers).length > 0) {
              this._render();
            }
          }
        } catch (err) {
          // silent
        }
      }, 3000);
    }

    _toggleMenu() {
      // Dispatch standard Home Assistant menu toggle event
      const event = new CustomEvent("hass-toggle-menu", {
        bubbles: true,
        composed: true,
        cancelable: false,
      });
      this.dispatchEvent(event);
      window.dispatchEvent(event);

      try {
        if (window.parent && window.parent !== window) {
          window.parent.dispatchEvent(new CustomEvent("hass-toggle-menu", {
            bubbles: true,
            composed: true,
            cancelable: false,
          }));
        }
      } catch (_) {}

      try {
        const root = document.querySelector("home-assistant") || document.querySelector("hc-main");
        if (root && root.shadowRoot) {
          const main = root.shadowRoot.querySelector("home-assistant-main");
          if (main && main.shadowRoot) {
            const drawer = main.shadowRoot.querySelector("ha-drawer") || main.shadowRoot.querySelector("ha-sidebar");
            if (drawer && typeof drawer.open === "boolean") {
              drawer.open = !drawer.open;
            }
          }
        }
      } catch (_) {}
    }

    async _silenceAlarm() {
      try {
        await this._hass.callWS({ type: "safety_monitor/action/silence" });
        await this._loadData();
      } catch (err) {
        alert("Error silencing alarm: " + err.message);
      }
    }

    async _resetAlarm() {
      try {
        await this._hass.callWS({ type: "safety_monitor/action/reset", force: true });
        await this._loadData();
      } catch (err) {
        alert("Error resetting alarm: " + err.message);
      }
    }

    async _toggleTestMode() {
      const current = this._config.state === "testing";
      try {
        await this._hass.callWS({
          type: "safety_monitor/action/test_mode",
          enabled: !current,
        });
        await this._loadData();
      } catch (err) {
        alert("Error toggling test mode: " + err.message);
      }
    }

    async _manualTrigger() {
      if (confirm(this._t("confirmManualTrigger"))) {
        try {
          await this._hass.callWS({
            type: "safety_monitor/action/trigger",
            reason: "Manual Trigger from Safety Monitor Panel",
          });
          await this._loadData();
        } catch (err) {
          alert("Error triggering alarm: " + err.message);
        }
      }
    }

    _getTypeIcon(type) {
      switch (type) {
        case "smoke": return "🔥";
        case "moisture": return "💧";
        case "gas": return "☣️";
        case "carbon_monoxide": return "⚠️";
        case "heat": return "🌡️";
        default: return "🛡️";
      }
    }

    _getTypeName(type) {
      switch (type) {
        case "smoke": return this._t("typeSmoke");
        case "moisture": return this._t("typeMoisture");
        case "gas": return this._t("typeGas");
        case "carbon_monoxide": return this._t("typeCO");
        case "heat": return this._t("typeHeat");
        default: return this._t("typeGeneric");
      }
    }

    _render() {
      const state = this._config.state || "normal";
      const activeTriggers = Object.values(this._config.active_triggers || {});
      const sensors = Object.values(this._config.sensors || {});
      const zones = Object.values(this._config.zones || {});
      const actions = this._config.actions || [];
      const history = this._config.history || [];

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            background-color: var(--primary-background-color, #fafafa);
            color: var(--primary-text-color, #212121);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            min-height: 100vh;
            box-sizing: border-box;
            padding: 16px;
          }
          * { box-sizing: border-box; }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 12px;
          }
          .title-area {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .app-icon {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: linear-gradient(135deg, #d32f2f, #f57c00);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 26px;
            box-shadow: 0 4px 12px rgba(211, 47, 47, 0.3);
            cursor: pointer;
            position: relative;
            user-select: none;
            transition: all 0.2s ease;
          }
          .app-icon:hover {
            transform: scale(1.06);
            box-shadow: 0 6px 16px rgba(211, 47, 47, 0.45);
            filter: brightness(1.08);
          }
          .app-icon:active {
            transform: scale(0.96);
          }
          .app-icon:focus-visible {
            outline: 2px solid var(--primary-color, #0288d1);
            outline-offset: 2px;
          }
          .menu-icon-badge {
            position: absolute;
            bottom: -3px;
            right: -3px;
            background: var(--card-background-color, #ffffff);
            color: var(--primary-text-color, #333333);
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.25);
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
            pointer-events: none;
            transition: all 0.2s ease;
          }
          .app-icon:hover .menu-icon-badge {
            transform: scale(1.15);
            background: var(--primary-color, #0288d1);
            color: var(--text-primary-color, #ffffff);
            border-color: var(--primary-color, #0288d1);
          }
          .app-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            line-height: 1.2;
          }
          .app-subtitle {
            font-size: 13px;
            color: var(--secondary-text-color, #757575);
            margin: 0;
          }
          /* Navigation Tabs */
          .tabs {
            display: flex;
            gap: 8px;
            background: var(--card-background-color, #fff);
            padding: 6px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            margin-bottom: 24px;
            overflow-x: auto;
          }
          .tab-btn {
            padding: 10px 18px;
            border: none;
            border-radius: 8px;
            background: transparent;
            color: var(--secondary-text-color, #666);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            white-space: nowrap;
            transition: all 0.2s ease;
          }
          .tab-btn:hover {
            color: var(--primary-color, #0288d1);
            background: rgba(2, 136, 209, 0.08);
          }
          .tab-btn.active {
            color: #fff;
            background: var(--primary-color, #0288d1);
            box-shadow: 0 2px 6px rgba(2, 136, 209, 0.3);
          }

          /* Status Banner */
          .status-banner {
            border-radius: 16px;
            padding: 24px;
            color: #fff;
            margin-bottom: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .status-banner.normal {
            background: linear-gradient(135deg, #2e7d32, #43a047);
          }
          .status-banner.pre_alarm {
            background: linear-gradient(135deg, #f57f17, #fbc02d);
            animation: pulse-warn 2s infinite;
          }
          .status-banner.triggered {
            background: linear-gradient(135deg, #b71c1c, #d32f2f);
            animation: pulse-danger 1.5s infinite;
          }
          .status-banner.silenced {
            background: linear-gradient(135deg, #e65100, #ff9800);
          }
          .status-banner.testing {
            background: linear-gradient(135deg, #00838f, #00acc1);
          }
          @keyframes pulse-danger {
            0% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
            70% { box-shadow: 0 0 0 20px rgba(211, 47, 47, 0); }
            100% { box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
          }
          @keyframes pulse-warn {
            0% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0.7); }
            70% { box-shadow: 0 0 0 16px rgba(245, 127, 23, 0); }
            100% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0); }
          }
          .status-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
          }
          .status-indicator {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .status-icon-large {
            font-size: 44px;
            line-height: 1;
          }
          .status-headline {
            font-size: 26px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
          }
          .status-desc {
            font-size: 15px;
            margin: 6px 0 0 0;
            opacity: 0.95;
            max-width: 600px;
          }
          .status-controls {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          .btn-ctl {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 18px;
            border: 1px solid rgba(255, 255, 255, 0.45);
            background: rgba(0, 0, 0, 0.35);
            color: #ffffff !important;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            backdrop-filter: blur(8px);
            transition: all 0.2s ease;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
            user-select: none;
          }
          .btn-ctl:hover {
            background: rgba(0, 0, 0, 0.55);
            border-color: rgba(255, 255, 255, 0.9);
            transform: translateY(-1px);
            color: #ffffff !important;
          }
          .btn-ctl.danger {
            background: #b71c1c;
            border-color: #ff8a80;
            color: #ffffff !important;
          }
          .btn-ctl.danger:hover {
            background: #d32f2f;
            color: #ffffff !important;
          }

          /* Cards */
          .card {
            background: var(--card-background-color, #fff);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
            flex-wrap: wrap;
            gap: 10px;
          }
          .card-title {
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          /* Candidate Discovery Banner */
          .candidate-box {
            background: rgba(2, 136, 209, 0.08);
            border: 1px dashed var(--primary-color, #0288d1);
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 20px;
          }
          .candidate-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
            max-height: 180px;
            overflow-y: auto;
            padding: 4px 6px 4px 0;
            scrollbar-width: thin;
            scrollbar-color: var(--divider-color, rgba(127, 127, 127, 0.35)) transparent;
          }
          .candidate-list::-webkit-scrollbar {
            width: 6px;
          }
          .candidate-list::-webkit-scrollbar-track {
            background: transparent;
          }
          .candidate-list::-webkit-scrollbar-thumb {
            background: var(--divider-color, rgba(127, 127, 127, 0.35));
            border-radius: 4px;
          }
          .candidate-list::-webkit-scrollbar-thumb:hover {
            background: var(--primary-color, #0288d1);
          }
          .candidate-chip {
            background: var(--card-background-color, rgba(127, 127, 127, 0.08));
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
            color: var(--primary-text-color, inherit);
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 13px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .btn-add-cand {
            border: none;
            background: var(--primary-color, #0288d1);
            color: var(--text-primary-color, #ffffff) !important;
            padding: 5px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .btn-add-cand:hover {
            filter: brightness(1.1);
          }

          /* Tables */
          .table-responsive {
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }
          th {
            padding: 12px 14px;
            border-bottom: 2px solid var(--divider-color, #e0e0e0);
            font-size: 13px;
            font-weight: 700;
            color: var(--secondary-text-color, #757575);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 14px;
            border-bottom: 1px solid var(--divider-color, #eeeeee);
            font-size: 14px;
            vertical-align: middle;
          }
          tr:hover td {
            background-color: rgba(0,0,0,0.02);
          }

          /* Badges */
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-smoke { background: #ffebee; color: #c62828; }
          .badge-moisture { background: #e1f5fe; color: #0277bd; }
          .badge-gas { background: #fff8e1; color: #f57f17; }
          .badge-co { background: #fbe9e7; color: #d84315; }
          .badge-heat { background: #fce4ec; color: #ad1457; }
          .badge-status-on { background: #ffebee; color: #c62828; font-weight: 700; }
          .badge-status-off { background: #e8f5e9; color: #2e7d32; }
          .badge-status-offline { background: #efebe9; color: #5d4037; }

          /* Filter and Search Bar */
          .toolbar {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 16px;
          }
          .search-input {
            flex: 1;
            min-width: 200px;
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid var(--divider-color, #ccc);
            background: var(--card-background-color, #fff);
            color: inherit;
            font-size: 14px;
          }
          .select-filter {
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid var(--divider-color, #ccc);
            background: var(--card-background-color, #fff);
            color: inherit;
            font-size: 14px;
          }
          /* Base Button - Material / Home Assistant compliant */
          .btn, .btn-primary, .btn-secondary, .btn-danger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 9px 18px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            line-height: 1.4;
            transition: all 0.15s ease;
            text-decoration: none;
            user-select: none;
          }
          .btn-primary {
            background-color: var(--primary-color, #0288d1);
            color: var(--text-primary-color, #ffffff) !important;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            border: none;
          }
          .btn-primary:hover {
            filter: brightness(1.1);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
            transform: translateY(-1px);
          }
          .btn-secondary {
            background-color: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
            color: var(--primary-text-color, inherit) !important;
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
          }
          .btn-secondary:hover {
            background-color: var(--divider-color, rgba(127, 127, 127, 0.28));
            color: var(--primary-text-color, inherit) !important;
          }
          .btn-danger {
            background-color: rgba(211, 47, 47, 0.15);
            color: var(--error-color, #d32f2f) !important;
            border: 1px solid rgba(211, 47, 47, 0.35);
          }
          .btn-danger:hover {
            background-color: var(--error-color, #d32f2f);
            color: #ffffff !important;
          }

          /* Small / Table Action Buttons */
          .btn-sm {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            line-height: 1.3;
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
            background-color: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
            color: var(--primary-text-color, inherit) !important;
            transition: all 0.15s ease;
          }
          .btn-sm:hover {
            background-color: var(--divider-color, rgba(127, 127, 127, 0.25));
            color: var(--primary-text-color, inherit) !important;
          }
          .btn-sm.action-test {
            background-color: rgba(2, 136, 209, 0.12);
            color: var(--primary-color, #0288d1) !important;
            border-color: rgba(2, 136, 209, 0.3);
          }
          .btn-sm.action-test:hover {
            background-color: var(--primary-color, #0288d1);
            color: #ffffff !important;
          }
          .btn-sm.danger {
            background-color: rgba(211, 47, 47, 0.12);
            color: var(--error-color, #d32f2f) !important;
            border-color: rgba(211, 47, 47, 0.35);
          }
          .btn-sm.danger:hover {
            background-color: var(--error-color, #d32f2f);
            color: #ffffff !important;
          }

          /* History Timeline */
          .timeline {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .timeline-item {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            padding: 12px 0;
            border-bottom: 1px solid var(--divider-color, #eee);
          }
          .timeline-dot {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            background: #f0f0f0;
            flex-shrink: 0;
          }
          .timeline-content {
            flex: 1;
          }
          .timeline-title {
            font-weight: 600;
            font-size: 14px;
            margin: 0;
          }
          .timeline-time {
            font-size: 12px;
            color: var(--secondary-text-color, #888);
            margin: 2px 0 0 0;
          }

          /* Phase Cards in Actions Tab */
          .phase-card {
            border: 1px solid var(--divider-color, #e0e0e0);
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 18px;
          }
          .phase-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .phase-name {
            font-size: 16px;
            font-weight: 700;
            margin: 0;
          }
          .phase-desc {
            font-size: 13px;
            color: var(--secondary-text-color, #666);
            margin: 4px 0 12px 0;
          }

          /* Modal Dialog */
          .modal-backdrop {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 16px;
          }
          .modal-content {
            background: var(--card-background-color, #fff);
            border-radius: 16px;
            width: 100%;
            max-width: 580px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 24px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.25);
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
            color: var(--primary-text-color, #333);
          }
          .form-control {
            width: 100%;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid var(--divider-color, #ccc);
            font-size: 14px;
            background: inherit;
            color: inherit;
          }
          /* Entity ID Live Suggestions Dropdown */
          .suggestions-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            margin-top: 4px;
            background: var(--card-background-color, #ffffff);
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
            border-radius: 10px;
            max-height: 220px;
            overflow-y: auto;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
            z-index: 10050;
            display: none;
            scrollbar-width: thin;
            scrollbar-color: var(--divider-color, rgba(127, 127, 127, 0.35)) transparent;
          }
          .suggestions-dropdown::-webkit-scrollbar {
            width: 6px;
          }
          .suggestions-dropdown::-webkit-scrollbar-thumb {
            background: var(--divider-color, rgba(127, 127, 127, 0.35));
            border-radius: 4px;
          }
          .suggestions-dropdown.visible {
            display: block;
          }
          .suggestion-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 9px 12px;
            cursor: pointer;
            border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.12));
            transition: background 0.15s ease;
          }
          .suggestion-item:last-child {
            border-bottom: none;
          }
          .suggestion-item:hover, .suggestion-item.active {
            background: rgba(2, 136, 209, 0.12);
          }
          .suggestion-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow: hidden;
          }
          .suggestion-name {
            font-size: 13px;
            font-weight: 600;
            color: var(--primary-text-color, inherit);
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .suggestion-entity {
            font-size: 11px;
            color: var(--secondary-text-color, #757575);
            font-family: monospace;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .modal-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 24px;
          }
        </style>

        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="title-area">
              <div
                class="app-icon"
                id="app-menu-toggle"
                role="button"
                tabindex="0"
                title="${this._t("toggleMenu")}"
                aria-label="${this._t("toggleMenu")}"
              >
                <span>🛡️</span>
                <div class="menu-icon-badge" title="${this._t("toggleMenu")}">
                  <svg viewBox="0 0 24 24" width="11" height="11" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </div>
              </div>
              <div>
                <h1 class="app-title">${this._t("appName")}</h1>
                <p class="app-subtitle">${this._t("subtitle")}</p>
              </div>
            </div>
            <div>
              <span class="badge ${state === 'normal' ? 'badge-status-off' : 'badge-status-on'}" style="font-size: 14px; padding: 6px 14px;">
                ${this._getTypeIcon(state === 'triggered' ? 'smoke' : 'generic')} ${this._t("status" + state.charAt(0).toUpperCase() + state.slice(1).replace('_', '')) || state}
              </span>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="tabs">
            <button class="tab-btn ${this._activeTab === 'overview' ? 'active' : ''}" id="tab-overview">
              🛡️ ${this._t("tabOverview")}
            </button>
            <button class="tab-btn ${this._activeTab === 'sensors' ? 'active' : ''}" id="tab-sensors">
              🚨 ${this._t("tabSensors")} (${sensors.length})
            </button>
            <button class="tab-btn ${this._activeTab === 'actions' ? 'active' : ''}" id="tab-actions">
              ⚡ ${this._t("tabActions")} (${actions.length})
            </button>
            <button class="tab-btn ${this._activeTab === 'settings' ? 'active' : ''}" id="tab-settings">
              ⚙️ ${this._t("tabSettings")}
            </button>
          </div>

          <!-- TAB 1: OVERVIEW & STATUS -->
          ${this._activeTab === 'overview' ? this._renderOverviewTab(state, activeTriggers, history) : ''}

          <!-- TAB 2: SENSORS -->
          ${this._activeTab === 'sensors' ? this._renderSensorsTab(sensors, zones) : ''}

          <!-- TAB 3: ACTIONS & ESCALATION -->
          ${this._activeTab === 'actions' ? this._renderActionsTab(actions) : ''}

          <!-- TAB 4: SETTINGS & ZONES -->
          ${this._activeTab === 'settings' ? this._renderSettingsTab(zones) : ''}

          <!-- Modals -->
          ${this._renderModals(zones)}
        </div>
      `;

      this._attachEventListeners();
    }

    _renderOverviewTab(state, activeTriggers, history) {
      let icon = "🛡️";
      let title = this._t("statusNormal");
      let desc = this._t("statusNormalDesc");

      if (state === "triggered") {
        icon = "🚨";
        title = this._t("statusTriggered");
        desc = this._t("statusTriggeredDesc");
      } else if (state === "pre_alarm") {
        icon = "⚠️";
        title = this._t("statusPreAlarm");
        desc = this._t("statusPreAlarmDesc");
      } else if (state === "silenced") {
        icon = "🔕";
        title = this._t("statusSilenced");
        desc = this._t("statusSilencedDesc");
      } else if (state === "testing") {
        icon = "🧪";
        title = this._t("statusTesting");
        desc = this._t("statusTestingDesc");
      }

      return `
        <!-- Main Hero Banner -->
        <div class="status-banner ${state}">
          <div class="status-top">
            <div class="status-indicator">
              <span class="status-icon-large">${icon}</span>
              <div>
                <h2 class="status-headline">${title}</h2>
                <p class="status-desc">${desc}</p>
              </div>
            </div>
            <div class="status-controls">
              ${(state === 'triggered' || state === 'pre_alarm') ? `
                <button class="btn-ctl" id="btn-silence">🔕 ${this._t("btnSilence")}</button>
              ` : ''}
              ${state !== 'normal' ? `
                <button class="btn-ctl" id="btn-reset">🔄 ${this._t("btnReset")}</button>
              ` : ''}
              <button class="btn-ctl" id="btn-test-mode">
                🧪 ${state === 'testing' ? this._t("btnExitTestMode") : this._t("btnTestMode")}
              </button>
              <button class="btn-ctl danger" id="btn-manual-trigger">
                🚨 ${this._t("btnManualTrigger")}
              </button>
            </div>
          </div>
        </div>

        <!-- Active Hazards List -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⚠️ ${this._t("activeHazardsTitle")} (${activeTriggers.length})</h3>
          </div>
          ${activeTriggers.length === 0 ? `
            <p style="color: var(--secondary-text-color, #757575); margin: 0;">${this._t("noActiveHazards")}</p>
          ` : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>${this._t("thType")}</th>
                    <th>${this._t("thSensor")}</th>
                    <th>${this._t("thZone")}</th>
                    <th>Zeitpunkt</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeTriggers.map(t => `
                    <tr style="background: rgba(211, 47, 47, 0.05);">
                      <td><span class="badge badge-${t.type}">${this._getTypeIcon(t.type)} ${this._getTypeName(t.type)}</span></td>
                      <td><strong>${t.name}</strong><br><small style="color: #666;">${t.entity_id}</small></td>
                      <td><span class="badge" style="background:#eee;">${t.zone}</span></td>
                      <td>${new Date(t.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Event History -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">📜 ${this._t("eventHistoryTitle")}</h3>
          </div>
          ${history.length === 0 ? `
            <p style="color: var(--secondary-text-color, #757575); margin: 0;">${this._t("noEvents")}</p>
          ` : `
            <ul class="timeline">
              ${history.slice().reverse().slice(0, 10).map(evt => `
                <li class="timeline-item">
                  <div class="timeline-dot">
                    ${evt.event === 'sensor_triggered' ? '🚨' : evt.event === 'silenced' ? '🔕' : evt.event === 'reset' ? '✅' : '🧪'}
                  </div>
                  <div class="timeline-content">
                    <p class="timeline-title">${evt.details || evt.name || evt.event}</p>
                    <p class="timeline-time">${new Date(evt.timestamp).toLocaleString()}</p>
                  </div>
                </li>
              `).join('')}
            </ul>
          `}
        </div>
      `;
    }

    _renderSensorsTab(sensors, zones) {
      const candidatesNotMonitored = this._candidates.filter(c => !c.monitored);

      let filtered = sensors;
      if (this._typeFilter !== 'all') {
        filtered = filtered.filter(s => s.type === this._typeFilter);
      }
      if (this._zoneFilter !== 'all') {
        filtered = filtered.filter(s => s.zone === this._zoneFilter);
      }
      if (this._searchFilter) {
        const q = this._searchFilter.toLowerCase();
        filtered = filtered.filter(s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          s.entity_id.toLowerCase().includes(q)
        );
      }

      return `
        ${candidatesNotMonitored.length > 0 ? `
          <div class="candidate-box">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
              <strong>✨ ${this._t("candidateBanner", { count: candidatesNotMonitored.length })}</strong>
              <small style="color: var(--secondary-text-color, #757575); font-size: 12px;">(${candidatesNotMonitored.length} verfügbar · scrollbar)</small>
            </div>
            <div class="candidate-list">
              ${candidatesNotMonitored.map(c => `
                <div class="candidate-chip">
                  <span>${this._getTypeIcon(c.device_class || 'generic')} <strong>${c.name}</strong> <small style="opacity: 0.7; font-size: 11px;">(${c.entity_id})</small></span>
                  <button class="btn-add-cand" data-cand-id="${c.entity_id}" data-cand-class="${c.device_class || 'smoke'}">
                    + ${this._t("addCandidate")}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🚨 ${this._t("tabSensors")}</h3>
            <button class="btn-primary" id="btn-open-add-sensor">+ ${this._t("btnAddSensor")}</button>
          </div>

          <div class="toolbar">
            <input type="text" class="search-input" id="search-sensors" placeholder="${this._t("searchSensorsPlaceholder")}" value="${this._searchFilter}">
            <select class="select-filter" id="filter-type">
              <option value="all" ${this._typeFilter === 'all' ? 'selected' : ''}>${this._t("filterAll")} (Typ)</option>
              <option value="smoke" ${this._typeFilter === 'smoke' ? 'selected' : ''}>🔥 ${this._t("typeSmoke")}</option>
              <option value="moisture" ${this._typeFilter === 'moisture' ? 'selected' : ''}>💧 ${this._t("typeMoisture")}</option>
              <option value="gas" ${this._typeFilter === 'gas' ? 'selected' : ''}>☣️ ${this._t("typeGas")}</option>
              <option value="carbon_monoxide" ${this._typeFilter === 'carbon_monoxide' ? 'selected' : ''}>⚠️ ${this._t("typeCO")}</option>
              <option value="heat" ${this._typeFilter === 'heat' ? 'selected' : ''}>🌡️ ${this._t("typeHeat")}</option>
            </select>
            <select class="select-filter" id="filter-zone">
              <option value="all" ${this._zoneFilter === 'all' ? 'selected' : ''}>${this._t("filterAll")} (Zonen)</option>
              ${zones.map(z => `<option value="${z.id}" ${this._zoneFilter === z.id ? 'selected' : ''}>${z.name}</option>`).join('')}
            </select>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>${this._t("thSensor")}</th>
                  <th>${this._t("thZone")}</th>
                  <th>${this._t("thType")}</th>
                  <th>${this._t("thPreAlarm")}</th>
                  <th>${this._t("thFeatures")}</th>
                  <th>${this._t("thStatus")}</th>
                  <th>${this._t("thActions")}</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.length === 0 ? `
                  <tr><td colspan="7" style="text-align: center; color: #888;">Keine Sensoren gefunden.</td></tr>
                ` : filtered.map(s => {
                  const haState = this._hass && this._hass.states[s.entity_id];
                  const isOn = haState && haState.state === 'on';
                  const isOff = haState && haState.state === 'off';
                  return `
                    <tr>
                      <td>
                        <strong>${s.name}</strong><br>
                        <small style="color: #666;">${s.entity_id}</small>
                      </td>
                      <td><span class="badge" style="background:#e0e0e0;">${s.zone}</span></td>
                      <td>
                        <span class="badge badge-${s.type}">
                          ${this._getTypeIcon(s.type)} ${this._getTypeName(s.type)}
                        </span>
                      </td>
                      <td>${s.pre_alarm_delay ? s.pre_alarm_delay + 's' : 'Sofort'}</td>
                      <td>
                        ${s.double_knock ? '<span class="badge" style="background:#fff3e0;color:#e65100;">Double-Knock</span> ' : ''}
                        ${s.auto_ack_on_clear ? '<span class="badge" style="background:#e8f5e9;color:#2e7d32;">Auto-Ack</span> ' : ''}
                        ${(s.linked_shutoff && s.linked_shutoff.length > 0) ? `<span class="badge" style="background:#e1f5fe;color:#0277bd;">${s.linked_shutoff.length} Aktoren</span>` : ''}
                      </td>
                      <td>
                        <span class="badge ${isOn ? 'badge-status-on' : isOff ? 'badge-status-off' : 'badge-status-offline'}">
                          ${isOn ? 'GEFAHR' : isOff ? 'Normal' : 'Offline'}
                        </span>
                      </td>
                      <td>
                        <button class="btn-sm btn-edit-sensor" data-entity-id="${s.entity_id}">${this._t("edit")}</button>
                        <button class="btn-sm danger btn-delete-sensor" data-entity-id="${s.entity_id}">${this._t("delete")}</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    _renderActionsTab(actions) {
      const cutoffActions = actions.filter(a => a.phase === 'cutoff');
      const notifActions = actions.filter(a => a.phase === 'notification');
      const acousticActions = actions.filter(a => a.phase === 'acoustic_optical');

      const renderActionList = (list) => {
        if (list.length === 0) return '<p style="color: #888; font-size: 13px;">Keine Aktionen in dieser Phase konfiguriert.</p>';
        return list.map(a => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
            <div>
              <strong>${a.name}</strong> <span style="font-size: 12px; color: #666;">(${a.service})</span><br>
              <small style="color: #888;">Gefahrentypen: ${(a.trigger_types || []).join(', ') || 'Alle'}</small>
            </div>
            <div style="display: flex; gap: 6px;">
              <button class="btn-sm action-test btn-test-action" data-action-id="${a.id}">⚡ ${this._t("testAction")}</button>
              <button class="btn-sm btn-edit-action" data-action-id="${a.id}">${this._t("edit")}</button>
              <button class="btn-sm danger btn-delete-action" data-action-id="${a.id}">${this._t("delete")}</button>
            </div>
          </div>
        `).join('');
      };

      return `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⚡ ${this._t("tabActions")}</h3>
            <button class="btn-primary" id="btn-open-add-action">+ ${this._t("btnAddAction")}</button>
          </div>

          <div class="phase-card">
            <div class="phase-header">
              <h4 class="phase-name">🚪 ${this._t("phaseCutoff")}</h4>
            </div>
            <p class="phase-desc">${this._t("phaseCutoffDesc")}</p>
            ${renderActionList(cutoffActions)}
          </div>

          <div class="phase-card">
            <div class="phase-header">
              <h4 class="phase-name">📱 ${this._t("phaseNotification")}</h4>
            </div>
            <p class="phase-desc">${this._t("phaseNotificationDesc")}</p>
            ${renderActionList(notifActions)}
          </div>

          <div class="phase-card">
            <div class="phase-header">
              <h4 class="phase-name">🚨 ${this._t("phaseAcoustic")}</h4>
            </div>
            <p class="phase-desc">${this._t("phaseAcousticDesc")}</p>
            ${renderActionList(acousticActions)}
          </div>
        </div>
      `;
    }

    _renderSettingsTab(zones) {
      const settings = this._config.settings || {};
      return `
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🏠 ${this._t("zonesTitle")}</h3>
            <button class="btn-primary" id="btn-open-add-zone">+ ${this._t("btnAddZone")}</button>
          </div>
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>${this._t("zoneName")}</th>
                  <th>ID</th>
                  <th>${this._t("doubleKnockEnabled")}</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                ${zones.map(z => `
                  <tr>
                    <td><strong>${z.name}</strong></td>
                    <td><code>${z.id}</code></td>
                    <td>${z.double_knock_enabled ? '✅ Ja (' + z.double_knock_timeout + 's)' : '❌ Nein'}</td>
                    <td>
                      <button class="btn-sm btn-edit-zone" data-zone-id="${z.id}">${this._t("edit")}</button>
                      <button class="btn-sm danger btn-delete-zone" data-zone-id="${z.id}">${this._t("delete")}</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">⚙️ ${this._t("settingsTitle")}</h3>
          </div>
          <div class="form-group">
            <label class="form-label">${this._t("lblTestDuration")}</label>
            <input type="number" class="form-control" id="setting-test-timeout" value="${Math.round((settings.test_mode_timeout || 900) / 60)}">
          </div>
          <div class="form-group">
            <label class="form-label">${this._t("lblSilenceDuration")}</label>
            <input type="number" class="form-control" id="setting-silence-timeout" value="${Math.round((settings.silence_timeout || 600) / 60)}">
          </div>
          <div class="form-group">
            <label class="form-label">${this._t("lblDoubleKnockTimeout")}</label>
            <input type="number" class="form-control" id="setting-double-knock" value="${settings.double_knock_global_timeout || 60}">
          </div>
          <div class="form-group">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" id="setting-offline-alerts" ${settings.heartbeat_alert_offline ? 'checked' : ''}>
              ${this._t("lblOfflineAlerts")}
            </label>
          </div>
          <div class="form-group">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" id="setting-battery-alerts" ${settings.heartbeat_alert_battery ? 'checked' : ''}>
              ${this._t("lblBatteryAlerts")}
            </label>
          </div>
          <button class="btn-primary" id="btn-save-settings">💾 ${this._t("save")}</button>
        </div>
      `;
    }

    _renderModals(zones) {
      if (!this._modalOpen) return '';

      if (this._modalOpen === 'sensor') {
        const s = this._editingSensor || {};
        return `
          <div class="modal-backdrop">
            <div class="modal-content">
              <h3>${s.entity_id ? this._t("edit") : this._t("btnAddSensor")}</h3>
              <div class="form-group" style="position: relative;">
                <label class="form-label">Entity ID</label>
                <input
                  type="text"
                  class="form-control"
                  id="modal-sensor-entity"
                  value="${s.entity_id || ''}"
                  ${s.entity_id ? 'readonly' : ''}
                  placeholder="binary_sensor.rauchmelder_kuche"
                  autocomplete="off"
                >
                <div class="suggestions-dropdown" id="sensor-suggestions"></div>
                ${!s.entity_id ? `
                  <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 4px;">
                    Tippen Sie zur Live-Suche oder wählen Sie aus den gefundenen Sensoren.
                  </small>
                ` : ''}
              </div>
              <div class="form-group">
                <label class="form-label">Name</label>
                <input type="text" class="form-control" id="modal-sensor-name" value="${s.name || ''}" placeholder="Küche Rauchmelder">
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("thZone")}</label>
                <select class="form-control" id="modal-sensor-zone">
                  ${zones.map(z => `<option value="${z.id}" ${s.zone === z.id ? 'selected' : ''}>${z.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("thType")}</label>
                <select class="form-control" id="modal-sensor-type">
                  <option value="smoke" ${s.type === 'smoke' ? 'selected' : ''}>🔥 ${this._t("typeSmoke")}</option>
                  <option value="moisture" ${s.type === 'moisture' ? 'selected' : ''}>💧 ${this._t("typeMoisture")}</option>
                  <option value="gas" ${s.type === 'gas' ? 'selected' : ''}>☣️ ${this._t("typeGas")}</option>
                  <option value="carbon_monoxide" ${s.type === 'carbon_monoxide' ? 'selected' : ''}>⚠️ ${this._t("typeCO")}</option>
                  <option value="heat" ${s.type === 'heat' ? 'selected' : ''}>🌡️ ${this._t("typeHeat")}</option>
                  <option value="generic" ${s.type === 'generic' ? 'selected' : ''}>🛡️ ${this._t("typeGeneric")}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("preAlarmDelaySec")}</label>
                <input type="number" class="form-control" id="modal-sensor-pre-alarm" value="${s.pre_alarm_delay || 0}">
              </div>
              <div class="form-group">
                <label style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="modal-sensor-double-knock" ${s.double_knock ? 'checked' : ''}>
                  ${this._t("doubleKnockHelp")}
                </label>
              </div>
              <div class="form-group">
                <label style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="modal-sensor-auto-ack" ${s.auto_ack_on_clear ? 'checked' : ''}>
                  ${this._t("autoAckHelp")}
                </label>
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("linkedShutoffs")}</label>
                <input type="text" class="form-control" id="modal-sensor-shutoffs" value="${(s.linked_shutoff || []).join(', ')}" placeholder="valve.hauptwasser, fan.lueftung">
              </div>
              <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-modal-cancel">${this._t("cancel")}</button>
                <button class="btn btn-primary" id="btn-modal-save-sensor">${this._t("save")}</button>
              </div>
            </div>
          </div>
        `;
      }

      if (this._modalOpen === 'zone') {
        const z = this._editingZone || {};
        return `
          <div class="modal-backdrop">
            <div class="modal-content">
              <h3>${z.id ? this._t("edit") : this._t("btnAddZone")}</h3>
              <div class="form-group">
                <label class="form-label">Zonen ID</label>
                <input type="text" class="form-control" id="modal-zone-id" value="${z.id || ''}" ${z.id ? 'readonly' : ''} placeholder="kitchen">
                <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 4px;">Eindeutige ID (wird automatisch als Name genutzt, falls Name leer gelassen wird).</small>
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("zoneName")}</label>
                <input type="text" class="form-control" id="modal-zone-name" value="${z.name || ''}" placeholder="Wird automatisch auf ID gesetzt falls leer">
                <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 4px;">Optionaler Anzeigename. Wenn leer, wird die ID verwendet.</small>
              </div>
              <div class="form-group">
                <label style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="modal-zone-dk" ${z.double_knock_enabled ? 'checked' : ''}>
                  ${this._t("doubleKnockEnabled")}
                </label>
              </div>
              <div class="form-group">
                <label class="form-label">Timeout (Sekunden)</label>
                <input type="number" class="form-control" id="modal-zone-dk-timeout" value="${z.double_knock_timeout || 60}">
              </div>
              <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-modal-cancel">${this._t("cancel")}</button>
                <button class="btn btn-primary" id="btn-modal-save-zone">${this._t("save")}</button>
              </div>
            </div>
          </div>
        `;
      }

      if (this._modalOpen === 'action') {
        const a = this._editingAction || {};
        return `
          <div class="modal-backdrop">
            <div class="modal-content">
              <h3>${a.id ? this._t("edit") : this._t("btnAddAction")}</h3>
              <div class="form-group">
                <label class="form-label">Aktions-Name</label>
                <input type="text" class="form-control" id="modal-act-name" value="${a.name || ''}" placeholder="Hauptwasserhahn schließen">
              </div>
              <div class="form-group">
                <label class="form-label">Eskalations-Stufe / Phase</label>
                <select class="form-control" id="modal-act-phase">
                  <option value="cutoff" ${a.phase === 'cutoff' ? 'selected' : ''}>🚪 Stufe 1: Notabschaltung (Cutoff)</option>
                  <option value="notification" ${a.phase === 'notification' ? 'selected' : ''}>📱 Stufe 2: Benachrichtigung</option>
                  <option value="acoustic_optical" ${a.phase === 'acoustic_optical' ? 'selected' : ''}>🚨 Stufe 3: Akustisch & Optisch</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("actionService")}</label>
                <input type="text" class="form-control" id="modal-act-service" value="${a.service || ''}" placeholder="valve.close_valve">
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("actionTarget")}</label>
                <input type="text" class="form-control" id="modal-act-target" value="${(a.target && a.target.entity_id) ? (Array.isArray(a.target.entity_id) ? a.target.entity_id.join(', ') : a.target.entity_id) : ''}" placeholder="valve.hauptwasser">
              </div>
              <div class="form-group">
                <label class="form-label">${this._t("actionPayload")}</label>
                <textarea class="form-control" id="modal-act-data" rows="4" style="font-family:monospace; font-size:12px;">${JSON.stringify(a.data || {}, null, 2)}</textarea>
              </div>
              <div class="modal-actions">
                <button class="btn btn-secondary" id="btn-modal-cancel">${this._t("cancel")}</button>
                <button class="btn btn-primary" id="btn-modal-save-action">${this._t("save")}</button>
              </div>
            </div>
          </div>
        `;
      }

      return '';
    }

    _attachEventListeners() {
      const root = this.shadowRoot;

      // Menu Toggle on Top-Left App Icon
      const btnMenu = root.querySelector('#app-menu-toggle');
      if (btnMenu) {
        const handleToggle = (e) => {
          e.preventDefault();
          this._toggleMenu();
        };
        btnMenu.addEventListener('click', handleToggle);
        btnMenu.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleToggle(e);
          }
        });
      }

      // Tabs
      root.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this._activeTab = e.currentTarget.id.replace('tab-', '');
          this._render();
        });
      });

      // Quick Controls
      const btnSilence = root.querySelector('#btn-silence');
      if (btnSilence) btnSilence.addEventListener('click', () => this._silenceAlarm());

      const btnReset = root.querySelector('#btn-reset');
      if (btnReset) btnReset.addEventListener('click', () => this._resetAlarm());

      const btnTestMode = root.querySelector('#btn-test-mode');
      if (btnTestMode) btnTestMode.addEventListener('click', () => this._toggleTestMode());

      const btnManualTrigger = root.querySelector('#btn-manual-trigger');
      if (btnManualTrigger) btnManualTrigger.addEventListener('click', () => this._manualTrigger());

      // Search & Filters
      const searchSensors = root.querySelector('#search-sensors');
      if (searchSensors) {
        searchSensors.addEventListener('input', (e) => {
          this._searchFilter = e.target.value;
          this._render();
        });
      }

      const filterType = root.querySelector('#filter-type');
      if (filterType) {
        filterType.addEventListener('change', (e) => {
          this._typeFilter = e.target.value;
          this._render();
        });
      }

      const filterZone = root.querySelector('#filter-zone');
      if (filterZone) {
        filterZone.addEventListener('change', (e) => {
          this._zoneFilter = e.target.value;
          this._render();
        });
      }

      // Add Candidate Quick-Button
      root.querySelectorAll('.btn-add-cand').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const entityId = e.currentTarget.dataset.candId;
          const devClass = e.currentTarget.dataset.candClass || 'smoke';
          const cand = (this._candidates || []).find(c => c.entity_id === entityId);
          const friendlyName = (cand && cand.name) ? cand.name : entityId.split('.')[1].replace(/_/g, ' ');
          this._editingSensor = {
            entity_id: entityId,
            name: friendlyName,
            zone: 'general',
            type: devClass === 'moisture' ? 'moisture' : devClass === 'gas' ? 'gas' : devClass === 'carbon_monoxide' ? 'carbon_monoxide' : devClass === 'heat' ? 'heat' : 'smoke',
            pre_alarm_delay: 0,
            auto_ack_on_clear: false,
            double_knock: false,
            linked_shutoff: [],
          };
          this._modalOpen = 'sensor';
          this._render();
        });
      });

      // Sensor Add / Edit / Delete
      const btnOpenAddSensor = root.querySelector('#btn-open-add-sensor');
      if (btnOpenAddSensor) {
        btnOpenAddSensor.addEventListener('click', () => {
          this._editingSensor = {};
          this._modalOpen = 'sensor';
          this._render();
        });
      }

      // Live suggestions for entity_id input in Sensor modal
      const entityInput = root.querySelector('#modal-sensor-entity');
      const suggestionsBox = root.querySelector('#sensor-suggestions');
      const nameInput = root.querySelector('#modal-sensor-name');
      const typeSelect = root.querySelector('#modal-sensor-type');

      if (entityInput && suggestionsBox && !entityInput.readOnly) {
        const getCandidateList = () => {
          const list = [];
          const seen = new Set();
          (this._candidates || []).forEach(c => {
            if (!seen.has(c.entity_id)) {
              seen.add(c.entity_id);
              list.push({
                entity_id: c.entity_id,
                name: c.name || c.entity_id,
                device_class: c.device_class || "",
                monitored: !!(this._config && this._config.sensors && this._config.sensors[c.entity_id]),
                is_hazard: !!c.is_hazard_class,
              });
            }
          });
          if (this._hass && this._hass.states) {
            Object.keys(this._hass.states).forEach(eid => {
              if (eid.startsWith("binary_sensor.") && !seen.has(eid)) {
                seen.add(eid);
                const st = this._hass.states[eid];
                const dc = (st.attributes && st.attributes.device_class) || "";
                const isHz = ["smoke", "moisture", "gas", "carbon_monoxide", "heat"].includes(dc) ||
                  ["smoke", "rauch", "water", "wasser", "leak", "gas", "co_", "heat"].some(w => eid.toLowerCase().includes(w));
                list.push({
                  entity_id: eid,
                  name: (st.attributes && st.attributes.friendly_name) || eid,
                  device_class: dc,
                  monitored: !!(this._config && this._config.sensors && this._config.sensors[eid]),
                  is_hazard: isHz,
                });
              }
            });
          }
          return list;
        };

        const renderSuggestions = (query = "") => {
          const q = (query || "").toLowerCase().trim();
          const all = getCandidateList();
          let matches = all;
          if (q) {
            matches = all.filter(c =>
              c.entity_id.toLowerCase().includes(q) ||
              (c.name && c.name.toLowerCase().includes(q))
            );
          }
          matches.sort((a, b) => {
            if (a.monitored !== b.monitored) return a.monitored ? 1 : -1;
            if (a.is_hazard !== b.is_hazard) return a.is_hazard ? -1 : 1;
            return a.name.localeCompare(b.name);
          });

          if (matches.length === 0) {
            suggestionsBox.innerHTML = `
              <div style="padding: 10px 14px; font-size: 12px; color: var(--secondary-text-color, #757575);">
                Keine passenden Sensoren gefunden.
              </div>
            `;
            suggestionsBox.classList.add('visible');
            return;
          }

          const topMatches = matches.slice(0, 25);
          suggestionsBox.innerHTML = topMatches.map(c => `
            <div class="suggestion-item" data-entity-id="${c.entity_id}" data-name="${c.name.replace(/"/g, '&quot;')}" data-class="${c.device_class}">
              <div class="suggestion-info">
                <span class="suggestion-name">
                  ${this._getTypeIcon(c.device_class || 'generic')} <strong>${c.name}</strong>
                </span>
                <span class="suggestion-entity">${c.entity_id}</span>
              </div>
              <div>
                ${c.monitored ? `
                  <span class="badge" style="background: rgba(127,127,127,0.18); font-size: 11px;">Bereits überwacht</span>
                ` : `
                  <span class="badge badge-${c.device_class || 'generic'}" style="font-size: 11px;">
                    ${this._getTypeName(c.device_class || 'generic')}
                  </span>
                `}
              </div>
            </div>
          `).join('');
          suggestionsBox.classList.add('visible');

          suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
              e.preventDefault();
              const eid = item.dataset.entityId;
              const name = item.dataset.name;
              const devClass = item.dataset.class;

              entityInput.value = eid;
              if (nameInput && (!nameInput.value || nameInput.value === eid)) {
                nameInput.value = name;
              }
              if (typeSelect && devClass) {
                const mapType = devClass === 'moisture' ? 'moisture'
                  : devClass === 'gas' ? 'gas'
                  : devClass === 'carbon_monoxide' ? 'carbon_monoxide'
                  : devClass === 'heat' ? 'heat'
                  : devClass === 'smoke' ? 'smoke'
                  : null;
                if (mapType) typeSelect.value = mapType;
              }
              suggestionsBox.classList.remove('visible');
            });
          });
        };

        entityInput.addEventListener('input', (e) => {
          renderSuggestions(e.target.value);
        });

        entityInput.addEventListener('focus', (e) => {
          renderSuggestions(e.target.value);
        });

        entityInput.addEventListener('blur', () => {
          setTimeout(() => {
            suggestionsBox.classList.remove('visible');
          }, 200);
        });
      }

      root.querySelectorAll('.btn-edit-sensor').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eid = e.currentTarget.dataset.entityId;
          this._editingSensor = Object.assign({}, this._config.sensors[eid]);
          this._modalOpen = 'sensor';
          this._render();
        });
      });

      root.querySelectorAll('.btn-delete-sensor').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const eid = e.currentTarget.dataset.entityId;
          if (confirm(`Sensor '${eid}' wirklich entfernen?`)) {
            await this._hass.callWS({ type: "safety_monitor/sensor/delete", entity_id: eid });
            await this._loadData();
          }
        });
      });

      // Actions Add / Edit / Delete / Test
      const btnOpenAddAction = root.querySelector('#btn-open-add-action');
      if (btnOpenAddAction) {
        btnOpenAddAction.addEventListener('click', () => {
          this._editingAction = {};
          this._modalOpen = 'action';
          this._render();
        });
      }

      root.querySelectorAll('.btn-edit-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const aid = e.currentTarget.dataset.actionId;
          this._editingAction = Object.assign({}, this._config.actions.find(a => a.id === aid));
          this._modalOpen = 'action';
          this._render();
        });
      });

      root.querySelectorAll('.btn-delete-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const aid = e.currentTarget.dataset.actionId;
          if (confirm(`Aktion '${aid}' wirklich löschen?`)) {
            await this._hass.callWS({ type: "safety_monitor/action/delete", action_id: aid });
            await this._loadData();
          }
        });
      });

      root.querySelectorAll('.btn-test-action').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const aid = e.currentTarget.dataset.actionId;
          try {
            await this._hass.callWS({ type: "safety_monitor/action/test", action_id: aid });
            alert("Aktion erfolgreich ausgeführt!");
          } catch (err) {
            alert("Fehler beim Testen der Aktion: " + err.message);
          }
        });
      });

      // Zones Add / Edit / Delete
      const btnOpenAddZone = root.querySelector('#btn-open-add-zone');
      if (btnOpenAddZone) {
        btnOpenAddZone.addEventListener('click', () => {
          this._editingZone = {};
          this._modalOpen = 'zone';
          this._render();
        });
      }

      root.querySelectorAll('.btn-edit-zone').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const zid = e.currentTarget.dataset.zoneId;
          this._editingZone = Object.assign({}, this._config.zones[zid]);
          this._modalOpen = 'zone';
          this._render();
        });
      });

      root.querySelectorAll('.btn-delete-zone').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const zid = e.currentTarget.dataset.zoneId;
          if (confirm(`Zone '${zid}' löschen?`)) {
            await this._hass.callWS({ type: "safety_monitor/zone/delete", zone_id: zid });
            await this._loadData();
          }
        });
      });

      // Settings Save
      const btnSaveSettings = root.querySelector('#btn-save-settings');
      if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', async () => {
          const testMin = parseInt(root.querySelector('#setting-test-timeout').value, 10) || 15;
          const silMin = parseInt(root.querySelector('#setting-silence-timeout').value, 10) || 10;
          const dkSec = parseInt(root.querySelector('#setting-double-knock').value, 10) || 60;
          const offlineAlert = root.querySelector('#setting-offline-alerts').checked;
          const batteryAlert = root.querySelector('#setting-battery-alerts').checked;

          try {
            await this._hass.callWS({
              type: "safety_monitor/config/update_settings",
              settings: {
                test_mode_timeout: testMin * 60,
                silence_timeout: silMin * 60,
                double_knock_global_timeout: dkSec,
                heartbeat_alert_offline: offlineAlert,
                heartbeat_alert_battery: batteryAlert,
              }
            });
            alert("Einstellungen erfolgreich gespeichert!");
            await this._loadData();
          } catch (err) {
            alert("Fehler beim Speichern: " + err.message);
          }
        });
      }

      // Modal buttons
      const btnModalCancel = root.querySelector('#btn-modal-cancel');
      if (btnModalCancel) {
        btnModalCancel.addEventListener('click', () => {
          this._modalOpen = null;
          this._render();
        });
      }

      const btnSaveModalSensor = root.querySelector('#btn-modal-save-sensor');
      if (btnSaveModalSensor) {
        btnSaveModalSensor.addEventListener('click', async () => {
          const entity = root.querySelector('#modal-sensor-entity').value.trim();
          const name = root.querySelector('#modal-sensor-name').value.trim() || entity;
          const zone = root.querySelector('#modal-sensor-zone').value;
          const type = root.querySelector('#modal-sensor-type').value;
          const delay = parseInt(root.querySelector('#modal-sensor-pre-alarm').value, 10) || 0;
          const dk = root.querySelector('#modal-sensor-double-knock').checked;
          const autoAck = root.querySelector('#modal-sensor-auto-ack').checked;
          const shutoffsRaw = root.querySelector('#modal-sensor-shutoffs').value;
          const shutoffs = shutoffsRaw.split(',').map(s => s.trim()).filter(Boolean);

          if (!entity) {
            alert("Entity ID ist erforderlich");
            return;
          }

          try {
            await this._hass.callWS({
              type: "safety_monitor/sensor/save",
              sensor: {
                entity_id: entity,
                name: name,
                zone: zone,
                type: type,
                pre_alarm_delay: delay,
                double_knock: dk,
                auto_ack_on_clear: autoAck,
                linked_shutoff: shutoffs,
                enabled: true,
              }
            });
            this._modalOpen = null;
            await this._loadData();
          } catch (err) {
            alert("Fehler beim Speichern des Sensors: " + err.message);
          }
        });
      }

      const btnSaveModalZone = root.querySelector('#btn-modal-save-zone');
      if (btnSaveModalZone) {
        btnSaveModalZone.addEventListener('click', async () => {
          const rawId = (root.querySelector('#modal-zone-id').value || '').trim();
          const id = rawId.toLowerCase().replace(/\s+/g, '_');
          const enteredName = (root.querySelector('#modal-zone-name').value || '').trim();
          // Fallback: If no name entered, use entered ID as name
          const name = enteredName || rawId || id;
          const dk = root.querySelector('#modal-zone-dk').checked;
          const timeout = parseInt(root.querySelector('#modal-zone-dk-timeout').value, 10) || 60;

          if (!id) {
            alert("Zonen ID ist erforderlich");
            return;
          }

          try {
            await this._hass.callWS({
              type: "safety_monitor/zone/save",
              zone: {
                id: id,
                name: name,
                double_knock_enabled: dk,
                double_knock_timeout: timeout,
              }
            });
            this._modalOpen = null;
            await this._loadData();
          } catch (err) {
            alert("Fehler beim Speichern der Zone: " + err.message);
          }
        });
      }

      const btnSaveModalAction = root.querySelector('#btn-modal-save-action');
      if (btnSaveModalAction) {
        btnSaveModalAction.addEventListener('click', async () => {
          const name = root.querySelector('#modal-act-name').value.trim() || "Aktion";
          const phase = root.querySelector('#modal-act-phase').value;
          const service = root.querySelector('#modal-act-service').value.trim();
          const targetRaw = root.querySelector('#modal-act-target').value.trim();
          let dataObj = {};
          try {
            dataObj = JSON.parse(root.querySelector('#modal-act-data').value || "{}");
          } catch (err) {
            alert("Ungültiges JSON in den Dienst-Daten: " + err.message);
            return;
          }

          if (!service) {
            alert("Dienst (Service) ist erforderlich!");
            return;
          }

          const target = targetRaw ? { entity_id: targetRaw.split(',').map(s => s.trim()) } : {};

          try {
            await this._hass.callWS({
              type: "safety_monitor/action/save",
              action: {
                id: (this._editingAction && this._editingAction.id) || undefined,
                name: name,
                phase: phase,
                service: service,
                target: target,
                data: dataObj,
                enabled: true,
                trigger_types: ["smoke", "moisture", "gas", "carbon_monoxide", "heat"],
              }
            });
            this._modalOpen = null;
            await this._loadData();
          } catch (err) {
            alert("Fehler beim Speichern der Aktion: " + err.message);
          }
        });
      }
    }
  }

  customElements.define("safety-monitor-panel", SafetyMonitorPanel);
})();
