# Digitales Kartenspielsystem

Lauffaehiger MVP fuer ein digitales Kartenspielsystem mit Web-Frontend, Express-REST-API, Kartenlogik, Regeln, Punkten, Spielstaenden, Tests, Security-Hardening und Vercel-Deployment.

## Status

- App: laeuft lokal mit Node.js und in Production auf Vercel
- CI: GitHub Actions fuehrt Tests bei Pushes auf `main` und Pull Requests aus
- CD: Vercel ist mit dem GitHub-Repository verbunden und deployed neue Commits automatisch
- GitHub Pages: deaktiviert, damit das Repository wieder private sein kann

Production:

<https://repo4copilot-test-team-gebr-gehirnz.vercel.app/>

## Projektstruktur

```text
.
+-- api/
|   +-- index.js              # Vercel Serverless Entry Point
+-- public/
|   +-- index.html            # Web-Frontend
|   +-- app.js                # Frontend-Logik
|   +-- styles.css            # UI-Styles
+-- src/
|   +-- gameService.js        # Spiellogik und In-Memory-State
|   +-- server.js             # Express-App und REST-API
+-- test/
|   +-- api.test.js           # API- und Security-Tests
|   +-- gameService.test.js   # Spiellogik-Tests
+-- docs/                     # Produkt-, Architektur- und Projekt-Doku
+-- .github/workflows/ci.yml  # GitHub Actions CI
+-- vercel.json               # Vercel Routing und Security-Header
+-- package.json
+-- package-lock.json
```

## Voraussetzungen

- Node.js 22 oder kompatibel
- npm
- Git

Optional fuer Deployments:

- Vercel Account
- Vercel CLI ueber `npx vercel`
- GitHub Repository mit Vercel-Verknuepfung

## Lokale Installation

Repository klonen:

```bash
git clone <repository-url>
cd <repository-folder>
```

Abhaengigkeiten installieren:

```bash
npm install
```

Anwendung starten:

```bash
npm start
```

Danach ist die App erreichbar unter:

<http://localhost:3000>

## Entwicklung

Server mit Watch-Modus starten:

```bash
npm run dev
```

Tests ausfuehren:

```bash
npm test
```

Security-Audit ausfuehren:

```bash
npm audit --audit-level=low
```

## Konfiguration

Die App funktioniert lokal ohne `.env`-Datei. Fuer produktive Admin-Funktionen koennen Environment Variables gesetzt werden.

| Variable | Pflicht | Beschreibung |
|---|---:|---|
| `PORT` | Nein | Lokaler Port, Standard: `3000` |
| `ADMIN_TOKEN` | Nein | Aktiviert geschuetzte Admin-Endpunkte. Ohne Token sind Admin-Aktionen deaktiviert. |
| `ALLOWED_ORIGINS` | Nein | Kommagetrennte Liste zusaetzlich erlaubter Cross-Origin-Urspruenge. Same-Origin ist immer erlaubt. |

Beispiel:

```bash
ADMIN_TOKEN="change-me"
ALLOWED_ORIGINS="https://example.com,https://app.example.com"
npm start
```

Unter Windows PowerShell:

```powershell
$env:ADMIN_TOKEN = "change-me"
$env:ALLOWED_ORIGINS = "https://example.com,https://app.example.com"
npm start
```

## API-Uebersicht

Healthcheck:

```http
GET /api/health
```

Spielverwaltung:

```http
POST /api/game/create
POST /api/game/{id}/join
POST /api/game/{id}/start
GET  /api/game/{id}/state
POST /api/game/{id}/end
```

Karten und Zuege:

```http
POST /api/game/{id}/shuffle
POST /api/game/{id}/deal
GET  /api/game/{id}/deck
GET  /api/game/{id}/hand/{playerId}
POST /api/game/{id}/play
POST /api/game/{id}/pass
GET  /api/game/{id}/turns
GET  /api/game/{id}/scores
```

Regeln und Varianten:

```http
GET  /api/rules
GET  /api/rules/{variant}
GET  /api/variants
POST /api/rules/update
```

`POST /api/rules/update` ist ein Admin-Endpunkt und benoetigt `ADMIN_TOKEN` ueber den Header `x-admin-token`.

Spielstaende:

```http
POST   /api/game/{id}/save
GET    /api/game/{id}/load
GET    /api/saved-games
DELETE /api/saved-games/{saveId}
```

`DELETE /api/saved-games/{saveId}` ist ein Admin-Endpunkt und benoetigt `ADMIN_TOKEN` ueber den Header `x-admin-token`.

## Beispielablauf per API

Spiel erstellen:

```bash
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d "{\"hostName\":\"Host\"}"
```

Spieler beitreten lassen:

```bash
curl -X POST http://localhost:3000/api/game/<game-id>/join \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"Spieler 2\"}"
```

Spiel starten:

```bash
curl -X POST http://localhost:3000/api/game/<game-id>/start
```

## Security

Aktuelle Schutzmassnahmen:

- Security-Header und Content-Security-Policy ueber Helmet
- zusaetzliche Vercel-Header in `vercel.json`
- `X-Powered-By` deaktiviert
- `Cache-Control: no-store`
- API Rate-Limiting
- JSON Body-Limit: `32kb`
- CORS: Same-Origin erlaubt, fremde Origins nur ueber `ALLOWED_ORIGINS`
- Admin-Endpunkte ohne `ADMIN_TOKEN` deaktiviert
- Input-Validierung fuer Spielernamen, Varianten und Spielerzahlen
- Frontend rendert Nutzerdaten mit `textContent` statt HTML-Injection
- `npm audit --audit-level=low` aktuell ohne Findings

Wichtig:

- Der MVP nutzt In-Memory-State. Daten gehen bei Neustarts, Serverless-Cold-Starts oder neuen Deployments verloren.
- Fuer echte Nutzerkonten, Passwoerter oder dauerhaft gespeicherte Spielstaende muss eine Datenbank und Authentifizierung ergaenzt werden.
- `ADMIN_TOKEN` sollte in Vercel/GitHub als Secret gesetzt werden, nicht im Repository.

## Vercel Deployment

Das Projekt ist fuer Vercel vorbereitet:

- `api/index.js` exportiert die Express-App fuer Serverless
- `vercel.json` routet alle Requests durch die gesicherte Express-App
- `public/` wird durch Express ausgeliefert

Manuelles Production-Deployment:

```bash
npx vercel deploy --prod
```

Lokalen Vercel-Build pruefen:

```bash
npx vercel pull --yes --environment production
npx vercel build --prod --yes
```

Wenn Vercel mit GitHub verbunden ist, deployed Vercel automatisch neue Commits auf `main`.

## GitHub CI

Workflow:

```text
.github/workflows/ci.yml
```

Ausloeser:

- Push auf `main`
- Pull Request

Der Workflow fuehrt aus:

```bash
npm ci
npm test
```

## Dokumentation

Fachliche und technische Doku:

- [Product Goal](docs/Product-goal.md)
- [Solution Design](docs/Solution-design.md)
- [Project Management](docs/Project_Management.md)
- [Glossar](docs/Glossar.md)

GitHub Pages ist bewusst deaktiviert. Die Doku liegt im Repository, wird aber nicht mehr als oeffentliche GitHub-Pages-Seite veroeffentlicht.

## Bekannte Grenzen des MVP

- Keine echte Benutzerregistrierung oder Authentifizierung
- Keine PostgreSQL-Datenbank
- Keine dauerhafte Persistenz ausser In-Memory-Saves waehrend derselben Laufzeit
- Keine WebSocket-Live-Updates
- Kein Multi-Instance-State-Sharing auf Serverless-Plattformen
- Admin-Funktionen sind tokenbasiert, aber noch nicht rollenbasiert

## Naechste sinnvolle Schritte

1. PostgreSQL oder eine andere persistente Datenbank anbinden.
2. Authentifizierung und Rollenmodell implementieren.
3. WebSocket- oder Realtime-Transport ergaenzen.
4. Spielregeln fachlich weiter konkretisieren.
5. E2E-Tests fuer die Weboberflaeche ergaenzen.
