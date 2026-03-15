# Cardio Tracker — 10-Wochen-Plan

Deine persönliche Cardio-Tracking App als Progressive Web App (PWA).

## Auf Vercel deployen (kostenlos)

### Schritt 1: GitHub Repository erstellen
1. Geh auf [github.com](https://github.com) und erstelle ein neues Repository
2. Nenne es z.B. `cardio-tracker`
3. Lade den gesamten Inhalt dieses Ordners hoch (drag & drop oder git push)

### Schritt 2: Auf Vercel deployen
1. Geh auf [vercel.com](https://vercel.com) und logge dich mit GitHub ein
2. Klicke "Add New Project"
3. Wähle dein `cardio-tracker` Repository aus
4. Framework: **Vite** (wird automatisch erkannt)
5. Klicke "Deploy"
6. In 30-60 Sekunden ist deine App live unter `cardio-tracker-xxxx.vercel.app`

### Schritt 3: Auf dem iPhone installieren
1. Öffne deine Vercel-URL in **Safari** auf dem iPhone
2. Tippe auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben)
3. Scrolle runter und wähle **"Zum Home-Bildschirm"**
4. Bestätige mit "Hinzufügen"

Die App öffnet sich jetzt im Fullscreen-Modus ohne Safari-Leisten und funktioniert offline. Alle Daten werden lokal auf deinem iPhone gespeichert.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne http://localhost:5173

## Technologie

- React 18 + Vite 5
- Recharts für Diagramme
- PWA mit Offline-Support
- localStorage für Datenpersistenz
- Kein Backend nötig
