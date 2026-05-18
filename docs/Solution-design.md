# Solution Design – Digitales Kartenspielsystem

**Wichtig**: Dieses Dokument beschreibt die technische Umsetzung der Anforderungen aus dem [Product Goal](Product-goal.md). Für Anforderungen siehe dort.

---

## 1. Architektur-Übersicht

### 1.1 Systemarchitektur
Das System folgt einer **Client-Server-Architektur** mit folgenden Komponenten:

- **Frontend (Client)**: Web-basierte oder Desktop-Anwendung (React/Vue.js)
- **Backend (Server)**: RESTful API (Node.js/Express oder Python/Flask)
- **Datenbank**: Relationale Datenbank (PostgreSQL) für Spielstände, Regeln und Benutzerdaten
- **Session-Management**: Echtzeit-Kommunikation via WebSocket für Live-Spielupdates

### 1.2 Technologie-Stack (Designentscheidung)

| Komponente | Technologie | Begründung | Alternativen |
|---|---|---|---|
| Frontend | React.js / Vue.js | Interaktive UI, einfache State-Verwaltung | Angular (komplexer), Svelte (weniger etabliert) |
| Backend | Node.js + Express / Python + Flask | Schnelle Entwicklung, gutes Ecosystem | Java/Spring (zu schwerfällig), Go (Overkill) |
| Datenbank | PostgreSQL | Zuverlässig, ACID-Konformität, open-source | MySQL (weniger ACID), MongoDB (nicht geeignet) |
| Echtzeit | WebSocket (Socket.io) | Live-Spielupdates ohne Latenz | Polling (ineffizient), Server-Sent Events (weniger interaktiv) |
| Hosting | Docker Container | Portable, skalierbar, einfaches Deployment | VM-basiert (komplexer), Serverless (zu Overhead) |

---

## 2. Funktionale Architektur

### 2.1 Hauptmodule

#### 2.1.1 Spielverwaltungsmodul
**Verantwortung**: Verwaltung von Spielsessions, Spielerlobbys und Spielablauf

**Komponenten**:
- `GameController`: Erstellen, Starten, Beenden von Spielen
- `PlayerManager`: Spielerregistrierung, Rollenzuweisung
- `GameStateManager`: Aktueller Spielstatus (wer ist dran, Kartenstatus, Punkte)

**API-Endpunkte**:
```
POST   /api/game/create         - Neues Spiel erstellen
POST   /api/game/{id}/start     - Spiel starten (min. Spieler erforderlich)
POST   /api/game/{id}/join      - Spieler beitreten
GET    /api/game/{id}/state     - Spielstatus abrufen
POST   /api/game/{id}/end       - Spiel beenden
DELETE /api/game/{id}           - Spiel löschen
```

#### 2.1.2 Kartenlogik-Modul
**Verantwortung**: Kartendeck-Verwaltung, Mischen, Austeilen

**Komponenten**:
- `DeckManager`: Deck initialisieren, validieren
- `ShuffleEngine`: Algorithmus zum Kartenmischen (Fisher-Yates-Shuffle)
- `DealManager`: Automatisches Austeilen von Karten

**API-Endpunkte**:
```
POST   /api/game/{id}/shuffle   - Karten mischen
POST   /api/game/{id}/deal      - Karten austeilen
GET    /api/game/{id}/deck      - Deckstatus abrufen
GET    /api/game/{id}/hand/{playerId} - Handkarten eines Spielers
```

#### 2.1.3 Regelverwaltungsmodul
**Verantwortung**: Verwaltung und Validierung von Spielregeln

**Komponenten**:
- `RuleEngine`: Regelausführung und Validierung
- `RuleRepository`: Speicherung und Abruf von Regelsets
- `VariantManager`: Spielvarianten verwalten

**API-Endpunkte**:
```
GET    /api/rules               - Alle Regeln abrufen
GET    /api/rules/{variant}     - Regeln für Variante abrufen
POST   /api/rules/update        - Regeln aktualisieren (Admin)
GET    /api/variants            - Verfügbare Spielvarianten
POST   /api/variants            - Neue Variante hinzufügen (Admin)
```

#### 2.1.4 Zug-Ausführungsmodul
**Verantwortung**: Verarbeitung von Spielerzügen und Regelüberprüfung

**Komponenten**:
- `MoveValidator`: Validiert Züge gegen aktuelle Regeln
- `MoveExecutor`: Führt Zug aus (Karten spielen, Punkte berechnen)
- `TurnManager`: Reihenfolge und Zugwechsel

**API-Endpunkte**:
```
POST   /api/game/{id}/play      - Zug ausführen
POST   /api/game/{id}/pass      - Zug passen
GET    /api/game/{id}/turns     - Zughistorie abrufen
```

**Wichtig - Input Validation (2.1.4.1)**: 
Alle Züge müssen genauestens validiert werden. Ein **ungültiger Zug** liegt vor, wenn:
- Regelverstoß erkannt wird
- Ungültiger Spielzustand herrscht
- Input-Validierungsfehler auftreten (falsche Format, nicht existierende IDs)
- State-Machine Konflikt erkannt wird
- Notwendige Ressourcen nicht verfügbar sind

Siehe [Glossar.md - Ungültiger Zug](Glossar.md#ungültiger-zug-invalid-move) für detaillierte Definition.

#### 2.1.5 Punkteverwaltungsmodul
**Verantwortung**: Berechnung und Verwaltung von Punkten

**Komponenten**:
- `ScoreCalculator`: Berechnet Punkte basierend auf Regeln
- `LeaderboardManager`: Ranglisten und Statistiken
- `ScoreValidator`: Validiert Berechnungen

**API-Endpunkte**:
```
GET    /api/game/{id}/scores    - Aktuelle Punktestände
GET    /api/leaderboard         - Globale Rangliste
GET    /api/stats/{playerId}    - Spielerstatistiken
```

#### 2.1.6 Persistenz-Modul
**Verantwortung**: Speichern und Wiederherstellen von Spielständen

**Komponenten**:
- `SaveGameManager`: Speichert komplette Spielsession
- `LoadGameManager`: Lädt Spielstand wieder
- `DatabaseAdapter`: Datenbank-Abstraktion

**API-Endpunkte**:
```
POST   /api/game/{id}/save      - Spielstand speichern
GET    /api/game/{id}/load      - Spielstand laden
GET    /api/saved-games         - Liste gespeicherter Spiele
DELETE /api/saved-games/{id}    - Gespeichertes Spiel löschen
```

---

## 3. Datenmodell

### 3.1 Entitäten

#### Game (Spielsession)
```
{
  id: UUID,
  host_id: UUID (Spielleiter),
  variant: STRING (Regelvariante),
  status: ENUM (CREATED, RUNNING, PAUSED, FINISHED),
  created_at: TIMESTAMP,
  started_at: TIMESTAMP,
  ended_at: TIMESTAMP,
  min_players: INT,
  max_players: INT,
  current_turn_player: UUID,
  winner_id: UUID (NULL bis Ende)
}
```

#### Player (Spieler)
```
{
  id: UUID,
  game_id: UUID (FK),
  user_id: UUID,
  username: STRING,
  role: ENUM (PLAYER, HOST/DEALER),
  hand: JSON (Array von Kartennummern),
  score: INT,
  status: ENUM (ACTIVE, FOLDED, ELIMINATED),
  joined_at: TIMESTAMP,
  turn_order: INT
}
```

#### Card (Karte)
```
{
  id: INT,
  game_id: UUID (FK),
  suit: ENUM (HEARTS, DIAMONDS, CLUBS, SPADES),
  rank: ENUM (2-10, J, Q, K, A),
  owner_player_id: UUID (FK, NULL wenn im Deck)
}
```

#### GameState (Spielstatus)
```
{
  id: UUID,
  game_id: UUID (FK),
  round: INT,
  deck_remaining: INT,
  last_move: JSON,
  timestamp: TIMESTAMP
}
```

#### Rule (Regel)
```
{
  id: UUID,
  variant: STRING,
  rule_text: TEXT,
  category: STRING (z.B. "Cardplay", "Scoring", "Special"),
  version: INT,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

#### SavedGame (Gespeicherter Spielstand)
```
{
  id: UUID,
  game_id: UUID (FK),
  snapshot: JSON (kompletter Spielstand),
  saved_by: UUID,
  saved_at: TIMESTAMP,
  description: STRING
}
```

---

## 4. Schnittstellen (Interfaces)

### 4.1 Schnittstellen-Übersicht

**Anmerkung**: Alle Schnittstellen sollten an einer zentralen Stelle dokumentiert sein, nicht an mehreren Orten verstreut (siehe Notes: "Irritierend dass an zwei Stellen Schnittstellen sind").

### 4.2 Frontend-Backend (REST API)

**Base URL**: `http://localhost:3000/api`

#### Authentication
```
POST /auth/register    - Benutzer registrieren
POST /auth/login       - Anmelden
POST /auth/logout      - Abmelden
GET  /auth/me          - Profil abrufen
```

#### Game Management
```
POST   /game/create
POST   /game/{gameId}/start
POST   /game/{gameId}/join
GET    /game/{gameId}/state
POST   /game/{gameId}/end
```

#### Gameplay
```
POST   /game/{gameId}/shuffle
POST   /game/{gameId}/deal
POST   /game/{gameId}/play
POST   /game/{gameId}/pass
GET    /game/{gameId}/hand/{playerId}
GET    /game/{gameId}/scores
```

#### Rules & Variants
```
GET    /rules
GET    /rules/{variant}
GET    /variants
```

#### Persistence
```
POST   /game/{gameId}/save
GET    /game/{gameId}/load
GET    /saved-games
DELETE /saved-games/{saveId}
```

### 4.3 Echtzeit-Kommunikation (WebSocket)

**Namespace**: `/game`

**Events vom Server**:
```javascript
// Spieler-Events
socket.on('player-joined', { playerId, username })
socket.on('player-left', { playerId })
socket.on('turn-changed', { currentPlayerId })

// Spiel-Events
socket.on('game-started', { variant, players })
socket.on('game-ended', { winner, finalScores })
socket.on('round-finished', { scores })

// Karten-Events
socket.on('cards-dealt', { playerHand })
socket.on('card-played', { playerId, card })
socket.on('deck-updated', { cardsRemaining })

// Status-Events
socket.on('game-paused', {})
socket.on('game-resumed', {})
socket.on('state-sync', { gameState })
```

**Events vom Client**:
```javascript
// Spieler-Events
socket.emit('join-game', { gameId, username })
socket.emit('leave-game', { gameId })

// Zug-Events
socket.emit('play-card', { gameId, cardId })
socket.emit('pass-turn', { gameId })

// Verwaltungs-Events
socket.emit('request-state-sync', { gameId })
```

---

## 5. Verhaltensbeschreibungen

### 5.1 Spielablauf (Happy Path)

**Hinweis**: Der detaillierte Spielablauf aus Kundensicht ist im [Product Goal](Product-goal.md) beschrieben.

Hier nur die technische Umsetzung:

1. **Spielerstellung**: Spielleiter erstellt Spiel → `POST /game/create`
2. **Spielerbeitritt**: Weitere Spieler treten bei → `POST /game/{id}/join`
3. **Spielstart**: Spielleiter startet Spiel (min. Spieler erforderlich) → `POST /game/{id}/start`
   - Karten werden gemischt: `POST /game/{id}/shuffle`
   - Karten werden ausgeteilt: `POST /game/{id}/deal`
4. **Spielablauf**: Spieler führen Züge aus → `POST /game/{id}/play`
   - Regeln werden validiert
   - Punkte werden berechnet
   - Nächster Spieler ist dran
5. **Runde beendet**: Bedingung erfüllt (z.B. alle Karten gespielt)
6. **Spielende**: Gewinner ermittelt → `POST /game/{id}/end`

### 5.2 Zustandsübergänge (State Machine)

**Detaillierte State Machine mit Methoden**:

```
┌─────────────────────────────────────────────────┐
│ CREATED                                         │
│ - Methods: create(), validate(), join()         │
└────────────────┬────────────────────────────────┘
                 │ start()
                 ▼
┌─────────────────────────────────────────────────┐
│ RUNNING                                         │
│ - Methods: playCard(), pass(), calculateScore() │
│ - Events: player-joined, turn-changed           │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
    pause()           Spielende
        │             erkannt?
        ▼                 │
┌──────────────┐          │
│ PAUSED       │          │
│ - resume()   │          │
└──────────────┘          │
        │                 │
    resume()              │
        │                 ▼
        └─────────────────────────┐
                                  │
                          ┌───────────────┐
                          │ FINISHED      │
                          │ - Methods:    │
                          │ getWinner()   │
                          │ save()        │
                          └───────────────┘

CANCELLED-State auch möglich: create() → CREATED → CANCELLED
```

**TODO**: Diese State Machine muss noch detaillierter werden mit Angabe aller Methoden und Bedingungen für Übergänge.

### 5.3 Fehlerbehandlung

| Szenario | HTTP Code | Aktion |
|---|---|---|
| Ungültiger Zug (siehe [Glossar](Glossar.md)) | `400 Bad Request` | Zug ablehnen, Fehlermeldung an Spieler |
| Spieler nicht gefunden | `404 Not Found` | Spiel-Session beenden oder Error-State |
| Unzureichende Spieler zum Starten | `403 Forbidden` | Fehlermeldung, Spiel nicht starten |
| Datenbank-Fehler | `500 Internal Server Error` | Retry-Mechanismus, Logging |
| WebSocket-Disconnect | Auto-Reconnect | State-Sync nach Wiederverbindung |

---

## 6. Sicherheit & Datenschutz

### 6.1 Authentifizierung & Autorisierung

- **JWT-Token**: Für Authentifizierung
- **Role-Based Access Control (RBAC)**: HOST-Rollen haben spezielle Berechtigungen
- **Input Validation**: Alle Eingaben validieren vor Verarbeitung (besonders kritisch: [Zug-Validierung](Glossar.md#ungültiger-zug-invalid-move))

### 6.2 Datenschutz (DSGVO)

- **Verschlüsslung**: HTTPS/TLS für Datenübertragung
- **Datenspeicherung**: Verschlüsselte Passwörter (bcrypt)
- **Datenlöschung**: Automatische Löschung alter Spielstände nach 90 Tagen
- **Consent**: Datenschutzerklärung vor Registrierung

### 6.3 Spielintegrität

- **Kartenvalidierung**: Keine Manipulation von Karten möglich
- **Zug-Validierung**: Jeder Zug wird auf Regelkonformität geprüft
- **Zustandsprüfung**: Regelmäßige Konsistenz-Checks

---

## 7. Umsetzung der Anforderungen aus dem Product Goal

**Hinweis**: Alle Anforderungen stehen im [Product Goal](Product-goal.md).

Diese Kapitel beschreibt, wie diese Anforderungen technisch umgesetzt werden:

### 7.1 Anforderung 1 - [Referenz zu PG]
- **Umsetzung**: [Modul/Komponenten, API-Endpunkt]
- **Tests**: [Unit Tests für...]

### 7.2 Anforderung 2 - [Referenz zu PG]
- **Umsetzung**: [Modul/Komponenten, API-Endpunkt]
- **Tests**: [Integration Tests für...]

**TODO**: Dieses Kapitel muss mit konkreten Anforderungen aus dem PG gefüllt werden.

---

## 8. Non-Funktionale Anforderungen (NFR)

### 8.1 Performance (NFR-1)

**Ziel**: Maximale Response-Zeit 0,3 Sekunden (außer Start/Laden)

**Implementierung**:
- Datenbank-Indexierung auf häufig abgefragt Felder
- Caching von Regelsets
- WebSocket für Echtzeit-Updates statt Polling
- Lazy Loading von Spielhistorie

**Tests**: Load-Test mit mindestens 10 gleichzeitigen Spielsessions

### 8.2 Verfügbarkeit (NFR-2)

**Ziel**: Maximal 1 kritischer Fehler pro Spielsession

**Implementierung**:
- Ausnahmepufferung und strukturierte Fehlerlog
- Graceful Degradation bei teilweisem Ausfall
- Automatische Spielstand-Sicherung alle 30 Sekunden
- Health-Check-Endpoints

### 8.3 Zuverlässigkeit (NFR-3)

- Unit-Tests für Regelmodul (mindestens 80% Coverage)
- Integration-Tests für API-Endpunkte
- E2E-Tests für komplette Spielflüsse

### 8.4 Usability (NFR-4)

**Ziel**: "OK"-Bewertung durch Kunden in Workshop

- Intuitive Bedienung (keine Schulung nötig)
- Klare Regelanzeige in der Spieloberfläche
- Spielstatus deutlich visualisiert

---

## 9. Deployment & Betrieb

### 9.1 Deployment-Architektur

```
Frontend (React Build) → CDN / Static Hosting
Backend (Node.js + Express) → Docker Container
Database (PostgreSQL) → Containerisiert
```

### 9.2 Docker-Compose

```yaml
version: '3.9'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/gamedb
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=gamedb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### 9.3 Monitoring

- **Logs**: ELK-Stack (Elasticsearch, Logstash, Kibana) oder CloudWatch
- **Metriken**: Prometheus + Grafana
- **Alerts**: E-Mails bei kritischen Fehlern

---

## 10. Testing-Strategie

**Siehe**: [Project_Management.md - Testing-Strategie](Project_Management.md#21-testing-strategie)

Diese Sektion war im Original-SD zu kurz gefasst. Eine detaillierte Testing-Strategie ist in einem eigenen Dokument ausgelagert.

---

## 11. Erweiterungspunkte (Future Work)

- **Multiplayer-Lobby**: Bessere Spieler-Matching-Systeme
- **KI-Gegner**: Bot-Spieler für Solo-Sessions
- **Mobile-App**: Native iOS/Android-Apps
- **Statistiken**: Erweiterte Spielerprofile und Achievements
- **Turniere**: Multi-Game-Turnierformate

---

## 12. Risiken & Mitigationen

**Siehe**: [Project_Management.md - Risk Management](Project_Management.md#11-identifizierte-risiken)

Risiken gehören nicht ins SD, sondern sind in einem eigenen Projekt-Management-Dokument dokumentiert.

---

## 13. Glossar

**Siehe**: [Glossar.md](Glossar.md)

Alle Begriffe und Definitionen (inkl. "Ungültiger Zug") sind in einem separaten Glossar-Dokument dokumentiert.

---

## Dokumentation Standards

- Bei jedem Sprint prüfen, ob dieses Dokument noch aktuell ist
- Technische Execution (TE) bleibt über Sprints hinweg gleich
- **Anforderungen gehören ins Product Goal**, nicht hier
- **Umsetzungsplans der Anforderungen** sollten in diesem Dokument mit klaren Referenzen auf das PG stehen
- Bei Designentscheidungen immer **Begründung UND Alternativen** anfügen (siehe Kapitel 1.2)
- **AML-File**: Sollte als eigenes Dokument im Repo stehen, nicht in diesem Dokument eingebettet sein
