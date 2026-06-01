# Contributing

Danke fuer dein Interesse am Projekt.

## Entwicklung

1. Repository klonen.
2. Abhaengigkeiten installieren:

```bash
npm install
```

3. Tests ausfuehren:

```bash
npm test
```

4. Lokalen Server starten:

```bash
npm run dev
```

Die Anwendung ist danach unter <http://localhost:3000> erreichbar.

## Pull Requests

- Arbeite in einem eigenen Branch.
- Halte Pull Requests klein und fachlich zusammenhaengend.
- Beschreibe kurz, was geaendert wurde und wie es getestet wurde.
- Aktualisiere README oder `docs/`, wenn sich Verhalten, API oder Setup aendern.
- Committe keine Secrets, `.env`-Dateien, Vercel-Projektdateien oder `node_modules`.

## Code-Stil

- Nutze moderne JavaScript-Module.
- Halte Spiellogik in `src/gameService.js` und HTTP-spezifische Logik in `src/server.js` getrennt.
- Bevorzuge explizite Input-Validierung und klare Fehlermeldungen.
