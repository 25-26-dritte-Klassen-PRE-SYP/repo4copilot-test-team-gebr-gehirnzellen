# Security Policy

## Supported Version

Der aktuelle `main`-Branch ist die einzige aktiv gepflegte Version dieses MVP.

## Reporting a Vulnerability

Bitte melde Sicherheitsprobleme nicht in oeffentlichen Issues. Nutze stattdessen eine private Nachricht an die Repository-Maintainer oder GitHub Private Vulnerability Reporting, falls es fuer das Repository aktiviert ist.

Ein guter Report enthaelt:

- betroffene Route, Datei oder Funktion
- reproduzierbare Schritte
- erwartetes und tatsaechliches Verhalten
- Einschaetzung der Auswirkung

## Scope

Bekannte MVP-Grenzen sind keine Sicherheitsluecken, solange sie wie dokumentiert bleiben:

- In-Memory-State statt dauerhafter Datenbank
- keine echte Benutzerregistrierung oder Authentifizierung
- Admin-Aktionen nur ueber `ADMIN_TOKEN`

Secrets wie `ADMIN_TOKEN`, Vercel Tokens oder andere API-Schluessel duerfen nicht im Repository gespeichert werden.
