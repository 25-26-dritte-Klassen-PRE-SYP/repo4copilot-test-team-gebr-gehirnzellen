---
layout: default
title: Digitales Kartenspielsystem
---

# Digitales Kartenspielsystem

Diese GitHub-Pages-Seite stellt die Architektur- und Projektdokumentation fuer das digitale Kartenspielsystem bereit.

## Dokumente

- [Product Goal](Product-goal.html)
- [Solution Design / Architektur](Solution-design.html)
- [Project Management](Project_Management.html)
- [Glossar](Glossar.html)

## Architektur-Kurzueberblick

Das geplante System folgt einer Client-Server-Architektur:

- Frontend: webbasierte Anwendung fuer Spieler und Spielleiter
- Backend: REST API fuer Spielverwaltung, Kartenlogik, Regeln und Punkte
- Datenbank: PostgreSQL fuer Spielstaende, Regeln und Benutzerdaten
- Echtzeit-Kommunikation: WebSocket fuer Live-Spielupdates

Die Details stehen im [Solution Design](Solution-design.html).
