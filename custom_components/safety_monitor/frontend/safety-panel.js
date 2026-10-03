/**
 * Safety Monitor - 24/7 Life Safety & Hazard Monitoring Dashboard
 * Custom Panel for Home Assistant
 *
 * Inspired by Alarmo, dedicated to Life Safety & Property Protection:
 * Smoke, Moisture, Gas, Carbon Monoxide, and Heat monitoring.
 */

(function () {
  const TRANSLATIONS = {
    "de": {
        "appName": "Safety Monitor",
        "subtitle": "24/7 Gefahrenmeldeanlage (Rauch, Wasser, Gas, CO)",
        "tabOverview": "Übersicht & Status",
        "tabSensors": "Sensoren",
        "tabActions": "Notfall-Aktionen",
        "tabSettings": "Zonen & Einstellungen",
        "statusNormal": "Alles Sicher",
        "statusNormalDesc": "Alle überwachten Sensoren sind unauffällig. Die 24/7 Schutzüberwachung ist aktiv.",
        "statusPreAlarm": "Voralarm / Verifikation",
        "statusPreAlarmDesc": "Mögliche Gefahr erkannt! Countdown läuft vor Auslösen der Hauptsirenen.",
        "statusTriggered": "AKUTE GEFAHR - ALARM AKTIV!",
        "statusTriggeredDesc": "Hauptalarm ausgelöst! Sirenen, Notabschaltungen und Benachrichtigungen laufen.",
        "statusSilenced": "Alarm Stummgeschaltet",
        "statusSilencedDesc": "Akustische Sirenen vorübergehend pausiert. Die 24/7 Gefahrenüberwachung bleibt aktiv!",
        "statusTesting": "Test- & Wartungsmodus",
        "statusTestingDesc": "Wartungsmodus aktiv: Sirenen und Notfall-Abschaltungen sind vorübergehend unterdrückt.",
        "testModeActiveTitle": "Test- & Wartungsmodus ist AKTIV",
        "testModeActiveDesc": "Sirenen und Notfall-Abschaltungen sind unterdrückt. Sie können Melder jetzt gefahrlos testen:",
        "btnDrillAll": "Alle Melder: Alarmübung",
        "btnSelfTestAll": "Alle Melder: Selbsttest",
        "btnSilence": "Sirenen stummschalten",
        "btnSilenceAgain": "Erneut stummschalten",
        "btnReset": "Quittieren / Zurücksetzen",
        "btnTestMode": "Test-Modus",
        "btnExitTestMode": "Test-Modus beenden",
        "btnManualTrigger": "Notfall-Alarm auslösen",
        "confirmManualTrigger": "Möchten Sie wirklich manuell den vollen Notfall-Alarm (Sirenen & Benachrichtigungen) auslösen?",
        "activeHazardsTitle": "Aktive Gefahrenmeldungen",
        "noActiveHazards": "Keine aktiven Gefahrenmeldungen vorhanden.",
        "eventHistoryTitle": "Ereignis-Protokoll",
        "noEvents": "Bisher keine Ereignisse protokolliert.",
        "historyFilterType": "Art des Ereignisses:",
        "historyFilterTime": "Zeitraum:",
        "historyTime24h": "Max. 24 Stunden",
        "historyTime1h": "Letzte 1 Stunde",
        "historyTime6h": "Letzte 6 Stunden",
        "historyTime12h": "Letzte 12 Stunden",
        "historyTime3d": "Letzte 3 Tage",
        "historyTimeAll": "Gesamter Verlauf (Alle)",
        "historyTypeAll": "Alle Ereignisarten",
        "historyTypeAlarms": "🚨 Alarme & Gefahren",
        "historyTypeSilenced": "🔕 Stummschaltungen",
        "historyTypeReset": "✅ Quittierung & Entwarnung",
        "historyTypeSelfTestAll": "🧪 Selbsttests (Alle)",
        "historyTypeSelfTestFailed": "❌ Selbsttest fehlgeschlagen",
        "historyTypeSelfTestSuccess": "✅ Selbsttest erfolgreich",
        "historyTypeDrills": "🔔 Alarmübungen",
        "historyTypeTestMode": "🛡️ Test-Modus",
        "historyTypeBattery": "🪫 Schwache Batterie",
        "historyTypeOffline": "📡 Melder Offline / Online",
        "historyTypeIgnored": "🙈 Ignoriert / Reaktiviert",
        "historyNoMatchingEvents": "Keine Ereignisse entsprechen den aktuellen Filterkriterien.",
        "historyShowAllEvents": "Alle Ereignisse anzeigen",
        "historyCountBadge": "{filtered} von {total} Ereignissen",
        "lblHistoryDefaultTime": "Standard-Zeitraum im Ereignis-Protokoll:",
        "searchSensorsPlaceholder": "Sensoren durchsuchen...",
        "searchCandidatesPlaceholder": "Gefahrensensoren filtern...",
        "filterAll": "Alle",
        "filterAllTypes": "Alle Typen",
        "noMatchingCandidates": "Keine Gefahrensensoren entsprechen dem Filter.",
        "btnAddSensor": "Sensor hinzufügen",
        "btnAddZone": "Zone hinzufügen",
        "btnAddAction": "Aktion hinzufügen",
        "candidateBanner": "{count} kompatible Gefahrensensoren in Home Assistant gefunden:",
        "addCandidate": "Überwachen",
        "thSensor": "Sensor",
        "thZone": "Zone",
        "thType": "Gefahrentyp",
        "thPreAlarm": "Voralarm-Verzögerung",
        "thFeatures": "Eigenschaften",
        "thStatus": "Zustand",
        "thActions": "Aktionen",
        "typeSmoke": "Rauch",
        "typeMoisture": "Wasserleckage",
        "typeGas": "Gas",
        "typeCO": "Kohlenmonoxid (CO)",
        "typeHeat": "Hitze",
        "typeGeneric": "Sonstiges",
        "phaseCutoff": "Stufe 1: Notabschaltung (Cutoff)",
        "phaseCutoffDesc": "Sofortiges Schließen von Hauptventilen, Abschalten von Lüftungen oder Öffnen von Fluchtwegen.",
        "phaseNotification": "Stufe 2: Prioritäre Benachrichtigung",
        "phaseNotificationDesc": "Kritische Push-Nachrichten mit Sound-Bypass an Smartphones.",
        "phaseAcoustic": "Stufe 3: Akustisch & Optisch",
        "phaseAcousticDesc": "Auslösen lauter Sirenen, rotes Notfall-Licht und TTS-Sprachausgabe.",
        "phaseRestore": "Stufe 4: Entwarnung & Rücksetzen (Nach Alarm)",
        "phaseRestoreDesc": "Wird nach Alarm-Rücksetzen ausgeführt: Rücksetzen normaler Beleuchtung, Lüftung wieder aktivieren oder 'Alles Sicher'-Entwarnungs-Push senden.",
        "phaseSystem": "Stufe 5: Wartung & Systemwarnungen (Batterie, Offline & Selbsttest)",
        "phaseSystemDesc": "Wird bei schwachem Batteriestand (< 15%), nicht erreichbaren (offline) Meldern oder fehlgeschlagenen Selbsttests ausgeführt (z. B. Push-Meldung).",
        "presetSystem": "🛠️ Systemmeldung",
        "presetSelfTestFailed": "🧪 Selbsttest-Fehler",
        "eventBatteryLow": "Schwache Batterie",
        "eventSensorOffline": "Melder Offline",
        "eventSelfTestFailed": "Selbsttest fehlgeschlagen",
        "actionSystemEvents": "Auslösen bei folgenden System-Ereignissen:",
        "testAction": "Testen",
        "edit": "Bearbeiten",
        "delete": "Löschen",
        "save": "Speichern",
        "cancel": "Abbrechen",
        "settingsTitle": "Globale Systemeinstellungen",
        "lblTestDuration": "Test-Modus Dauer (Minuten):",
        "lblSilenceDuration": "Stummschaltung Dauer (Minuten):",
        "lblDoubleKnockTimeout": "Globaler Double-Knock Timeout (Sekunden):",
        "lblOfflineAlerts": "Warnung bei offline / nicht erreichbaren Sensoren",
        "lblBatteryAlerts": "Warnung bei schwachem Batteriestand (< 15%)",
        "zonesTitle": "Gefahrenzonen & Räume",
        "zoneName": "Zonen-Name",
        "doubleKnockEnabled": "Multi-Sensor-Verifikation (Double-Knock)",
        "doubleKnockHelp": "Löst erst bei Bestätigung durch einen 2. Sensor in der Zone den Hauptalarm aus.",
        "autoAckHelp": "Setzt Alarm automatisch zurück, sobald der Sensor wieder OFF meldet.",
        "linkedShutoffs": "Verknüpfte Notfall-Aktoren (z. B. valve.hauptwasser, fan.lueftung):",
        "preAlarmDelaySec": "Voralarm-Verzögerung (Sekunden, 0 = sofort):",
        "actionService": "Home Assistant Dienst:",
        "actionTarget": "Ziel-Entität:",
        "actionPayload": "Dienst-Daten (Service Payload):",
        "actionTriggerTypes": "Auslösen bei folgenden Gefahrentypen:",
        "toggleMenu": "Home Assistant Seitenmenü öffnen / schließen",
        "targetPlaceholder": "z. B. valve.hauptwasser, siren.alarm",
        "targetHelp": "Tippe, um Entitäten zu suchen (Ventile, Sirenen, Schalter, Lichter etc.). Hinweis: Bei notify.notify, Benachrichtigungen oder Skripten ist kein Ziel erforderlich (kann leer bleiben).",
        "targetPreviewTitle": "Vorschau der ausgewählten Ziel-Entität(en):",
        "serviceSelectLabel": "Mögliche Dienste für Ziel-Entität:",
        "serviceCustomOption": "✏️ Manuelle Eingabe / Anderer Dienst...",
        "serviceHelp": "Wähle oben einen Dienst passend zur Entität oder tippe manuell (z. B. valve.close_valve).",
        "payloadHelpTitle": "Format-Hinweis (Service Data)",
        "payloadHelpDesc": "Eingabe als JSON-Objekt { \"schlüssel\": \"wert\" }. Bei reinen Ein-/Ausschaltbefehlen (z. B. valve.close_valve, fan.turn_off) sind keine Daten nötig (einfach {} belassen).",
        "presetsTitle": "Schnell-Vorlagen:",
        "variablesTitle": "Dynamische Platzhalter (Klick zum Einfügen):",
        "presetEmpty": "🔘 Leer ({})",
        "presetNotify": "📱 Push-Meldung",
        "presetCritical": "🚨 Kritischer Notfall-Push",
        "presetRedLight": "💡 Rotes Notlicht",
        "presetSiren": "🔊 Sirene Lautstärke",
        "presetAllClear": "✅ Entwarnungs-Push",
        "presetScript": "📜 Skript-Variablen",
        "actionRepeat": "Wiederholung während Alarm (Wiederholungsschleife):",
        "actionRepeatHelp": "Wiederholt die Aktion während eines aktiven Alarms alle X Sekunden (z. B. für Sirenen oder Push-Updates). 0 = nur einmalig.",
        "validJson": "✅ Gültiges JSON",
        "invalidJson": "❌ Ungültiges JSON",
        "entityNotFoundInHA": "Nicht im HA-Zustandsregister gefunden",
        "silenceEntity": "Stummschalt-Entität (Button/Switch):",
        "silenceEntityHelp": "Optional: Button/Schalter am Rauchmelder zum Stummschalten der Sirene am Gerät.",
        "drillEntity": "Alarmübungs-Entität (Button):",
        "drillEntityHelp": "Optional: Löst Vernetzungstest / Alarmübung am Rauchmelder aus.",
        "testEntity": "Selbsttest-Entität (Button):",
        "testEntityHelp": "Optional: Führt einen internen Funktionstest des Melders aus.",
        "batteryEntity": "Batterie-Entität (Sensor):",
        "batteryEntityHelp": "Optional: Sensor für Batteriestand in % (wird automatisch ermittelt, wenn leer gelassen).",
        "btnSelfTest": "🧪 Selbsttest",
        "btnDrill": "🔔 Alarmübung",
        "btnMuteSensor": "🔕 Melder stummschalten",
        "btnIgnoreSensor": "🙈 Temporär ignorieren",
        "btnUnignoreSensor": "👁️ Reaktivieren",
        "badgeIgnored": "Ignoriert",
        "batteryWarning": "Schwache Batterie bei Gefahrensensoren",
        "batteryStatus": "Batterie",
        "mainsPowered": "⚡ Netzbetrieb",
        "testResultEntity": "Selbsttest-Ergebnis-Entität (Sensor):",
        "testResultEntityHelp": "Optional: Sensor für das Ergebnis des Selbsttests (z. B. sensor.rauchmelder_last_self_test mit Wert 'Erfolg' oder Zeitstempel).",
        "btnStartSequentialSelfTest": "Sequentiellen Selbsttest starten",
        "btnCancelSelfTest": "Selbsttest abbrechen",
        "selectDrillSensorPlaceholder": "-- Melder für Alarmübung auswählen --",
        "btnDrillSingle": "Alarmübung starten",
        "drillSensorHelp": "Wählen Sie einen bestimmten Melder aus, um gezielt an diesem die Alarmübung auszulösen.",
        "autoSelfTestTitle": "Automatischer periodischer Selbsttest",
        "autoSelfTestDesc": "Führt an einem gewählten Tag im Monat sequentiell im Testmodus einen Selbsttest aller Melder durch und prüft die Ergebnis-Sensoren. Bei Fehlern wird eine Benachrichtigung gesendet.",
        "lblAutoSelfTestEnabled": "Monatlichen Selbsttest aller Melder automatisch durchführen",
        "lblAutoSelfTestDay": "Tag des Monats (1-31):",
        "lblAutoSelfTestTime": "Uhrzeit (HH:MM):",
        "lblAutoSelfTestStep": "Wartezeit pro Melder (Sekunden):",
        "lblAutoSelfTestNotify": "Benachrichtigung bei fehlgeschlagenen Meldern absetzen (Stufe 5)",
        "selfTestStatusTitle": "Selbsttest-Status",
        "selfTestProgress": "Fortschritt: Melder {current} von {total}",
        "selfTestPassed": "Bestanden",
        "selfTestFailed": "Fehlgeschlagen",
        "selfTestPending": "Wartend",
        "selfTestTesting": "Wird getestet...",
        "lblLanguage": "Sprache / Language:",
        "langAuto": "Automatisch (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Alarm",
        "badgeSilenced": "Stumm",
        "badgeAllClear": "Entwarnung",
        "badgeFailed": "Fehlgeschlagen",
        "badgePassed": "Bestanden",
        "badgeDrill": "Alarmübung",
        "badgeSelfTest": "Selbsttest",
        "badgeTestMode": "Test-Modus",
        "badgeBattery": "Batterie",
        "badgeOffline": "Offline",
        "badgeOnline": "Online",
        "badgeReactivated": "Reaktiviert",
        "saving": "Speichern...",
        "saved": "Gespeichert",
        "yes": "Ja",
        "no": "Nein"
    },
    "en": {
        "appName": "Safety Monitor",
        "subtitle": "24/7 Life Safety & Hazard Monitoring (Smoke, Water, Gas, CO)",
        "tabOverview": "Overview & Status",
        "tabSensors": "Sensors",
        "tabActions": "Emergency Actions",
        "tabSettings": "Zones & Settings",
        "statusNormal": "All Clear & Safe",
        "statusNormalDesc": "All monitored sensors are normal. 24/7 hazard monitoring is fully active.",
        "statusPreAlarm": "Pre-Alarm / Verification",
        "statusPreAlarmDesc": "Potential hazard detected! Countdown active before main sirens trigger.",
        "statusTriggered": "ACUTE HAZARD - ALARM ACTIVE!",
        "statusTriggeredDesc": "Full emergency alarm! Sirens, cutoffs, and critical notifications are running.",
        "statusSilenced": "Alarms Silenced",
        "statusSilencedDesc": "Acoustic sirens temporarily silenced. 24/7 hazard monitoring remains active!",
        "statusTesting": "Test & Maintenance Mode",
        "statusTestingDesc": "Maintenance mode active: External sirens and emergency shutoffs are suppressed.",
        "testModeActiveTitle": "Test & Maintenance Mode is ACTIVE",
        "testModeActiveDesc": "Sirens and emergency shutoffs are suppressed. You can safely test devices now:",
        "btnDrillAll": "All Sensors: Alarm Drill",
        "btnSelfTestAll": "All Sensors: Self-Test",
        "btnSilence": "Silence Sirens",
        "btnSilenceAgain": "Silence Again",
        "btnReset": "Acknowledge / Reset",
        "btnTestMode": "Test Mode",
        "btnExitTestMode": "Exit Test Mode",
        "btnManualTrigger": "Trigger Emergency Alarm",
        "confirmManualTrigger": "Are you sure you want to manually trigger the full emergency alarm sequence?",
        "activeHazardsTitle": "Active Hazard Alerts",
        "noActiveHazards": "No active hazard alerts at this time.",
        "eventHistoryTitle": "Event Log",
        "noEvents": "No events recorded yet.",
        "historyFilterType": "Event Type:",
        "historyFilterTime": "Time Period:",
        "historyTime24h": "Max. 24 Hours",
        "historyTime1h": "Last 1 Hour",
        "historyTime6h": "Last 6 Hours",
        "historyTime12h": "Last 12 Hours",
        "historyTime3d": "Last 3 Days",
        "historyTimeAll": "All Recorded Events",
        "historyTypeAll": "All Event Types",
        "historyTypeAlarms": "🚨 Alarms & Hazards",
        "historyTypeSilenced": "🔕 Silenced",
        "historyTypeReset": "✅ Reset & All Clear",
        "historyTypeSelfTestAll": "🧪 Self-Tests (All)",
        "historyTypeSelfTestFailed": "❌ Self-Test Failed",
        "historyTypeSelfTestSuccess": "✅ Self-Test Passed",
        "historyTypeDrills": "🔔 Alarm Drills",
        "historyTypeTestMode": "🛡️ Test Mode",
        "historyTypeBattery": "🪫 Low Battery",
        "historyTypeOffline": "📡 Sensor Offline / Online",
        "historyTypeIgnored": "🙈 Ignored / Unignored",
        "historyNoMatchingEvents": "No events match the current filter criteria.",
        "historyShowAllEvents": "Show all events",
        "historyCountBadge": "{filtered} of {total} events",
        "lblHistoryDefaultTime": "Default Period in Event Log:",
        "searchSensorsPlaceholder": "Search sensors...",
        "searchCandidatesPlaceholder": "Filter hazard sensors...",
        "filterAll": "All",
        "filterAllTypes": "All types",
        "noMatchingCandidates": "No hazard sensors match the filter.",
        "btnAddSensor": "Add Sensor",
        "btnAddZone": "Add Zone",
        "btnAddAction": "Add Action",
        "candidateBanner": "{count} hazard-capable sensor(s) discovered in Home Assistant:",
        "addCandidate": "Monitor",
        "thSensor": "Sensor",
        "thZone": "Zone",
        "thType": "Hazard Type",
        "thPreAlarm": "Pre-Alarm Delay",
        "thFeatures": "Features",
        "thStatus": "Status",
        "thActions": "Actions",
        "typeSmoke": "Smoke",
        "typeMoisture": "Water Leak",
        "typeGas": "Gas",
        "typeCO": "Carbon Monoxide (CO)",
        "typeHeat": "Heat",
        "typeGeneric": "Generic",
        "phaseCutoff": "Phase 1: Emergency Cutoff",
        "phaseCutoffDesc": "Immediate closing of main shutoff valves, HVAC shutdown, or opening escape routes.",
        "phaseNotification": "Phase 2: Critical Notifications",
        "phaseNotificationDesc": "High-priority push notifications with alarm stream bypass to mobile apps.",
        "phaseAcoustic": "Phase 3: Acoustic & Optical",
        "phaseAcousticDesc": "Trigger loud sirens, flashing emergency red lighting, and TTS announcements.",
        "phaseRestore": "Phase 4: All-Clear & Restore (Post-Alarm)",
        "phaseRestoreDesc": "Executed upon alarm reset: Restoring normal lighting, restarting ventilation, or sending an all-clear notification.",
        "phaseSystem": "Phase 5: Maintenance & System Alerts (Battery, Offline & Self-Test)",
        "phaseSystemDesc": "Triggered on low battery (< 15%), detector offline, or failed detector self-tests (e.g. maintenance push notification).",
        "presetSystem": "🛠️ System Alert",
        "presetSelfTestFailed": "🧪 Self-Test Failure",
        "eventBatteryLow": "Low Battery",
        "eventSensorOffline": "Sensor Offline",
        "eventSelfTestFailed": "Self-Test Failed",
        "actionSystemEvents": "Trigger for following system events:",
        "testAction": "Test",
        "edit": "Edit",
        "delete": "Delete",
        "save": "Save",
        "cancel": "Cancel",
        "settingsTitle": "Global System Settings",
        "lblTestDuration": "Test Mode Duration (Minutes):",
        "lblSilenceDuration": "Silence Duration (Minutes):",
        "lblDoubleKnockTimeout": "Global Double-Knock Timeout (Seconds):",
        "lblOfflineAlerts": "Alert on offline / unavailable sensors",
        "lblBatteryAlerts": "Alert on low sensor battery (< 15%)",
        "zonesTitle": "Hazard Zones & Areas",
        "zoneName": "Zone Name",
        "doubleKnockEnabled": "Multi-Sensor Verification (Double-Knock)",
        "doubleKnockHelp": "Requires confirmation from a 2nd sensor in the zone before full alarm triggers.",
        "autoAckHelp": "Automatically reset alarm once the sensor returns to OFF state.",
        "linkedShutoffs": "Linked Shutoff Entities (e.g. valve.main_water, fan.ventilation):",
        "preAlarmDelaySec": "Pre-alarm delay (seconds, 0 = instant):",
        "actionService": "Home Assistant Service:",
        "actionTarget": "Target Entity:",
        "actionPayload": "Service Data (Payload):",
        "actionTriggerTypes": "Trigger for following hazard types:",
        "toggleMenu": "Toggle Home Assistant sidebar menu",
        "targetPlaceholder": "e.g. valve.main_water, siren.alarm",
        "targetHelp": "Type to search entities (valves, sirens, switches, lights, etc.). Note: For notify.notify, notifications or scripts, target is optional (can be left blank).",
        "targetPreviewTitle": "Preview of target entity/entities:",
        "serviceSelectLabel": "Available services for target entity:",
        "serviceCustomOption": "✏️ Custom / Manual Service...",
        "serviceHelp": "Select a service matching the entity above or enter manually (e.g. valve.close_valve).",
        "payloadHelpTitle": "Format guide (Service Data)",
        "payloadHelpDesc": "Enter as JSON object { \"key\": \"value\" }. For standard valves and switches (e.g. valve.close_valve, fan.turn_off), no data is needed (leave as {}).",
        "presetsTitle": "Quick presets:",
        "variablesTitle": "Dynamic placeholders (click to insert):",
        "presetEmpty": "🔘 Empty ({})",
        "presetNotify": "📱 Push Notification",
        "presetCritical": "🚨 Critical Push Alarm",
        "presetRedLight": "💡 Red Warning Light",
        "presetSiren": "🔊 Siren Volume",
        "presetAllClear": "✅ All-Clear Push",
        "presetScript": "📜 Script Variables",
        "actionRepeat": "Repetition Loop during Alarm (seconds, 0 = once):",
        "actionRepeatHelp": "Repeats this action every X seconds while alarm is triggered (e.g. for sirens or push updates). 0 = execute once only.",
        "validJson": "✅ Valid JSON",
        "invalidJson": "❌ Invalid JSON",
        "entityNotFoundInHA": "Not found in HA states registry",
        "silenceEntity": "Silence Entity (Button/Switch):",
        "silenceEntityHelp": "Optional: Button/switch on detector to hush/silence physical device alarm.",
        "drillEntity": "Alarm Drill Entity (Button):",
        "drillEntityHelp": "Optional: Triggers mesh evacuation drill or alarm test on detector.",
        "testEntity": "Self-Test Entity (Button):",
        "testEntityHelp": "Optional: Runs internal self-test on the detector.",
        "batteryEntity": "Battery Entity (Sensor):",
        "batteryEntityHelp": "Optional: Sensor for battery percentage (auto-detected if left blank).",
        "btnSelfTest": "🧪 Self-Test",
        "btnDrill": "🔔 Drill",
        "btnMuteSensor": "🔕 Silence Detector",
        "btnIgnoreSensor": "🙈 Ignore Alert",
        "btnUnignoreSensor": "👁️ Unignore",
        "badgeIgnored": "🙈 Ignored (until sensor clear)",
        "batteryWarning": "Low Battery Warning on Hazard Sensors",
        "batteryStatus": "Battery",
        "mainsPowered": "⚡ Mains / n/a",
        "testResultEntity": "Self-Test Result Entity (Sensor):",
        "testResultEntityHelp": "Optional: Sensor reporting self-test outcome (e.g. sensor.smoke_last_self_test with state 'Erfolg'/'success' or timestamp).",
        "btnStartSequentialSelfTest": "Start Sequential Self-Test",
        "btnCancelSelfTest": "Cancel Self-Test",
        "selectDrillSensorPlaceholder": "-- Select detector for alarm drill --",
        "btnDrillSingle": "Start Alarm Drill",
        "drillSensorHelp": "Select a specific detector to trigger the drill on that device.",
        "autoSelfTestTitle": "Automated Periodic Self-Test",
        "autoSelfTestDesc": "Runs a sequential self-test in test mode on a chosen day each month and verifies result sensors. If any detector fails, a notification is sent.",
        "lblAutoSelfTestEnabled": "Automatically run monthly self-test of all detectors",
        "lblAutoSelfTestDay": "Day of month (1-31):",
        "lblAutoSelfTestTime": "Time (HH:MM):",
        "lblAutoSelfTestStep": "Step delay per detector (seconds):",
        "lblAutoSelfTestNotify": "Send notification if detectors fail self-test (Phase 5)",
        "selfTestStatusTitle": "Self-Test Status",
        "selfTestProgress": "Progress: Detector {current} of {total}",
        "selfTestPassed": "Passed",
        "selfTestFailed": "Failed",
        "selfTestPending": "Pending",
        "selfTestTesting": "Testing...",
        "lblLanguage": "Language:",
        "langAuto": "Automatic (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Alarm",
        "badgeSilenced": "Silenced",
        "badgeAllClear": "All Clear",
        "badgeFailed": "Failed",
        "badgePassed": "Passed",
        "badgeDrill": "Drill",
        "badgeSelfTest": "Self-Test",
        "badgeTestMode": "Test Mode",
        "badgeBattery": "Battery",
        "badgeOffline": "Offline",
        "badgeOnline": "Online",
        "badgeReactivated": "Reactivated",
        "saving": "Saving...",
        "saved": "Saved",
        "yes": "Yes",
        "no": "No"
    },
    "fr": {
        "appName": "Safety Monitor",
        "subtitle": "Surveillance des risques et sécurité 24/7 (Fumée, Eau, Gaz, CO)",
        "tabOverview": "Aperçu & État",
        "tabSensors": "Capteurs",
        "tabActions": "Actions d'urgence",
        "tabSettings": "Zones & Paramètres",
        "statusNormal": "Tout est sécurisé",
        "statusNormalDesc": "Tous les capteurs surveillés sont normaux. La surveillance des risques 24/7 est active.",
        "statusPreAlarm": "Pré-alarme / Vérification",
        "statusPreAlarmDesc": "Risque potentiel détecté ! Compte à rebours avant le déclenchement des sirènes.",
        "statusTriggered": "DANGER IMMÉDIAT - ALARME ACTIVE !",
        "statusTriggeredDesc": "Alarme d'urgence déclenchée ! Sirènes, coupures et notifications en cours.",
        "statusSilenced": "Alarmes coupées",
        "statusSilencedDesc": "Sirènes temporairement coupées. La surveillance des risques 24/7 reste active !",
        "statusTesting": "Mode Test & Maintenance",
        "statusTestingDesc": "Mode maintenance actif : les sirènes et coupures d'urgence sont temporairement désactivées.",
        "testModeActiveTitle": "Le mode Test & Maintenance est ACTIF",
        "testModeActiveDesc": "Les sirènes et coupures d'urgence sont désactivées. Vous pouvez tester vos détecteurs en toute sécurité :",
        "btnDrillAll": "Tous les détecteurs : Exercice d'alarme",
        "btnSelfTestAll": "Tous les détecteurs : Auto-test",
        "btnSilence": "Couper les sirènes",
        "btnSilenceAgain": "Couper à nouveau",
        "btnReset": "Acquitter / Réinitialiser",
        "btnTestMode": "Mode Test",
        "btnExitTestMode": "Quitter le mode Test",
        "btnManualTrigger": "Déclencher l'alarme d'urgence",
        "confirmManualTrigger": "Voulez-vous vraiment déclencher manuellement la séquence complète d'alarme d'urgence ?",
        "activeHazardsTitle": "Alertes de risque actives",
        "noActiveHazards": "Aucune alerte de risque active pour le moment.",
        "eventHistoryTitle": "Journal des événements",
        "noEvents": "Aucun événement enregistré pour le moment.",
        "historyFilterType": "Type d'événement :",
        "historyFilterTime": "Période :",
        "historyTime24h": "Max. 24 heures",
        "historyTime1h": "Dernière 1 heure",
        "historyTime6h": "Dernières 6 heures",
        "historyTime12h": "Dernières 12 heures",
        "historyTime3d": "Derniers 3 jours",
        "historyTimeAll": "Tout l'historique enregistré",
        "historyTypeAll": "Tous les types d'événements",
        "historyTypeAlarms": "🚨 Alarmes & Risques",
        "historyTypeSilenced": "🔕 Coupées",
        "historyTypeReset": "✅ Réinitialisation & Fin d'alerte",
        "historyTypeSelfTestAll": "🧪 Auto-tests (Tous)",
        "historyTypeSelfTestFailed": "❌ Échec de l'auto-test",
        "historyTypeSelfTestSuccess": "✅ Auto-test réussi",
        "historyTypeDrills": "🔔 Exercices d'alarme",
        "historyTypeTestMode": "🛡️ Mode Test",
        "historyTypeBattery": "🪫 Batterie faible",
        "historyTypeOffline": "📡 Détecteur hors-ligne / en ligne",
        "historyTypeIgnored": "🙈 Ignoré / Réactivé",
        "historyNoMatchingEvents": "Aucun événement ne correspond aux critères de filtre actuels.",
        "historyShowAllEvents": "Afficher tous les événements",
        "historyCountBadge": "{filtered} sur {total} événements",
        "lblHistoryDefaultTime": "Période par défaut du journal :",
        "searchSensorsPlaceholder": "Rechercher des capteurs...",
        "searchCandidatesPlaceholder": "Filtrer les capteurs de risque...",
        "filterAll": "Tous",
        "filterAllTypes": "Tous les types",
        "noMatchingCandidates": "Aucun capteur de risque ne correspond au filtre.",
        "btnAddSensor": "Ajouter un capteur",
        "btnAddZone": "Ajouter une zone",
        "btnAddAction": "Ajouter une action",
        "candidateBanner": "{count} capteur(s) compatible(s) découvert(s) dans Home Assistant :",
        "addCandidate": "Surveiller",
        "thSensor": "Capteur",
        "thZone": "Zone",
        "thType": "Type de risque",
        "thPreAlarm": "Délai de pré-alarme",
        "thFeatures": "Fonctionnalités",
        "thStatus": "État",
        "thActions": "Actions",
        "typeSmoke": "Fumée",
        "typeMoisture": "Fuite d'eau",
        "typeGas": "Gaz",
        "typeCO": "Monoxyde de carbone (CO)",
        "typeHeat": "Chaleur",
        "typeGeneric": "Générique",
        "phaseCutoff": "Phase 1 : Coupure d'urgence",
        "phaseCutoffDesc": "Fermeture immédiate des vannes principales, arrêt de la ventilation ou ouverture des issues de secours.",
        "phaseNotification": "Phase 2 : Notifications prioritaires",
        "phaseNotificationDesc": "Notifications push critiques avec contournement du mode silencieux vers les smartphones.",
        "phaseAcoustic": "Phase 3 : Avertisseurs sonores & visuels",
        "phaseAcousticDesc": "Déclenchement des sirènes puissantes, éclairage d'urgence rouge et annonces vocales TTS.",
        "phaseRestore": "Phase 4 : Fin d'alerte & Restauration (Après alarme)",
        "phaseRestoreDesc": "Exécuté après réinitialisation de l'alarme : rétablissement de l'éclairage, redémarrage de la ventilation ou notification de fin d'alerte.",
        "phaseSystem": "Phase 5 : Maintenance & Alertes système (Batterie, Hors-ligne & Auto-test)",
        "phaseSystemDesc": "Déclenché en cas de batterie faible (< 15%), détecteur hors-ligne ou échec d'auto-test.",
        "presetSystem": "🛠️ Alerte système",
        "presetSelfTestFailed": "🧪 Échec de l'auto-test",
        "eventBatteryLow": "Batterie faible",
        "eventSensorOffline": "Détecteur hors-ligne",
        "eventSelfTestFailed": "Échec de l'auto-test",
        "actionSystemEvents": "Déclencher pour les événements système suivants :",
        "testAction": "Tester",
        "edit": "Modifier",
        "delete": "Supprimer",
        "save": "Enregistrer",
        "cancel": "Annuler",
        "settingsTitle": "Paramètres généraux du système",
        "lblTestDuration": "Durée du mode test (minutes) :",
        "lblSilenceDuration": "Durée de mise sous silence (minutes) :",
        "lblDoubleKnockTimeout": "Délai global de double confirmation (secondes) :",
        "lblOfflineAlerts": "Alerter si des capteurs sont hors-ligne / indisponibles",
        "lblBatteryAlerts": "Alerter en cas de batterie faible (< 15%)",
        "zonesTitle": "Zones de risque & Pièces",
        "zoneName": "Nom de la zone",
        "doubleKnockEnabled": "Vérification multi-capteurs (Double-Knock)",
        "doubleKnockHelp": "Nécessite la confirmation d'un 2ème capteur dans la zone avant de déclencher l'alarme principale.",
        "autoAckHelp": "Réinitialise automatiquement l'alarme dès que le capteur repasse à l'état OFF.",
        "linkedShutoffs": "Actionneurs d'urgence liés (ex. valve.eau_principale, fan.ventilation) :",
        "preAlarmDelaySec": "Délai de pré-alarme (secondes, 0 = immédiat) :",
        "actionService": "Service Home Assistant :",
        "actionTarget": "Entité cible :",
        "actionPayload": "Données du service (Payload) :",
        "actionTriggerTypes": "Déclencher pour les types de risque suivants :",
        "toggleMenu": "Basculer la barre latérale Home Assistant",
        "targetPlaceholder": "ex. valve.eau_principale, siren.alarme",
        "targetHelp": "Tapez pour rechercher des entités (vannes, sirènes, commutateurs, éclairages, etc.). Remarque : Pour notify.notify, la cible est facultative.",
        "targetPreviewTitle": "Aperçu de l'entité/des entités cible(s) :",
        "serviceSelectLabel": "Services disponibles pour l'entité cible :",
        "serviceCustomOption": "✏️ Service personnalisé / manuel...",
        "serviceHelp": "Sélectionnez un service correspondant à l'entité ci-dessus ou saisissez-le manuellement.",
        "payloadHelpTitle": "Guide de format (Données du service)",
        "payloadHelpDesc": "Saisir sous forme d'objet JSON { \"clé\": \"valeur\" }. Pour les vannes et commutateurs (ex. valve.close_valve), laisser {}.",
        "presetsTitle": "Modèles rapides :",
        "variablesTitle": "Variables dynamiques (cliquer pour insérer) :",
        "presetEmpty": "🔘 Vide ({})",
        "presetNotify": "📱 Notification push",
        "presetCritical": "🚨 Alerte critique prioritaire",
        "presetRedLight": "💡 Éclairage d'urgence rouge",
        "presetSiren": "🔊 Volume de la sirène",
        "presetAllClear": "✅ Notification de fin d'alerte",
        "presetScript": "📜 Variables de script",
        "actionRepeat": "Boucle de répétition pendant l'alarme (secondes, 0 = une fois) :",
        "actionRepeatHelp": "Répète cette action toutes les X secondes tant que l'alarme est active. 0 = exécution unique.",
        "validJson": "✅ JSON valide",
        "invalidJson": "❌ JSON non valide",
        "entityNotFoundInHA": "Non trouvé dans le registre d'état HA",
        "silenceEntity": "Entité de mise sous silence (Bouton/Interrupteur) :",
        "silenceEntityHelp": "Facultatif : Bouton/interrupteur physique pour couper la sirène de l'appareil.",
        "drillEntity": "Entité d'exercice d'alarme (Bouton) :",
        "drillEntityHelp": "Facultatif : Déclenche un test d'interconnexion ou un exercice d'alarme.",
        "testEntity": "Entité d'auto-test (Bouton) :",
        "testEntityHelp": "Facultatif : Lance un auto-test interne sur l'appareil.",
        "batteryEntity": "Entité de batterie (Capteur) :",
        "batteryEntityHelp": "Facultatif : Capteur de pourcentage de batterie (détecté automatiquement si vide).",
        "btnSelfTest": "🧪 Auto-test",
        "btnDrill": "🔔 Exercice",
        "btnMuteSensor": "🔕 Couper le détecteur",
        "btnIgnoreSensor": "🙈 Ignorer l'alerte",
        "btnUnignoreSensor": "👁️ Réactiver",
        "badgeIgnored": "🙈 Ignoré (jusqu'au retour à la normale)",
        "batteryWarning": "Batterie faible sur les capteurs de risque",
        "batteryStatus": "Batterie",
        "mainsPowered": "⚡ Secteur",
        "testResultEntity": "Entité de résultat d'auto-test (Capteur) :",
        "testResultEntityHelp": "Facultatif : Capteur indiquant le résultat de l'auto-test (ex. valeur 'succès' ou horodatage).",
        "btnStartSequentialSelfTest": "Démarrer l'auto-test séquentiel",
        "btnCancelSelfTest": "Annuler l'auto-test",
        "selectDrillSensorPlaceholder": "-- Sélectionner un détecteur pour l'exercice --",
        "btnDrillSingle": "Démarrer l'exercice",
        "drillSensorHelp": "Sélectionnez un détecteur spécifique pour déclencher l'exercice sur cet appareil.",
        "autoSelfTestTitle": "Auto-test périodique automatique",
        "autoSelfTestDesc": "Exécute un auto-test séquentiel en mode test à une date mensuelle choisie et vérifie les capteurs de résultat. En cas d'anomalie, une notification est envoyée.",
        "lblAutoSelfTestEnabled": "Effectuer automatiquement un auto-test mensuel de tous les détecteurs",
        "lblAutoSelfTestDay": "Jour du mois (1-31) :",
        "lblAutoSelfTestTime": "Heure (HH:MM) :",
        "lblAutoSelfTestStep": "Délai entre chaque détecteur (secondes) :",
        "lblAutoSelfTestNotify": "Envoyer une notification si des détecteurs échouent (Phase 5)",
        "selfTestStatusTitle": "État de l'auto-test",
        "selfTestProgress": "Progression : Détecteur {current} sur {total}",
        "selfTestPassed": "Réussi",
        "selfTestFailed": "Échoué",
        "selfTestPending": "En attente",
        "selfTestTesting": "En cours de test...",
        "lblLanguage": "Langue :",
        "langAuto": "Automatique (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Alarme",
        "badgeSilenced": "Silencieux",
        "badgeAllClear": "Fin d'alerte",
        "badgeFailed": "Échoué",
        "badgePassed": "Réussi",
        "badgeDrill": "Exercice",
        "badgeSelfTest": "Auto-test",
        "badgeTestMode": "Mode Test",
        "badgeBattery": "Batterie",
        "badgeOffline": "Hors-ligne",
        "badgeOnline": "En ligne",
        "badgeReactivated": "Réactivé",
        "saving": "Enregistrement...",
        "saved": "Enregistré",
        "yes": "Oui",
        "no": "Non"
    },
    "es": {
        "appName": "Safety Monitor",
        "subtitle": "Monitorización de seguridad y riesgos 24/7 (Humo, Agua, Gas, CO)",
        "tabOverview": "Resumen & Estado",
        "tabSensors": "Sensores",
        "tabActions": "Acciones de emergencia",
        "tabSettings": "Zonas & Ajustes",
        "statusNormal": "Todo seguro y normal",
        "statusNormalDesc": "Todos los sensores monitorizados están en orden. La protección 24/7 está activa.",
        "statusPreAlarm": "Pre-alarma / Verificación",
        "statusPreAlarmDesc": "¡Posible peligro detectado! Cuenta atrás antes de activar las sirenas principales.",
        "statusTriggered": "¡PELIGRO GRAVE - ALARMA ACTIVA!",
        "statusTriggeredDesc": "¡Alarma de emergencia activada! Sirenas, cortes automáticos y notificaciones en marcha.",
        "statusSilenced": "Alarmas silenciadas",
        "statusSilencedDesc": "Sirenas acústicas temporalmente en silencio. ¡La monitorización 24/7 continúa activa!",
        "statusTesting": "Modo Prueba & Mantenimiento",
        "statusTestingDesc": "Modo mantenimiento activo: las sirenas y cortes automáticos están temporalmente anulados.",
        "testModeActiveTitle": "El modo Prueba & Mantenimiento está ACTIVO",
        "testModeActiveDesc": "Sirenas y cortes anulados. Ahora puede probar sus detectores con total seguridad:",
        "btnDrillAll": "Todos los detectores: Simulacro",
        "btnSelfTestAll": "Todos los detectores: Autotest",
        "btnSilence": "Silenciar sirenas",
        "btnSilenceAgain": "Silenciar de nuevo",
        "btnReset": "Confirmar / Restablecer",
        "btnTestMode": "Modo Prueba",
        "btnExitTestMode": "Salir del modo prueba",
        "btnManualTrigger": "Disparar alarma de emergencia",
        "confirmManualTrigger": "¿Seguro que desea activar manualmente la secuencia completa de alarma de emergencia?",
        "activeHazardsTitle": "Alertas de peligro activas",
        "noActiveHazards": "No hay alertas de peligro activas actualmente.",
        "eventHistoryTitle": "Registro de eventos",
        "noEvents": "No hay eventos registrados aún.",
        "historyFilterType": "Tipo de evento:",
        "historyFilterTime": "Periodo:",
        "historyTime24h": "Máx. 24 horas",
        "historyTime1h": "Última 1 hora",
        "historyTime6h": "Últimas 6 horas",
        "historyTime12h": "Últimas 12 horas",
        "historyTime3d": "Últimos 3 días",
        "historyTimeAll": "Todo el historial registrado",
        "historyTypeAll": "Todos los tipos de eventos",
        "historyTypeAlarms": "🚨 Alarmas & Peligros",
        "historyTypeSilenced": "🔕 Silenciados",
        "historyTypeReset": "✅ Restablecimiento & Normalidad",
        "historyTypeSelfTestAll": "🧪 Autotests (Todos)",
        "historyTypeSelfTestFailed": "❌ Autotest fallido",
        "historyTypeSelfTestSuccess": "✅ Autotest superado",
        "historyTypeDrills": "🔔 Simulacros de alarma",
        "historyTypeTestMode": "🛡️ Modo Prueba",
        "historyTypeBattery": "🪫 Batería baja",
        "historyTypeOffline": "📡 Detector Desconectado / Conectado",
        "historyTypeIgnored": "🙈 Ignorado / Reactivado",
        "historyNoMatchingEvents": "Ningún evento coincide con los criterios de filtro actuales.",
        "historyShowAllEvents": "Mostrar todos los eventos",
        "historyCountBadge": "{filtered} de {total} eventos",
        "lblHistoryDefaultTime": "Periodo predeterminado en el registro:",
        "searchSensorsPlaceholder": "Buscar sensores...",
        "searchCandidatesPlaceholder": "Filtrar sensores de peligro...",
        "filterAll": "Todos",
        "filterAllTypes": "Todos los tipos",
        "noMatchingCandidates": "Ningún sensor de peligro coincide con el filtro.",
        "btnAddSensor": "Añadir sensor",
        "btnAddZone": "Añadir zona",
        "btnAddAction": "Añadir acción",
        "candidateBanner": "{count} sensor(es) compatible(s) descubierto(s) en Home Assistant:",
        "addCandidate": "Monitorizar",
        "thSensor": "Sensor",
        "thZone": "Zona",
        "thType": "Tipo de peligro",
        "thPreAlarm": "Retardo pre-alarma",
        "thFeatures": "Características",
        "thStatus": "Estado",
        "thActions": "Acciones",
        "typeSmoke": "Humo",
        "typeMoisture": "Fuga de agua",
        "typeGas": "Gas",
        "typeCO": "Monóxido de carbono (CO)",
        "typeHeat": "Calor",
        "typeGeneric": "Genérico",
        "phaseCutoff": "Fase 1: Corte de emergencia",
        "phaseCutoffDesc": "Cierre inmediato de válvulas principales, corte de ventilación o apertura de vías de escape.",
        "phaseNotification": "Fase 2: Notificaciones prioritarias",
        "phaseNotificationDesc": "Notificaciones push críticas para móviles con sonido de alarma prioritario.",
        "phaseAcoustic": "Fase 3: Acústica & Óptica",
        "phaseAcousticDesc": "Activación de sirenas potentes, luz de emergencia roja y avisos de voz TTS.",
        "phaseRestore": "Fase 4: Restablecimiento & Normalidad (Tras alarma)",
        "phaseRestoreDesc": "Ejecutado al restablecer la alarma: restablecer luces, reiniciar ventilación o enviar push de fin de peligro.",
        "phaseSystem": "Fase 5: Mantenimiento & Avisos del sistema (Batería, Desconexión & Autotest)",
        "phaseSystemDesc": "Activado con batería baja (< 15%), detector desconectado o fallo en autotest.",
        "presetSystem": "🛠️ Aviso del sistema",
        "presetSelfTestFailed": "🧪 Fallo en autotest",
        "eventBatteryLow": "Batería baja",
        "eventSensorOffline": "Detector desconectado",
        "eventSelfTestFailed": "Fallo en autotest",
        "actionSystemEvents": "Activar con los siguientes eventos del sistema:",
        "testAction": "Probar",
        "edit": "Editar",
        "delete": "Eliminar",
        "save": "Guardar",
        "cancel": "Cancelar",
        "settingsTitle": "Ajustes globales del sistema",
        "lblTestDuration": "Duración modo prueba (minutos):",
        "lblSilenceDuration": "Duración del silencio (minutos):",
        "lblDoubleKnockTimeout": "Tiempo de doble verificación global (segundos):",
        "lblOfflineAlerts": "Avisar ante sensores desconectados / no disponibles",
        "lblBatteryAlerts": "Avisar si la batería del sensor está baja (< 15%)",
        "zonesTitle": "Zonas de peligro & Estancias",
        "zoneName": "Nombre de la zona",
        "doubleKnockEnabled": "Verificación multisensores (Double-Knock)",
        "doubleKnockHelp": "Requiere la confirmación de un segundo sensor en la zona antes de activar la alarma completa.",
        "autoAckHelp": "Restablece automáticamente la alarma en cuanto el sensor vuelve a estado OFF.",
        "linkedShutoffs": "Actuadores de corte vinculados (ej. valve.agua_principal, fan.ventilacion):",
        "preAlarmDelaySec": "Retardo de pre-alarma (segundos, 0 = instantáneo):",
        "actionService": "Servicio de Home Assistant:",
        "actionTarget": "Entidad objetivo:",
        "actionPayload": "Datos del servicio (Payload):",
        "actionTriggerTypes": "Activar ante los siguientes peligros:",
        "toggleMenu": "Alternar menú lateral de Home Assistant",
        "targetPlaceholder": "ej. valve.agua_principal, siren.alarma",
        "targetHelp": "Escriba para buscar entidades (válvulas, sirenas, interruptores, luces, etc.). Nota: En notify.notify o scripts, el objetivo es opcional.",
        "targetPreviewTitle": "Vista previa de la(s) entidad(es) objetivo:",
        "serviceSelectLabel": "Servicios disponibles para la entidad objetivo:",
        "serviceCustomOption": "✏️ Servicio manual / personalizado...",
        "serviceHelp": "Seleccione un servicio para la entidad o introdúzcalo manualmente.",
        "payloadHelpTitle": "Guía de formato (Datos del servicio)",
        "payloadHelpDesc": "Introducir como objeto JSON { \"clave\": \"valor\" }. Para válvulas y relés estándar (ej. valve.close_valve), dejar como {}.",
        "presetsTitle": "Plantillas rápidas:",
        "variablesTitle": "Variables dinámicas (clic para insertar):",
        "presetEmpty": "🔘 Vacío ({})",
        "presetNotify": "📱 Notificación push",
        "presetCritical": "🚨 Alarma push crítica",
        "presetRedLight": "💡 Luz de emergencia roja",
        "presetSiren": "🔊 Volumen de sirena",
        "presetAllClear": "✅ Push de fin de alarma",
        "presetScript": "📜 Variables de script",
        "actionRepeat": "Bucle de repetición durante la alarma (segundos, 0 = una vez):",
        "actionRepeatHelp": "Repite esta acción cada X segundos mientras la alarma está activa. 0 = ejecutar una sola vez.",
        "validJson": "✅ JSON válido",
        "invalidJson": "❌ JSON no válido",
        "entityNotFoundInHA": "No encontrada en el registro de estados de HA",
        "silenceEntity": "Entidad de silenciamiento (Botón/Interruptor):",
        "silenceEntityHelp": "Opcional: Botón/interruptor físico para silenciar la sirena del dispositivo.",
        "drillEntity": "Entidad de simulacro de alarma (Botón):",
        "drillEntityHelp": "Opcional: Activa simulacro de evacuación o prueba acústica.",
        "testEntity": "Entidad de autotest (Botón):",
        "testEntityHelp": "Opcional: Inicia autotest interno en el detector.",
        "batteryEntity": "Entidad de batería (Sensor):",
        "batteryEntityHelp": "Opcional: Sensor de porcentaje de batería (detectado automáticamente si se deja vacío).",
        "btnSelfTest": "🧪 Autotest",
        "btnDrill": "🔔 Simulacro",
        "btnMuteSensor": "🔕 Silenciar detector",
        "btnIgnoreSensor": "🙈 Ignorar alerta",
        "btnUnignoreSensor": "👁️ Reactivar",
        "badgeIgnored": "🙈 Ignorado (hasta que vuelva a OFF)",
        "batteryWarning": "Aviso de batería baja en sensores de riesgo",
        "batteryStatus": "Batería",
        "mainsPowered": "⚡ Red eléctrica",
        "testResultEntity": "Entidad de resultado de autotest (Sensor):",
        "testResultEntityHelp": "Opcional: Sensor que informa del resultado del autotest (ej. valor 'éxito' o fecha/hora).",
        "btnStartSequentialSelfTest": "Iniciar autotest secuencial",
        "btnCancelSelfTest": "Cancelar autotest",
        "selectDrillSensorPlaceholder": "-- Seleccionar detector para simulacro --",
        "btnDrillSingle": "Iniciar simulacro",
        "drillSensorHelp": "Seleccione un detector específico para iniciar el simulacro en dicho dispositivo.",
        "autoSelfTestTitle": "Autotest periódico automático",
        "autoSelfTestDesc": "Ejecuta un autotest secuencial en modo prueba en un día mensual programado y comprueba los resultados. Si alguno falla, envía una notificación.",
        "lblAutoSelfTestEnabled": "Realizar automáticamente autotest mensual de todos los detectores",
        "lblAutoSelfTestDay": "Día del mes (1-31):",
        "lblAutoSelfTestTime": "Hora (HH:MM):",
        "lblAutoSelfTestStep": "Espera por detector (segundos):",
        "lblAutoSelfTestNotify": "Enviar notificación si algún detector falla (Fase 5)",
        "selfTestStatusTitle": "Estado del autotest",
        "selfTestProgress": "Progreso: Detector {current} de {total}",
        "selfTestPassed": "Aprobado",
        "selfTestFailed": "Fallido",
        "selfTestPending": "En espera",
        "selfTestTesting": "Probando...",
        "lblLanguage": "Idioma:",
        "langAuto": "Automático (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Alarma",
        "badgeSilenced": "Silenciado",
        "badgeAllClear": "Fin de alerta",
        "badgeFailed": "Fallido",
        "badgePassed": "Aprobado",
        "badgeDrill": "Simulacro",
        "badgeSelfTest": "Autotest",
        "badgeTestMode": "Modo prueba",
        "badgeBattery": "Batería",
        "badgeOffline": "Desconectado",
        "badgeOnline": "Conectado",
        "badgeReactivated": "Reactivado",
        "saving": "Guardando...",
        "saved": "Guardado",
        "yes": "Sí",
        "no": "No"
    },
    "it": {
        "appName": "Safety Monitor",
        "subtitle": "Monitoraggio sicurezza e pericoli 24/7 (Fumo, Acqua, Gas, CO)",
        "tabOverview": "Panoramica & Stato",
        "tabSensors": "Sensori",
        "tabActions": "Azioni di emergenza",
        "tabSettings": "Zone & Impostazioni",
        "statusNormal": "Tutto sicuro e regolare",
        "statusNormalDesc": "Tutti i sensori monitorati sono normali. Il monitoraggio continuo 24/7 è attivo.",
        "statusPreAlarm": "Pre-allarme / Verifica",
        "statusPreAlarmDesc": "Potenziale pericolo rilevato! Conto alla rovescia attivo prima dell'attivazione delle sirene.",
        "statusTriggered": "PERICOLO CRITICO - ALLARME ATTIVO!",
        "statusTriggeredDesc": "Allarme di emergenza attivo! Sirene, interruzioni e notifiche in corso.",
        "statusSilenced": "Allarmi silenziati",
        "statusSilencedDesc": "Sirene acustiche temporaneamente silenziate. Il monitoraggio 24/7 resta attivo!",
        "statusTesting": "Modalità Test & Manutenzione",
        "statusTestingDesc": "Modalità manutenzione attiva: sirene ed interruzioni di emergenza sono disattivate.",
        "testModeActiveTitle": "La modalità Test & Manutenzione è ATTIVA",
        "testModeActiveDesc": "Sirene ed interruzioni sono disattivate. Ora puoi testare i rilevatori in sicurezza:",
        "btnDrillAll": "Tutti i rilevatori: Esercitazione",
        "btnSelfTestAll": "Tutti i rilevatori: Autotest",
        "btnSilence": "Silenzia sirene",
        "btnSilenceAgain": "Silenzia di nuovo",
        "btnReset": "Conferma / Ripristina",
        "btnTestMode": "Modalità Test",
        "btnExitTestMode": "Esci dalla modalità test",
        "btnManualTrigger": "Attiva allarme di emergenza",
        "confirmManualTrigger": "Sei sicuro di voler attivare manualmente la sequenza completa di allarme?",
        "activeHazardsTitle": "Avvisi di pericolo attivi",
        "noActiveHazards": "Nessun avviso di pericolo attivo al momento.",
        "eventHistoryTitle": "Registro eventi",
        "noEvents": "Nessun evento registrato finora.",
        "historyFilterType": "Tipo di evento:",
        "historyFilterTime": "Periodo:",
        "historyTime24h": "Max. 24 ore",
        "historyTime1h": "Ultima 1 ora",
        "historyTime6h": "Ultime 6 ore",
        "historyTime12h": "Ultime 12 ore",
        "historyTime3d": "Ultimi 3 giorni",
        "historyTimeAll": "Tutta la cronologia",
        "historyTypeAll": "Tutti i tipi di evento",
        "historyTypeAlarms": "🚨 Allarmi & Pericoli",
        "historyTypeSilenced": "🔕 Silenziati",
        "historyTypeReset": "✅ Ripristino & Cessato allarme",
        "historyTypeSelfTestAll": "🧪 Autotest (Tutti)",
        "historyTypeSelfTestFailed": "❌ Autotest fallito",
        "historyTypeSelfTestSuccess": "✅ Autotest superato",
        "historyTypeDrills": "🔔 Esercitazioni allarme",
        "historyTypeTestMode": "🛡️ Modalità Test",
        "historyTypeBattery": "🪫 Batteria scarica",
        "historyTypeOffline": "📡 Rilevatore Offline / Online",
        "historyTypeIgnored": "🙈 Ignorato / Riattivato",
        "historyNoMatchingEvents": "Nessun evento corrisponde ai criteri del filtro.",
        "historyShowAllEvents": "Mostra tutti gli eventi",
        "historyCountBadge": "{filtered} di {total} eventi",
        "lblHistoryDefaultTime": "Periodo predefinito nel registro:",
        "searchSensorsPlaceholder": "Cerca sensori...",
        "searchCandidatesPlaceholder": "Filtra sensori di pericolo...",
        "filterAll": "Tutti",
        "filterAllTypes": "Tutti i tipi",
        "noMatchingCandidates": "Nessun sensore di pericolo corrisponde al filtro.",
        "btnAddSensor": "Aggiungi sensore",
        "btnAddZone": "Aggiungi zona",
        "btnAddAction": "Aggiungi azione",
        "candidateBanner": "{count} sensori compatibili rilevati in Home Assistant:",
        "addCandidate": "Monitora",
        "thSensor": "Sensore",
        "thZone": "Zona",
        "thType": "Tipo di pericolo",
        "thPreAlarm": "Ritardo pre-allarme",
        "thFeatures": "Caratteristiche",
        "thStatus": "Stato",
        "thActions": "Azioni",
        "typeSmoke": "Fumo",
        "typeMoisture": "Allagamento / Acqua",
        "typeGas": "Gas",
        "typeCO": "Monossido di carbonio (CO)",
        "typeHeat": "Calore",
        "typeGeneric": "Generico",
        "phaseCutoff": "Fase 1: Interruzione di emergenza",
        "phaseCutoffDesc": "Chiusura immediata delle valvole principali, arresto ventilazione o apertura vie di fuga.",
        "phaseNotification": "Fase 2: Notifiche prioritarie",
        "phaseNotificationDesc": "Notifiche push critiche per smartphone con suono di allarme prioritario.",
        "phaseAcoustic": "Fase 3: Acustica & Ottica",
        "phaseAcousticDesc": "Attivazione sirene ad alta potenza, luci di emergenza rosse e annunci vocali TTS.",
        "phaseRestore": "Fase 4: Cessato allarme & Ripristino (Post-allarme)",
        "phaseRestoreDesc": "Eseguito dopo il ripristino dell'allarme: ripristino illuminazione, riavvio ventilazione o notifica di sicurezza.",
        "phaseSystem": "Fase 5: Manutenzione & Avvisi di sistema (Batteria, Offline & Autotest)",
        "phaseSystemDesc": "Attivato in caso di batteria scarica (< 15%), rilevatore offline o fallimento autotest.",
        "presetSystem": "🛠️ Avviso di sistema",
        "presetSelfTestFailed": "🧪 Fallimento autotest",
        "eventBatteryLow": "Batteria scarica",
        "eventSensorOffline": "Rilevatore offline",
        "eventSelfTestFailed": "Autotest fallito",
        "actionSystemEvents": "Attiva per i seguenti eventi di sistema:",
        "testAction": "Testa",
        "edit": "Modifica",
        "delete": "Elimina",
        "save": "Salva",
        "cancel": "Annulla",
        "settingsTitle": "Impostazioni generali del sistema",
        "lblTestDuration": "Durata modalità test (minuti):",
        "lblSilenceDuration": "Durata silenziamento (minuti):",
        "lblDoubleKnockTimeout": "Timeout globale doppia verifica (secondi):",
        "lblOfflineAlerts": "Avvisa per sensori offline / non disponibili",
        "lblBatteryAlerts": "Avvisa per batteria scarica (< 15%)",
        "zonesTitle": "Zone di pericolo & Stanze",
        "zoneName": "Nome della zona",
        "doubleKnockEnabled": "Verifica multi-sensore (Double-Knock)",
        "doubleKnockHelp": "Richiede la conferma di un 2° sensore nella zona prima di attivare l'allarme generale.",
        "autoAckHelp": "Ripristina automaticamente l'allarme quando il sensore torna su OFF.",
        "linkedShutoffs": "Dispositivi di interruzione collegati (es. valve.acqua_principale, fan.ventilazione):",
        "preAlarmDelaySec": "Ritardo pre-allarme (secondi, 0 = immediato):",
        "actionService": "Servizio Home Assistant:",
        "actionTarget": "Entità di destinazione:",
        "actionPayload": "Dati del servizio (Payload):",
        "actionTriggerTypes": "Attiva per i seguenti tipi di pericolo:",
        "toggleMenu": "Apri/Chiudi barra laterale Home Assistant",
        "targetPlaceholder": "es. valve.acqua_principale, siren.allarme",
        "targetHelp": "Digita per cercare entità (valvole, sirene, interruttori, luci, ecc.). Nota: Per notify.notify o script, la destinazione è facoltativa.",
        "targetPreviewTitle": "Anteprima entità di destinazione:",
        "serviceSelectLabel": "Servizi disponibili per l'entità:",
        "serviceCustomOption": "✏️ Servizio personalizzato / manuale...",
        "serviceHelp": "Seleziona un servizio adatto all'entità o inseriscilo manualmente.",
        "payloadHelpTitle": "Guida al formato (Dati servizio)",
        "payloadHelpDesc": "Inserisci come oggetto JSON { \"chiave\": \"valore\" }. Per valvole o interruttori standard (es. valve.close_valve), lasciare {}.",
        "presetsTitle": "Modelli rapidi:",
        "variablesTitle": "Variabili dinamiche (clicca per inserire):",
        "presetEmpty": "🔘 Vuoto ({})",
        "presetNotify": "📱 Notifica push",
        "presetCritical": "🚨 Notifica critica di allarme",
        "presetRedLight": "💡 Luce rossa di emergenza",
        "presetSiren": "🔊 Volume sirena",
        "presetAllClear": "✅ Notifica di cessato allarme",
        "presetScript": "📜 Variabili script",
        "actionRepeat": "Ripetizione ciclica durante allarme (secondi, 0 = una volta):",
        "actionRepeatHelp": "Ripete questa azione ogni X secondi finché l'allarme è attivo. 0 = esegui una sola volta.",
        "validJson": "✅ JSON valido",
        "invalidJson": "❌ JSON non valido",
        "entityNotFoundInHA": "Non trovata nel registro stati HA",
        "silenceEntity": "Entità di silenziamento (Pulsante/Interruttore):",
        "silenceEntityHelp": "Opzionale: Pulsante o interruttore per silenziare la sirena del dispositivo.",
        "drillEntity": "Entità di esercitazione (Pulsante):",
        "drillEntityHelp": "Opzionale: Avvia l'esercitazione o il test di allarme acustico sul rilevatore.",
        "testEntity": "Entità di autotest (Pulsante):",
        "testEntityHelp": "Opzionale: Esegue l'autotest diagnostico interno sul rilevatore.",
        "batteryEntity": "Entità della batteria (Sensore):",
        "batteryEntityHelp": "Opzionale: Sensore percentuale batteria (rilevato automaticamente se vuoto).",
        "btnSelfTest": "🧪 Autotest",
        "btnDrill": "🔔 Esercitazione",
        "btnMuteSensor": "🔕 Silenzia rilevatore",
        "btnIgnoreSensor": "🙈 Ignora avviso",
        "btnUnignoreSensor": "👁️ Riattiva",
        "badgeIgnored": "🙈 Ignorato (fino al ritorno su OFF)",
        "batteryWarning": "Avviso batteria scarica su sensori di sicurezza",
        "batteryStatus": "Batteria",
        "mainsPowered": "⚡ Alimentazione di rete",
        "testResultEntity": "Entità risultato autotest (Sensore):",
        "testResultEntityHelp": "Opzionale: Sensore che riporta l'esito dell'autotest (es. valore 'success' o timestamp).",
        "btnStartSequentialSelfTest": "Avvia autotest sequenziale",
        "btnCancelSelfTest": "Annulla autotest",
        "selectDrillSensorPlaceholder": "-- Seleziona rilevatore per l'esercitazione --",
        "btnDrillSingle": "Avvia esercitazione",
        "drillSensorHelp": "Seleziona un rilevatore specifico su cui eseguire l'esercitazione di allarme.",
        "autoSelfTestTitle": "Autotest periodico automatico",
        "autoSelfTestDesc": "Esegue un autotest sequenziale in modalità test in un giorno prestabilito ogni mese e verifica gli esiti. Se un rilevatore fallisce, invia una notifica.",
        "lblAutoSelfTestEnabled": "Esegui automaticamente l'autotest mensile di tutti i rilevatori",
        "lblAutoSelfTestDay": "Giorno del mese (1-31):",
        "lblAutoSelfTestTime": "Ora (HH:MM):",
        "lblAutoSelfTestStep": "Attesa per rilevatore (secondi):",
        "lblAutoSelfTestNotify": "Invia notifica se ci sono rilevatori falliti (Fase 5)",
        "selfTestStatusTitle": "Stato autotest",
        "selfTestProgress": "Avanzamento: Rilevatore {current} di {total}",
        "selfTestPassed": "Superato",
        "selfTestFailed": "Fallito",
        "selfTestPending": "In attesa",
        "selfTestTesting": "In corso di verifica...",
        "lblLanguage": "Lingua:",
        "langAuto": "Automatico (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Allarme",
        "badgeSilenced": "Silenziato",
        "badgeAllClear": "Cessato allarme",
        "badgeFailed": "Fallito",
        "badgePassed": "Superato",
        "badgeDrill": "Esercitazione",
        "badgeSelfTest": "Autotest",
        "badgeTestMode": "Modalità test",
        "badgeBattery": "Batteria",
        "badgeOffline": "Offline",
        "badgeOnline": "Online",
        "badgeReactivated": "Riattivato",
        "saving": "Salvataggio...",
        "saved": "Salvato",
        "yes": "Sì",
        "no": "No"
    },
    "nl": {
        "appName": "Safety Monitor",
        "subtitle": "24/7 Gevaren- & Veiligheidsbewaking (Rook, Vocht, Gas, CO)",
        "tabOverview": "Overzicht & Status",
        "tabSensors": "Sensoren",
        "tabActions": "Noodacties",
        "tabSettings": "Zones & Instellingen",
        "statusNormal": "Alles Veilig & Normaal",
        "statusNormalDesc": "Alle bewaakte sensoren zijn normaal. De 24/7 beveiligingsmonitoring is actief.",
        "statusPreAlarm": "Vooralarm / Verificatie",
        "statusPreAlarmDesc": "Mogelijk gevaar gedetecteerd! Aftelling actief voor het afgaan van de hoofdsirenes.",
        "statusTriggered": "ACUUT GEVAAR - ALARM ACTIEF!",
        "statusTriggeredDesc": "Volledig noodalarm geactiveerd! Sirenes, afsluitingen en meldingen worden uitgevoerd.",
        "statusSilenced": "Alarmen Gedempt",
        "statusSilencedDesc": "Akoestische sirenes tijdelijk gepauzeerd. De 24/7 gevaarbewaking blijft actief!",
        "statusTesting": "Test- & Onderhoudsmodus",
        "statusTestingDesc": "Onderhoudsmodus actief: externe sirenes en noodafsluitingen zijn tijdelijk onderdrukt.",
        "testModeActiveTitle": "Test- & Onderhoudsmodus is ACTIEF",
        "testModeActiveDesc": "Sirenes en afsluitingen zijn onderdrukt. U kunt detectoren nu veilig testen:",
        "btnDrillAll": "Alle melders: Alarm Oefening",
        "btnSelfTestAll": "Alle melders: Zelftest",
        "btnSilence": "Sirenes dempen",
        "btnSilenceAgain": "Opnieuw dempen",
        "btnReset": "Bevestigen / Resetten",
        "btnTestMode": "Testmodus",
        "btnExitTestMode": "Testmodus verlaten",
        "btnManualTrigger": "Noodalarm activeren",
        "confirmManualTrigger": "Weet u zeker dat u handmatig de volledige alarmsequentie wilt activeren?",
        "activeHazardsTitle": "Actieve gevaarmeldingen",
        "noActiveHazards": "Geen actieve gevaarmeldingen op dit moment.",
        "eventHistoryTitle": "Gebeurtenissenlogboek",
        "noEvents": "Nog geen gebeurtenissen vastgelegd.",
        "historyFilterType": "Type gebeurtenis:",
        "historyFilterTime": "Periode:",
        "historyTime24h": "Max. 24 uur",
        "historyTime1h": "Afgelopen 1 uur",
        "historyTime6h": "Afgelopen 6 uur",
        "historyTime12h": "Afgelopen 12 uur",
        "historyTime3d": "Afgelopen 3 dagen",
        "historyTimeAll": "Volledige geschiedenis",
        "historyTypeAll": "Alle gebeurtenistypen",
        "historyTypeAlarms": "🚨 Alarmen & Gevaren",
        "historyTypeSilenced": "🔕 Gedempt",
        "historyTypeReset": "✅ Bevestiging & Veilig",
        "historyTypeSelfTestAll": "🧪 Zelftests (Alle)",
        "historyTypeSelfTestFailed": "❌ Zelftest mislukt",
        "historyTypeSelfTestSuccess": "✅ Zelftest geslaagd",
        "historyTypeDrills": "🔔 Alarmoefeningen",
        "historyTypeTestMode": "🛡️ Testmodus",
        "historyTypeBattery": "🪫 Lage batterij",
        "historyTypeOffline": "📡 Melder Offline / Online",
        "historyTypeIgnored": "🙈 Genegeerd / Geheractiveerd",
        "historyNoMatchingEvents": "Geen gebeurtenissen voldoen aan de huidige filtercriteria.",
        "historyShowAllEvents": "Alle gebeurtenissen weergeven",
        "historyCountBadge": "{filtered} van {total} gebeurtenissen",
        "lblHistoryDefaultTime": "Standaardperiode in gebeurtenissenlogboek:",
        "searchSensorsPlaceholder": "Sensoren zoeken...",
        "searchCandidatesPlaceholder": "Gevaarsensoren filteren...",
        "filterAll": "Alle",
        "filterAllTypes": "Alle types",
        "noMatchingCandidates": "Geen gevaarsensoren komen overeen met het filter.",
        "btnAddSensor": "Sensor toevoegen",
        "btnAddZone": "Zone toevoegen",
        "btnAddAction": "Actie toevoegen",
        "candidateBanner": "{count} geschikte gevaarsensor(en) gevonden in Home Assistant:",
        "addCandidate": "Monitoren",
        "thSensor": "Sensor",
        "thZone": "Zone",
        "thType": "Gevaartype",
        "thPreAlarm": "Vooralarm-vertraging",
        "thFeatures": "Functies",
        "thStatus": "Status",
        "thActions": "Acties",
        "typeSmoke": "Rook",
        "typeMoisture": "Waterlekkage",
        "typeGas": "Gas",
        "typeCO": "Koolmonoxide (CO)",
        "typeHeat": "Hitte",
        "typeGeneric": "Algemeen",
        "phaseCutoff": "Fase 1: Noodafsluiting (Cutoff)",
        "phaseCutoffDesc": "Direct sluiten van hoofdkranen, uitschakelen ventilatie of openen vluchtwegen.",
        "phaseNotification": "Fase 2: Prioritaire meldingen",
        "phaseNotificationDesc": "Kritieke pushmeldingen met geluidsbypass naar mobiele apparaten.",
        "phaseAcoustic": "Fase 3: Akoestisch & Optisch",
        "phaseAcousticDesc": "Activeren van luide sirenes, rode noodverlichting en TTS-spraakberichten.",
        "phaseRestore": "Fase 4: Alles veilig & Herstel (Na alarm)",
        "phaseRestoreDesc": "Uitgevoerd na alarmreset: verlichting herstellen, ventilatie herstarten of 'alles veilig'-push sturen.",
        "phaseSystem": "Fase 5: Onderhoud & Systeemmeldingen (Batterij, Offline & Zelftest)",
        "phaseSystemDesc": "Geactiveerd bij lage batterij (< 15%), offline sensor of mislukte zelftest.",
        "presetSystem": "🛠️ Systeemmelding",
        "presetSelfTestFailed": "🧪 Zelftestfout",
        "eventBatteryLow": "Lage batterij",
        "eventSensorOffline": "Sensor offline",
        "eventSelfTestFailed": "Zelftest mislukt",
        "actionSystemEvents": "Activeren bij volgende systeemgebeurtenissen:",
        "testAction": "Testen",
        "edit": "Bewerken",
        "delete": "Verwijderen",
        "save": "Opslaan",
        "cancel": "Annuleren",
        "settingsTitle": "Algemene systeeminstellingen",
        "lblTestDuration": "Duur testmodus (minuten):",
        "lblSilenceDuration": "Duur demping (minuten):",
        "lblDoubleKnockTimeout": "Globale double-knock timeout (seconden):",
        "lblOfflineAlerts": "Melding bij offline / niet-beschikbare sensoren",
        "lblBatteryAlerts": "Melding bij lage batterij (< 15%)",
        "zonesTitle": "Gevarenzones & Ruimtes",
        "zoneName": "Zonenaam",
        "doubleKnockEnabled": "Multi-sensor verificatie (Double-Knock)",
        "doubleKnockHelp": "Vereist bevestiging door een 2e sensor in de zone voordat het hoofdalarm afgaat.",
        "autoAckHelp": "Reset het alarm automatisch zodra de sensor weer OFF meldt.",
        "linkedShutoffs": "Gekoppelde noodactoren (bijv. valve.hoofdwater, fan.ventilatie):",
        "preAlarmDelaySec": "Vooralarm-vertraging (seconden, 0 = direct):",
        "actionService": "Home Assistant Dienst:",
        "actionTarget": "Doelentiteit:",
        "actionPayload": "Dienstgegevens (Payload):",
        "actionTriggerTypes": "Activeren bij de volgende gevaartypes:",
        "toggleMenu": "Zijbalk Home Assistant in-/uitklappen",
        "targetPlaceholder": "bijv. valve.hoofdwater, siren.alarm",
        "targetHelp": "Typ om entiteiten te zoeken (kranen, sirenes, schakelaars, lampen etc.). Voor notify.notify is doel optioneel.",
        "targetPreviewTitle": "Voorbeeld van doelentiteit(en):",
        "serviceSelectLabel": "Beschikbare diensten voor doelentiteit:",
        "serviceCustomOption": "✏️ Handmatige / Aangepaste dienst...",
        "serviceHelp": "Selecteer een dienst voor de entiteit of voer handmatig in.",
        "payloadHelpTitle": "Formaatinformatie (Dienstgegevens)",
        "payloadHelpDesc": "Invoeren als JSON-object { \"sleutel\": \"waarde\" }. Voor standaard kranen/schakelaars is {} voldoende.",
        "presetsTitle": "Snelle sjablonen:",
        "variablesTitle": "Dynamische variabelen (klik om in te voegen):",
        "presetEmpty": "🔘 Leeg ({})",
        "presetNotify": "📱 Pushmelding",
        "presetCritical": "🚨 Kritiek alarm push",
        "presetRedLight": "💡 Rood noodlicht",
        "presetSiren": "🔊 Sirene volume",
        "presetAllClear": "✅ Alles-veilig melding",
        "presetScript": "📜 Scriptvariabelen",
        "actionRepeat": "Herhaling tijdens alarm (seconden, 0 = eenmalig):",
        "actionRepeatHelp": "Herhaalt deze actie elke X seconden zolang alarm actief is. 0 = eenmalig uitvoeren.",
        "validJson": "✅ Geldige JSON",
        "invalidJson": "❌ Ongeldige JSON",
        "entityNotFoundInHA": "Niet gevonden in HA-statusregister",
        "silenceEntity": "Dempentiteit (Knop/Schakelaar):",
        "silenceEntityHelp": "Optioneel: Knop/schakelaar op de melder om de sirene op het apparaat te dempen.",
        "drillEntity": "Alarmoefening-entiteit (Knop):",
        "drillEntityHelp": "Optioneel: Start netwerkoefening of alarmtest op melder.",
        "testEntity": "Zelftest-entiteit (Knop):",
        "testEntityHelp": "Optioneel: Voert interne zelftest van de melder uit.",
        "batteryEntity": "Batterij-entiteit (Sensor):",
        "batteryEntityHelp": "Optioneel: Sensor voor batterijpercentage (automatisch gedetecteerd indien leeg).",
        "btnSelfTest": "🧪 Zelftest",
        "btnDrill": "🔔 Oefening",
        "btnMuteSensor": "🔕 Melder dempen",
        "btnIgnoreSensor": "🙈 Tijdelijk negeren",
        "btnUnignoreSensor": "👁️ Heractiveren",
        "badgeIgnored": "🙈 Genegeerd (tot sensor herstelt)",
        "batteryWarning": "Waarschuwing lage batterij op gevaarsensoren",
        "batteryStatus": "Batterij",
        "mainsPowered": "⚡ Netstroom",
        "testResultEntity": "Zelftest-resultaatentiteit (Sensor):",
        "testResultEntityHelp": "Optioneel: Sensor voor de uitkomst van de zelftest (bijv. waarde 'succes' of tijdstempel).",
        "btnStartSequentialSelfTest": "Sequentiële zelftest starten",
        "btnCancelSelfTest": "Zelftest annuleren",
        "selectDrillSensorPlaceholder": "-- Melder voor alarmoefening kiezen --",
        "btnDrillSingle": "Alarmoefening starten",
        "drillSensorHelp": "Selecteer een specifieke melder om gericht een alarmoefening te starten.",
        "autoSelfTestTitle": "Automatische periodieke zelftest",
        "autoSelfTestDesc": "Voert maandelijks op een ingestelde dag een sequentiële zelftest uit in testmodus en controleert resultaten. Bij storingen volgt een notificatie.",
        "lblAutoSelfTestEnabled": "Maandelijkse zelftest van alle melders automatisch uitvoeren",
        "lblAutoSelfTestDay": "Dag van de maand (1-31):",
        "lblAutoSelfTestTime": "Tijdstip (UU:MM):",
        "lblAutoSelfTestStep": "Wachttijd per melder (seconden):",
        "lblAutoSelfTestNotify": "Melding verzenden bij mislukte melders (Fase 5)",
        "selfTestStatusTitle": "Zelftest-status",
        "selfTestProgress": "Voortgang: Melder {current} van {total}",
        "selfTestPassed": "Geslaagd",
        "selfTestFailed": "Mislukt",
        "selfTestPending": "Wachtend",
        "selfTestTesting": "Wordt getest...",
        "lblLanguage": "Taal:",
        "langAuto": "Automatisch (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Alarm",
        "badgeSilenced": "Gedempt",
        "badgeAllClear": "Veilig",
        "badgeFailed": "Mislukt",
        "badgePassed": "Geslaagd",
        "badgeDrill": "Oefening",
        "badgeSelfTest": "Zelftest",
        "badgeTestMode": "Testmodus",
        "badgeBattery": "Batterij",
        "badgeOffline": "Offline",
        "badgeOnline": "Online",
        "badgeReactivated": "Geheractiveerd",
        "saving": "Opslaan...",
        "saved": "Opgeslagen",
        "yes": "Ja",
        "no": "Nee"
    },
    "pl": {
        "appName": "Safety Monitor",
        "subtitle": "Całodobowe monitorowanie zagrożeń i bezpieczeństwa (Dym, Woda, Gaz, CO)",
        "tabOverview": "Przegląd & Status",
        "tabSensors": "Czujniki",
        "tabActions": "Działania awaryjne",
        "tabSettings": "Strefy & Ustawienia",
        "statusNormal": "Wszystko bezpieczne",
        "statusNormalDesc": "Wszystkie monitorowane czujniki działają prawidłowo. Ochrona 24/7 jest aktywna.",
        "statusPreAlarm": "Pre-alarm / Weryfikacja",
        "statusPreAlarmDesc": "Wykryto potencjalne zagrożenie! Odliczanie do uruchomienia głównych syren.",
        "statusTriggered": "BEZPOŚREDNIE ZAGROŻENIE - ALARM AKTYWNY!",
        "statusTriggeredDesc": "Główny alarm wyzwolony! Trwa działanie syren, odcięć awaryjnych i powiadomień.",
        "statusSilenced": "Alarmy wyciszone",
        "statusSilencedDesc": "Syreny akustyczne tymczasowo wyciszone. Monitoring zagrożeń 24/7 pozostaje aktywny!",
        "statusTesting": "Tryb testowy & konserwacyjny",
        "statusTestingDesc": "Tryb konserwacji aktywny: zewnętrzne syreny i odcięcia są wyłączone.",
        "testModeActiveTitle": "Tryb testowy i konserwacyjny jest AKTYWNY",
        "testModeActiveDesc": "Syreny i odcięcia są wstrzymane. Możesz bezpiecznie przetestować czujniki:",
        "btnDrillAll": "Wszystkie czujniki: Ćwiczenie alarmowe",
        "btnSelfTestAll": "Wszystkie czujniki: Autotest",
        "btnSilence": "Wycisz syreny",
        "btnSilenceAgain": "Wycisz ponownie",
        "btnReset": "Potwierdź / Resetuj",
        "btnTestMode": "Tryb testowy",
        "btnExitTestMode": "Zakończ tryb testowy",
        "btnManualTrigger": "Wyzwól alarm awaryjny",
        "confirmManualTrigger": "Czy na pewno chcesz ręcznie uruchomić pełną procedurę alarmową i ewakuacyjną?",
        "activeHazardsTitle": "Aktywne alerty o zagrożeniach",
        "noActiveHazards": "Brak aktywnych alertów w tym momencie.",
        "eventHistoryTitle": "Dziennik zdarzeń",
        "noEvents": "Brak zarejestrowanych zdarzeń.",
        "historyFilterType": "Rodzaj zdarzenia:",
        "historyFilterTime": "Zakres czasu:",
        "historyTime24h": "Maks. 24 godziny",
        "historyTime1h": "Ostatnia 1 godzina",
        "historyTime6h": "Ostatnie 6 godzin",
        "historyTime12h": "Ostatnie 12 godzin",
        "historyTime3d": "Ostatnie 3 dni",
        "historyTimeAll": "Cała historia zdarzeń",
        "historyTypeAll": "Wszystkie typy zdarzeń",
        "historyTypeAlarms": "🚨 Alarmy & Zagrożenia",
        "historyTypeSilenced": "🔕 Wyciszone",
        "historyTypeReset": "✅ Potwierdzenie & Odwołanie",
        "historyTypeSelfTestAll": "🧪 Autotesty (Wszystkie)",
        "historyTypeSelfTestFailed": "❌ Błąd autotestu",
        "historyTypeSelfTestSuccess": "✅ Autotest pomyślny",
        "historyTypeDrills": "🔔 Ćwiczenia alarmowe",
        "historyTypeTestMode": "🛡️ Tryb testowy",
        "historyTypeBattery": "🪫 Rozładowana bateria",
        "historyTypeOffline": "📡 Czujnik Offline / Online",
        "historyTypeIgnored": "🙈 Ignorowany / Reaktywowany",
        "historyNoMatchingEvents": "Brak zdarzeń spełniających wybrane kryteria filtra.",
        "historyShowAllEvents": "Pokaż wszystkie zdarzenia",
        "historyCountBadge": "{filtered} z {total} zdarzeń",
        "lblHistoryDefaultTime": "Domyślny zakres w dzienniku zdarzeń:",
        "searchSensorsPlaceholder": "Szukaj czujników...",
        "searchCandidatesPlaceholder": "Filtruj czujniki zagrożeń...",
        "filterAll": "Wszystkie",
        "filterAllTypes": "Wszystkie typy",
        "noMatchingCandidates": "Żaden czujnik nie odpowiada filtrowi.",
        "btnAddSensor": "Dodaj czujnik",
        "btnAddZone": "Dodaj strefę",
        "btnAddAction": "Dodaj akcję",
        "candidateBanner": "Znaleziono {count} zgodnych czujników w Home Assistant:",
        "addCandidate": "Monitoruj",
        "thSensor": "Czujnik",
        "thZone": "Strefa",
        "thType": "Typ zagrożenia",
        "thPreAlarm": "Opóźnienie pre-alarmu",
        "thFeatures": "Właściwości",
        "thStatus": "Stan",
        "thActions": "Akcje",
        "typeSmoke": "Dym",
        "typeMoisture": "Zalanie / Woda",
        "typeGas": "Gaz",
        "typeCO": "Tlenek węgla (CO)",
        "typeHeat": "Temperatura / Ciepło",
        "typeGeneric": "Ogólne",
        "phaseCutoff": "Faza 1: Odcięcie awaryjne",
        "phaseCutoffDesc": "Natychmiastowe zamknięcie głównych zaworów, wyłączenie wentylacji lub otwarcie dróg ewakuacji.",
        "phaseNotification": "Faza 2: Powiadomienia priorytetowe",
        "phaseNotificationDesc": "Krytyczne powiadomienia push z obejściem wyciszenia na urządzenia mobilne.",
        "phaseAcoustic": "Faza 3: Sygnalizacja akustyczna & optyczna",
        "phaseAcousticDesc": "Uruchomienie głośnych syren, czerwonego oświetlenia awaryjnego i komunikatów głosowych TTS.",
        "phaseRestore": "Faza 4: Odwołanie alarmu & Przywracanie stanu",
        "phaseRestoreDesc": "Wykonywane po resecie alarmu: przywrócenie oświetlenia, wznowienie wentylacji lub wysłanie komunikatu o bezpieczeństwie.",
        "phaseSystem": "Faza 5: Konserwacja & Ostrzeżenia systemowe (Bateria, Offline & Autotest)",
        "phaseSystemDesc": "Wyzwalane przy niskim stanie baterii (< 15%), niedostępności czujnika lub nieudanym teście.",
        "presetSystem": "🛠️ Alert systemowy",
        "presetSelfTestFailed": "🧪 Błąd autotestu",
        "eventBatteryLow": "Niski poziom baterii",
        "eventSensorOffline": "Czujnik offline",
        "eventSelfTestFailed": "Autotest nie powiódł się",
        "actionSystemEvents": "Wyzwól przy następujących zdarzeniach:",
        "testAction": "Testuj",
        "edit": "Edytuj",
        "delete": "Usuń",
        "save": "Zapisz",
        "cancel": "Anuluj",
        "settingsTitle": "Ogólne ustawienia systemu",
        "lblTestDuration": "Czas trwania trybu testowego (minuty):",
        "lblSilenceDuration": "Czas wyciszenia syren (minuty):",
        "lblDoubleKnockTimeout": "Globalny limit podwójnej weryfikacji (sekundy):",
        "lblOfflineAlerts": "Ostrzegaj o niedostępnych / offline czujnikach",
        "lblBatteryAlerts": "Ostrzegaj o niskim poziomie baterii (< 15%)",
        "zonesTitle": "Strefy zagrożeń & Pomieszczenia",
        "zoneName": "Nazwa strefy",
        "doubleKnockEnabled": "Weryfikacja wieloczujnikowa (Double-Knock)",
        "doubleKnockHelp": "Wymaga potwierdzenia przez 2. czujnik w strefie przed uruchomieniem głównego alarmu.",
        "autoAckHelp": "Automatycznie resetuje alarm, gdy czujnik powróci do stanu OFF.",
        "linkedShutoffs": "Powiązane elementy odcinające (np. valve.glowny_zawor, fan.wentylacja):",
        "preAlarmDelaySec": "Opóźnienie pre-alarmu (sekundy, 0 = natychmiast):",
        "actionService": "Usługa Home Assistant:",
        "actionTarget": "Encja docelowa:",
        "actionPayload": "Dane usługi (Payload):",
        "actionTriggerTypes": "Wyzwól przy następujących zagrożeniach:",
        "toggleMenu": "Przełącz pasek boczny Home Assistant",
        "targetPlaceholder": "np. valve.glowny_zawor, siren.alarm",
        "targetHelp": "Wpisz, aby wyszukać encje (zawory, syreny, przełączniki, światła itp.). Dla notify.notify cel jest opcjonalny.",
        "targetPreviewTitle": "Podgląd encji docelowej:",
        "serviceSelectLabel": "Dostępne usługi dla wybranej encji:",
        "serviceCustomOption": "✏️ Własna / Inna usługa...",
        "serviceHelp": "Wybierz usługę pasującą do encji lub wpisz ją ręcznie.",
        "payloadHelpTitle": "Wskazówka dot. formatu (Dane usługi)",
        "payloadHelpDesc": "Wprowadź jako obiekt JSON { \"klucz\": \"wartość\" }. Dla standardowych zaworów/przełączników wystarczy {}.",
        "presetsTitle": "Szybkie szablony:",
        "variablesTitle": "Zmienne dynamiczne (kliknij, aby wstawić):",
        "presetEmpty": "🔘 Puste ({})",
        "presetNotify": "📱 Powiadomienie push",
        "presetCritical": "🚨 Krytyczny push alarmowy",
        "presetRedLight": "💡 Czerwone światło awaryjne",
        "presetSiren": "🔊 Głośność syreny",
        "presetAllClear": "✅ Push o odwołaniu alarmu",
        "presetScript": "📜 Zmienne skryptu",
        "actionRepeat": "Pętla powtarzania w trakcie alarmu (sekundy, 0 = jednorazowo):",
        "actionRepeatHelp": "Powtarza tę akcję co X sekund tak długo, jak trwa alarm. 0 = jednokrotne wykonanie.",
        "validJson": "✅ Prawidłowy JSON",
        "invalidJson": "❌ Nieprawidłowy JSON",
        "entityNotFoundInHA": "Nie znaleziono w rejestrze stanów HA",
        "silenceEntity": "Encja wyciszania (Przycisk/Przełącznik):",
        "silenceEntityHelp": "Opcjonalnie: Przycisk na czujniku do wyciszenia jego fizycznej syreny.",
        "drillEntity": "Encja ćwiczenia alarmowego (Przycisk):",
        "drillEntityHelp": "Opcjonalnie: Wyzwala test sieciowy lub ćwiczenie na czujniku.",
        "testEntity": "Encja autotestu (Przycisk):",
        "testEntityHelp": "Opcjonalnie: Uruchamia wewnętrzny test sprawności czujnika.",
        "batteryEntity": "Encja poziomu baterii (Czujnik):",
        "batteryEntityHelp": "Opcjonalnie: Czujnik procentowy baterii (wykrywany automatycznie, jeśli pusty).",
        "btnSelfTest": "🧪 Autotest",
        "btnDrill": "🔔 Ćwiczenie",
        "btnMuteSensor": "🔕 Wycisz czujnik",
        "btnIgnoreSensor": "🙈 Zignoruj alert",
        "btnUnignoreSensor": "👁️ Reaktywuj",
        "badgeIgnored": "🙈 Zignorowany (do stanu OFF)",
        "batteryWarning": "Ostrzeżenie o słabej baterii czujników",
        "batteryStatus": "Bateria",
        "mainsPowered": "⚡ Zasilanie sieciowe",
        "testResultEntity": "Encja wyniku autotestu (Czujnik):",
        "testResultEntityHelp": "Opcjonalnie: Czujnik raportujący wynik testu (np. stan 'sukces' lub data).",
        "btnStartSequentialSelfTest": "Uruchom sekwencyjny autotest",
        "btnCancelSelfTest": "Anuluj autotest",
        "selectDrillSensorPlaceholder": "-- Wybierz czujnik do ćwiczenia --",
        "btnDrillSingle": "Rozpocznij ćwiczenie",
        "drillSensorHelp": "Wybierz konkretny czujnik, na którym ma zostać uruchomione ćwiczenie.",
        "autoSelfTestTitle": "Automatyczny okresowy autotest",
        "autoSelfTestDesc": "Wykonuje comiesięczny autotest w trybie testowym w wybranym dniu i weryfikuje stany. W razie błędu wysyła powiadomienie.",
        "lblAutoSelfTestEnabled": "Wykonuj comiesięczny autotest wszystkich czujników",
        "lblAutoSelfTestDay": "Dzień miesiąca (1-31):",
        "lblAutoSelfTestTime": "Godzina (GG:MM):",
        "lblAutoSelfTestStep": "Odstęp między czujnikami (sekundy):",
        "lblAutoSelfTestNotify": "Wyślij powiadomienie o błędach autotestu (Faza 5)",
        "selfTestStatusTitle": "Status autotestu",
        "selfTestProgress": "Postęp: Czujnik {current} z {total}",
        "selfTestPassed": "Zaliczony",
        "selfTestFailed": "Niepowodzenie",
        "selfTestPending": "Oczekuje",
        "selfTestTesting": "Trwa testowanie...",
        "lblLanguage": "Język:",
        "langAuto": "Automatycznie (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Alarm",
        "badgeSilenced": "Wyciszony",
        "badgeAllClear": "Koniec alarmu",
        "badgeFailed": "Niepowodzenie",
        "badgePassed": "Zaliczony",
        "badgeDrill": "Ćwiczenie",
        "badgeSelfTest": "Autotest",
        "badgeTestMode": "Tryb testowy",
        "badgeBattery": "Bateria",
        "badgeOffline": "Offline",
        "badgeOnline": "Online",
        "badgeReactivated": "Reaktywowany",
        "saving": "Zapisywanie...",
        "saved": "Zapisano",
        "yes": "Tak",
        "no": "Nie"
    },
    "pt": {
        "appName": "Safety Monitor",
        "subtitle": "Monitorização de segurança e riscos 24/7 (Fumo, Água, Gás, CO)",
        "tabOverview": "Visão Geral & Estado",
        "tabSensors": "Sensores",
        "tabActions": "Ações de Emergência",
        "tabSettings": "Zonas & Configurações",
        "statusNormal": "Tudo Seguro e Normal",
        "statusNormalDesc": "Todos os sensores monitorizados estão normais. A proteção 24/7 está ativa.",
        "statusPreAlarm": "Pré-alarme / Verificação",
        "statusPreAlarmDesc": "Potencial perigo detetado! Contagem decrescente ativa antes do disparo das sirenes.",
        "statusTriggered": "PERIGO IMINENTE - ALARME ATIVO!",
        "statusTriggeredDesc": "Alarme de emergência disparado! Sirenes, cortes automáticos e notificações em curso.",
        "statusSilenced": "Alarmes Silenciados",
        "statusSilencedDesc": "Sirenes acústicas temporariamente silenciadas. A monitorização 24/7 continua ativa!",
        "statusTesting": "Modo de Teste & Manutenção",
        "statusTestingDesc": "Modo de manutenção ativo: sirenes e cortes de emergência estão temporariamente desativados.",
        "testModeActiveTitle": "Modo de Teste & Manutenção está ATIVO",
        "testModeActiveDesc": "Sirenes e cortes desativados. Pode agora testar os seus sensores em segurança:",
        "btnDrillAll": "Todos os sensores: Simulação de alarme",
        "btnSelfTestAll": "Todos os sensores: Autoteste",
        "btnSilence": "Silenciar sirenes",
        "btnSilenceAgain": "Silenciar novamente",
        "btnReset": "Confirmar / Redefinir",
        "btnTestMode": "Modo de Teste",
        "btnExitTestMode": "Sair do modo de teste",
        "btnManualTrigger": "Disparar alarme de emergência",
        "confirmManualTrigger": "Tem a certeza de que deseja disparar manualmente toda a sequência de alarme de emergência?",
        "activeHazardsTitle": "Alertas de perigo ativos",
        "noActiveHazards": "Nenhum alerta de perigo ativo de momento.",
        "eventHistoryTitle": "Registo de eventos",
        "noEvents": "Nenhum evento registado até ao momento.",
        "historyFilterType": "Tipo de evento:",
        "historyFilterTime": "Período:",
        "historyTime24h": "Máx. 24 horas",
        "historyTime1h": "Última 1 hora",
        "historyTime6h": "Últimas 6 horas",
        "historyTime12h": "Últimas 12 horas",
        "historyTime3d": "Últimos 3 dias",
        "historyTimeAll": "Todo o histórico",
        "historyTypeAll": "Todos os tipos de evento",
        "historyTypeAlarms": "🚨 Alarmes & Perigos",
        "historyTypeSilenced": "🔕 Silenciados",
        "historyTypeReset": "✅ Confirmação & Fim de alerta",
        "historyTypeSelfTestAll": "🧪 Autotestes (Todos)",
        "historyTypeSelfTestFailed": "❌ Falha no autoteste",
        "historyTypeSelfTestSuccess": "✅ Autoteste com sucesso",
        "historyTypeDrills": "🔔 Simulações de alarme",
        "historyTypeTestMode": "🛡️ Modo de Teste",
        "historyTypeBattery": "🪫 Bateria fraca",
        "historyTypeOffline": "📡 Sensor Offline / Online",
        "historyTypeIgnored": "🙈 Ignorado / Reativado",
        "historyNoMatchingEvents": "Nenhum evento corresponde aos filtros selecionados.",
        "historyShowAllEvents": "Mostrar todos os eventos",
        "historyCountBadge": "{filtered} de {total} eventos",
        "lblHistoryDefaultTime": "Período padrão no registo de eventos:",
        "searchSensorsPlaceholder": "Procurar sensores...",
        "searchCandidatesPlaceholder": "Filtrar sensores de risco...",
        "filterAll": "Todos",
        "filterAllTypes": "Todos os tipos",
        "noMatchingCandidates": "Nenhum sensor de risco corresponde ao filtro.",
        "btnAddSensor": "Adicionar sensor",
        "btnAddZone": "Adicionar zona",
        "btnAddAction": "Adicionar ação",
        "candidateBanner": "{count} sensor(es) compatível(eis) encontrado(s) no Home Assistant:",
        "addCandidate": "Monitorizar",
        "thSensor": "Sensor",
        "thZone": "Zona",
        "thType": "Tipo de perigo",
        "thPreAlarm": "Atraso pré-alarme",
        "thFeatures": "Recursos",
        "thStatus": "Estado",
        "thActions": "Ações",
        "typeSmoke": "Fumo",
        "typeMoisture": "Fuga de água",
        "typeGas": "Gás",
        "typeCO": "Monóxido de carbono (CO)",
        "typeHeat": "Calor",
        "typeGeneric": "Genérico",
        "phaseCutoff": "Fase 1: Corte de emergência",
        "phaseCutoffDesc": "Fecho imediato de válvulas principais, paragem de ventilação ou abertura de saídas de emergência.",
        "phaseNotification": "Fase 2: Notificações prioritárias",
        "phaseNotificationDesc": "Notificações push críticas com prioridade máxima para dispositivos móveis.",
        "phaseAcoustic": "Fase 3: Acústica & Ótica",
        "phaseAcousticDesc": "Ativação de sirenes sonoras, iluminação de emergência vermelha e anúncios de voz TTS.",
        "phaseRestore": "Fase 4: Restauração & Fim de perigo (Pós-alarme)",
        "phaseRestoreDesc": "Executado após redefinir o alarme: restauração da iluminação, reinício da ventilação ou push de fim de perigo.",
        "phaseSystem": "Fase 5: Manutenção & Avisos do sistema (Bateria, Offline & Autoteste)",
        "phaseSystemDesc": "Ativado em caso de bateria fraca (< 15%), sensor offline ou falha no autoteste.",
        "presetSystem": "🛠️ Alerta de sistema",
        "presetSelfTestFailed": "🧪 Falha no autoteste",
        "eventBatteryLow": "Bateria fraca",
        "eventSensorOffline": "Sensor offline",
        "eventSelfTestFailed": "Falha no autoteste",
        "actionSystemEvents": "Disparar para os seguintes eventos:",
        "testAction": "Testar",
        "edit": "Editar",
        "delete": "Eliminar",
        "save": "Guardar",
        "cancel": "Cancelar",
        "settingsTitle": "Configurações globais do sistema",
        "lblTestDuration": "Duração do modo de teste (minutos):",
        "lblSilenceDuration": "Duração do silêncio (minutos):",
        "lblDoubleKnockTimeout": "Tempo de dupla verificação global (segundos):",
        "lblOfflineAlerts": "Alertar sobre sensores offline / indisponíveis",
        "lblBatteryAlerts": "Alertar sobre bateria baixa (< 15%)",
        "zonesTitle": "Zonas de perigo & Divisões",
        "zoneName": "Nome da zona",
        "doubleKnockEnabled": "Verificação multi-sensor (Double-Knock)",
        "doubleKnockHelp": "Requer confirmação de um 2º sensor na zona antes do alarme completo disparar.",
        "autoAckHelp": "Redefine automaticamente o alarme quando o sensor regressa ao estado OFF.",
        "linkedShutoffs": "Atuadores de corte associados (ex. valve.agua_geral, fan.ventilacao):",
        "preAlarmDelaySec": "Atraso de pré-alarme (segundos, 0 = imediato):",
        "actionService": "Serviço do Home Assistant:",
        "actionTarget": "Entidade de destino:",
        "actionPayload": "Dados do serviço (Payload):",
        "actionTriggerTypes": "Disparar para os seguintes perigos:",
        "toggleMenu": "Alternar barra lateral do Home Assistant",
        "targetPlaceholder": "ex. valve.agua_geral, siren.alarme",
        "targetHelp": "Escreva para procurar entidades (válvulas, sirenes, interruptores, luzes, etc.). No notify.notify o destino é opcional.",
        "targetPreviewTitle": "Pré-visualização da entidade de destino:",
        "serviceSelectLabel": "Serviços disponíveis para a entidade:",
        "serviceCustomOption": "✏️ Serviço personalizado / manual...",
        "serviceHelp": "Selecione um serviço apropriado para a entidade ou introduza manualmente.",
        "payloadHelpTitle": "Guia de formato (Dados do serviço)",
        "payloadHelpDesc": "Introduza como objeto JSON { \"chave\": \"valor\" }. Para válvulas/interruptores normais basta {}.",
        "presetsTitle": "Modelos rápidos:",
        "variablesTitle": "Variáveis dinâmicas (clique para inserir):",
        "presetEmpty": "🔘 Vazio ({})",
        "presetNotify": "📱 Notificação push",
        "presetCritical": "🚨 Alarme push crítico",
        "presetRedLight": "💡 Luz vermelha de emergência",
        "presetSiren": "🔊 Volume da sirene",
        "presetAllClear": "✅ Push de fim de perigo",
        "presetScript": "📜 Variáveis de script",
        "actionRepeat": "Repetição durante alarme (segundos, 0 = uma vez):",
        "actionRepeatHelp": "Repete esta ação a cada X segundos enquanto o alarme estiver ativo. 0 = executa uma vez.",
        "validJson": "✅ JSON válido",
        "invalidJson": "❌ JSON inválido",
        "entityNotFoundInHA": "Não encontrado no registo de estados do HA",
        "silenceEntity": "Entidade de silenciamento (Botão/Interruptor):",
        "silenceEntityHelp": "Opcional: Botão/interruptor físico para silenciar a sirene do dispositivo.",
        "drillEntity": "Entidade de simulação de alarme (Botão):",
        "drillEntityHelp": "Opcional: Dispara simulação de evacuação ou teste no sensor.",
        "testEntity": "Entidade de autoteste (Botão):",
        "testEntityHelp": "Opcional: Executa autoteste interno de diagnóstico no sensor.",
        "batteryEntity": "Entidade de bateria (Sensor):",
        "batteryEntityHelp": "Opcional: Sensor de percentagem da bateria (detetado automaticamente se vazio).",
        "btnSelfTest": "🧪 Autoteste",
        "btnDrill": "🔔 Simulação",
        "btnMuteSensor": "🔕 Silenciar sensor",
        "btnIgnoreSensor": "🙈 Ignorar alerta",
        "btnUnignoreSensor": "👁️ Reativar",
        "badgeIgnored": "🙈 Ignorado (até regressar a OFF)",
        "batteryWarning": "Aviso de bateria fraca em sensores de segurança",
        "batteryStatus": "Bateria",
        "mainsPowered": "⚡ Ligado à corrente",
        "testResultEntity": "Entidade de resultado do autoteste (Sensor):",
        "testResultEntityHelp": "Opcional: Sensor que indica o resultado do autoteste (ex. valor 'sucesso' ou data/hora).",
        "btnStartSequentialSelfTest": "Iniciar autoteste sequencial",
        "btnCancelSelfTest": "Cancelar autoteste",
        "selectDrillSensorPlaceholder": "-- Selecionar sensor para simulação --",
        "btnDrillSingle": "Iniciar simulação",
        "drillSensorHelp": "Selecione um sensor específico para acionar a simulação nesse dispositivo.",
        "autoSelfTestTitle": "Autoteste periódico automático",
        "autoSelfTestDesc": "Executa mensalmente um autoteste sequencial em modo de teste num dia escolhido e verifica os resultados. Se falhar, envia notificação.",
        "lblAutoSelfTestEnabled": "Executar mensalmente autoteste automático em todos os sensores",
        "lblAutoSelfTestDay": "Dia do mês (1-31):",
        "lblAutoSelfTestTime": "Hora (HH:MM):",
        "lblAutoSelfTestStep": "Espera por sensor (segundos):",
        "lblAutoSelfTestNotify": "Enviar notificação se sensores falharem (Fase 5)",
        "selfTestStatusTitle": "Estado do autoteste",
        "selfTestProgress": "Progresso: Sensor {current} de {total}",
        "selfTestPassed": "Aprovado",
        "selfTestFailed": "Falhou",
        "selfTestPending": "Pendente",
        "selfTestTesting": "A testar...",
        "lblLanguage": "Idioma:",
        "langAuto": "Automático (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Alarme",
        "badgeSilenced": "Silenciado",
        "badgeAllClear": "Fim de alerta",
        "badgeFailed": "Falhou",
        "badgePassed": "Aprovado",
        "badgeDrill": "Simulacro",
        "badgeSelfTest": "Autoteste",
        "badgeTestMode": "Modo de teste",
        "badgeBattery": "Bateria",
        "badgeOffline": "Offline",
        "badgeOnline": "Online",
        "badgeReactivated": "Reativado",
        "saving": "A guardar...",
        "saved": "Guardado",
        "yes": "Sim",
        "no": "Não"
    },
    "ru": {
        "appName": "Safety Monitor",
        "subtitle": "Круглосуточный мониторинг безопасности (Дым, Вода, Газ, CO)",
        "tabOverview": "Обзор & Статус",
        "tabSensors": "Датчики",
        "tabActions": "Аварийные действия",
        "tabSettings": "Зоны & Настройки",
        "statusNormal": "Всё в безопасности",
        "statusNormalDesc": "Все контролируемые датчики в норме. Мониторинг безопасности 24/7 активен.",
        "statusPreAlarm": "Предварительная тревога / Проверка",
        "statusPreAlarmDesc": "Обнаружена возможная угроза! Идёт обратный отсчёт перед запуском основных сирен.",
        "statusTriggered": "ПРЯМАЯ ОПАСНОСТЬ - ТРЕВОГА АКТИВНА!",
        "statusTriggeredDesc": "Основная тревога включена! Работают сирены, аварийные отключения и оповещения.",
        "statusSilenced": "Сирены заглушены",
        "statusSilencedDesc": "Звуковые сирены временно отключены. Мониторинг безопасности 24/7 остаётся активным!",
        "statusTesting": "Режим тестирования и обслуживания",
        "statusTestingDesc": "Режим обслуживания: сирены и аварийные отключения временно подавлены.",
        "testModeActiveTitle": "Режим тестирования АКТИВЕН",
        "testModeActiveDesc": "Сирены и аварийные отключения подавлены. Теперь можно безопасно проверить датчики:",
        "btnDrillAll": "Все датчики: Учебная тревога",
        "btnSelfTestAll": "Все датчики: Самопроверка",
        "btnSilence": "Заглушить сирены",
        "btnSilenceAgain": "Заглушить повторно",
        "btnReset": "Подтвердить / Сбросить",
        "btnTestMode": "Режим теста",
        "btnExitTestMode": "Выйти из режима теста",
        "btnManualTrigger": "Активировать аварийную тревогу",
        "confirmManualTrigger": "Вы действительно хотите вручную запустить полную последовательность аварийной тревоги?",
        "activeHazardsTitle": "Активные сигналы опасности",
        "noActiveHazards": "В данный момент активных угроз нет.",
        "eventHistoryTitle": "Журнал событий",
        "noEvents": "Событий пока не зарегистрировано.",
        "historyFilterType": "Тип события:",
        "historyFilterTime": "Период:",
        "historyTime24h": "Макс. 24 часа",
        "historyTime1h": "Последний 1 час",
        "historyTime6h": "Последние 6 часов",
        "historyTime12h": "Последние 12 часов",
        "historyTime3d": "Последние 3 дня",
        "historyTimeAll": "Вся история",
        "historyTypeAll": "Все типы событий",
        "historyTypeAlarms": "🚨 Тревоги & Опасности",
        "historyTypeSilenced": "🔕 Заглушено",
        "historyTypeReset": "✅ Сброс & Отбой",
        "historyTypeSelfTestAll": "🧪 Самопроверки (Все)",
        "historyTypeSelfTestFailed": "❌ Ошибка самопроверки",
        "historyTypeSelfTestSuccess": "✅ Самопроверка успешна",
        "historyTypeDrills": "🔔 Учебные тревоги",
        "historyTypeTestMode": "🛡️ Режим теста",
        "historyTypeBattery": "🪫 Разряженная батарея",
        "historyTypeOffline": "📡 Датчик Офлайн / Онлайн",
        "historyTypeIgnored": "🙈 Игнорируется / Восстановлен",
        "historyNoMatchingEvents": "Нет событий, соответствующих критериям фильтра.",
        "historyShowAllEvents": "Показать все события",
        "historyCountBadge": "{filtered} из {total} событий",
        "lblHistoryDefaultTime": "Период по умолчанию в журнале:",
        "searchSensorsPlaceholder": "Поиск датчиков...",
        "searchCandidatesPlaceholder": "Фильтр датчиков опасности...",
        "filterAll": "Все",
        "filterAllTypes": "Все типы",
        "noMatchingCandidates": "Нет датчиков, соответствующих фильтру.",
        "btnAddSensor": "Добавить датчик",
        "btnAddZone": "Добавить зону",
        "btnAddAction": "Добавить действие",
        "candidateBanner": "Обнаружено совместимых датчиков в Home Assistant: {count}",
        "addCandidate": "Мониторить",
        "thSensor": "Датчик",
        "thZone": "Зона",
        "thType": "Тип опасности",
        "thPreAlarm": "Задержка предтревоги",
        "thFeatures": "Свойства",
        "thStatus": "Состояние",
        "thActions": "Действия",
        "typeSmoke": "Дым",
        "typeMoisture": "Протечка воды",
        "typeGas": "Газ",
        "typeCO": "Угарный газ (CO)",
        "typeHeat": "Тепло / Перегрев",
        "typeGeneric": "Общее",
        "phaseCutoff": "Фаза 1: Аварийное отключение",
        "phaseCutoffDesc": "Немедленное закрытие главных кранов, отключение вентиляции или открытие путей эвакуации.",
        "phaseNotification": "Фаза 2: Приоритетные уведомления",
        "phaseNotificationDesc": "Критичные push-уведомления со звуковым обходом беззвучного режима на телефоны.",
        "phaseAcoustic": "Фаза 3: Акустика & Оптика",
        "phaseAcousticDesc": "Включение мощных сирен, красного аварийного света и голосовых сообщений TTS.",
        "phaseRestore": "Фаза 4: Отбой & Восстановление (После тревоги)",
        "phaseRestoreDesc": "Выполняется после сброса тревоги: восстановление света, перезапуск вентиляции или оповещение о безопасности.",
        "phaseSystem": "Фаза 5: Обслуживание & Системные оповещения (Батарея, Офлайн & Тест)",
        "phaseSystemDesc": "Срабатывает при низком заряде батареи (< 15%), отключении датчика или сбое самопроверки.",
        "presetSystem": "🛠️ Системное оповещение",
        "presetSelfTestFailed": "🧪 Ошибка самопроверки",
        "eventBatteryLow": "Низкий заряд батареи",
        "eventSensorOffline": "Датчик отключён (офлайн)",
        "eventSelfTestFailed": "Сбой самопроверки",
        "actionSystemEvents": "Запускать при следующих системных событиях:",
        "testAction": "Тест",
        "edit": "Изменить",
        "delete": "Удалить",
        "save": "Сохранить",
        "cancel": "Отмена",
        "settingsTitle": "Общие настройки системы",
        "lblTestDuration": "Длительность тестового режима (минут):",
        "lblSilenceDuration": "Длительность заглушения сирен (минут):",
        "lblDoubleKnockTimeout": "Глобальный таймаут двойного подтверждения (секунд):",
        "lblOfflineAlerts": "Оповещать об отключённых / недоступных датчиках",
        "lblBatteryAlerts": "Оповещать о низком заряде батареи (< 15%)",
        "zonesTitle": "Зоны опасности & Комнаты",
        "zoneName": "Название зоны",
        "doubleKnockEnabled": "Проверка несколькими датчиками (Double-Knock)",
        "doubleKnockHelp": "Требует срабатывания второго датчика в зоне перед включением полной тревоги.",
        "autoAckHelp": "Автоматически сбрасывать тревогу, как только датчик вернётся в состояние OFF.",
        "linkedShutoffs": "Связанные исполнительные устройства (напр. valve.voda, fan.vytyazhka):",
        "preAlarmDelaySec": "Задержка предварительной тревоги (секунд, 0 = сразу):",
        "actionService": "Служба Home Assistant:",
        "actionTarget": "Целевой объект (Target):",
        "actionPayload": "Параметры службы (Payload):",
        "actionTriggerTypes": "Срабатывать при следующих типах опасности:",
        "toggleMenu": "Переключить боковое меню Home Assistant",
        "targetPlaceholder": "напр. valve.voda, siren.alarm",
        "targetHelp": "Начните вводить для поиска объектов (краны, сирены, выключатели, свет). Для notify.notify цель не обязательна.",
        "targetPreviewTitle": "Предпросмотр целевого объекта:",
        "serviceSelectLabel": "Доступные службы для объекта:",
        "serviceCustomOption": "✏️ Вручную / Другая служба...",
        "serviceHelp": "Выберите подходящую службу или введите её вручную (напр. valve.close_valve).",
        "payloadHelpTitle": "Формат параметров (Service Data)",
        "payloadHelpDesc": "Введите как JSON-объект { \"key\": \"value\" }. Для стандартных выключателей/кранов достаточно {}.",
        "presetsTitle": "Быстрые шаблоны:",
        "variablesTitle": "Динамические переменные (нажмите для вставки):",
        "presetEmpty": "🔘 Пусто ({})",
        "presetNotify": "📱 Push-уведомление",
        "presetCritical": "🚨 Экстренный push-сигнал",
        "presetRedLight": "💡 Красный аварийный свет",
        "presetSiren": "🔊 Громкость сирены",
        "presetAllClear": "✅ Уведомление об отбое",
        "presetScript": "📜 Переменные скрипта",
        "actionRepeat": "Повторение во время тревоги (секунд, 0 = однократно):",
        "actionRepeatHelp": "Повторяет действие каждые X секунд, пока длится тревога. 0 = однократный запуск.",
        "validJson": "✅ Корректный JSON",
        "invalidJson": "❌ Некорректный JSON",
        "entityNotFoundInHA": "Не найдено в реестре состояний HA",
        "silenceEntity": "Объект заглушения (Кнопка/Переключатель):",
        "silenceEntityHelp": "Опционально: Кнопка на датчике для отключения звука на самом устройстве.",
        "drillEntity": "Объект учебной тревоги (Кнопка):",
        "drillEntityHelp": "Опционально: Запускает проверку оповещения или учебную тревогу.",
        "testEntity": "Объект самопроверки (Кнопка):",
        "testEntityHelp": "Опционально: Запускает внутреннюю диагностику датчика.",
        "batteryEntity": "Объект батареи (Датчик):",
        "batteryEntityHelp": "Опционально: Датчик процента заряда (определяется автоматически, если пусто).",
        "btnSelfTest": "🧪 Самопроверка",
        "btnDrill": "🔔 Учебная тревога",
        "btnMuteSensor": "🔕 Заглушить датчик",
        "btnIgnoreSensor": "🙈 Временно игнорировать",
        "btnUnignoreSensor": "👁️ Возобновить",
        "badgeIgnored": "🙈 Игнорируется (до возврата в норму)",
        "batteryWarning": "Низкий заряд батареи на датчиках безопасности",
        "batteryStatus": "Батарея",
        "mainsPowered": "⚡ Сеть 220V",
        "testResultEntity": "Объект результата самопроверки (Датчик):",
        "testResultEntityHelp": "Опционально: Датчик результата самопроверки (напр. значение 'успех' или время).",
        "btnStartSequentialSelfTest": "Запустить поочерёдную самопроверку",
        "btnCancelSelfTest": "Отменить самопроверку",
        "selectDrillSensorPlaceholder": "-- Выберите датчик для учебной тревоги --",
        "btnDrillSingle": "Запустить учебную тревогу",
        "drillSensorHelp": "Выберите конкретный датчик для запуска учебной тревоги на нём.",
        "autoSelfTestTitle": "Автоматическая периодическая самопроверка",
        "autoSelfTestDesc": "Раз в месяц в выбранный день поочерёдно тестирует все датчики и сверяет результат. При неполадках высылает уведомление.",
        "lblAutoSelfTestEnabled": "Автоматически проводить ежемесячную самопроверку всех датчиков",
        "lblAutoSelfTestDay": "День месяца (1-31):",
        "lblAutoSelfTestTime": "Время (ЧЧ:ММ):",
        "lblAutoSelfTestStep": "Интервал между датчиками (секунд):",
        "lblAutoSelfTestNotify": "Отправлять уведомление при сбое самопроверки (Фаза 5)",
        "selfTestStatusTitle": "Статус самопроверки",
        "selfTestProgress": "Прогресс: Датчик {current} из {total}",
        "selfTestPassed": "Пройден",
        "selfTestFailed": "Сбой",
        "selfTestPending": "Ожидание",
        "selfTestTesting": "Проверяется...",
        "lblLanguage": "Язык:",
        "langAuto": "Автоматически (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Тревога",
        "badgeSilenced": "Заглушено",
        "badgeAllClear": "Отбой",
        "badgeFailed": "Сбой",
        "badgePassed": "Пройден",
        "badgeDrill": "Учебная тревога",
        "badgeSelfTest": "Самопроверка",
        "badgeTestMode": "Режим теста",
        "badgeBattery": "Батарея",
        "badgeOffline": "Офлайн",
        "badgeOnline": "Онлайн",
        "badgeReactivated": "Восстановлен",
        "saving": "Сохранение...",
        "saved": "Сохранено",
        "yes": "Да",
        "no": "Нет"
    },
    "sv": {
        "appName": "Safety Monitor",
        "subtitle": "24/7 Säkerhets- & Riskövervakning (Rök, Vatten, Gas, CO)",
        "tabOverview": "Översikt & Status",
        "tabSensors": "Sensorer",
        "tabActions": "Nödåtgärder",
        "tabSettings": "Zoner & Inställningar",
        "statusNormal": "Allt säkert & normalt",
        "statusNormalDesc": "Alla övervakade sensorer är normala. Säkerhetsövervakningen 24/7 är aktiv.",
        "statusPreAlarm": "Förlarm / Verifiering",
        "statusPreAlarmDesc": "Möjlig fara upptäckt! Nedräkning pågår innan huvudsirener utlöses.",
        "statusTriggered": "AKUT FARA - LARM AKTIVT!",
        "statusTriggeredDesc": "Nödlarm utlöst! Sirener, nödavstängningar och aviseringar pågår.",
        "statusSilenced": "Larm tystat",
        "statusSilencedDesc": "Akustiska sirener tillfälligt tystade. Riskövervakningen 24/7 förblir aktiv!",
        "statusTesting": "Test- & Underhållsläge",
        "statusTestingDesc": "Underhållsläge aktivt: sirener och nödavstängningar är tillfälligt avstängda.",
        "testModeActiveTitle": "Test- & Underhållsläge är AKTIVT",
        "testModeActiveDesc": "Sirener och avstängningar är avaktiverade. Du kan nu testa detektorer säkert:",
        "btnDrillAll": "Alla detektorer: Larmövning",
        "btnSelfTestAll": "Alla detektorer: Självtest",
        "btnSilence": "Tysta sirener",
        "btnSilenceAgain": "Tysta igen",
        "btnReset": "Kvittera / Återställ",
        "btnTestMode": "Testläge",
        "btnExitTestMode": "Avsluta testläge",
        "btnManualTrigger": "Utlös nödlarm",
        "confirmManualTrigger": "Är du säker på att du vill utlösa hela larmsekvensen manuellt?",
        "activeHazardsTitle": "Aktiva larmvarningar",
        "noActiveHazards": "Inga aktiva larmvarningar för närvarande.",
        "eventHistoryTitle": "Händelselogg",
        "noEvents": "Inga händelser har loggats ännu.",
        "historyFilterType": "Typ av händelse:",
        "historyFilterTime": "Tidsperiod:",
        "historyTime24h": "Max. 24 timmar",
        "historyTime1h": "Senaste 1 timmen",
        "historyTime6h": "Senaste 6 timmarna",
        "historyTime12h": "Senaste 12 timmarna",
        "historyTime3d": "Senaste 3 dagarna",
        "historyTimeAll": "Hela historiken",
        "historyTypeAll": "Alla händelsetyper",
        "historyTypeAlarms": "🚨 Larm & Risker",
        "historyTypeSilenced": "🔕 Tystade",
        "historyTypeReset": "✅ Kvittering & Faran över",
        "historyTypeSelfTestAll": "🧪 Självtester (Alla)",
        "historyTypeSelfTestFailed": "❌ Självtest misslyckades",
        "historyTypeSelfTestSuccess": "✅ Självtest godkänt",
        "historyTypeDrills": "🔔 Larmövningar",
        "historyTypeTestMode": "🛡️ Testläge",
        "historyTypeBattery": "🪫 Svagt batteri",
        "historyTypeOffline": "📡 Detektor Offline / Online",
        "historyTypeIgnored": "🙈 Ignorerad / Återaktiverad",
        "historyNoMatchingEvents": "Inga händelser matchar det valda filtret.",
        "historyShowAllEvents": "Visa alla händelser",
        "historyCountBadge": "{filtered} av {total} händelser",
        "lblHistoryDefaultTime": "Standardperiod i händelseloggen:",
        "searchSensorsPlaceholder": "Sök sensorer...",
        "searchCandidatesPlaceholder": "Filtrera risksensorer...",
        "filterAll": "Alla",
        "filterAllTypes": "Alla typer",
        "noMatchingCandidates": "Inga risksensorer matchar filtret.",
        "btnAddSensor": "Lägg till sensor",
        "btnAddZone": "Lägg till zon",
        "btnAddAction": "Lägg till åtgärd",
        "candidateBanner": "{count} kompatibla risksensor(er) upptäcktes i Home Assistant:",
        "addCandidate": "Övervaka",
        "thSensor": "Sensor",
        "thZone": "Zon",
        "thType": "Risktyp",
        "thPreAlarm": "Förlarmsfördröjning",
        "thFeatures": "Egenskaper",
        "thStatus": "Status",
        "thActions": "Åtgärder",
        "typeSmoke": "Rök",
        "typeMoisture": "Vattenläcka",
        "typeGas": "Gas",
        "typeCO": "Kolmonoxid (CO)",
        "typeHeat": "Värme",
        "typeGeneric": "Generisk",
        "phaseCutoff": "Fas 1: Nödavstängning (Cutoff)",
        "phaseCutoffDesc": "Omedelbar stängning av huvudventiler, avstängning av ventilation eller öppning av utrymningsvägar.",
        "phaseNotification": "Fas 2: Prioriterade aviseringar",
        "phaseNotificationDesc": "Kritiska push-meddelanden som åsidosätter ljudlöst läge till mobiler.",
        "phaseAcoustic": "Fas 3: Akustisk & Optisk",
        "phaseAcousticDesc": "Aktivera kraftiga sirener, röd nödbelysning och TTS-röstmeddelanden.",
        "phaseRestore": "Fas 4: Faran över & Återställning (Efter larm)",
        "phaseRestoreDesc": "Körs vid larmåterställning: återställ belysning, starta om ventilation eller skicka faran-över-avisering.",
        "phaseSystem": "Fas 5: Underhåll & Systemvarningar (Batteri, Offline & Självtest)",
        "phaseSystemDesc": "Utlöses vid svagt batteri (< 15%), frånkopplad detektor eller misslyckat självtest.",
        "presetSystem": "🛠️ Systemvarning",
        "presetSelfTestFailed": "🧪 Självtestfel",
        "eventBatteryLow": "Svagt batteri",
        "eventSensorOffline": "Detektor offline",
        "eventSelfTestFailed": "Självtest misslyckades",
        "actionSystemEvents": "Utlös vid följande systemhändelser:",
        "testAction": "Testa",
        "edit": "Redigera",
        "delete": "Ta bort",
        "save": "Spara",
        "cancel": "Avbryt",
        "settingsTitle": "Globala systeminställningar",
        "lblTestDuration": "Testlägets varaktighet (minuter):",
        "lblSilenceDuration": "Tystnadens varaktighet (minuter):",
        "lblDoubleKnockTimeout": "Global timeout för dubbelverifiering (sekunder):",
        "lblOfflineAlerts": "Varna vid frånkopplade / offline sensorer",
        "lblBatteryAlerts": "Varna vid svagt sensorbatteri (< 15%)",
        "zonesTitle": "Riskzoner & Rum",
        "zoneName": "Zonnamn",
        "doubleKnockEnabled": "Verifiering med flera sensorer (Double-Knock)",
        "doubleKnockHelp": "Kräver bekräftelse från en 2:a sensor i zonen innan fullt larm utlöses.",
        "autoAckHelp": "Återställer larmet automatiskt så snart sensorn återgår till OFF-läge.",
        "linkedShutoffs": "Kopplade stängningsenheter (t.ex. valve.huvudvatten, fan.ventilation):",
        "preAlarmDelaySec": "Förlarmsfördröjning (sekunder, 0 = omedelbart):",
        "actionService": "Home Assistant-tjänst:",
        "actionTarget": "Målenhet:",
        "actionPayload": "Tjänstdata (Payload):",
        "actionTriggerTypes": "Utlös vid följande risktyper:",
        "toggleMenu": "Växla Home Assistant-sidomenyn",
        "targetPlaceholder": "t.ex. valve.huvudvatten, siren.alarm",
        "targetHelp": "Skriv för att söka efter enheter (ventiler, sirener, brytare, lampor osv.). För notify.notify är målenhet valfri.",
        "targetPreviewTitle": "Förhandsvisning av målenhet:",
        "serviceSelectLabel": "Tillgängliga tjänster för enheten:",
        "serviceCustomOption": "✏️ Manuell / Anpassad tjänst...",
        "serviceHelp": "Välj en tjänst som matchar enheten ovan eller ange manuellt.",
        "payloadHelpTitle": "Formatguide (Tjänstdata)",
        "payloadHelpDesc": "Ange som JSON-objekt { \"nyckel\": \"värde\" }. För standardventiler och brytare räcker det med {}.",
        "presetsTitle": "Snabbmallar:",
        "variablesTitle": "Dynamiska variabler (klicka för att infoga):",
        "presetEmpty": "🔘 Tom ({})",
        "presetNotify": "📱 Push-avisering",
        "presetCritical": "🚨 Kritiskt nödlarm push",
        "presetRedLight": "💡 Rött nödljus",
        "presetSiren": "🔊 Sirenvolym",
        "presetAllClear": "✅ Faran-över-avisering",
        "presetScript": "📜 Skriptvariabler",
        "actionRepeat": "Repetitionsslinga under larm (sekunder, 0 = en gång):",
        "actionRepeatHelp": "Upprepar denna åtgärd var X:e sekund så länge larmet är aktivt. 0 = kör endast en gång.",
        "validJson": "✅ Giltig JSON",
        "invalidJson": "❌ Ogiltig JSON",
        "entityNotFoundInHA": "Hittades inte i HA-tillståndsregistret",
        "silenceEntity": "Tystningsenhet (Knapp/Brytare):",
        "silenceEntityHelp": "Valfritt: Knapp på detektorn för att tysta enhetens fysiska larm.",
        "drillEntity": "Larmövningsenhet (Knapp):",
        "drillEntityHelp": "Valfritt: Utlöser nätverkstest eller larmövning på detektorn.",
        "testEntity": "Självtestenhet (Knapp):",
        "testEntityHelp": "Valfritt: Kör internt självtest på detektorn.",
        "batteryEntity": "Batterienhet (Sensor):",
        "batteryEntityHelp": "Valfritt: Sensor för batteriprocent (identifieras automatiskt om tomt).",
        "btnSelfTest": "🧪 Självtest",
        "btnDrill": "🔔 Övning",
        "btnMuteSensor": "🔕 Tysta detektor",
        "btnIgnoreSensor": "🙈 Ignorera varning",
        "btnUnignoreSensor": "👁️ Återaktivera",
        "badgeIgnored": "🙈 Ignorerad (tills återställd)",
        "batteryWarning": "Varning för svagt batteri på risksensorer",
        "batteryStatus": "Batteri",
        "mainsPowered": "⚡ Nätdrift",
        "testResultEntity": "Självtest-resultatenhet (Sensor):",
        "testResultEntityHelp": "Valfritt: Sensor som rapporterar självtestresultat (t.ex. värde 'framgång' eller tidsstämpel).",
        "btnStartSequentialSelfTest": "Starta sekventiellt självtest",
        "btnCancelSelfTest": "Avbryt självtest",
        "selectDrillSensorPlaceholder": "-- Välj detektor för larmövning --",
        "btnDrillSingle": "Starta larmövning",
        "drillSensorHelp": "Välj en specifik detektor för att utlösa övningen på den enheten.",
        "autoSelfTestTitle": "Automatiskt periodiskt självtest",
        "autoSelfTestDesc": "Kör sekventiellt självtest i testläge på en vald dag varje månad och verifierar resultat. Vid fel skickas avisering.",
        "lblAutoSelfTestEnabled": "Kör automatiskt månatligt självtest av alla detektorer",
        "lblAutoSelfTestDay": "Dag i månaden (1-31):",
        "lblAutoSelfTestTime": "Tid (TT:MM):",
        "lblAutoSelfTestStep": "Väntetid per detektor (sekunder):",
        "lblAutoSelfTestNotify": "Skicka avisering om detektorer misslyckas (Fas 5)",
        "selfTestStatusTitle": "Självtest-status",
        "selfTestProgress": "Framsteg: Detektor {current} av {total}",
        "selfTestPassed": "Godkänd",
        "selfTestFailed": "Misslyckades",
        "selfTestPending": "Väntar",
        "selfTestTesting": "Testas...",
        "lblLanguage": "Språk:",
        "langAuto": "Automatiskt (Home Assistant)",
        "langEn": "English",
        "langDe": "Deutsch",
        "langFr": "Français",
        "langEs": "Español",
        "langIt": "Italiano",
        "langNl": "Nederlands",
        "langPl": "Polski",
        "langPt": "Português",
        "langRu": "Русский",
        "langSv": "Svenska",
        "badgeAlarm": "Larm",
        "badgeSilenced": "Tystad",
        "badgeAllClear": "Faran över",
        "badgeFailed": "Misslyckades",
        "badgePassed": "Godkänd",
        "badgeDrill": "Larmövning",
        "badgeSelfTest": "Självtest",
        "badgeTestMode": "Testläge",
        "badgeBattery": "Batteri",
        "badgeOffline": "Offline",
        "badgeOnline": "Online",
        "badgeReactivated": "Återaktiverad",
        "saving": "Sparar...",
        "saved": "Sparat",
        "yes": "Ja",
        "no": "Nej"
    }
};

  const STANDARD_SERVICES = {
    valve: [
      { service: "valve.close_valve", label: "Ventil schließen (Notabschaltung)", icon: "🚪", recommended: true },
      { service: "valve.open_valve", label: "Ventil öffnen", icon: "💧" },
      { service: "valve.toggle", label: "Ventil umschalten", icon: "🔄" },
      { service: "homeassistant.turn_off", label: "Gerät ausschalten", icon: "🔌" },
    ],
    switch: [
      { service: "switch.turn_off", label: "Ausschalten (Strom trennen)", icon: "🔌", recommended: true },
      { service: "switch.turn_on", label: "Einschalten", icon: "⚡" },
      { service: "switch.toggle", label: "Umschalten", icon: "🔄" },
    ],
    input_boolean: [
      { service: "input_boolean.turn_off", label: "Ausschalten", icon: "🔌", recommended: true },
      { service: "input_boolean.turn_on", label: "Einschalten", icon: "⚡" },
      { service: "input_boolean.toggle", label: "Umschalten", icon: "🔄" },
    ],
    fan: [
      { service: "fan.turn_off", label: "Lüfter ausschalten (Rauchstopp)", icon: "🌀", recommended: true },
      { service: "fan.turn_on", label: "Lüfter einschalten", icon: "💨" },
      { service: "fan.toggle", label: "Umschalten", icon: "🔄" },
    ],
    cover: [
      { service: "cover.open_cover", label: "Rollladen öffnen (Fluchtweg)", icon: "🪟", recommended: true },
      { service: "cover.close_cover", label: "Rollladen schließen", icon: "🔒" },
      { service: "cover.stop_cover", label: "Rollladen stoppen", icon: "⏹️" },
    ],
    siren: [
      { service: "siren.turn_on", label: "Sirene einschalten (Alarm)", icon: "🚨", recommended: true },
      { service: "siren.turn_off", label: "Sirene ausschalten", icon: "🔕" },
      { service: "siren.toggle", label: "Sirene umschalten", icon: "🔄" },
    ],
    light: [
      { service: "light.turn_on", label: "Licht einschalten (Notbeleuchtung/Rot)", icon: "💡", recommended: true },
      { service: "light.turn_off", label: "Licht ausschalten", icon: "🌑" },
      { service: "light.toggle", label: "Licht umschalten", icon: "🔄" },
    ],
    notify: [
      { service: "notify.notify", label: "Standard Push-Benachrichtigung", icon: "📱", recommended: true },
      { service: "notify.persistent_notification", label: "Dauerhafte Benachrichtigung in HA", icon: "📌" },
    ],
    media_player: [
      { service: "media_player.play_media", label: "Audio-/Warnton abspielen", icon: "🔊", recommended: true },
      { service: "media_player.volume_set", label: "Lautstärke setzen", icon: "📢" },
      { service: "media_player.turn_on", label: "Player einschalten", icon: "▶️" },
      { service: "media_player.turn_off", label: "Player ausschalten", icon: "⏹️" },
    ],
    lock: [
      { service: "lock.unlock", label: "Schloss entriegeln (Fluchtweg)", icon: "🔓", recommended: true },
      { service: "lock.lock", label: "Schloss verriegeln", icon: "🔒" },
    ],
    climate: [
      { service: "climate.turn_off", label: "Heizung/Klima ausschalten", icon: "❄️", recommended: true },
    ],
    script: [
      { service: "script.turn_on", label: "Notfall-Skript ausführen (Starten)", icon: "📜", recommended: true },
      { service: "script.turn_off", label: "Skript stoppen", icon: "⏹️" },
      { service: "script.toggle", label: "Skript umschalten", icon: "🔄" },
      { service: "homeassistant.turn_on", label: "Ausführen (Allgemein)", icon: "⚡" },
    ],
    automation: [
      { service: "automation.trigger", label: "Automation auslösen", icon: "⚙️", recommended: true },
      { service: "automation.turn_on", label: "Automation aktivieren", icon: "⚡" },
      { service: "automation.turn_off", label: "Automation deaktivieren", icon: "🔌" },
    ],
    scene: [
      { service: "scene.turn_on", label: "Notfall-Szene aktivieren", icon: "🎬", recommended: true },
    ],
    camera: [
      { service: "camera.snapshot", label: "Kamera-Schnappschuss erstellen", icon: "📷", recommended: true },
      { service: "camera.record", label: "Kamera-Aufnahme starten", icon: "🎥" },
    ],
    homeassistant: [
      { service: "homeassistant.turn_off", label: "Gerät ausschalten", icon: "🔌", recommended: true },
      { service: "homeassistant.turn_on", label: "Gerät einschalten", icon: "⚡" },
    ]
  };

  const ACTION_DATA_PRESETS = {
    empty: "{}",
    notify: JSON.stringify({
      title: "🚨 Safety Monitor Alarm",
      message: "Achtung: {{ hazard_type }} erkannt durch {{ sensor_name }} in Zone {{ zone }}!"
    }, null, 2),
    critical: JSON.stringify({
      title: "🚨 KRITISCHER NOTFALL-ALARM",
      message: "Akute Gefahr! {{ hazard_type }} in Zone {{ zone }}! Sofort prüfen oder evakuieren.",
      data: {
        push: {
          sound: {
            name: "default",
            critical: 1,
            volume: 1.0
          }
        }
      }
    }, null, 2),
    red_light: JSON.stringify({
      rgb_color: [255, 0, 0],
      brightness: 255
    }, null, 2),
    siren: JSON.stringify({
      tone: "alarm",
      volume_level: 1.0
    }, null, 2),
    all_clear: JSON.stringify({
      title: "✅ Entwarnung: Gefahr beendet",
      message: "Gefahr in Zone {{ zone }} wurde behoben. Safety Monitor wieder im Normalzustand."
    }, null, 2),
    script: JSON.stringify({
      variables: {
        text: "Achtung: {{ hazard_type }} erkannt durch {{ sensor_name }} in Zone {{ zone }}!"
      }
    }, null, 2),
    system_warning: JSON.stringify({
      title: "⚠️ Systemmeldung: {{ sensor_name }}",
      message: "{{ message }}"
    }, null, 2),
    self_test_failed: JSON.stringify({
      title: "🧪 Selbsttest fehlgeschlagen ({{ failed_count }} Melder)",
      message: "Achtung: Selbsttest fehlgeschlagen bei folgenden Meldern: {{ failed_sensors }}!"
    }, null, 2)
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
      this._candidateSearchFilter = "";
      this._candidateTypeFilter = "all";
      let savedTypeFilter = "all";
      let savedTimeFilter = "24h";
      try {
        savedTypeFilter = localStorage.getItem("sm_history_type_filter") || "all";
        savedTimeFilter = localStorage.getItem("sm_history_time_filter") || "24h";
      } catch (_) {}
      this._historyTypeFilter = savedTypeFilter;
      this._historyTimeFilter = savedTimeFilter;
      this._editingSensor = null;
      this._editingZone = null;
      this._editingAction = null;
      this._modalOpen = null; // 'sensor' | 'zone' | 'action'
      this._statusPollInterval = null;
      this._candidateScrollTop = 0;
      this._lang = this._resolveLanguage("auto");
    }

    _resolveLanguage(setting) {
      let s = setting;
      if (!s || s === "auto") {
        try {
          s = localStorage.getItem("sm_language");
        } catch (_) {}
      }
      if (!s || s === "auto") {
        s = (this._config && this._config.settings && this._config.settings.language) || "auto";
      }
      if (s && s !== "auto" && TRANSLATIONS[s]) {
        return s;
      }
      let langCode = "en";
      if (this._hass && this._hass.language) {
        langCode = this._hass.language.substring(0, 2).toLowerCase();
      } else if (typeof navigator !== "undefined" && navigator.language) {
        langCode = navigator.language.substring(0, 2).toLowerCase();
      }
      return TRANSLATIONS[langCode] ? langCode : "en";
    }

    set hass(hass) {
      const oldHass = this._hass;
      this._hass = hass;
      if (!oldHass && hass) {
        this._lang = this._resolveLanguage();
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

    async _loadData(loadCandidates = false) {
      if (!this._hass) return;
      try {
        const config = await this._hass.callWS({ type: "safety_monitor/config/get" });
        if (config) {
          this._config = Object.assign({}, this._config, config);
          try {
            if (!localStorage.getItem("sm_history_time_filter") && this._config.settings && this._config.settings.history_default_time) {
              this._historyTimeFilter = this._config.settings.history_default_time;
            }
            if (this._config.settings && this._config.settings.language) {
              const saved = localStorage.getItem("sm_language");
              this._lang = this._resolveLanguage(saved || this._config.settings.language);
            }
          } catch (_) {}
        }
        if (!this._modalOpen) {
          this._render();
        }
      } catch (err) {
        console.error("Error loading Safety Monitor config:", err);
      }

      if (loadCandidates || this._activeTab === "sensors" || !this._candidates || this._candidates.length === 0) {
        this._loadCandidates();
      }
    }

    async _loadCandidates() {
      if (!this._hass) return;
      try {
        const candResult = await this._hass.callWS({ type: "safety_monitor/sensors/list_candidates" });
        this._candidates = (candResult && candResult.candidates) || [];
        if (this._activeTab === "sensors" && !this._modalOpen) {
          this._render();
        }
      } catch (err) {
        console.error("Error loading candidate sensors:", err);
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
            const oldIgnored = (this._config.ignored_sensors || []).join(',');
            const newIgnored = (status.ignored_sensors || []).join(',');
            if (oldIgnored !== newIgnored) changed = true;

            const oldTriggers = Object.keys(this._config.active_triggers || {}).join(',');
            const newTriggers = Object.keys(status.active_triggers || {}).join(',');
            if (oldTriggers !== newTriggers) changed = true;

            const oldSelfTest = JSON.stringify(this._config.self_test_status || {});
            const newSelfTest = JSON.stringify(status.self_test_status || {});
            if (oldSelfTest !== newSelfTest) changed = true;

            this._config.active_triggers = status.active_triggers || {};
            this._config.offline_sensors = status.offline_sensors || [];
            this._config.ignored_sensors = status.ignored_sensors || [];
            this._config.sensor_batteries = status.sensor_batteries || {};
            this._config.low_battery_sensors = status.low_battery_sensors || {};
            this._config.self_test_status = status.self_test_status || {};
            if (!this._modalOpen && (changed || Object.keys(this._config.active_triggers).length > 0 || (this._config.self_test_status && this._config.self_test_status.running))) {
              this._render();
            }
          }
        } catch (err) {
          // silent
        }
      }, 2500);
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
      const root = this.shadowRoot;
      const btn = root ? root.querySelector('#btn-silence') : null;
      let orig = "";
      if (btn) {
        orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '⏳ Stummschalten...';
      }
      try {
        await this._hass.callWS({ type: "safety_monitor/action/silence" });
        if (btn) btn.innerHTML = '✅ Stumm';
        await this._loadData();
      } catch (err) {
        if (btn) {
          btn.innerHTML = '❌ Fehler';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 2500);
        }
      }
    }

    async _resetAlarm() {
      const root = this.shadowRoot;
      const btn = root ? root.querySelector('#btn-reset') : null;
      let orig = "";
      if (btn) {
        orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '⏳ Zurücksetzen...';
      }
      try {
        await this._hass.callWS({ type: "safety_monitor/action/reset", force: true });
        if (btn) btn.innerHTML = '✅ Zurückgesetzt';
        await this._loadData();
      } catch (err) {
        if (btn) {
          btn.innerHTML = '❌ Fehler';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 2500);
        }
      }
    }

    async _toggleTestMode() {
      const root = this.shadowRoot;
      const btn = root ? root.querySelector('#btn-test-mode') : null;
      const current = this._config.state === "testing" || (this._config.settings && this._config.settings.test_mode);
      const orig = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = current ? '⏳ Beende Test-Modus...' : '⏳ Aktiviere Test-Modus...';
      }
      try {
        const res = await this._hass.callWS({
          type: "safety_monitor/action/test_mode",
          enabled: !current,
        });
        const newState = (res && res.state) ? res.state : (!current ? 'testing' : 'normal');
        this._config.state = newState;
        if (!this._config.settings) this._config.settings = {};
        this._config.settings.test_mode = (newState === 'testing');
        this._render();
        await this._loadData();
      } catch (err) {
        if (btn) {
          btn.innerHTML = '❌ Fehler';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 2500);
        }
        alert("Fehler beim Umschalten des Test-Modus: " + (err?.message || err?.error || err));
      }
    }

    async _triggerAllSensorButtons(btnType) {
      const root = this.shadowRoot;
      const btn = root ? root.querySelector(btnType === 'drill' ? '#btn-test-drill-all' : '#btn-test-self-all') : null;
      const orig = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Sende...';
      }
      try {
        const res = await this._hass.callWS({
          type: "safety_monitor/action/trigger_all_sensor_buttons",
          button_type: btnType,
        });
        if (btn) {
          if (res && res.count > 0) {
            btn.innerHTML = `✅ ${res.count} Melder ausgelöst`;
          } else {
            btn.innerHTML = 'ℹ️ Keine Buttons hinterlegt';
            btn.title = 'In den Einstellungen der Sensoren können Alarmübungs- und Selbsttest-Buttons konfiguriert werden.';
          }
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 2500);
        }
      } catch (err) {
        if (btn) {
          btn.innerHTML = '❌ Fehler';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 2500);
        }
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

    async _startSequentialSelfTest() {
      const root = this.shadowRoot;
      const btn = root ? root.querySelector('#btn-test-self-sequential') : null;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Starte...';
      }
      try {
        const stepSec = (this._config.settings && this._config.settings.auto_self_test_step_seconds) || 60;
        const res = await this._hass.callWS({
          type: "safety_monitor/self_test/start",
          step_seconds: stepSec,
        });
        if (res && res.status) {
          this._config.self_test_status = res.status;
          this._render();
        } else if (res && res.error) {
          alert(`Fehler: ${res.error}`);
          if (btn) btn.disabled = false;
        }
      } catch (err) {
        alert(`Fehler beim Starten des Selbsttests: ${err?.message || err}`);
        if (btn) btn.disabled = false;
      }
    }

    async _cancelSequentialSelfTest() {
      const root = this.shadowRoot;
      const btn = root ? root.querySelector('#btn-test-self-cancel') : null;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Beende...';
      }
      try {
        const res = await this._hass.callWS({
          type: "safety_monitor/self_test/cancel",
        });
        if (res && res.status) {
          this._config.self_test_status = res.status;
        }
        this._render();
      } catch (err) {
        alert(`Fehler beim Abbrechen des Selbsttests: ${err?.message || err}`);
        if (btn) btn.disabled = false;
      }
    }

    async _triggerSingleDrill() {
      const root = this.shadowRoot;
      const sel = root ? root.querySelector('#select-test-drill-sensor') : null;
      const btn = root ? root.querySelector('#btn-test-drill-single') : null;
      const entityId = sel ? sel.value : '';
      if (!entityId) {
        alert("Bitte wählen Sie zuerst einen Melder für die Alarmübung aus.");
        if (sel) sel.focus();
        return;
      }
      const orig = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Sende...';
      }
      try {
        const ok = await this._triggerSensorButton(entityId, 'drill');
        if (btn) {
          btn.innerHTML = ok ? '✅ Ausgelöst' : '❌ Fehlgeschlagen';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 2500);
        }
      } catch (err) {
        if (btn) {
          btn.innerHTML = '❌ Fehler';
          setTimeout(() => {
            btn.innerHTML = orig;
            btn.disabled = false;
          }, 2500);
        }
      }
    }

    async _triggerSensorButton(entityId, buttonType) {
      try {
        await this._hass.callWS({
          type: "safety_monitor/sensor/trigger_button",
          entity_id: entityId,
          button_type: buttonType,
        });
        await this._loadData();
        return true;
      } catch (err) {
        alert("Fehler beim Ausführen des Melder-Befehls: " + (err.message || err));
        throw err;
      }
    }

    async _setSensorIgnored(entityId, ignored) {
      try {
        await this._hass.callWS({
          type: "safety_monitor/sensor/ignore",
          entity_id: entityId,
          ignored: !!ignored,
        });
        await this._loadData();
      } catch (err) {
        alert("Fehler beim Ignorieren des Melders: " + (err.message || err));
        throw err;
      }
    }

    _getTypeIcon(type) {
      switch (type) {
        case "smoke": return "🔥";
        case "moisture": return "💧";
        case "gas": return "☣️";
        case "carbon_monoxide": return "⚠️";
        case "heat": return "🌡️";
        case "battery_low": return "🪫";
        case "sensor_offline": return "📡";
        case "self_test_failed": return "🧪";
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
        case "battery_low": return this._t("eventBatteryLow") || "Schwache Batterie";
        case "sensor_offline": return this._t("eventSensorOffline") || "Melder Offline";
        case "self_test_failed": return this._t("eventSelfTestFailed") || "Selbsttest fehlgeschlagen";
        default: return this._t("typeGeneric");
      }
    }

    _getDomainIcon(domain) {
      switch (domain) {
        case "valve": return "💧";
        case "switch": return "🔌";
        case "light": return "💡";
        case "siren": return "🚨";
        case "cover": return "🪟";
        case "fan": return "🌀";
        case "notify": return "📱";
        case "media_player": return "🔊";
        case "lock": return "🔓";
        case "climate": return "❄️";
        case "script": return "📜";
        case "automation": return "⚙️";
        case "scene": return "🎬";
        default: return "⚡";
      }
    }

    _formatStateText(domain, state) {
      if (!state) return "Unbekannt";
      const s = String(state).toLowerCase();
      if (s === "open") return "Offen";
      if (s === "closed") return "Geschlossen";
      if (s === "on") return "Aktiv / Ein";
      if (s === "off") return "Aus";
      if (s === "unlocked") return "Entriegelt";
      if (s === "locked") return "Verriegelt";
      if (s === "unavailable") return "Nicht verfügbar";
      if (s === "unknown") return "Unbekannt";
      return state;
    }

    _getServicesForDomain(domain) {
      const services = [];
      const seen = new Set();
      const dom = (domain || "").trim().toLowerCase();

      // 1. If a known domain is provided, load its standard curated services
      if (dom && STANDARD_SERVICES[dom]) {
        STANDARD_SERVICES[dom].forEach(s => {
          services.push(s);
          seen.add(s.service);
        });
      }

      // 2. Dynamic discovery: ONLY for notify mobile apps (e.g. notify.mobile_app_*)
      // NEVER dump user scripts (script.*), internal HA system calls, or unrelated services!
      if (dom === "notify" && this._hass && this._hass.services && this._hass.services.notify) {
        const notifyServices = this._hass.services.notify;
        Object.keys(notifyServices).forEach(srvName => {
          const fullSrv = `notify.${srvName}`;
          if (!seen.has(fullSrv) && (srvName.startsWith("mobile_app_") || srvName.includes("notify"))) {
            seen.add(fullSrv);
            const friendly = srvName.startsWith("mobile_app_")
              ? `Push an Smartphone (${srvName.replace("mobile_app_", "").replace(/_/g, " ")})`
              : srvName;
            services.push({
              service: fullSrv,
              label: friendly,
              icon: "📱",
            });
          }
        });
      }

      // 3. Fallback: If domain is empty (no target entered yet) or unknown domain, provide curated emergency services
      if (services.length === 0) {
        [
          { service: "valve.close_valve", label: "Ventil schließen (Notabschaltung)", icon: "🚪", recommended: true },
          { service: "fan.turn_off", label: "Lüfter ausschalten (Rauchstopp)", icon: "🌀", recommended: true },
          { service: "switch.turn_off", label: "Schalter/Strom trennen", icon: "🔌", recommended: true },
          { service: "cover.open_cover", label: "Rollladen öffnen (Fluchtweg)", icon: "🪟", recommended: true },
          { service: "siren.turn_on", label: "Sirene einschalten (Alarm)", icon: "🚨", recommended: true },
          { service: "light.turn_on", label: "Licht einschalten (Notbeleuchtung/Rot)", icon: "💡", recommended: true },
          { service: "notify.notify", label: "Standard Push-Benachrichtigung", icon: "📱", recommended: true },
          { service: "script.turn_on", label: "Notfall-Skript ausführen", icon: "📜" },
          { service: "scene.turn_on", label: "Notfall-Szene aktivieren", icon: "🎬" },
          { service: "homeassistant.turn_off", label: "Gerät ausschalten", icon: "🔌" },
          { service: "homeassistant.turn_on", label: "Gerät einschalten", icon: "⚡" },
        ].forEach(s => services.push(s));
      }

      return services;
    }

    _renderTargetPreview(targetRaw) {
      if (!targetRaw || !targetRaw.trim()) return '';
      const entityIds = targetRaw.split(',').map(s => s.trim()).filter(Boolean);
      if (entityIds.length === 0) return '';

      const chips = entityIds.map(eid => {
        const stateObj = this._hass && this._hass.states && this._hass.states[eid];
        if (!stateObj) {
          return `
            <div class="target-chip not-found" style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 10px; border-radius: 8px; background: rgba(245, 127, 23, 0.08); border: 1px solid rgba(245, 127, 23, 0.3); font-size: 12px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>⚠️</span>
                <code>${eid}</code>
              </div>
              <span style="color: var(--secondary-text-color, #757575); font-size: 11px;">(${this._t("entityNotFoundInHA") || 'Nicht im HA-Zustandsregister gefunden'})</span>
            </div>
          `;
        }
        const fn = (stateObj.attributes && stateObj.attributes.friendly_name) || eid;
        const st = stateObj.state;
        const domain = eid.split('.')[0];
        const icon = this._getDomainIcon(domain);
        const isOn = ["on", "open", "unlocked", "active"].includes(String(st).toLowerCase());
        const isOff = ["off", "closed", "locked", "idle"].includes(String(st).toLowerCase());
        const badgeClass = isOn ? "badge-status-on" : isOff ? "badge-status-off" : "badge-status-offline";
        const stateText = this._formatStateText(domain, st);

        return `
          <div class="target-chip" style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 8px 12px; border-radius: 8px; background: var(--secondary-background-color, rgba(127, 127, 127, 0.08)); border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.2)));">
            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
              <span style="font-size: 18px; line-height: 1;">${icon}</span>
              <div style="overflow: hidden;">
                <div style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--primary-text-color, inherit);">
                  ${fn}
                </div>
                <div style="font-size: 11px; font-family: monospace; color: var(--secondary-text-color, #757575); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${eid}
                </div>
              </div>
            </div>
            <div>
              <span class="badge ${badgeClass}" style="font-size: 11px; padding: 3px 8px;">
                ${stateText}
              </span>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">
          <div style="font-size: 11px; font-weight: 600; color: var(--secondary-text-color, #757575);">
            ${this._t("targetPreviewTitle")}
          </div>
          ${chips}
        </div>
      `;
    }

    _renderModalTriggerCheckboxes(phase, triggerTypes) {
      const hasExplicitTypes = Array.isArray(triggerTypes) && triggerTypes.length > 0;
      if (phase === 'system') {
        const isChecked = (val) => !hasExplicitTypes || triggerTypes.includes(val);
        return `
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" class="act-type-cb" value="battery_low" ${isChecked('battery_low') ? 'checked' : ''}> 🪫 ${this._t("eventBatteryLow")}
          </label>
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" class="act-type-cb" value="sensor_offline" ${isChecked('sensor_offline') ? 'checked' : ''}> 📡 ${this._t("eventSensorOffline")}
          </label>
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
            <input type="checkbox" class="act-type-cb" value="self_test_failed" ${isChecked('self_test_failed') ? 'checked' : ''}> 🧪 ${this._t("eventSelfTestFailed")}
          </label>
        `;
      }
      const isChecked = (val) => !hasExplicitTypes || triggerTypes.includes(val);
      return `
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
          <input type="checkbox" class="act-type-cb" value="smoke" ${isChecked('smoke') ? 'checked' : ''}> 🔥 ${this._t("typeSmoke")}
        </label>
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
          <input type="checkbox" class="act-type-cb" value="moisture" ${isChecked('moisture') ? 'checked' : ''}> 💧 ${this._t("typeMoisture")}
        </label>
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
          <input type="checkbox" class="act-type-cb" value="gas" ${isChecked('gas') ? 'checked' : ''}> ☣️ ${this._t("typeGas")}
        </label>
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
          <input type="checkbox" class="act-type-cb" value="carbon_monoxide" ${isChecked('carbon_monoxide') ? 'checked' : ''}> ⚠️ ${this._t("typeCO")}
        </label>
        <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 13px;">
          <input type="checkbox" class="act-type-cb" value="heat" ${isChecked('heat') ? 'checked' : ''}> 🌡️ ${this._t("typeHeat")}
        </label>
      `;
    }

    _render() {
      if (!this._config) return;

      // Preserve focus & cursor position if an input is active
      let activeId = null;
      let selStart = null;
      let selEnd = null;
      if (this.shadowRoot && this.shadowRoot.activeElement) {
        const el = this.shadowRoot.activeElement;
        activeId = el.id;
        if (typeof el.selectionStart === 'number') {
          selStart = el.selectionStart;
          selEnd = el.selectionEnd;
        }
      }

      // Preserve scroll position of candidate list if present
      const curCandList = this.shadowRoot && this.shadowRoot.querySelector('.candidate-list');
      if (curCandList) {
        this._candidateScrollTop = curCandList.scrollTop;
      }

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
            background: var(--ha-card-background, var(--card-background-color, rgba(127, 127, 127, 0.1)));
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.2)));
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
            color: var(--secondary-text-color, #757575);
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
          .btn-ctl.silence-highlight {
            background: linear-gradient(135deg, #e65100 0%, #f57c00 100%);
            border-color: #ffe082;
            color: #ffffff !important;
            box-shadow: 0 0 16px rgba(255, 152, 0, 0.6);
            animation: pulse-silence 2.2s infinite ease-in-out;
          }
          .btn-ctl.silence-highlight:hover {
            background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%);
            box-shadow: 0 0 20px rgba(255, 152, 0, 0.9);
          }
          @keyframes pulse-silence {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.04); }
          }

          /* Cards */
          .card {
            background: var(--ha-card-background, var(--card-background-color, #ffffff));
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.2)));
            color: var(--primary-text-color, inherit);
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
            width: 100%;
            box-sizing: border-box;
          }
          .candidate-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
            overflow-x: hidden;
            width: 100%;
            box-sizing: border-box;
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
          .candidate-card, .candidate-chip {
            background: var(--card-background-color, var(--ha-card-background, rgba(127, 127, 127, 0.08)));
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
            color: var(--primary-text-color, inherit);
            border-radius: 12px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 100%;
            box-sizing: border-box;
            transition: all 0.15s ease;
          }
          .candidate-card:hover, .candidate-chip:hover {
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.16));
            border-color: var(--primary-color, #0288d1);
          }
          .candidate-header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
          .candidate-type-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .candidate-type-icon {
            font-size: 16px;
            line-height: 1;
          }
          .candidate-details {
            display: flex;
            flex-direction: column;
            gap: 3px;
            width: 100%;
          }
          .candidate-name {
            font-size: 14px;
            font-weight: 600;
            color: var(--primary-text-color, inherit);
            line-height: 1.4;
            word-break: break-word;
          }
          .candidate-entity {
            font-size: 12px;
            font-family: var(--code-font-family, monospace);
            color: var(--secondary-text-color, #757575);
            line-height: 1.35;
            word-break: break-all;
          }
          .btn-add-cand {
            border: none;
            background: var(--primary-color, #0288d1);
            color: var(--text-primary-color, #ffffff) !important;
            padding: 6px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
            white-space: nowrap;
            flex-shrink: 0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
          }
          .btn-add-cand:hover {
            filter: brightness(1.1);
            box-shadow: 0 2px 6px rgba(2, 136, 209, 0.35);
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
            border-bottom: 2px solid var(--divider-color, rgba(127, 127, 127, 0.2));
            font-size: 13px;
            font-weight: 700;
            color: var(--secondary-text-color, #757575);
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 14px;
            border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
            font-size: 14px;
            vertical-align: middle;
          }
          tr:hover td {
            background-color: rgba(127, 127, 127, 0.05);
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
            line-height: 1.3;
          }
          .badge-smoke {
            background: rgba(211, 47, 47, 0.15);
            color: var(--error-color, #d32f2f);
            border: 1px solid rgba(211, 47, 47, 0.3);
          }
          .badge-moisture {
            background: rgba(2, 136, 209, 0.15);
            color: var(--primary-color, #0288d1);
            border: 1px solid rgba(2, 136, 209, 0.3);
          }
          .badge-gas {
            background: rgba(245, 127, 23, 0.15);
            color: #f57f17;
            border: 1px solid rgba(245, 127, 23, 0.3);
          }
          .badge-co {
            background: rgba(216, 67, 21, 0.15);
            color: #d84315;
            border: 1px solid rgba(216, 67, 21, 0.3);
          }
          .badge-heat {
            background: rgba(173, 20, 87, 0.15);
            color: #ad1457;
            border: 1px solid rgba(173, 20, 87, 0.3);
          }
          .badge-generic {
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
            color: var(--primary-text-color, inherit);
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
          }
          .badge-status-on {
            background: rgba(211, 47, 47, 0.2);
            color: var(--error-color, #d32f2f);
            font-weight: 700;
            border: 1px solid rgba(211, 47, 47, 0.4);
          }
          .badge-status-off {
            background: rgba(46, 125, 50, 0.15);
            color: var(--success-color, #2e7d32);
            border: 1px solid rgba(46, 125, 50, 0.3);
          }
          .badge-status-offline {
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
            color: var(--secondary-text-color, #757575);
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
          }
          .badge-zone {
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
            color: var(--primary-text-color, inherit);
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
          }
          .badge-feature-dk {
            background: rgba(230, 81, 0, 0.15);
            color: #ff9800;
            border: 1px solid rgba(230, 81, 0, 0.3);
          }
          .badge-feature-ack {
            background: rgba(46, 125, 50, 0.15);
            color: #4caf50;
            border: 1px solid rgba(46, 125, 50, 0.3);
          }
          .badge-feature-shutoff {
            background: rgba(2, 136, 209, 0.15);
            color: #03a9f4;
            border: 1px solid rgba(2, 136, 209, 0.3);
          }

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
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
            color: var(--primary-text-color, inherit);
            font-size: 14px;
            box-sizing: border-box;
          }
          .select-filter {
            padding: 10px 14px;
            border-radius: 10px;
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
            color: var(--primary-text-color, inherit);
            font-size: 14px;
            box-sizing: border-box;
          }
          .select-filter option {
            background-color: var(--card-background-color, var(--primary-background-color, #202020));
            color: var(--primary-text-color, inherit);
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
          .btn-sm.action-test.test-success {
            background-color: rgba(76, 175, 80, 0.15) !important;
            color: #4caf50 !important;
            border-color: #4caf50 !important;
          }
          .btn-sm.action-test.test-error {
            background-color: rgba(244, 67, 54, 0.15) !important;
            color: #f44336 !important;
            border-color: #f44336 !important;
          }
          .btn.action-modal-test {
            background-color: rgba(255, 152, 0, 0.12);
            color: #f57c00 !important;
            border: 1px solid rgba(255, 152, 0, 0.35);
            font-weight: 600;
            transition: all 0.2s ease;
          }
          .btn.action-modal-test:hover {
            background-color: rgba(255, 152, 0, 0.22);
            border-color: #f57c00;
          }
          .btn.action-modal-test.test-success {
            background-color: rgba(76, 175, 80, 0.18) !important;
            color: #2e7d32 !important;
            border-color: #4caf50 !important;
          }
          .btn.action-modal-test.test-error {
            background-color: rgba(244, 67, 54, 0.18) !important;
            color: #d32f2f !important;
            border-color: #f44336 !important;
          }
          .btn.test-success, .btn-primary.test-success, .btn-modal-save-zone.test-success {
            background-color: #2e7d32 !important;
            color: #ffffff !important;
            border-color: #2e7d32 !important;
          }
          .btn.test-error, .btn-primary.test-error, .btn-modal-save-zone.test-error {
            background-color: #d32f2f !important;
            color: #ffffff !important;
            border-color: #d32f2f !important;
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
            border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
          }
          .timeline-dot {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.15));
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
            color: var(--primary-text-color, inherit);
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
            color: var(--secondary-text-color, #757575);
            margin: 2px 0 0 0;
          }
          .history-container::-webkit-scrollbar {
            width: 6px;
          }
          .history-container::-webkit-scrollbar-thumb {
            background-color: var(--divider-color, rgba(127, 127, 127, 0.3));
            border-radius: 3px;
          }

          /* Phase Cards in Actions Tab */
          .phase-card {
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 18px;
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.05));
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
            color: var(--secondary-text-color, #757575);
            margin: 4px 0 12px 0;
          }
          .action-item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid var(--divider-color, rgba(127, 127, 127, 0.15));
            flex-wrap: wrap;
          }
          .action-item-row:last-child {
            border-bottom: none;
          }
          .action-item-info {
            flex: 1 1 auto;
            min-width: 200px;
            word-break: break-word;
          }
          .action-item-btns {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
            align-items: center;
            flex-shrink: 0;
          }
          @media (max-width: 600px) {
            .action-item-row {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
              padding: 10px 0;
            }
            .action-item-info {
              flex: 0 0 auto;
              width: 100%;
              min-width: 0;
            }
            .action-item-btns {
              width: 100%;
              justify-content: flex-start;
              margin-top: 2px;
            }
          }
          .repeat-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: rgba(33, 150, 243, 0.15);
            color: #2196f3;
            font-size: 11px;
            font-weight: 600;
            padding: 2px 7px;
            border-radius: 6px;
            margin-left: 6px;
            vertical-align: middle;
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
            background: var(--card-background-color, var(--ha-card-background, var(--primary-background-color, #202020)));
            color: var(--primary-text-color, inherit);
            border-radius: 16px;
            width: 100%;
            max-width: 580px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 24px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.35);
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.25)));
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
            color: var(--primary-text-color, inherit);
          }
          .form-control {
            width: 100%;
            padding: 10px 12px;
            border-radius: 8px;
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
            font-size: 14px;
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.12));
            color: var(--primary-text-color, inherit);
            box-sizing: border-box;
          }
          /* Entity ID Live Suggestions Dropdown */
          .suggestions-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            width: 100%;
            box-sizing: border-box;
            margin-top: 4px;
            background: var(--card-background-color, var(--ha-card-background, var(--primary-background-color, #202020)));
            color: var(--primary-text-color, inherit);
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
            border-radius: 10px;
            max-height: 220px;
            overflow-y: auto;
            overflow-x: hidden;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
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
          .target-chip {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding: 8px 12px;
            border-radius: 8px;
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.2)));
            box-sizing: border-box;
          }
          .target-chip.not-found {
            background: rgba(245, 127, 23, 0.08);
            border-color: rgba(245, 127, 23, 0.3);
          }
          .data-preset-btn {
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 600;
            border-radius: 6px;
            border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.3)));
            background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
            color: var(--primary-text-color, inherit);
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .data-preset-btn:hover {
            background: var(--primary-color, #0288d1);
            color: #ffffff !important;
            border-color: var(--primary-color, #0288d1);
          }
          .data-var-chip {
            display: inline-block;
            padding: 4px 8px;
            font-size: 11px;
            font-family: var(--code-font-family, monospace);
            border-radius: 6px;
            border: 1px dashed var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.35)));
            background: var(--card-background-color, var(--ha-card-background, rgba(127, 127, 127, 0.05)));
            color: var(--primary-text-color, inherit);
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .data-var-chip:hover {
            background: rgba(2, 136, 209, 0.15);
            border-color: var(--primary-color, #0288d1);
            color: var(--primary-color, #0288d1);
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

      if (typeof this._candidateScrollTop === 'number' && this._candidateScrollTop > 0) {
        const restoredCandList = this.shadowRoot.querySelector('.candidate-list');
        if (restoredCandList) {
          restoredCandList.scrollTop = this._candidateScrollTop;
          requestAnimationFrame(() => {
            if (restoredCandList) {
              restoredCandList.scrollTop = this._candidateScrollTop;
            }
          });
          setTimeout(() => {
            const listEl = this.shadowRoot && this.shadowRoot.querySelector('.candidate-list');
            if (listEl && this._candidateScrollTop > 0) {
              listEl.scrollTop = this._candidateScrollTop;
            }
          }, 30);
        }
      }

      if (activeId) {
        const restored = this.shadowRoot.querySelector('#' + activeId);
        if (restored) {
          restored.focus();
          if (selStart !== null && typeof restored.setSelectionRange === 'function') {
            try {
              restored.setSelectionRange(selStart, selEnd);
            } catch (err) {
              // Ignore unsupported inputs
            }
          }
        }
      }
    }

    _getHistoryEventIcon(evt) {
      const ev = (evt && evt.event) || '';
      if (ev === 'sensor_triggered' || ev === 'manual_alarm') return '🚨';
      if (ev === 'silenced' || ev === 'sensor_silence') return '🔕';
      if (ev === 'reset') return '✅';
      if (ev === 'self_test_failed') return '❌';
      if (ev === 'self_test_success') return '✅';
      if (ev === 'sensor_drill') return '🔔';
      if (ev === 'sensor_test') return '🧪';
      if (ev === 'test_mode') return '🛡️';
      if (ev === 'battery_low') return '🪫';
      if (ev === 'sensor_offline') return '⚠️';
      if (ev === 'sensor_online') return '📡';
      if (ev === 'sensor_ignored') return '🙈';
      if (ev === 'sensor_unignored') return '👁️';
      return '📜';
    }

    _getHistoryEventBadge(evt) {
      const ev = (evt && evt.event) || '';
      if (ev === 'sensor_triggered' || ev === 'manual_alarm') {
        return `<span class="badge" style="background:#d32f2f; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">🚨 ${this._t("badgeAlarm")}</span>`;
      }
      if (ev === 'silenced' || ev === 'sensor_silence') {
        return `<span class="badge" style="background:#f57c00; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">🔕 ${this._t("badgeSilenced")}</span>`;
      }
      if (ev === 'reset') {
        return `<span class="badge" style="background:#2e7d32; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">✅ ${this._t("badgeAllClear")}</span>`;
      }
      if (ev === 'self_test_failed') {
        return `<span class="badge" style="background:#c62828; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">❌ ${this._t("badgeFailed")}</span>`;
      }
      if (ev === 'self_test_success') {
        return `<span class="badge" style="background:#2e7d32; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">✅ ${this._t("badgePassed")}</span>`;
      }
      if (ev === 'sensor_drill') {
        return `<span class="badge" style="background:#7b1fa2; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">🔔 ${this._t("badgeDrill")}</span>`;
      }
      if (ev === 'sensor_test') {
        return `<span class="badge" style="background:#0288d1; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">🧪 ${this._t("badgeSelfTest")}</span>`;
      }
      if (ev === 'test_mode') {
        return `<span class="badge" style="background:#00796b; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">🛡️ ${this._t("badgeTestMode")}</span>`;
      }
      if (ev === 'battery_low') {
        return `<span class="badge" style="background:#e65100; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">🪫 ${this._t("badgeBattery")}</span>`;
      }
      if (ev === 'sensor_offline') {
        return `<span class="badge" style="background:#b71c1c; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">⚠️ ${this._t("badgeOffline")}</span>`;
      }
      if (ev === 'sensor_online') {
        return `<span class="badge" style="background:#388e3c; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">📡 ${this._t("badgeOnline")}</span>`;
      }
      if (ev === 'sensor_ignored') {
        return `<span class="badge" style="background:#616161; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">🙈 ${this._t("badgeIgnored")}</span>`;
      }
      if (ev === 'sensor_unignored') {
        return `<span class="badge" style="background:#455a64; color:#fff; font-size:11px; padding:2px 8px; border-radius:4px;">👁️ ${this._t("badgeReactivated")}</span>`;
      }
      return '';
    }

    _formatEventTime(timestamp) {
      if (!timestamp) return '';
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return timestamp;
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - d.getTime()) / 1000));
      let rel = '';
      try {
        const rtf = new Intl.RelativeTimeFormat(this._lang, { numeric: 'auto' });
        if (diffSec < 60) {
          rel = rtf.format(-diffSec, 'second');
        } else if (diffSec < 3600) {
          rel = rtf.format(-Math.floor(diffSec / 60), 'minute');
        } else if (diffSec < 86400) {
          rel = rtf.format(-Math.floor(diffSec / 3600), 'hour');
        } else {
          rel = rtf.format(-Math.floor(diffSec / 86400), 'day');
        }
      } catch (_) {
        rel = `${diffSec}s ago`;
      }
      return `${d.toLocaleString(this._lang)} (${rel})`;
    }

    _getFilteredHistory(history) {
      if (!Array.isArray(history)) return [];
      const typeFilter = this._historyTypeFilter || 'all';
      const timeFilter = this._historyTimeFilter || '24h';
      const now = Date.now();

      let filtered = history.slice().reverse(); // Most recent first

      // 1. Time filter
      if (timeFilter !== 'all') {
        let maxAgeMs = 24 * 3600 * 1000;
        if (timeFilter === '1h') maxAgeMs = 1 * 3600 * 1000;
        else if (timeFilter === '6h') maxAgeMs = 6 * 3600 * 1000;
        else if (timeFilter === '12h') maxAgeMs = 12 * 3600 * 1000;
        else if (timeFilter === '24h') maxAgeMs = 24 * 3600 * 1000;
        else if (timeFilter === '3d') maxAgeMs = 3 * 24 * 3600 * 1000;

        filtered = filtered.filter(evt => {
          if (!evt.timestamp) return true;
          const t = new Date(evt.timestamp).getTime();
          if (isNaN(t)) return true;
          return (now - t) <= maxAgeMs;
        });
      }

      // 2. Event type filter
      if (typeFilter !== 'all') {
        filtered = filtered.filter(evt => {
          const ev = evt.event || '';
          switch (typeFilter) {
            case 'alarms':
              return ev === 'sensor_triggered' || ev === 'manual_alarm';
            case 'silenced':
              return ev === 'silenced' || ev === 'sensor_silence';
            case 'reset':
              return ev === 'reset';
            case 'self_tests':
              return ev === 'self_test_failed' || ev === 'self_test_success' || ev === 'sensor_test';
            case 'self_test_failed':
              return ev === 'self_test_failed';
            case 'self_test_success':
              return ev === 'self_test_success';
            case 'drills':
              return ev === 'sensor_drill';
            case 'test_mode':
              return ev === 'test_mode';
            case 'battery_low':
              return ev === 'battery_low';
            case 'offline_online':
              return ev === 'sensor_offline' || ev === 'sensor_online';
            case 'ignored':
              return ev === 'sensor_ignored' || ev === 'sensor_unignored';
            default:
              return ev === typeFilter;
          }
        });
      }

      return filtered;
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

      const lowBatteries = this._config.low_battery_sensors || {};
      const lowBatteryEntries = Object.entries(lowBatteries);
      const filteredHistory = this._getFilteredHistory(history);

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
                <button class="btn-ctl silence-highlight" id="btn-silence">🔕 ${this._t("btnSilence")}</button>
              ` : (state === 'silenced' && activeTriggers.length > 0) ? `
                <button class="btn-ctl" id="btn-silence">🔕 ${this._t("btnSilenceAgain")}</button>
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

        <!-- Test Mode Active Action Console -->
        ${state === 'testing' ? (() => {
          const allSensors = Object.values(this._config.sensors || {});
          const drillSensors = allSensors.filter(s => !!s.drill_entity);
          const testSensors = allSensors.filter(s => !!s.test_entity);
          const selfTestStatus = this._config.self_test_status || {};
          return `
          <div class="card" style="border-left: 4px solid #00acc1; background: rgba(0, 172, 193, 0.08); margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">🧪</span>
                <div>
                  <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #00838f;">
                    ${this._t("testModeActiveTitle")}
                  </h4>
                  <p style="margin: 3px 0 0 0; font-size: 13px; color: var(--secondary-text-color, #757575);">
                    ${this._t("testModeActiveDesc")}
                  </p>
                </div>
              </div>
              <div>
                <button class="btn-sm" id="btn-test-exit" style="cursor: pointer; background: #e53935; color: #fff; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 600; font-size: 12px;">
                  ⏹️ ${this._t("btnExitTestMode")}
                </button>
              </div>
            </div>

            <!-- Single Detector Drill Section -->
            <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(0, 172, 193, 0.2); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="font-weight: 700; font-size: 13px; color: #00838f;">📢 Alarmübung (Einzelner Melder)</div>
                <div style="font-size: 12px; color: var(--secondary-text-color, #757575);">${this._t("drillSensorHelp")}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                ${drillSensors.length > 0 ? `
                  <select id="select-test-drill-sensor" class="form-control" style="max-width: 280px; padding: 6px 10px; font-size: 12px; border-radius: 6px;">
                    <option value="">${this._t("selectDrillSensorPlaceholder")}</option>
                    ${drillSensors.map(s => `
                      <option value="${s.entity_id}">${s.name || s.entity_id}</option>
                    `).join('')}
                  </select>
                  <button class="btn-sm" id="btn-test-drill-single" style="cursor: pointer; background: #0288d1; color: #fff; border: none; padding: 7px 12px; border-radius: 6px; font-weight: 600; font-size: 12px;">
                    🔔 ${this._t("btnDrillSingle")}
                  </button>
                ` : `
                  <span style="font-size: 12px; color: var(--secondary-text-color, #757575);">ℹ️ Keine Melder mit Alarmübungs-Button konfiguriert</span>
                `}
              </div>
            </div>

            <!-- Sequential Self-Test Section -->
            <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid rgba(0, 172, 193, 0.2);">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 8px;">
                <div>
                  <div style="font-weight: 700; font-size: 13px; color: #00838f;">🧪 Sequentieller Selbsttest (${testSensors.length} Melder mit Test-Funktion)</div>
                  <div style="font-size: 12px; color: var(--secondary-text-color, #757575);">
                    Testet alle Melder nacheinander im konfigurierten Abstand und prüft Rückmeldungen.
                  </div>
                </div>
                <div>
                  ${selfTestStatus.running ? `
                    <button class="btn-sm" id="btn-test-self-cancel" style="cursor: pointer; background: #d32f2f; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 600; font-size: 12px;">
                      ⏹️ ${this._t("btnCancelSelfTest")}
                    </button>
                  ` : `
                    <button class="btn-sm" id="btn-test-self-sequential" ${testSensors.length === 0 ? 'disabled' : ''} style="cursor: pointer; background: #00897b; color: #fff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 600; font-size: 12px;">
                      🧪 ${this._t("btnStartSequentialSelfTest")}
                    </button>
                  `}
                </div>
              </div>

              ${selfTestStatus.running ? `
                <div style="padding: 12px 14px; border-radius: 8px; background: rgba(0, 137, 123, 0.1); border: 1px solid rgba(0, 137, 123, 0.3); margin-top: 8px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                    <strong style="color: #00796b; font-size: 13px;">
                      🧪 ${this._t("selfTestProgress").replace('{current}', selfTestStatus.current_index || 0).replace('{total}', selfTestStatus.total || testSensors.length)}
                    </strong>
                    <span style="font-size: 12px; color: var(--secondary-text-color, #757575);">
                      Aktuell: <strong>${selfTestStatus.current_sensor_name || selfTestStatus.current_sensor || '...'}</strong> (${selfTestStatus.step_seconds || 60}s Pause)
                    </span>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${Object.values(selfTestStatus.results || {}).map(r => {
                      const isCur = r.entity_id === selfTestStatus.current_sensor;
                      const bgBadge = r.status === 'passed' ? '#2e7d32' : r.status === 'failed' ? '#c62828' : r.status === 'testing' ? '#0288d1' : '#757575';
                      const lblBadge = r.status === 'passed' ? this._t("selfTestPassed") : r.status === 'failed' ? this._t("selfTestFailed") : r.status === 'testing' ? this._t("selfTestTesting") : this._t("selfTestPending");
                      return `
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 10px; border-radius: 6px; background: ${isCur ? 'rgba(2, 136, 209, 0.12)' : 'var(--card-background-color, #fff)'}; border: 1px solid ${isCur ? '#0288d1' : 'var(--ha-card-border-color, rgba(127,127,127,0.2))'}; font-size: 12px;">
                          <div>
                            <strong>${r.name || r.entity_id}</strong>
                            <span style="color: var(--secondary-text-color, #757575); margin-left: 6px;">(${r.details || ''})</span>
                          </div>
                          <span class="badge" style="background: ${bgBadge}; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 4px;">
                            ${lblBadge}
                          </span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              ` : (selfTestStatus.finished_at ? `
                <div style="margin-top: 8px; font-size: 12px; color: var(--secondary-text-color, #757575); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                  <span>
                    Letzter Selbsttest beendet (${new Date(selfTestStatus.finished_at).toLocaleTimeString()}):
                    ${Object.values(selfTestStatus.results || {}).some(r => r.status === 'failed')
                      ? `<strong style="color: #c62828;">⚠️ ${Object.values(selfTestStatus.results || {}).filter(r => r.status === 'failed').length} Melder mit Fehler!</strong>`
                      : `<strong style="color: #2e7d32;">✅ Alle Melder erfolgreich bestanden.</strong>`
                    }
                  </span>
                </div>
              ` : '')}
            </div>
          </div>
          `;
        })() : ''}

        <!-- Low Battery Warning Banner -->
        ${lowBatteryEntries.length > 0 ? `
          <div class="card" style="border-left: 4px solid #f57f17; background: rgba(245, 127, 23, 0.08); margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 26px;">🪫</span>
                <div>
                  <h4 style="margin: 0; font-size: 15px; font-weight: 700; color: #f57f17;">${this._t("batteryWarning")}</h4>
                  <p style="margin: 2px 0 0 0; font-size: 13px; color: var(--secondary-text-color, #757575);">
                    Folgende Melder haben einen kritischen Batteriestand (&lt; 15%):
                    <strong>${lowBatteryEntries.map(([eid, b]) => `${b.name || eid} (${b.level}%)`).join(', ')}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Active Hazards List -->
        <div class="card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
            <h3 class="card-title">⚠️ ${this._t("activeHazardsTitle")} (${activeTriggers.length})</h3>
          </div>
          ${activeTriggers.length === 0 ? `
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
              <p style="color: var(--secondary-text-color, #757575); margin: 0;">${this._t("noActiveHazards")}</p>
              <button class="btn-sm" id="btn-goto-sensors" style="cursor: pointer;">
                🔍 Melder-Übersicht &amp; Tests anzeigen
              </button>
            </div>
          ` : `
            <div class="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>${this._t("thType")}</th>
                    <th>${this._t("thSensor")}</th>
                    <th>${this._t("thZone")}</th>
                    <th>Zeitpunkt</th>
                    <th>${this._t("thActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  ${activeTriggers.map(t => {
                    const isIgnored = (this._config.ignored_sensors || []).includes(t.entity_id);
                    const sensorConf = (this._config.sensors || {})[t.entity_id] || {};
                    const hasSilence = !!sensorConf.silence_entity;
                    return `
                      <tr style="background: ${isIgnored ? 'rgba(127, 127, 127, 0.08)' : 'rgba(211, 47, 47, 0.05)'};">
                        <td><span class="badge badge-${t.type}">${this._getTypeIcon(t.type)} ${this._getTypeName(t.type)}</span></td>
                        <td><strong>${t.name}</strong><br><small style="color: var(--secondary-text-color, #888);">${t.entity_id}</small></td>
                        <td><span class="badge badge-zone">${t.zone}</span></td>
                        <td>${new Date(t.timestamp).toLocaleTimeString()}</td>
                        <td>
                          ${isIgnored ? `
                            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                              <span class="badge badge-status-offline">${this._t("badgeIgnored")}</span>
                              <button class="btn-sm btn-unignore-hazard" data-entity-id="${t.entity_id}">
                                ${this._t("btnUnignoreSensor")}
                              </button>
                            </div>
                          ` : `
                            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
                              ${hasSilence ? `
                                <button class="btn-sm btn-silence-hazard" data-entity-id="${t.entity_id}" title="${this._t("silenceEntityHelp")}">
                                  ${this._t("btnMuteSensor")}
                                </button>
                              ` : ''}
                              <button class="btn-sm danger btn-ignore-hazard" data-entity-id="${t.entity_id}" title="${this._t("btnIgnoreSensor")}">
                                ${this._t("btnIgnoreSensor")}
                              </button>
                            </div>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Event History -->
        <div class="card">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <h3 class="card-title" style="margin: 0;">📜 ${this._t("eventHistoryTitle")}</h3>
              ${history && history.length > 0 ? `
                <span class="badge badge-generic" style="font-size: 11px;">
                  ${this._t("historyCountBadge", { filtered: filteredHistory.length, total: history.length })}
                </span>
              ` : ''}
            </div>

            <!-- Filter Controls -->
            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <label for="history-filter-type" style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color, #757575);">
                  ${this._t("historyFilterType")}
                </label>
                <select id="history-filter-type" class="form-control" style="font-size: 12px; padding: 4px 8px; width: auto; min-width: 170px;">
                  <option value="all" ${this._historyTypeFilter === 'all' ? 'selected' : ''}>${this._t("historyTypeAll")}</option>
                  <option value="alarms" ${this._historyTypeFilter === 'alarms' ? 'selected' : ''}>${this._t("historyTypeAlarms")}</option>
                  <option value="silenced" ${this._historyTypeFilter === 'silenced' ? 'selected' : ''}>${this._t("historyTypeSilenced")}</option>
                  <option value="reset" ${this._historyTypeFilter === 'reset' ? 'selected' : ''}>${this._t("historyTypeReset")}</option>
                  <option value="self_tests" ${this._historyTypeFilter === 'self_tests' ? 'selected' : ''}>${this._t("historyTypeSelfTestAll")}</option>
                  <option value="self_test_failed" ${this._historyTypeFilter === 'self_test_failed' ? 'selected' : ''}>${this._t("historyTypeSelfTestFailed")}</option>
                  <option value="self_test_success" ${this._historyTypeFilter === 'self_test_success' ? 'selected' : ''}>${this._t("historyTypeSelfTestSuccess")}</option>
                  <option value="drills" ${this._historyTypeFilter === 'drills' ? 'selected' : ''}>${this._t("historyTypeDrills")}</option>
                  <option value="test_mode" ${this._historyTypeFilter === 'test_mode' ? 'selected' : ''}>${this._t("historyTypeTestMode")}</option>
                  <option value="battery_low" ${this._historyTypeFilter === 'battery_low' ? 'selected' : ''}>${this._t("historyTypeBattery")}</option>
                  <option value="offline_online" ${this._historyTypeFilter === 'offline_online' ? 'selected' : ''}>${this._t("historyTypeOffline")}</option>
                  <option value="ignored" ${this._historyTypeFilter === 'ignored' ? 'selected' : ''}>${this._t("historyTypeIgnored")}</option>
                </select>
              </div>

              <div style="display: flex; align-items: center; gap: 6px;">
                <label for="history-filter-time" style="font-size: 12px; font-weight: 600; color: var(--secondary-text-color, #757575);">
                  ${this._t("historyFilterTime")}
                </label>
                <select id="history-filter-time" class="form-control" style="font-size: 12px; padding: 4px 8px; width: auto; min-width: 140px;">
                  <option value="24h" ${this._historyTimeFilter === '24h' ? 'selected' : ''}>${this._t("historyTime24h")}</option>
                  <option value="1h" ${this._historyTimeFilter === '1h' ? 'selected' : ''}>${this._t("historyTime1h")}</option>
                  <option value="6h" ${this._historyTimeFilter === '6h' ? 'selected' : ''}>${this._t("historyTime6h")}</option>
                  <option value="12h" ${this._historyTimeFilter === '12h' ? 'selected' : ''}>${this._t("historyTime12h")}</option>
                  <option value="3d" ${this._historyTimeFilter === '3d' ? 'selected' : ''}>${this._t("historyTime3d")}</option>
                  <option value="all" ${this._historyTimeFilter === 'all' ? 'selected' : ''}>${this._t("historyTimeAll")}</option>
                </select>
              </div>
            </div>
          </div>

          ${!history || history.length === 0 ? `
            <p style="color: var(--secondary-text-color, #757575); margin: 0;">${this._t("noEvents")}</p>
          ` : filteredHistory.length === 0 ? `
            <div style="text-align: center; padding: 24px 12px; background: rgba(127,127,127,0.04); border-radius: 8px; border: 1px dashed var(--ha-card-border-color, rgba(127,127,127,0.2));">
              <p style="color: var(--secondary-text-color, #757575); margin: 0 0 10px 0; font-size: 14px;">
                ${this._t("historyNoMatchingEvents")}
              </p>
              <button class="btn-sm" id="btn-history-show-all" style="cursor: pointer;">
                📜 ${this._t("historyShowAllEvents")}
              </button>
            </div>
          ` : `
            <div class="history-container" style="max-height: 520px; overflow-y: auto; padding-right: 4px;">
              <ul class="timeline">
                ${filteredHistory.map(evt => `
                  <li class="timeline-item">
                    <div class="timeline-dot">
                      ${this._getHistoryEventIcon(evt)}
                    </div>
                    <div class="timeline-content">
                      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
                        <p class="timeline-title">${evt.details || evt.name || evt.event}</p>
                        ${this._getHistoryEventBadge(evt)}
                      </div>
                      <p class="timeline-time">${this._formatEventTime(evt.timestamp)}</p>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          `}
        </div>
      `;
    }

    _getFilteredSensors() {
      const sensors = (this._config && this._config.sensors) ? Object.values(this._config.sensors) : [];
      let filtered = sensors;
      if (this._typeFilter !== 'all') {
        filtered = filtered.filter(s => s.type === this._typeFilter);
      }
      if (this._zoneFilter !== 'all') {
        filtered = filtered.filter(s => s.zone === this._zoneFilter);
      }
      if (this._searchFilter) {
        const q = this._searchFilter.toLowerCase().trim();
        filtered = filtered.filter(s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          s.entity_id.toLowerCase().includes(q)
        );
      }
      return filtered;
    }

    _renderSensorsTableRows(filtered) {
      if (filtered.length === 0) {
        return `<tr><td colspan="8" style="text-align: center; color: var(--secondary-text-color, #757575); padding: 24px;">Keine Sensoren gefunden.</td></tr>`;
      }
      return filtered.map(s => {
        const haState = this._hass && this._hass.states[s.entity_id];
        const isOn = haState && haState.state === 'on';
        const isOff = haState && haState.state === 'off';
        const isIgnored = (this._config.ignored_sensors || []).includes(s.entity_id);
        const bInfo = (this._config.sensor_batteries || {})[s.entity_id];
        let batteryBadge = `<span style="color: var(--secondary-text-color, #757575); font-size: 12px;">${this._t("mainsPowered")}</span>`;
        if (bInfo && bInfo.level !== null && bInfo.level !== undefined) {
          const isLow = bInfo.is_low || bInfo.level < 15;
          batteryBadge = `
            <span class="badge" style="background: ${isLow ? 'rgba(211, 47, 47, 0.15)' : 'rgba(46, 125, 50, 0.15)'}; color: ${isLow ? '#d32f2f' : '#2e7d32'}; border: 1px solid ${isLow ? 'rgba(211, 47, 47, 0.3)' : 'rgba(46, 125, 50, 0.3)'};">
              ${isLow ? '🪫' : '🔋'} ${bInfo.level}%
            </span>
          `;
        }

        return `
          <tr>
            <td>
              <strong>${s.name}</strong><br>
              <small style="color: var(--secondary-text-color, #888);">${s.entity_id}</small>
            </td>
            <td><span class="badge badge-zone">${s.zone}</span></td>
            <td>
              <span class="badge badge-${s.type}">
                ${this._getTypeIcon(s.type)} ${this._getTypeName(s.type)}
              </span>
            </td>
            <td>${s.pre_alarm_delay ? s.pre_alarm_delay + 's' : 'Sofort'}</td>
            <td>
              ${s.double_knock ? '<span class="badge badge-feature-dk">Double-Knock</span> ' : ''}
              ${s.auto_ack_on_clear ? '<span class="badge badge-feature-ack">Auto-Ack</span> ' : ''}
              ${(!s.double_knock && !s.auto_ack_on_clear) ? '<span style="color: var(--secondary-text-color, #757575); font-size: 12px;">Standard</span>' : ''}
            </td>
            <td>${batteryBadge}</td>
            <td>
              <span class="badge ${isOn ? 'badge-status-on' : isOff ? 'badge-status-off' : 'badge-status-offline'}">
                ${isOn ? (isIgnored ? 'GEFAHR (Ignoriert)' : 'GEFAHR') : isOff ? (isIgnored ? 'Normal (Ignoriert)' : 'Normal') : 'Offline'}
              </span>
            </td>
            <td>
              <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;">
                ${s.test_entity ? `<button class="btn-sm btn-sensor-test" data-entity-id="${s.entity_id}" title="${this._t("testEntityHelp")}">${this._t("btnSelfTest")}</button>` : ''}
                ${s.drill_entity ? `<button class="btn-sm btn-sensor-drill" data-entity-id="${s.entity_id}" title="${this._t("drillEntityHelp")}">${this._t("btnDrill")}</button>` : ''}
                ${s.silence_entity ? `<button class="btn-sm btn-sensor-silence" data-entity-id="${s.entity_id}" title="${this._t("silenceEntityHelp")}">${this._t("btnMuteSensor")}</button>` : ''}
                <button class="btn-sm btn-edit-sensor" data-entity-id="${s.entity_id}">${this._t("edit")}</button>
                <button class="btn-sm danger btn-delete-sensor" data-entity-id="${s.entity_id}">${this._t("delete")}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    _updateSensorsTable() {
      const root = this.shadowRoot;
      if (!root) return;
      const tbody = root.querySelector('#sensors-table-body');
      if (!tbody) return;
      const filtered = this._getFilteredSensors();
      tbody.innerHTML = this._renderSensorsTableRows(filtered);
      this._attachSensorRowListeners();
    }

    _attachSensorRowListeners() {
      const root = this.shadowRoot;
      if (!root) return;
      root.querySelectorAll('.btn-edit-sensor').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const eid = e.currentTarget.dataset.entityId;
          const found = (this._config.sensors && this._config.sensors[eid]) || {};
          this._editingSensor = JSON.parse(JSON.stringify(found));
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

      root.querySelectorAll('.btn-sensor-test').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const targetBtn = e.currentTarget;
          const eid = targetBtn.dataset.entityId;
          const orig = targetBtn.innerHTML;
          targetBtn.disabled = true;
          targetBtn.innerHTML = '⏳...';
          try {
            await this._triggerSensorButton(eid, 'test');
            targetBtn.innerHTML = '✅';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2000);
          } catch (_) {
            targetBtn.innerHTML = '❌';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2500);
          }
        });
      });

      root.querySelectorAll('.btn-sensor-drill').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const targetBtn = e.currentTarget;
          const eid = targetBtn.dataset.entityId;
          const orig = targetBtn.innerHTML;
          targetBtn.disabled = true;
          targetBtn.innerHTML = '⏳...';
          try {
            await this._triggerSensorButton(eid, 'drill');
            targetBtn.innerHTML = '✅';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2000);
          } catch (_) {
            targetBtn.innerHTML = '❌';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2500);
          }
        });
      });

      root.querySelectorAll('.btn-sensor-silence').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const targetBtn = e.currentTarget;
          const eid = targetBtn.dataset.entityId;
          const orig = targetBtn.innerHTML;
          targetBtn.disabled = true;
          targetBtn.innerHTML = '⏳...';
          try {
            await this._triggerSensorButton(eid, 'silence');
            targetBtn.innerHTML = '✅';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2000);
          } catch (_) {
            targetBtn.innerHTML = '❌';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2500);
          }
        });
      });
    }

    _getCandidateType(c) {
      if (c.device_class && ["smoke", "moisture", "gas", "carbon_monoxide", "heat"].includes(c.device_class)) {
        return c.device_class;
      }
      const idAndName = `${c.entity_id || ''} ${c.name || ''}`.toLowerCase();
      if (idAndName.includes('smoke') || idAndName.includes('rauch')) return 'smoke';
      if (idAndName.includes('moisture') || idAndName.includes('water') || idAndName.includes('wasser') || idAndName.includes('leak')) return 'moisture';
      if (idAndName.includes('gas')) return 'gas';
      if (idAndName.includes('co_') || idAndName.includes('carbon') || idAndName.includes('monoxid')) return 'carbon_monoxide';
      if (idAndName.includes('heat') || idAndName.includes('hitze') || idAndName.includes('temp')) return 'heat';
      return c.device_class || 'generic';
    }

    _getFilteredCandidates() {
      const list = (this._candidates || []).filter(c => !c.monitored);
      const search = (this._candidateSearchFilter || "").trim().toLowerCase();
      const type = this._candidateTypeFilter || "all";

      return list.filter(c => {
        const cType = this._getCandidateType(c);
        if (type !== "all" && cType !== type) {
          return false;
        }
        if (search) {
          const name = (c.name || "").toLowerCase();
          const entityId = (c.entity_id || "").toLowerCase();
          const devClass = (c.device_class || "").toLowerCase();
          const typeName = (this._getTypeName(cType) || "").toLowerCase();
          if (!name.includes(search) && !entityId.includes(search) && !devClass.includes(search) && !typeName.includes(search)) {
            return false;
          }
        }
        return true;
      });
    }

    _renderCandidateCards(candidates) {
      if (!candidates || candidates.length === 0) {
        return `
          <div style="padding: 24px 12px; text-align: center; color: var(--secondary-text-color, #757575); font-size: 13px;">
            🔍 ${this._t("noMatchingCandidates")}
          </div>
        `;
      }
      return candidates.map(c => {
        const cType = this._getCandidateType(c);
        return `
          <div class="candidate-card candidate-chip">
            <div class="candidate-header-row">
              <div class="candidate-type-badge">
                <span class="candidate-type-icon">${this._getTypeIcon(cType)}</span>
                <span class="badge badge-${cType}">
                  ${this._getTypeName(cType)}
                </span>
              </div>
              <button class="btn-add-cand" data-cand-id="${c.entity_id}" data-cand-class="${cType}">
                + ${this._t("addCandidate")}
              </button>
            </div>
            <div class="candidate-details">
              <div class="candidate-name">${c.name}</div>
              ${(c.entity_id && c.entity_id !== c.name) ? `
                <div class="candidate-entity">${c.entity_id}</div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    _updateCandidatesList() {
      const root = this.shadowRoot;
      if (!root) return;
      const candList = root.querySelector('.candidate-list');
      if (!candList) return;
      const filtered = this._getFilteredCandidates();
      candList.innerHTML = this._renderCandidateCards(filtered);

      const countLabel = root.querySelector('#candidate-count-label');
      const allNotMonitored = (this._candidates || []).filter(c => !c.monitored);
      if (countLabel) {
        if (filtered.length !== allNotMonitored.length) {
          countLabel.textContent = `(${filtered.length} von ${allNotMonitored.length} gefiltert · vertikal scrollbar)`;
        } else {
          countLabel.textContent = `(${allNotMonitored.length} verfügbar · vertikal scrollbar)`;
        }
      }

      candList.scrollTop = 0;
      this._attachCandidateListeners();
    }

    _attachCandidateListeners() {
      const root = this.shadowRoot;
      if (!root) return;
      root.querySelectorAll('.btn-add-cand').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const cList = root.querySelector('.candidate-list');
          if (cList) {
            this._candidateScrollTop = cList.scrollTop;
          }
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
            silence_entity: (cand && cand.suggested_silence) || '',
            drill_entity: (cand && cand.suggested_drill) || '',
            test_entity: (cand && cand.suggested_test) || '',
            test_result_entity: (cand && cand.suggested_test_result) || '',
            battery_entity: (cand && cand.suggested_battery) || '',
          };
          this._modalOpen = 'sensor';
          this._render();
        });
      });
    }

    _renderSensorsTab(sensors, zones) {
      const candidatesNotMonitored = this._candidates.filter(c => !c.monitored);
      const filteredCandidates = this._getFilteredCandidates();
      const filtered = this._getFilteredSensors();

      return `
        ${candidatesNotMonitored.length > 0 ? `
          <div class="candidate-box">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-bottom: 8px;">
              <strong>✨ ${this._t("candidateBanner", { count: candidatesNotMonitored.length })}</strong>
              <small id="candidate-count-label" style="color: var(--secondary-text-color, #757575); font-size: 12px;">
                ${filteredCandidates.length !== candidatesNotMonitored.length
                  ? `(${filteredCandidates.length} von ${candidatesNotMonitored.length} gefiltert · vertikal scrollbar)`
                  : `(${candidatesNotMonitored.length} verfügbar · vertikal scrollbar)`}
              </small>
            </div>
            <div class="candidate-toolbar toolbar" style="margin-bottom: 10px; gap: 8px;">
              <input
                type="search"
                class="search-input"
                id="search-candidates"
                placeholder="${this._t("searchCandidatesPlaceholder")}"
                value="${this._candidateSearchFilter || ''}"
                style="min-width: 180px; padding: 8px 12px; font-size: 13px;"
              >
              <select
                class="select-filter"
                id="filter-candidate-type"
                style="padding: 8px 12px; font-size: 13px;"
              >
                <option value="all" ${this._candidateTypeFilter === 'all' ? 'selected' : ''}>${this._t("filterAllTypes")}</option>
                <option value="smoke" ${this._candidateTypeFilter === 'smoke' ? 'selected' : ''}>🔥 ${this._t("typeSmoke")}</option>
                <option value="moisture" ${this._candidateTypeFilter === 'moisture' ? 'selected' : ''}>💧 ${this._t("typeMoisture")}</option>
                <option value="gas" ${this._candidateTypeFilter === 'gas' ? 'selected' : ''}>☣️ ${this._t("typeGas")}</option>
                <option value="carbon_monoxide" ${this._candidateTypeFilter === 'carbon_monoxide' ? 'selected' : ''}>⚠️ ${this._t("typeCO")}</option>
                <option value="heat" ${this._candidateTypeFilter === 'heat' ? 'selected' : ''}>🌡️ ${this._t("typeHeat")}</option>
                <option value="generic" ${this._candidateTypeFilter === 'generic' ? 'selected' : ''}>🛡️ ${this._t("typeGeneric")}</option>
              </select>
            </div>
            <div class="candidate-list">
              ${this._renderCandidateCards(filteredCandidates)}
            </div>
          </div>
        ` : ''}

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🚨 ${this._t("tabSensors")}</h3>
            <button class="btn-primary" id="btn-open-add-sensor">+ ${this._t("btnAddSensor")}</button>
          </div>

          <div class="toolbar">
            <input type="text" class="search-input" id="search-sensors" placeholder="${this._t("searchSensorsPlaceholder")}" value="${this._searchFilter || ''}">
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
                  <th>${this._t("batteryStatus")}</th>
                  <th>${this._t("thStatus")}</th>
                  <th>${this._t("thActions")}</th>
                </tr>
              </thead>
              <tbody id="sensors-table-body">
                ${this._renderSensorsTableRows(filtered)}
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
      const restoreActions = actions.filter(a => a.phase === 'restore');
      const systemActions = actions.filter(a => a.phase === 'system');

      const renderActionList = (list) => {
        if (list.length === 0) return '<p style="color: var(--secondary-text-color, #757575); font-size: 13px;">Keine Aktionen in dieser Phase konfiguriert.</p>';
        return list.map(a => {
          const repeatBadge = (a.repeat_interval && a.repeat_interval > 0)
            ? `<span class="repeat-badge" title="Wiederholung alle ${a.repeat_interval} Sekunden während Alarm">🔄 alle ${a.repeat_interval}s</span>`
            : '';
          const targetEntities = a.target && a.target.entity_id
            ? (Array.isArray(a.target.entity_id) ? a.target.entity_id.filter(Boolean) : [a.target.entity_id].filter(Boolean))
            : [];
          let targetDisplay = '';
          if (targetEntities.length > 0) {
            targetDisplay = ` · Ziel: <code>${targetEntities.join(', ')}</code>`;
          } else if (a.service && !a.service.startsWith('notify.')) {
            targetDisplay = ` · Ziel: <span style="color: var(--warning-color, #ff9800); font-size: 11px;">⚠️ Nicht festgelegt</span>`;
          }

          return `
            <div class="action-item-row">
              <div class="action-item-info">
                <strong>${a.name}</strong> <span style="font-size: 12px; color: var(--secondary-text-color, #757575);">(${a.service})</span>${repeatBadge}<br>
                <small style="color: var(--secondary-text-color, #757575); line-height: 1.4; display: inline-block; margin-top: 2px;">
                  ${a.phase === 'system' ? 'System-Ereignisse' : 'Gefahrentypen'}: ${(a.trigger_types && a.trigger_types.length > 0) ? a.trigger_types.map(t => `${this._getTypeIcon(t)} ${this._getTypeName(t)}`).join(', ') : 'Alle'}
                  ${targetDisplay}
                </small>
              </div>
              <div class="action-item-btns">
                <button class="btn-sm action-test btn-test-action" data-action-id="${a.id}">⚡ ${this._t("testAction")}</button>
                <button class="btn-sm btn-edit-action" data-action-id="${a.id}">${this._t("edit")}</button>
                <button class="btn-sm danger btn-delete-action" data-action-id="${a.id}">${this._t("delete")}</button>
              </div>
            </div>
          `;
        }).join('');
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

          <div class="phase-card">
            <div class="phase-header">
              <h4 class="phase-name">🔄 ${this._t("phaseRestore")}</h4>
            </div>
            <p class="phase-desc">${this._t("phaseRestoreDesc")}</p>
            ${renderActionList(restoreActions)}
          </div>

          <div class="phase-card">
            <div class="phase-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <h4 class="phase-name">🛠️ ${this._t("phaseSystem")}</h4>
              <button class="btn-sm btn-open-add-phase-action" data-phase="system">+ ${this._t("btnAddAction")}</button>
            </div>
            <p class="phase-desc">${this._t("phaseSystemDesc")}</p>
            ${renderActionList(systemActions)}
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
                  <th>${this._t("thActions")}</th>
                </tr>
              </thead>
              <tbody>
                ${zones.map(z => `
                  <tr>
                    <td><strong>${z.name}</strong></td>
                    <td><code>${z.id}</code></td>
                    <td>${z.double_knock_enabled ? '✅ ' + this._t('yes') + ' (' + z.double_knock_timeout + 's)' : '❌ ' + this._t('no')}</td>
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
            <label class="form-label">${this._t("lblLanguage")}</label>
            <select class="form-control" id="setting-language">
              <option value="auto" ${(settings.language || 'auto') === 'auto' ? 'selected' : ''}>${this._t("langAuto")}</option>
              <option value="en" ${settings.language === 'en' ? 'selected' : ''}>${this._t("langEn")}</option>
              <option value="de" ${settings.language === 'de' ? 'selected' : ''}>${this._t("langDe")}</option>
              <option value="fr" ${settings.language === 'fr' ? 'selected' : ''}>${this._t("langFr")}</option>
              <option value="es" ${settings.language === 'es' ? 'selected' : ''}>${this._t("langEs")}</option>
              <option value="it" ${settings.language === 'it' ? 'selected' : ''}>${this._t("langIt")}</option>
              <option value="nl" ${settings.language === 'nl' ? 'selected' : ''}>${this._t("langNl")}</option>
              <option value="pl" ${settings.language === 'pl' ? 'selected' : ''}>${this._t("langPl")}</option>
              <option value="pt" ${settings.language === 'pt' ? 'selected' : ''}>${this._t("langPt")}</option>
              <option value="ru" ${settings.language === 'ru' ? 'selected' : ''}>${this._t("langRu")}</option>
              <option value="sv" ${settings.language === 'sv' ? 'selected' : ''}>${this._t("langSv")}</option>
            </select>
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
          <div class="form-group">
            <label class="form-label">${this._t("lblHistoryDefaultTime")}</label>
            <select class="form-control" id="setting-history-default-time">
              <option value="24h" ${(settings.history_default_time || '24h') === '24h' ? 'selected' : ''}>${this._t("historyTime24h")}</option>
              <option value="1h" ${settings.history_default_time === '1h' ? 'selected' : ''}>${this._t("historyTime1h")}</option>
              <option value="6h" ${settings.history_default_time === '6h' ? 'selected' : ''}>${this._t("historyTime6h")}</option>
              <option value="12h" ${settings.history_default_time === '12h' ? 'selected' : ''}>${this._t("historyTime12h")}</option>
              <option value="3d" ${settings.history_default_time === '3d' ? 'selected' : ''}>${this._t("historyTime3d")}</option>
              <option value="all" ${settings.history_default_time === 'all' ? 'selected' : ''}>${this._t("historyTimeAll")}</option>
            </select>
          </div>

          <hr style="border: none; border-top: 1px solid var(--divider-color, rgba(127,127,127,0.2)); margin: 20px 0;">
          <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #00796b;">
            🧪 ${this._t("autoSelfTestTitle")}
          </h4>
          <p style="color: var(--secondary-text-color, #757575); font-size: 13px; margin: 0 0 14px 0;">
            ${this._t("autoSelfTestDesc")}
          </p>
          <div class="form-group">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-weight: 600;">
              <input type="checkbox" id="setting-auto-self-test-enabled" ${settings.auto_self_test_enabled ? 'checked' : ''}>
              ${this._t("lblAutoSelfTestEnabled")}
            </label>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 12px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">${this._t("lblAutoSelfTestDay")}</label>
              <input type="number" min="1" max="31" class="form-control" id="setting-auto-self-test-day" value="${settings.auto_self_test_day || 1}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">${this._t("lblAutoSelfTestTime")}</label>
              <input type="time" class="form-control" id="setting-auto-self-test-time" value="${settings.auto_self_test_time || '11:00'}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">${this._t("lblAutoSelfTestStep")}</label>
              <input type="number" min="10" max="600" class="form-control" id="setting-auto-self-test-step" value="${settings.auto_self_test_step_seconds || 60}">
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 20px;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" id="setting-auto-self-test-notify" ${settings.auto_self_test_notify !== false ? 'checked' : ''}>
              ${this._t("lblAutoSelfTestNotify")}
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
                <div id="modal-sensor-entity-preview">
                  ${this._renderTargetPreview(s.entity_id || '')}
                </div>
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
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                  <input type="checkbox" id="modal-sensor-double-knock" ${s.double_knock ? 'checked' : ''}>
                  ${this._t("doubleKnockHelp")}
                </label>
              </div>
              <div class="form-group">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                  <input type="checkbox" id="modal-sensor-auto-ack" ${s.auto_ack_on_clear ? 'checked' : ''}>
                  ${this._t("autoAckHelp")}
                </label>
              </div>

              <!-- Detector specific control entities -->
              <div style="margin-top: 12px; margin-bottom: 12px; padding: 12px; background: var(--secondary-background-color, rgba(127, 127, 127, 0.08)); border-radius: 8px; border: 1px solid var(--ha-card-border-color, var(--divider-color, rgba(127, 127, 127, 0.2)));">
                <div style="font-weight: 600; font-size: 13px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                  <span>🔕</span> <span>Erweiterte Melder-Funktionen & Tasten</span>
                </div>
                
                <div class="form-group" style="margin-bottom: 14px; position: relative;">
                  <label class="form-label">${this._t("silenceEntity")}</label>
                  <div style="position: relative;">
                    <input
                      type="text"
                      class="form-control"
                      id="modal-sensor-silence"
                      value="${s.silence_entity || ''}"
                      placeholder="button.rauchmelder_silence"
                      autocomplete="off"
                    >
                    <div id="sensor-silence-suggestions" class="suggestions-dropdown"></div>
                  </div>
                  <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 2px;">
                    ${this._t("silenceEntityHelp")}
                  </small>
                  <div id="modal-sensor-silence-preview">
                    ${this._renderTargetPreview(s.silence_entity || '')}
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 14px; position: relative;">
                  <label class="form-label">${this._t("testEntity")}</label>
                  <div style="position: relative;">
                    <input
                      type="text"
                      class="form-control"
                      id="modal-sensor-test"
                      value="${s.test_entity || ''}"
                      placeholder="button.rauchmelder_self_test"
                      autocomplete="off"
                    >
                    <div id="sensor-test-suggestions" class="suggestions-dropdown"></div>
                  </div>
                  <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 2px;">
                    ${this._t("testEntityHelp")}
                  </small>
                  <div id="modal-sensor-test-preview">
                    ${this._renderTargetPreview(s.test_entity || '')}
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 14px; position: relative;">
                  <label class="form-label">${this._t("testResultEntity")}</label>
                  <div style="position: relative;">
                    <input
                      type="text"
                      class="form-control"
                      id="modal-sensor-test-result"
                      value="${s.test_result_entity || ''}"
                      placeholder="sensor.rauchmelder_last_self_test"
                      autocomplete="off"
                    >
                    <div id="sensor-test-result-suggestions" class="suggestions-dropdown"></div>
                  </div>
                  <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 2px;">
                    ${this._t("testResultEntityHelp")}
                  </small>
                  <div id="modal-sensor-test-result-preview">
                    ${this._renderTargetPreview(s.test_result_entity || '')}
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 14px; position: relative;">
                  <label class="form-label">${this._t("drillEntity")}</label>
                  <div style="position: relative;">
                    <input
                      type="text"
                      class="form-control"
                      id="modal-sensor-drill"
                      value="${s.drill_entity || ''}"
                      placeholder="button.rauchmelder_alarm_drill"
                      autocomplete="off"
                    >
                    <div id="sensor-drill-suggestions" class="suggestions-dropdown"></div>
                  </div>
                  <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 2px;">
                    ${this._t("drillEntityHelp")}
                  </small>
                  <div id="modal-sensor-drill-preview">
                    ${this._renderTargetPreview(s.drill_entity || '')}
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 0; position: relative;">
                  <label class="form-label">${this._t("batteryEntity")}</label>
                  <div style="position: relative;">
                    <input
                      type="text"
                      class="form-control"
                      id="modal-sensor-battery"
                      value="${s.battery_entity || ''}"
                      placeholder="sensor.rauchmelder_battery"
                      autocomplete="off"
                    >
                    <div id="sensor-battery-suggestions" class="suggestions-dropdown"></div>
                  </div>
                  <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 2px;">
                    ${this._t("batteryEntityHelp")}
                  </small>
                  <div id="modal-sensor-battery-preview">
                    ${this._renderTargetPreview(s.battery_entity || '')}
                  </div>
                </div>
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
                <button class="btn-modal-save-zone btn btn-primary" id="btn-modal-save-zone">${this._t("save")}</button>
              </div>
            </div>
          </div>
        `;
      }

      if (this._modalOpen === 'action') {
        const a = this._editingAction || {};
        const currentTarget = (a.target && a.target.entity_id) ? (Array.isArray(a.target.entity_id) ? a.target.entity_id.join(', ') : a.target.entity_id) : '';
        const currentService = a.service || '';
        const targetDomain = currentTarget ? currentTarget.split(',')[0].trim().split('.')[0] : (currentService ? currentService.split('.')[0] : '');
        const availableServices = this._getServicesForDomain(targetDomain);

        return `
          <div class="modal-backdrop">
            <div class="modal-content" style="max-width: 640px;">
              <h3>${a.id ? this._t("edit") : this._t("btnAddAction")}</h3>

              <!-- Name -->
              <div class="form-group">
                <label class="form-label">Aktions-Name</label>
                <input type="text" class="form-control" id="modal-act-name" value="${a.name || ''}" placeholder="Hauptwasserhahn schließen">
              </div>

              <!-- Phase / Escalation -->
              <div class="form-group">
                <label class="form-label">Eskalations-Stufe / Phase</label>
                <select class="form-control" id="modal-act-phase">
                  <option value="cutoff" ${a.phase === 'cutoff' ? 'selected' : ''}>🚪 Stufe 1: Notabschaltung (Cutoff)</option>
                  <option value="notification" ${a.phase === 'notification' ? 'selected' : ''}>📱 Stufe 2: Benachrichtigung</option>
                  <option value="acoustic_optical" ${a.phase === 'acoustic_optical' ? 'selected' : ''}>🚨 Stufe 3: Akustisch & Optisch</option>
                  <option value="restore" ${a.phase === 'restore' ? 'selected' : ''}>🔄 ${this._t("phaseRestore")}</option>
                  <option value="system" ${a.phase === 'system' ? 'selected' : ''}>🛠️ ${this._t("phaseSystem")}</option>
                </select>
                <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 4px;" id="modal-act-phase-desc">
                  ${a.phase === 'system'
                    ? "Stufe 5: System- & Wartungsmeldungen bei schwacher Batterie, Offline-Meldern oder fehlgeschlagenen Selbsttests."
                    : "Stufe 1: Notfall-Aktoren. Stufe 2: Push-Meldungen. Stufe 3: Sirenen/Licht. Stufe 4: Nach Alarm (Entwarnung). Stufe 5: Systemmeldungen (Batterie, Offline & Selbsttest)."
                  }
                </small>
              </div>

              <!-- Repeat Loop -->
              <div class="form-group">
                <label class="form-label">${this._t("actionRepeat")}</label>
                <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                  <input
                    type="number"
                    class="form-control"
                    id="modal-act-repeat"
                    value="${a.repeat_interval || 0}"
                    min="0"
                    step="5"
                    style="max-width: 140px;"
                  >
                  <span style="font-size: 13px; color: var(--secondary-text-color, #757575);">Sekunden (0 = einmalig)</span>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px;">
                  <button type="button" class="btn-data-preset act-repeat-preset" data-repeat="0">0s (Einmalig)</button>
                  <button type="button" class="btn-data-preset act-repeat-preset" data-repeat="30">30s</button>
                  <button type="button" class="btn-data-preset act-repeat-preset" data-repeat="60">60s (1 Min)</button>
                  <button type="button" class="btn-data-preset act-repeat-preset" data-repeat="120">120s (2 Min)</button>
                  <button type="button" class="btn-data-preset act-repeat-preset" data-repeat="300">300s (5 Min)</button>
                </div>
                <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block;">
                  ${this._t("actionRepeatHelp")}
                </small>
              </div>

              <!-- Hazard / Event Types -->
              <div class="form-group" id="modal-act-types-group">
                <label class="form-label" id="modal-act-types-label">
                  ${a.phase === 'system' ? (this._t("actionSystemEvents") || "Auslösen bei folgenden System-Ereignissen:") : (this._t("actionTriggerTypes") || "Auslösen bei folgenden Gefahrentypen:")}
                </label>
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px;" id="modal-act-types-container">
                  ${this._renderModalTriggerCheckboxes(a.phase, a.trigger_types)}
                </div>
              </div>

              <!-- Target Entity with Live Search & Preview -->
              <div class="form-group" style="position: relative;">
                <label class="form-label">${this._t("actionTarget")}</label>
                <div style="position: relative;">
                  <input
                    type="text"
                    class="form-control"
                    id="modal-act-target"
                    value="${currentTarget}"
                    placeholder="${this._t("targetPlaceholder")}"
                    autocomplete="off"
                  >
                  <div id="action-target-suggestions" class="suggestions-dropdown"></div>
                </div>
                <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 4px;">
                  ${this._t("targetHelp")}
                </small>
                <div id="action-target-preview">
                  ${this._renderTargetPreview(currentTarget)}
                </div>
              </div>

              <!-- Service Selection with Dynamic Options based on Target -->
              <div class="form-group">
                <label class="form-label">${this._t("actionService")}</label>
                <div style="margin-bottom: 6px;">
                  <label style="font-size: 11px; font-weight: 600; color: var(--secondary-text-color, #757575); display: block; margin-bottom: 3px;">
                    ${this._t("serviceSelectLabel")}
                  </label>
                  <select class="form-control" id="modal-act-service-select">
                    ${availableServices.map(s => `
                      <option value="${s.service}" ${currentService === s.service ? 'selected' : ''}>
                        ${s.icon || '⚡'} ${s.service} — ${s.label || s.service} ${s.recommended ? '⭐ [Empfohlen]' : ''}
                      </option>
                    `).join('')}
                    <option value="custom" ${(!availableServices.some(s => s.service === currentService) && currentService) ? 'selected' : ''}>
                      ${this._t("serviceCustomOption")}
                    </option>
                  </select>
                </div>
                <input
                  type="text"
                  class="form-control"
                  id="modal-act-service"
                  value="${currentService}"
                  placeholder="valve.close_valve"
                >
                <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 4px;">
                  ${this._t("serviceHelp")}
                </small>
              </div>

              <!-- Payload / Service Data with Presets, Placeholders & Validation -->
              <div class="form-group">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                  <label class="form-label" style="margin-bottom: 0;">${this._t("actionPayload")}</label>
                  <span id="act-data-validation-badge" style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; background: rgba(76, 175, 80, 0.15); color: #4caf50;">
                    ${this._t("validJson")}
                  </span>
                </div>

                <!-- Explanation Box -->
                <div style="background: rgba(2, 136, 209, 0.08); border: 1px solid rgba(2, 136, 209, 0.25); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; font-size: 12px; line-height: 1.45;">
                  <div style="font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                    <span>ℹ️</span> <span>${this._t("payloadHelpTitle")}</span>
                  </div>
                  <div style="color: var(--secondary-text-color, #757575);">
                    ${this._t("payloadHelpDesc")}
                  </div>
                </div>

                <!-- Presets -->
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; font-weight: 600; color: var(--secondary-text-color, #757575); margin-bottom: 4px;">
                    ${this._t("presetsTitle")}
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="empty">${this._t("presetEmpty")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="notify">${this._t("presetNotify")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="critical">${this._t("presetCritical")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="red_light">${this._t("presetRedLight")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="siren">${this._t("presetSiren")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="all_clear">${this._t("presetAllClear")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="script">${this._t("presetScript")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="system_warning">${this._t("presetSystem")}</button>
                    <button type="button" class="btn-data-preset data-preset-btn" data-preset="self_test_failed">${this._t("presetSelfTestFailed")}</button>
                  </div>
                </div>

                <!-- Template Placeholders -->
                <div style="margin-bottom: 8px;">
                  <div style="font-size: 11px; font-weight: 600; color: var(--secondary-text-color, #757575); margin-bottom: 4px;">
                    ${this._t("variablesTitle")}
                  </div>
                  <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                    <span class="btn-data-var data-var-chip" data-var="{{ sensor_name }}" title="Name des auslösenden Sensors">+ {{ sensor_name }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ zone }}" title="Gefahrenzone / Raum">+ {{ zone }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ hazard_type }}" title="Gefahrentyp (z. B. Rauch, Wasserleckage, Selbsttest-Fehler)">+ {{ hazard_type }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ battery_level }}" title="Batteriestand in % (z. B. 12)">+ {{ battery_level }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ event }}" title="Ereignis (battery_low, sensor_offline oder self_test_failed)">+ {{ event }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ failed_sensors }}" title="Fehlgeschlagene Melder beim Selbsttest (z. B. Rauchmelder Schlafzimmer)">+ {{ failed_sensors }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ failed_count }}" title="Anzahl fehlgeschlagener Melder beim Selbsttest (z. B. 1)">+ {{ failed_count }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ message }}" title="Automatische Status-/Warnmeldung">+ {{ message }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ timestamp }}" title="Auslöse-Zeitpunkt (Datum + Uhrzeit)">+ {{ timestamp }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ time }}" title="Uhrzeit (z. B. 13:45:00)">+ {{ time }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ entity_id }}" title="Entitäts-ID des Sensors">+ {{ entity_id }}</span>
                    <span class="btn-data-var data-var-chip" data-var="{{ state }}" title="Status (triggered / normal / battery_low / offline / self_test_failed)">+ {{ state }}</span>
                  </div>
                  <small style="color: var(--secondary-text-color, #757575); font-size: 11px; display: block; margin-top: 5px;">
                    💡 Beim Testen der Aktion werden Platzhalter automatisch durch realistische Beispieldaten passend zu den gewählten Gefahrentypen ersetzt!
                  </small>
                </div>

                <textarea
                  class="form-control"
                  id="modal-act-data"
                  rows="4"
                  style="font-family: monospace; font-size: 12px; resize: vertical;"
                >${JSON.stringify(a.data || {}, null, 2)}</textarea>
                <div id="modal-act-data-error" style="display: none; color: #f44336; font-size: 11px; margin-top: 4px;"></div>
              </div>

              <!-- Modal Actions -->
              <div class="modal-actions" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button type="button" class="btn action-modal-test" id="btn-modal-test-action" title="Dienst sofort mit Beispieldaten testen">
                    ⚡ ${this._t("testAction")}
                  </button>
                  <div id="modal-test-action-feedback" style="display: none; font-size: 12px; max-width: 360px; word-break: break-word; line-height: 1.35;"></div>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-secondary" id="btn-modal-cancel">${this._t("cancel")}</button>
                  <button class="btn btn-primary" id="btn-modal-save-action">${this._t("save")}</button>
                </div>
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

      const btnTestExit = root.querySelector('#btn-test-exit');
      if (btnTestExit) btnTestExit.addEventListener('click', () => this._toggleTestMode());

      const btnTestDrillSingle = root.querySelector('#btn-test-drill-single');
      if (btnTestDrillSingle) btnTestDrillSingle.addEventListener('click', () => this._triggerSingleDrill());

      const btnTestSelfSeq = root.querySelector('#btn-test-self-sequential');
      if (btnTestSelfSeq) btnTestSelfSeq.addEventListener('click', () => this._startSequentialSelfTest());

      const btnTestSelfCancel = root.querySelector('#btn-test-self-cancel');
      if (btnTestSelfCancel) btnTestSelfCancel.addEventListener('click', () => this._cancelSequentialSelfTest());

      const btnTestDrillAll = root.querySelector('#btn-test-drill-all');
      if (btnTestDrillAll) btnTestDrillAll.addEventListener('click', () => this._triggerAllSensorButtons('drill'));

      const btnTestSelfAll = root.querySelector('#btn-test-self-all');
      if (btnTestSelfAll) btnTestSelfAll.addEventListener('click', () => this._triggerAllSensorButtons('test'));

      const btnManualTrigger = root.querySelector('#btn-manual-trigger');
      if (btnManualTrigger) btnManualTrigger.addEventListener('click', () => this._manualTrigger());

      const btnGotoSensors = root.querySelector('#btn-goto-sensors');
      if (btnGotoSensors) {
        btnGotoSensors.addEventListener('click', () => {
          this._activeTab = 'sensors';
          this._render();
        });
      }

      // History Filter Listeners
      const filterHistType = root.querySelector('#history-filter-type');
      if (filterHistType) {
        filterHistType.addEventListener('change', (e) => {
          this._historyTypeFilter = e.target.value;
          try {
            localStorage.setItem("sm_history_type_filter", this._historyTypeFilter);
          } catch (_) {}
          this._render();
        });
      }

      const filterHistTime = root.querySelector('#history-filter-time');
      if (filterHistTime) {
        filterHistTime.addEventListener('change', (e) => {
          this._historyTimeFilter = e.target.value;
          try {
            localStorage.setItem("sm_history_time_filter", this._historyTimeFilter);
          } catch (_) {}
          this._render();
        });
      }

      const btnHistShowAll = root.querySelector('#btn-history-show-all');
      if (btnHistShowAll) {
        btnHistShowAll.addEventListener('click', () => {
          this._historyTypeFilter = 'all';
          this._historyTimeFilter = 'all';
          try {
            localStorage.setItem("sm_history_type_filter", 'all');
            localStorage.setItem("sm_history_time_filter", 'all');
          } catch (_) {}
          this._render();
        });
      }

      // Active Hazard Row Actions (Silence device & Ignore sensor)
      root.querySelectorAll('.btn-silence-hazard').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const targetBtn = e.currentTarget;
          const eid = targetBtn.dataset.entityId;
          const orig = targetBtn.innerHTML;
          targetBtn.disabled = true;
          targetBtn.innerHTML = '⏳...';
          try {
            await this._triggerSensorButton(eid, 'silence');
            targetBtn.innerHTML = '✅ Stumm';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2000);
          } catch (_) {
            targetBtn.innerHTML = '❌';
            setTimeout(() => {
              targetBtn.innerHTML = orig;
              targetBtn.disabled = false;
            }, 2500);
          }
        });
      });

      root.querySelectorAll('.btn-ignore-hazard').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const eid = e.currentTarget.dataset.entityId;
          if (confirm(`Melder '${eid}' temporär ignorieren bis Sensor wieder normal (OFF) ist? Dies pausiert Sirenen.`)) {
            await this._setSensorIgnored(eid, true);
          }
        });
      });

      root.querySelectorAll('.btn-unignore-hazard').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const eid = e.currentTarget.dataset.entityId;
          await this._setSensorIgnored(eid, false);
        });
      });

      // Search & Filters
      const searchSensors = root.querySelector('#search-sensors');
      if (searchSensors) {
        searchSensors.addEventListener('input', (e) => {
          this._searchFilter = e.target.value;
          this._updateSensorsTable();
        });
      }

      const filterType = root.querySelector('#filter-type');
      if (filterType) {
        filterType.addEventListener('change', (e) => {
          this._typeFilter = e.target.value;
          this._updateSensorsTable();
        });
      }

      const filterZone = root.querySelector('#filter-zone');
      if (filterZone) {
        filterZone.addEventListener('change', (e) => {
          this._zoneFilter = e.target.value;
          this._updateSensorsTable();
        });
      }

      // Sensor Row Action Listeners
      this._attachSensorRowListeners();

      // Candidate Filter Listeners
      const searchCandidates = root.querySelector('#search-candidates');
      if (searchCandidates) {
        searchCandidates.addEventListener('input', (e) => {
          this._candidateSearchFilter = e.target.value;
          this._candidateScrollTop = 0;
          this._updateCandidatesList();
        });
      }

      const filterCandType = root.querySelector('#filter-candidate-type');
      if (filterCandType) {
        filterCandType.addEventListener('change', (e) => {
          this._candidateTypeFilter = e.target.value;
          this._candidateScrollTop = 0;
          this._updateCandidatesList();
        });
      }

      // Candidate List Scroll Tracking & Retention
      const candList = root.querySelector('.candidate-list');
      if (candList) {
        candList.addEventListener('scroll', () => {
          this._candidateScrollTop = candList.scrollTop;
        }, { passive: true });
        if (typeof this._candidateScrollTop === 'number' && this._candidateScrollTop > 0) {
          candList.scrollTop = this._candidateScrollTop;
        }
      }

      // Candidate Row Actions
      this._attachCandidateListeners();

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
                  <span class="badge badge-generic" style="font-size: 11px;">Bereits überwacht</span>
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
              const mainPreviewEl = root.querySelector('#modal-sensor-entity-preview');
              if (mainPreviewEl) {
                mainPreviewEl.innerHTML = this._renderTargetPreview(eid);
              }
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
          const val = e.target.value;
          const mainPreviewEl = root.querySelector('#modal-sensor-entity-preview');
          if (mainPreviewEl) {
            mainPreviewEl.innerHTML = this._renderTargetPreview(val);
          }
          renderSuggestions(val);
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

      // Reusable helper for single entity autocomplete dropdown & live preview
      const setupEntityAutocomplete = (inputEl, suggestionsEl, previewEl, filterFn, priorityTerms = []) => {
        if (!inputEl || !suggestionsEl) return;

        const getAllEntities = (query = "") => {
          if (!this._hass || !this._hass.states) return [];
          const list = [];
          Object.keys(this._hass.states).forEach(eid => {
            const st = this._hass.states[eid];
            if (filterFn(eid, st, query)) {
              const fn = (st.attributes && st.attributes.friendly_name) || eid;
              const dom = eid.split('.')[0];
              list.push({
                entity_id: eid,
                name: fn,
                domain: dom,
                state: st.state,
                stateObj: st,
              });
            }
          });
          return list;
        };

        const renderSuggestions = (query = "") => {
          const q = (query || "").toLowerCase().trim();
          const all = getAllEntities(q);
          const currentMainSensor = (root.querySelector('#modal-sensor-entity')?.value || '').toLowerCase().trim();
          const mainPrefix = currentMainSensor.includes('.') ? currentMainSensor.split('.')[1] : currentMainSensor;
          const mainTokens = mainPrefix ? mainPrefix.split('_').filter(t => t.length > 2) : [];

          let matches = all;
          if (q) {
            matches = all.filter(c =>
              c.entity_id.toLowerCase().includes(q) ||
              c.name.toLowerCase().includes(q)
            );
          }

          matches.sort((a, b) => {
            const aId = a.entity_id.toLowerCase();
            const bId = b.entity_id.toLowerCase();
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();

            let aScore = 0;
            let bScore = 0;
            if (mainPrefix && aId.includes(mainPrefix)) aScore += 100;
            if (mainPrefix && bId.includes(mainPrefix)) bScore += 100;

            mainTokens.forEach(tok => {
              if (aId.includes(tok) || aName.includes(tok)) aScore += 20;
              if (bId.includes(tok) || bName.includes(tok)) bScore += 20;
            });

            priorityTerms.forEach(term => {
              if (aId.includes(term) || aName.includes(term)) aScore += 15;
              if (bId.includes(term) || bName.includes(term)) bScore += 15;
            });

            if (aScore !== bScore) return bScore - aScore;
            return a.name.localeCompare(b.name);
          });

          if (matches.length === 0) {
            suggestionsEl.innerHTML = `
              <div style="padding: 10px 14px; font-size: 12px; color: var(--secondary-text-color, #757575);">
                Keine passenden Entitäten gefunden.
              </div>
            `;
            suggestionsEl.classList.add('visible');
            return;
          }

          const top = matches.slice(0, 20);
          suggestionsEl.innerHTML = top.map(c => {
            const domIcon = this._getDomainIcon(c.domain);
            const isMatch = mainPrefix && (c.entity_id.toLowerCase().includes(mainPrefix) || mainTokens.some(tok => c.entity_id.toLowerCase().includes(tok)));
            const uom = c.stateObj?.attributes?.unit_of_measurement;
            const stateDisplay = uom ? `${c.state} ${uom}` : c.state;
            return `
              <div class="suggestion-item" data-entity-id="${c.entity_id}">
                <div class="suggestion-info">
                  <span class="suggestion-name">
                    ${domIcon} <strong>${c.name}</strong> ${isMatch ? '<span style="color: #ff9800; font-size: 11px;">⭐ [Passend]</span>' : ''}
                  </span>
                  <span class="suggestion-entity">${c.entity_id}</span>
                </div>
                <div>
                  <span class="badge badge-generic" style="font-size: 11px;">
                    ${stateDisplay !== undefined ? stateDisplay : c.domain}
                  </span>
                </div>
              </div>
            `;
          }).join('');
          suggestionsEl.classList.add('visible');

          suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
              e.preventDefault();
              const eid = item.dataset.entityId;
              inputEl.value = eid;
              suggestionsEl.classList.remove('visible');
              if (previewEl) {
                previewEl.innerHTML = this._renderTargetPreview(eid);
              }
            });
          });
        };

        inputEl.addEventListener('input', (e) => {
          const val = e.target.value;
          if (previewEl) {
            previewEl.innerHTML = this._renderTargetPreview(val);
          }
          renderSuggestions(val);
        });

        inputEl.addEventListener('focus', (e) => {
          renderSuggestions(e.target.value);
        });

        inputEl.addEventListener('blur', () => {
          setTimeout(() => {
            suggestionsEl.classList.remove('visible');
          }, 200);
        });
      };

      // 1. Wire silence entity autocomplete & preview
      const silenceInput = root.querySelector('#modal-sensor-silence');
      const silenceSuggestions = root.querySelector('#sensor-silence-suggestions');
      const silencePreview = root.querySelector('#modal-sensor-silence-preview');
      if (silenceInput && silenceSuggestions) {
        setupEntityAutocomplete(
          silenceInput,
          silenceSuggestions,
          silencePreview,
          (eid) => eid.startsWith('button.') || eid.startsWith('switch.') || eid.startsWith('input_boolean.'),
          ['silence', 'mute', 'hush', 'stumm', 'sirene', 'alarm']
        );
      }

      // 2. Wire test entity autocomplete & preview
      const testInput = root.querySelector('#modal-sensor-test');
      const testSuggestions = root.querySelector('#sensor-test-suggestions');
      const testPreview = root.querySelector('#modal-sensor-test-preview');
      if (testInput && testSuggestions) {
        setupEntityAutocomplete(
          testInput,
          testSuggestions,
          testPreview,
          (eid) => eid.startsWith('button.'),
          ['test', 'self_test', 'selbsttest', 'pruef', 'check']
        );
      }

      // 2b. Wire test result entity autocomplete & preview
      const testResultInput = root.querySelector('#modal-sensor-test-result');
      const testResultSuggestions = root.querySelector('#sensor-test-result-suggestions');
      const testResultPreview = root.querySelector('#modal-sensor-test-result-preview');
      if (testResultInput && testResultSuggestions) {
        setupEntityAutocomplete(
          testResultInput,
          testResultSuggestions,
          testResultPreview,
          (eid, st, q) => {
            if (!eid.startsWith('sensor.') && !eid.startsWith('binary_sensor.')) return false;
            if (q) return true;
            return eid.toLowerCase().includes('test') || (st?.attributes?.friendly_name || '').toLowerCase().includes('test');
          },
          ['test', 'self_test', 'selbsttest', 'result', 'ergebnis', 'status', 'last_test']
        );
      }

      // 3. Wire drill entity autocomplete & preview
      const drillInput = root.querySelector('#modal-sensor-drill');
      const drillSuggestions = root.querySelector('#sensor-drill-suggestions');
      const drillPreview = root.querySelector('#modal-sensor-drill-preview');
      if (drillInput && drillSuggestions) {
        setupEntityAutocomplete(
          drillInput,
          drillSuggestions,
          drillPreview,
          (eid) => eid.startsWith('button.'),
          ['drill', 'alarm', 'uebung', 'mesh', 'vernetzung', 'siren']
        );
      }

      // 4. Wire battery entity autocomplete & preview
      const batteryInput = root.querySelector('#modal-sensor-battery');
      const batterySuggestions = root.querySelector('#sensor-battery-suggestions');
      const batteryPreview = root.querySelector('#modal-sensor-battery-preview');
      if (batteryInput && batterySuggestions) {
        setupEntityAutocomplete(
          batteryInput,
          batterySuggestions,
          batteryPreview,
          (eid, st, q) => {
            if (!eid.startsWith('sensor.')) return false;
            if (q) return true;
            const dc = st?.attributes?.device_class || '';
            const uom = st?.attributes?.unit_of_measurement || '';
            return dc === 'battery' || uom === '%' || eid.toLowerCase().includes('batt') || (st?.attributes?.friendly_name || '').toLowerCase().includes('batt');
          },
          ['battery', 'batterie', 'level', 'stand', 'batt']
        );
      }

      // Actions Add / Edit / Delete / Test
      const btnOpenAddAction = root.querySelector('#btn-open-add-action');
      if (btnOpenAddAction) {
        btnOpenAddAction.addEventListener('click', () => {
          this._editingAction = {};
          this._modalOpen = 'action';
          this._render();
        });
      }

      root.querySelectorAll('.btn-open-add-phase-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const ph = e.currentTarget.dataset.phase || 'system';
          this._editingAction = { phase: ph };
          this._modalOpen = 'action';
          this._render();
        });
      });

      root.querySelectorAll('.btn-edit-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const aid = e.currentTarget.dataset.actionId;
          const found = (this._config.actions || []).find(a => a.id === aid);
          this._editingAction = found ? JSON.parse(JSON.stringify(found)) : {};
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
          const targetBtn = e.currentTarget;
          const aid = targetBtn.dataset.actionId;
          const origContent = targetBtn.innerHTML;

          targetBtn.disabled = true;
          targetBtn.innerHTML = '⏳ Testen...';
          targetBtn.classList.remove('test-success', 'test-error');

          try {
            const res = await this._hass.callWS({ type: "safety_monitor/action/test", action_id: aid });
            if (res && res.success === false) {
              throw new Error(res.error || "Aktion fehlgeschlagen");
            }
            targetBtn.innerHTML = '✅ Erfolgreich';
            targetBtn.classList.add('test-success');
            setTimeout(() => {
              targetBtn.innerHTML = origContent;
              targetBtn.classList.remove('test-success');
              targetBtn.disabled = false;
            }, 2500);
          } catch (err) {
            const rawMsg = err?.message || err?.error || "Fehler aufgetreten";
            const shortMsg = rawMsg.length > 26 ? rawMsg.slice(0, 23) + '...' : rawMsg;
            targetBtn.innerHTML = `❌ ${shortMsg}`;
            targetBtn.title = rawMsg;
            targetBtn.classList.add('test-error');
            setTimeout(() => {
              targetBtn.innerHTML = origContent;
              targetBtn.title = '';
              targetBtn.classList.remove('test-error');
              targetBtn.disabled = false;
            }, 3500);
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
          const found = (this._config.zones && this._config.zones[zid]) || {};
          this._editingZone = JSON.parse(JSON.stringify(found));
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

      // Language Setting Change (Instant reactive switch)
      const selectLang = root.querySelector('#setting-language');
      if (selectLang) {
        selectLang.addEventListener('change', async (e) => {
          const newLangSetting = e.target.value;
          try {
            localStorage.setItem("sm_language", newLangSetting);
          } catch (_) {}
          this._lang = this._resolveLanguage(newLangSetting);
          if (this._config && this._config.settings) {
            this._config.settings.language = newLangSetting;
          }
          try {
            await this._hass.callWS({
              type: "safety_monitor/config/update_settings",
              settings: { language: newLangSetting }
            });
          } catch (err) {
            console.error("Failed to save language setting:", err);
          }
          this._render();
        });
      }

      // Settings Save
      const btnSaveSettings = root.querySelector('#btn-save-settings');
      if (btnSaveSettings) {
        btnSaveSettings.addEventListener('click', async () => {
          const origContent = btnSaveSettings.innerHTML;
          btnSaveSettings.disabled = true;
          btnSaveSettings.innerHTML = '⏳ ' + this._t("saving");
          btnSaveSettings.classList.remove('test-success', 'test-error');

          const langChoice = root.querySelector('#setting-language')?.value || 'auto';
          const testMin = parseInt(root.querySelector('#setting-test-timeout').value, 10) || 15;
          const silMin = parseInt(root.querySelector('#setting-silence-timeout').value, 10) || 10;
          const dkSec = parseInt(root.querySelector('#setting-double-knock').value, 10) || 60;
          const offlineAlert = root.querySelector('#setting-offline-alerts').checked;
          const batteryAlert = root.querySelector('#setting-battery-alerts').checked;
          const autoSelfTestEnabled = root.querySelector('#setting-auto-self-test-enabled')?.checked || false;
          const autoSelfTestDay = parseInt(root.querySelector('#setting-auto-self-test-day')?.value, 10) || 1;
          const autoSelfTestTime = (root.querySelector('#setting-auto-self-test-time')?.value || '11:00').trim();
          const autoSelfTestStep = parseInt(root.querySelector('#setting-auto-self-test-step')?.value, 10) || 60;
          const autoSelfTestNotify = root.querySelector('#setting-auto-self-test-notify')?.checked !== false;
          const histDefaultTime = (root.querySelector('#setting-history-default-time')?.value) || '24h';

          const updatedSettings = {
            language: langChoice,
            test_mode_timeout: testMin * 60,
            silence_timeout: silMin * 60,
            double_knock_global_timeout: dkSec,
            heartbeat_alert_offline: offlineAlert,
            heartbeat_alert_battery: batteryAlert,
            auto_self_test_enabled: autoSelfTestEnabled,
            auto_self_test_day: autoSelfTestDay,
            auto_self_test_time: autoSelfTestTime,
            auto_self_test_step_seconds: autoSelfTestStep,
            auto_self_test_notify: autoSelfTestNotify,
            history_default_time: histDefaultTime,
          };

          try {
            await this._hass.callWS({
              type: "safety_monitor/config/update_settings",
              settings: updatedSettings,
            });
            this._config.settings = Object.assign({}, this._config.settings, updatedSettings);
            this._historyTimeFilter = histDefaultTime;
            try {
              localStorage.setItem("sm_history_time_filter", histDefaultTime);
              localStorage.setItem("sm_language", langChoice);
            } catch (_) {}
            this._lang = this._resolveLanguage(langChoice);
            btnSaveSettings.innerHTML = '✅ ' + this._t("saved");
            btnSaveSettings.classList.add('test-success');
            setTimeout(() => {
              const currentBtn = this.shadowRoot && this.shadowRoot.querySelector('#btn-save-settings');
              if (currentBtn) {
                currentBtn.innerHTML = origContent;
                currentBtn.classList.remove('test-success');
                currentBtn.disabled = false;
              }
            }, 2500);
          } catch (err) {
            const rawMsg = err?.message || err?.error || "Fehler beim Speichern";
            const shortMsg = rawMsg.length > 24 ? rawMsg.slice(0, 21) + '...' : rawMsg;
            btnSaveSettings.innerHTML = `❌ ${shortMsg}`;
            btnSaveSettings.title = rawMsg;
            btnSaveSettings.classList.add('test-error');
            setTimeout(() => {
              const currentBtn = this.shadowRoot && this.shadowRoot.querySelector('#btn-save-settings');
              if (currentBtn) {
                currentBtn.innerHTML = origContent;
                currentBtn.title = '';
                currentBtn.classList.remove('test-error');
                currentBtn.disabled = false;
              }
            }, 3500);
          }
        });
      }

      // Modal buttons
      const btnModalCancel = root.querySelector('#btn-modal-cancel');
      if (btnModalCancel) {
        btnModalCancel.addEventListener('click', () => {
          this._modalOpen = null;
          this._editingAction = null;
          this._editingSensor = null;
          this._editingZone = null;
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
          const shutoffs = (this._editingSensor && this._editingSensor.linked_shutoff) || [];
          const silenceEntity = root.querySelector('#modal-sensor-silence')?.value.trim() || "";
          const drillEntity = root.querySelector('#modal-sensor-drill')?.value.trim() || "";
          const testEntity = root.querySelector('#modal-sensor-test')?.value.trim() || "";
          const testResultEntity = root.querySelector('#modal-sensor-test-result')?.value.trim() || "";
          const batteryEntity = root.querySelector('#modal-sensor-battery')?.value.trim() || "";

          if (!entity) {
            btnSaveModalSensor.innerHTML = '⚠️ Entity ID erforderlich';
            btnSaveModalSensor.classList.add('test-error');
            setTimeout(() => {
              btnSaveModalSensor.innerHTML = this._t("save");
              btnSaveModalSensor.classList.remove('test-error');
            }, 2500);
            root.querySelector('#modal-sensor-entity')?.focus();
            return;
          }

          const origContent = btnSaveModalSensor.innerHTML;
          btnSaveModalSensor.disabled = true;
          btnSaveModalSensor.innerHTML = '⏳ Speichern...';
          btnSaveModalSensor.classList.remove('test-success', 'test-error');

          try {
            const saveRes = await this._hass.callWS({
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
                silence_entity: silenceEntity,
                drill_entity: drillEntity,
                test_entity: testEntity,
                test_result_entity: testResultEntity,
                battery_entity: batteryEntity,
                enabled: true,
              }
            });
            if (saveRes && saveRes.sensor) {
              if (!this._config.sensors) this._config.sensors = {};
              this._config.sensors[saveRes.sensor.entity_id] = saveRes.sensor;
            }
            btnSaveModalSensor.innerHTML = '✅ Gespeichert';
            btnSaveModalSensor.classList.add('test-success');
            setTimeout(async () => {
              this._modalOpen = null;
              this._editingSensor = null;
              this._render();
              await this._loadData();
            }, 350);
          } catch (err) {
            const rawMsg = err?.message || err?.error || "Fehler aufgetreten";
            const shortMsg = rawMsg.length > 24 ? rawMsg.slice(0, 21) + '...' : rawMsg;
            btnSaveModalSensor.innerHTML = `❌ ${shortMsg}`;
            btnSaveModalSensor.title = rawMsg;
            btnSaveModalSensor.classList.add('test-error');
            setTimeout(() => {
              btnSaveModalSensor.innerHTML = origContent;
              btnSaveModalSensor.title = '';
              btnSaveModalSensor.classList.remove('test-error');
              btnSaveModalSensor.disabled = false;
            }, 3000);
          }
        });
      }

      const btnSaveModalZone = root.querySelector('#btn-modal-save-zone');
      if (btnSaveModalZone) {
        btnSaveModalZone.addEventListener('click', async () => {
          const rawId = (root.querySelector('#modal-zone-id').value || '').trim();
          const id = rawId.toLowerCase().replace(/\s+/g, '_');
          const enteredName = (root.querySelector('#modal-zone-name').value || '').trim();
          const name = enteredName || rawId || id;
          const dk = root.querySelector('#modal-zone-dk').checked;
          const timeout = parseInt(root.querySelector('#modal-zone-dk-timeout').value, 10) || 60;

          if (!id) {
            btnSaveModalZone.innerHTML = '⚠️ Zonen-ID erforderlich';
            btnSaveModalZone.classList.add('test-error');
            setTimeout(() => {
              btnSaveModalZone.innerHTML = this._t("save");
              btnSaveModalZone.classList.remove('test-error');
            }, 2500);
            root.querySelector('#modal-zone-id')?.focus();
            return;
          }

          const origContent = btnSaveModalZone.innerHTML;
          btnSaveModalZone.disabled = true;
          btnSaveModalZone.innerHTML = '⏳ Speichern...';
          btnSaveModalZone.classList.remove('test-success', 'test-error');

          try {
            const saveRes = await this._hass.callWS({
              type: "safety_monitor/zone/save",
              zone: {
                id: id,
                name: name,
                double_knock_enabled: dk,
                double_knock_timeout: timeout,
              }
            });
            if (saveRes && saveRes.zone) {
              if (!this._config.zones) this._config.zones = {};
              this._config.zones[saveRes.zone.id] = saveRes.zone;
            }
            btnSaveModalZone.innerHTML = '✅ Gespeichert';
            btnSaveModalZone.classList.add('test-success');
            setTimeout(async () => {
              this._modalOpen = null;
              this._editingZone = null;
              this._render();
              await this._loadData();
            }, 350);
          } catch (err) {
            const rawMsg = err?.message || err?.error || "Fehler aufgetreten";
            const shortMsg = rawMsg.length > 24 ? rawMsg.slice(0, 21) + '...' : rawMsg;
            btnSaveModalZone.innerHTML = `❌ ${shortMsg}`;
            btnSaveModalZone.title = rawMsg;
            btnSaveModalZone.classList.add('test-error');
            setTimeout(() => {
              btnSaveModalZone.innerHTML = origContent;
              btnSaveModalZone.title = '';
              btnSaveModalZone.classList.remove('test-error');
              btnSaveModalZone.disabled = false;
            }, 3000);
          }
        });
      }

      // Action Modal Interactive Controls (Target Search, Live Preview, Dynamic Services, Presets, Validation)
      const actTargetInput = root.querySelector('#modal-act-target');
      const actTargetSuggestions = root.querySelector('#action-target-suggestions');
      const actTargetPreview = root.querySelector('#action-target-preview');
      const actServiceSelect = root.querySelector('#modal-act-service-select');
      const actServiceInput = root.querySelector('#modal-act-service');
      const actDataTextarea = root.querySelector('#modal-act-data');
      const actDataBadge = root.querySelector('#act-data-validation-badge');
      const actDataError = root.querySelector('#modal-act-data-error');

      const actPhaseSelect = root.querySelector('#modal-act-phase');
      if (actPhaseSelect) {
        actPhaseSelect.addEventListener('change', (e) => {
          const newPhase = e.target.value;
          const typesLabel = root.querySelector('#modal-act-types-label');
          const typesContainer = root.querySelector('#modal-act-types-container');
          const phaseDesc = root.querySelector('#modal-act-phase-desc');

          if (newPhase === 'system') {
            if (typesLabel) typesLabel.textContent = this._t("actionSystemEvents") || "Auslösen bei folgenden System-Ereignissen:";
            if (phaseDesc) phaseDesc.textContent = "Stufe 5: System- & Wartungsmeldungen bei schwacher Batterie, Offline-Meldern oder fehlgeschlagenen Selbsttests.";
            if (typesContainer) {
              typesContainer.innerHTML = this._renderModalTriggerCheckboxes('system', ['battery_low', 'sensor_offline', 'self_test_failed']);
            }
          } else {
            if (typesLabel) typesLabel.textContent = this._t("actionTriggerTypes") || "Auslösen bei folgenden Gefahrentypen:";
            if (phaseDesc) phaseDesc.textContent = "Stufe 1: Notfall-Aktoren. Stufe 2: Push-Meldungen. Stufe 3: Sirenen/Licht. Stufe 4: Nach Alarm (Entwarnung). Stufe 5: Systemmeldungen (Batterie, Offline & Selbsttest).";
            if (typesContainer) {
              typesContainer.innerHTML = this._renderModalTriggerCheckboxes(newPhase, ['smoke', 'moisture', 'gas', 'carbon_monoxide', 'heat']);
            }
          }
        });
      }

      if (actTargetInput && actServiceSelect && actDataTextarea) {
        // 1. JSON Live Validator
        const validateJson = () => {
          if (!actDataTextarea || !actDataBadge) return true;
          const raw = actDataTextarea.value.trim();
          if (!raw) {
            actDataBadge.textContent = this._t("validJson");
            actDataBadge.style.background = "rgba(76, 175, 80, 0.15)";
            actDataBadge.style.color = "#4caf50";
            if (actDataError) actDataError.style.display = "none";
            return true;
          }
          try {
            JSON.parse(raw);
            actDataBadge.textContent = this._t("validJson");
            actDataBadge.style.background = "rgba(76, 175, 80, 0.15)";
            actDataBadge.style.color = "#4caf50";
            if (actDataError) actDataError.style.display = "none";
            return true;
          } catch (err) {
            actDataBadge.textContent = this._t("invalidJson");
            actDataBadge.style.background = "rgba(244, 67, 54, 0.15)";
            actDataBadge.style.color = "#f44336";
            if (actDataError) {
              actDataError.textContent = err.message;
              actDataError.style.display = "block";
            }
            return false;
          }
        };

        actDataTextarea.addEventListener('input', validateJson);
        validateJson();

        // 2. Presets Buttons
        root.querySelectorAll('.data-preset-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const key = e.currentTarget.dataset.preset;
            const val = ACTION_DATA_PRESETS[key];
            if (val !== undefined) {
              actDataTextarea.value = val;
              validateJson();
            }
          });
        });

        // Repeat Presets Buttons
        root.querySelectorAll('.act-repeat-preset').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const sec = e.currentTarget.dataset.repeat;
            const repeatInput = root.querySelector('#modal-act-repeat');
            if (repeatInput && sec !== undefined) {
              repeatInput.value = sec;
            }
          });
        });

        // 3. Dynamic Variable Tags
        root.querySelectorAll('.btn-data-var').forEach(chip => {
          chip.addEventListener('click', (e) => {
            const varTag = e.currentTarget.dataset.var;
            const start = actDataTextarea.selectionStart || 0;
            const end = actDataTextarea.selectionEnd || 0;
            const val = actDataTextarea.value;
            actDataTextarea.value = val.substring(0, start) + varTag + val.substring(end);
            actDataTextarea.selectionStart = actDataTextarea.selectionEnd = start + varTag.length;
            actDataTextarea.focus();
            validateJson();
          });
        });

        // 4. Update dynamic services dropdown based on domain
        const updateServicesDropdown = (domain, preserveService = null) => {
          const services = this._getServicesForDomain(domain);
          const currentVal = preserveService || (actServiceInput ? actServiceInput.value.trim() : '');

          let optionsHtml = services.map(s => `
            <option value="${s.service}" ${currentVal === s.service ? 'selected' : ''}>
              ${s.icon || '⚡'} ${s.service} — ${s.label || s.service} ${s.recommended ? '⭐ [Empfohlen]' : ''}
            </option>
          `).join('');

          const hasMatch = services.some(s => s.service === currentVal);
          optionsHtml += `
            <option value="custom" ${(!hasMatch && currentVal) ? 'selected' : ''}>
              ${this._t("serviceCustomOption")}
            </option>
          `;
          actServiceSelect.innerHTML = optionsHtml;

          if (!currentVal && services.length > 0) {
            const rec = services.find(s => s.recommended) || services[0];
            actServiceSelect.value = rec.service;
            if (actServiceInput) actServiceInput.value = rec.service;
          } else if (hasMatch) {
            actServiceSelect.value = currentVal;
          } else if (currentVal) {
            actServiceSelect.value = "custom";
          }
        };

        // 5. Service select change listener
        actServiceSelect.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val === 'custom') {
            if (actServiceInput) {
              actServiceInput.focus();
              actServiceInput.select();
            }
          } else {
            if (actServiceInput) actServiceInput.value = val;
            // Smart preset suggestion: if data is empty or default empty, suggest appropriate payload
            if (actDataTextarea.value.trim() === '{}' || !actDataTextarea.value.trim()) {
              if (val.startsWith('notify.')) {
                actDataTextarea.value = ACTION_DATA_PRESETS.notify;
                validateJson();
              } else if (val.startsWith('light.')) {
                actDataTextarea.value = ACTION_DATA_PRESETS.red_light;
                validateJson();
              } else if (val.startsWith('siren.')) {
                actDataTextarea.value = ACTION_DATA_PRESETS.siren;
                validateJson();
              }
            }
          }
        });

        // 6. Service input listener
        if (actServiceInput) {
          actServiceInput.addEventListener('input', (e) => {
            const srv = e.target.value.trim();
            const match = Array.from(actServiceSelect.options).some(opt => opt.value === srv);
            actServiceSelect.value = match ? srv : 'custom';
          });
        }

        // 7. Live Target Suggestions & Preview
        if (actTargetSuggestions) {
          const getTargetCandidates = () => {
            const list = [];
            const priorityDomains = ['valve', 'siren', 'switch', 'light', 'cover', 'fan', 'notify', 'media_player', 'lock', 'climate', 'script', 'scene'];
            if (this._hass && this._hass.states) {
              Object.keys(this._hass.states).forEach(eid => {
                const dom = eid.split('.')[0];
                const st = this._hass.states[eid];
                const fn = (st.attributes && st.attributes.friendly_name) || eid;
                list.push({
                  entity_id: eid,
                  name: fn,
                  domain: dom,
                  state: st.state,
                  is_priority: priorityDomains.includes(dom),
                });
              });
            }
            return list;
          };

          const renderTargetSuggestions = (query = "") => {
            const tokens = (query || "").split(',');
            const curToken = tokens[tokens.length - 1].trim().toLowerCase();
            const all = getTargetCandidates();

            let matches = all;
            if (curToken) {
              matches = all.filter(c =>
                c.entity_id.toLowerCase().includes(curToken) ||
                (c.name && c.name.toLowerCase().includes(curToken))
              );
            }
            matches.sort((a, b) => {
              if (a.is_priority !== b.is_priority) return a.is_priority ? -1 : 1;
              return a.name.localeCompare(b.name);
            });

            if (matches.length === 0) {
              actTargetSuggestions.innerHTML = `
                <div style="padding: 10px 14px; font-size: 12px; color: var(--secondary-text-color, #757575);">
                  Keine passenden Entitäten gefunden.
                </div>
              `;
              actTargetSuggestions.classList.add('visible');
              return;
            }

            const topMatches = matches.slice(0, 25);
            actTargetSuggestions.innerHTML = topMatches.map(c => `
              <div class="suggestion-item target-suggestion-item" data-entity-id="${c.entity_id}" data-domain="${c.domain}">
                <div class="suggestion-info">
                  <span class="suggestion-name">
                    ${this._getDomainIcon(c.domain)} <strong>${c.name}</strong>
                  </span>
                  <span class="suggestion-entity">${c.entity_id}</span>
                </div>
                <div>
                  <span class="badge ${c.is_priority ? 'badge-smoke' : 'badge-generic'}" style="font-size: 11px;">
                    ${c.domain}
                  </span>
                </div>
              </div>
            `).join('');
            actTargetSuggestions.classList.add('visible');

            actTargetSuggestions.querySelectorAll('.target-suggestion-item').forEach(item => {
              item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const eid = item.dataset.entityId;
                const dom = item.dataset.domain;

                // Replace the last typed token with selected entity ID
                const currentRaw = actTargetInput.value;
                const rawTokens = currentRaw.split(',');
                rawTokens[rawTokens.length - 1] = " " + eid;
                const updatedVal = rawTokens.map(t => t.trim()).filter(Boolean).join(", ");
                actTargetInput.value = updatedVal;
                actTargetSuggestions.classList.remove('visible');

                // Update preview
                if (actTargetPreview) {
                  actTargetPreview.innerHTML = this._renderTargetPreview(updatedVal);
                }

                // Update services dropdown for this domain
                updateServicesDropdown(dom);
              });
            });
          };

          actTargetInput.addEventListener('input', (e) => {
            const val = e.target.value;
            if (actTargetPreview) {
              actTargetPreview.innerHTML = this._renderTargetPreview(val);
            }
            renderTargetSuggestions(val);
            const firstEid = val.split(',')[0].trim();
            if (firstEid.includes('.')) {
              updateServicesDropdown(firstEid.split('.')[0]);
            } else {
              updateServicesDropdown('');
            }
          });

          actTargetInput.addEventListener('focus', (e) => {
            renderTargetSuggestions(e.target.value);
          });

          actTargetInput.addEventListener('blur', () => {
            setTimeout(() => {
              actTargetSuggestions.classList.remove('visible');
            }, 200);
          });
        }
      }

      const btnSaveModalAction = root.querySelector('#btn-modal-save-action');
      if (btnSaveModalAction) {
        btnSaveModalAction.addEventListener('click', async () => {
          const name = root.querySelector('#modal-act-name').value.trim() || "Aktion";
          const phase = root.querySelector('#modal-act-phase').value;
          const service = root.querySelector('#modal-act-service').value.trim();
          const targetRaw = root.querySelector('#modal-act-target').value.trim();
          const repeatInterval = parseInt(root.querySelector('#modal-act-repeat')?.value, 10) || 0;
          let dataObj = {};
          try {
            dataObj = JSON.parse(root.querySelector('#modal-act-data').value || "{}");
          } catch (err) {
            btnSaveModalAction.innerHTML = '❌ Ungültiges JSON';
            btnSaveModalAction.classList.add('test-error');
            const dataErr = root.querySelector('#modal-act-data-error');
            if (dataErr) {
              dataErr.style.display = 'block';
              dataErr.textContent = 'Ungültiges JSON: ' + err.message;
            }
            setTimeout(() => {
              btnSaveModalAction.innerHTML = this._t("save");
              btnSaveModalAction.classList.remove('test-error');
            }, 3000);
            return;
          }

          if (!service) {
            btnSaveModalAction.innerHTML = '⚠️ Dienst erforderlich';
            btnSaveModalAction.classList.add('test-error');
            setTimeout(() => {
              btnSaveModalAction.innerHTML = this._t("save");
              btnSaveModalAction.classList.remove('test-error');
            }, 2500);
            root.querySelector('#modal-act-service')?.focus();
            return;
          }

          const origContent = btnSaveModalAction.innerHTML;
          btnSaveModalAction.disabled = true;
          btnSaveModalAction.innerHTML = '⏳ Speichern...';
          btnSaveModalAction.classList.remove('test-success', 'test-error');

          const target = targetRaw ? { entity_id: targetRaw.split(',').map(s => s.trim()).filter(Boolean) } : {};
          const selectedTypes = Array.from(root.querySelectorAll('.act-type-cb:checked')).map(cb => cb.value);
          const triggerTypes = selectedTypes.length > 0 ? selectedTypes : (phase === 'system' ? ["battery_low", "sensor_offline", "self_test_failed"] : ["smoke", "moisture", "gas", "carbon_monoxide", "heat"]);

          try {
            const saveRes = await this._hass.callWS({
              type: "safety_monitor/action/save",
              action: {
                id: (this._editingAction && this._editingAction.id) || undefined,
                name: name,
                phase: phase,
                service: service,
                target: target,
                data: dataObj,
                repeat_interval: repeatInterval,
                enabled: true,
                trigger_types: triggerTypes,
              }
            });

            if (saveRes && saveRes.action) {
              const savedAct = saveRes.action;
              if (!Array.isArray(this._config.actions)) {
                this._config.actions = [];
              }
              const idx = this._config.actions.findIndex(a => a.id === savedAct.id);
              if (idx >= 0) {
                this._config.actions[idx] = savedAct;
              } else {
                this._config.actions.push(savedAct);
              }
            }

            btnSaveModalAction.innerHTML = '✅ Gespeichert';
            btnSaveModalAction.classList.add('test-success');
            setTimeout(async () => {
              this._modalOpen = null;
              this._editingAction = null;
              this._render();
              await this._loadData();
            }, 350);
          } catch (err) {
            const rawMsg = err?.message || err?.error || "Fehler aufgetreten";
            const shortMsg = rawMsg.length > 24 ? rawMsg.slice(0, 21) + '...' : rawMsg;
            btnSaveModalAction.innerHTML = `❌ ${shortMsg}`;
            btnSaveModalAction.title = rawMsg;
            btnSaveModalAction.classList.add('test-error');
            setTimeout(() => {
              btnSaveModalAction.innerHTML = origContent;
              btnSaveModalAction.title = '';
              btnSaveModalAction.classList.remove('test-error');
              btnSaveModalAction.disabled = false;
            }, 3000);
          }
        });
      }

      const btnTestModalAction = root.querySelector('#btn-modal-test-action');
      if (btnTestModalAction) {
        btnTestModalAction.addEventListener('click', async () => {
          const name = root.querySelector('#modal-act-name').value.trim() || "Aktion";
          const phase = root.querySelector('#modal-act-phase').value;
          const service = root.querySelector('#modal-act-service').value.trim();
          const targetRaw = root.querySelector('#modal-act-target').value.trim();
          const repeatInterval = parseInt(root.querySelector('#modal-act-repeat')?.value, 10) || 0;
          const feedbackEl = root.querySelector('#modal-test-action-feedback');
          if (feedbackEl) {
            feedbackEl.style.display = 'none';
            feedbackEl.innerHTML = '';
          }

          let dataObj = {};
          try {
            dataObj = JSON.parse(root.querySelector('#modal-act-data').value || "{}");
          } catch (err) {
            btnTestModalAction.innerHTML = '❌ Ungültiges JSON';
            btnTestModalAction.classList.add('test-error');
            if (feedbackEl) {
              feedbackEl.style.display = 'block';
              feedbackEl.style.color = '#d32f2f';
              feedbackEl.innerHTML = `⚠️ Ungültiges JSON: ${err.message}`;
            }
            setTimeout(() => {
              btnTestModalAction.innerHTML = '⚡ ' + this._t("testAction");
              btnTestModalAction.classList.remove('test-error');
            }, 3000);
            return;
          }

          if (!service) {
            btnTestModalAction.innerHTML = '⚠️ Dienst erforderlich';
            btnTestModalAction.classList.add('test-error');
            if (feedbackEl) {
              feedbackEl.style.display = 'block';
              feedbackEl.style.color = '#d32f2f';
              feedbackEl.innerHTML = '⚠️ Bitte wählen oder tippen Sie einen Dienst ein.';
            }
            setTimeout(() => {
              btnTestModalAction.innerHTML = '⚡ ' + this._t("testAction");
              btnTestModalAction.classList.remove('test-error');
            }, 2500);
            root.querySelector('#modal-act-service')?.focus();
            return;
          }

          const origContent = btnTestModalAction.innerHTML;
          btnTestModalAction.disabled = true;
          btnTestModalAction.innerHTML = '⏳ Testen...';
          btnTestModalAction.classList.remove('test-success', 'test-error');

          const target = targetRaw ? { entity_id: targetRaw.split(',').map(s => s.trim()).filter(Boolean) } : {};
          const selectedTypes = Array.from(root.querySelectorAll('.act-type-cb:checked')).map(cb => cb.value);
          const triggerTypes = selectedTypes.length > 0 ? selectedTypes : (phase === 'system' ? ["battery_low", "sensor_offline", "self_test_failed"] : ["smoke", "moisture", "gas", "carbon_monoxide", "heat"]);

          try {
            const res = await this._hass.callWS({
              type: "safety_monitor/action/test",
              action: {
                id: (this._editingAction && this._editingAction.id) || undefined,
                name: name,
                phase: phase,
                service: service,
                target: target,
                data: dataObj,
                repeat_interval: repeatInterval,
                enabled: true,
                trigger_types: triggerTypes,
              }
            });
            if (res && res.success === false) {
              throw new Error(res.error || "Aktion fehlgeschlagen");
            }
            btnTestModalAction.innerHTML = '✅ Erfolgreich';
            btnTestModalAction.classList.add('test-success');
            if (feedbackEl) {
              feedbackEl.style.display = 'block';
              feedbackEl.style.color = '#2e7d32';
              feedbackEl.innerHTML = '✅ Dienstaufruf erfolgreich ausgeführt!';
            }
            setTimeout(() => {
              btnTestModalAction.innerHTML = origContent;
              btnTestModalAction.classList.remove('test-success');
              btnTestModalAction.disabled = false;
              if (feedbackEl) feedbackEl.style.display = 'none';
            }, 3000);
          } catch (err) {
            const rawMsg = err?.message || err?.error || "Fehler aufgetreten";
            btnTestModalAction.innerHTML = '❌ Fehlgeschlagen';
            btnTestModalAction.title = rawMsg;
            btnTestModalAction.classList.add('test-error');
            if (feedbackEl) {
              feedbackEl.style.display = 'block';
              feedbackEl.style.color = '#d32f2f';
              feedbackEl.innerHTML = `⚠️ ${rawMsg}`;
            }
            setTimeout(() => {
              btnTestModalAction.innerHTML = origContent;
              btnTestModalAction.title = '';
              btnTestModalAction.classList.remove('test-error');
              btnTestModalAction.disabled = false;
            }, 4500);
          }
        });
      }
    }
  }

  customElements.define("safety-monitor-panel", SafetyMonitorPanel);
})();
