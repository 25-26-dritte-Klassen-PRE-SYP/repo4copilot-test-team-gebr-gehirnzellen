# repo4copilot-test-team-gebr-gehirnzellen

Dokumentation und Architektur fuer ein digitales Kartenspielsystem.

## Lokale Anwendung

Der aktuelle Stand enthaelt einen lauffaehigen MVP mit:

- REST API fuer Spielverwaltung, Kartenlogik, Regeln, Punkte und Spielstaende
- statischem Web-Frontend
- In-Memory-Persistenz fuer den Projektprototyp
- automatisierten Unit- und API-Tests

### Start

```bash
npm install
npm start
```

Danach ist die Anwendung lokal erreichbar:

<http://localhost:3000>

### Tests

```bash
npm test
```

## GitHub Pages

Die Dokumentationsseite wird kostenlos ueber GitHub Pages bereitgestellt.

Startseite: <https://25-26-dritte-klassen-pre-syp.github.io/repo4copilot-test-team-gebr-gehirnzellen/>

## CI/CD

- GitHub Actions fuehrt bei Pushes auf `main` und Pull Requests `npm test` aus.
- Vercel ist mit dem GitHub-Repository verbunden und deployed neue Commits automatisch.
- Production-App: <https://repo4copilot-test-team-gebr-gehirnz.vercel.app/>

## Security

- Security-Header und Content-Security-Policy werden ueber Helmet gesetzt.
- API-Antworten werden nicht gecached (`Cache-Control: no-store`).
- API-Requests sind rate-limitiert.
- Cross-Origin-Requests sind auf Same-Origin und optionale `ALLOWED_ORIGINS` begrenzt.
- Admin-Endpunkte sind ohne `ADMIN_TOKEN` deaktiviert.
- Frontend-Ausgaben verwenden `textContent` statt HTML-Injection fuer Nutzerdaten.
