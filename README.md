# Digitales Kartenspielsystem

Lauffaehiger MVP fuer ein digitales Kartenspielsystem mit Web-Frontend, Express-REST-API, Spiellogik, In-Memory-Spielstaenden, Tests, Security-Hardening und Vercel-Deployment.

Production: <https://repo4copilot-test-team-gebr-gehirnz.vercel.app/>

## Features

- Spiele erstellen, Spieler beitreten lassen und Partien starten
- Karten mischen, austeilen, spielen und passen
- Punkte, Zugverlauf, Gewinner und Spielstatus abrufen
- Spielstaende waehrend derselben Serverlaufzeit speichern und laden
- Regel- und Varianten-Endpunkte
- Browser-Frontend ohne Build-Schritt
- API- und Service-Tests mit `node:test`
- Security-Header, CSP, CORS-Einschraenkung, Rate-Limiting und Body-Limit

## Tech Stack

- Node.js 22+
- Express
- Vanilla HTML, CSS und JavaScript
- Vercel Serverless Function
- GitHub Actions CI

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
```

## Schnellstart

Voraussetzungen:

- Node.js 22 oder neuer
- npm

Installation:

```bash
npm install
```

Start:

```bash
npm start
```

Die App ist danach unter <http://localhost:3000> erreichbar.

Entwicklung mit Watch-Modus:

```bash
npm run dev
```

Tests:

```bash
npm test
```

Security-Audit:

```bash
npm audit --audit-level=low
```

## Konfiguration

Die App funktioniert lokal ohne `.env`-Datei. Eine Vorlage liegt in `.env.example`.

| Variable | Pflicht | Beschreibung |
|---|---:|---|
| `PORT` | Nein | Lokaler Port, Standard: `3000` |
| `ADMIN_TOKEN` | Nein | Aktiviert geschuetzte Admin-Endpunkte. Ohne Token sind Admin-Aktionen deaktiviert. |
| `ALLOWED_ORIGINS` | Nein | Kommagetrennte Liste zusaetzlich erlaubter Cross-Origin-Urspruenge. Same-Origin ist immer erlaubt. |

PowerShell-Beispiel:

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

Spielstaende:

```http
POST   /api/game/{id}/save
GET    /api/game/{id}/load
GET    /api/saved-games
DELETE /api/saved-games/{saveId}
```

`POST /api/rules/update` und `DELETE /api/saved-games/{saveId}` benoetigen `ADMIN_TOKEN` ueber den Header `x-admin-token`.

## Beispielablauf per API

```bash
curl -X POST http://localhost:3000/api/game/create \
  -H "Content-Type: application/json" \
  -d "{\"hostName\":\"Host\"}"
```

```bash
curl -X POST http://localhost:3000/api/game/<game-id>/join \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"Spieler 2\"}"
```

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

Sicherheitsmeldungen bitte nicht als oeffentliche Issues posten. Details stehen in [SECURITY.md](SECURITY.md).

## Deployment

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

## Dokumentation

- [Product Goal](docs/Product-goal.md)
- [Solution Design](docs/Solution-design.md)
- [Project Management](docs/Project_Management.md)
- [Glossar](docs/Glossar.md)

## Bekannte Grenzen des MVP

- Keine echte Benutzerregistrierung oder Authentifizierung
- Keine dauerhafte Datenbank
- Keine dauerhafte Persistenz ausser In-Memory-Saves waehrend derselben Laufzeit
- Keine WebSocket-Live-Updates
- Kein Multi-Instance-State-Sharing auf Serverless-Plattformen
- Admin-Funktionen sind tokenbasiert, aber noch nicht rollenbasiert

## Mitmachen

Siehe [CONTRIBUTING.md](CONTRIBUTING.md). Das Projekt steht unter der [MIT License](LICENSE).
