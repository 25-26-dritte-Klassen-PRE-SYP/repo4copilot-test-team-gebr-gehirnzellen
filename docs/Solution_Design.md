# Solution Design – Digitales Kartenspielsystem

## 1. Architektur-Übersicht

### 1.1 Systemarchitektur
Das System folgt einer **Client-Server-Architektur** mit folgenden Komponenten:

- **Frontend (Client)**: Web-basierte oder Desktop-Anwendung (React/Vue.js)
- **Backend (Server)**: RESTful API (Node.js/Express oder Python/Flask)
- **Datenbank**: Relationale Datenbank (PostgreSQL) für Spielstände, Regeln und Benutzerdaten
- **Session-Management**: Echtzeit-Kommunikation via WebSocket für Live-Spielupdates

### 1.2 Technologie-Stack

| Komponente | Technologie | Begründung |
|---|---|---|
| Frontend | React.js / Vue.js | Interaktive UI, einfache State-Verwaltung |
| Backend | Node.js + Express / Python + Flask | Schnelle Entwicklung, gutes Ecosystem |
| Datenbank | PostgreSQL | Zuverlässig, ACID-Konformität |
| Echtzeit | WebSocket (Socket.io) | Live-Spielupdates ohne Latenz |
| Hosting | Docker Container | Portable, skalierbar |

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

### 4.1 Frontend-Backend (REST API)

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

### 4.2 Echtzeit-Kommunikation (WebSocket)

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

```
CREATED → RUNNING → (PAUSED) → RUNNING → FINISHED
   ↓
 CREATED → CANCELLED
```

### 5.3 Fehlerbehandlung

| Szenario | Aktion |
|---|---|
| Ungültiger Zug | `400 Bad Request` + Fehlermeldung |
| Spieler nicht gefunden | `404 Not Found` |
| Unzureichende Spieler | `403 Forbidden` |
| Datenbank-Fehler | `500 Internal Server Error` + Retry-Mechanismus |
| WebSocket-Disconnect | Auto-Reconnect mit State-Sync |

---

## 6. Sicherheit & Datenschutz

### 6.1 Authentifizierung & Autorisierung

- **JWT-Token**: Für Authentifizierung
- **Role-Based Access Control (RBAC)**: HOST-Rollen haben spezielle Berechtigungen
- **Input Validation**: Alle Eingaben validieren vor Verarbeitung

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

## 7. Non-Funktionale Anforderungen (NFR)

### 7.1 Performance (NFR-1)

**Ziel**: Maximale Response-Zeit 0,3 Sekunden (außer Start/Laden)

**Implementierung**:
- Datenbank-Indexierung auf häufig abgefragt Felder
- Caching von Regelsets
- WebSocket für Echtzeit-Updates statt Polling
- Lazy Loading von Spielhistorie

**Tests**: Load-Test mit mindestens 10 gleichzeitigen Spielsessions

### 7.2 Verfügbarkeit (NFR-2)

**Ziel**: Maximal 1 kritischer Fehler pro Spielsession

**Implementierung**:
- Ausnahmepufferung und strukturierte Fehlerlog
- Graceful Degradation bei teilweisem Ausfall
- Automatische Spielstand-Sicherung alle 30 Sekunden
- Health-Check-Endpoints

### 7.3 Zuverlässigkeit (NFR-3)

- Unit-Tests für Regelmodul (mindestens 80% Coverage)
- Integration-Tests für API-Endpunkte
- E2E-Tests für komplette Spielflüsse

### 7.4 Usability (NFR-4)

**Ziel**: "OK"-Bewertung durch Kunden in Workshop

- Intuitive Bedienung (keine Schulung nötig)
- Klare Regelanzeige in der Spieloberfläche
- Spielstatus deutlich visualisiert

---

## 8. Deployment & Betrieb

### 8.1 Deployment-Architektur

```
Frontend (React Build) → CDN / Static Hosting
Backend (Node.js + Express) → Docker Container
Database (PostgreSQL) → Containerisiert
```

### 8.2 Docker-Compose

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

### 8.3 Monitoring

- **Logs**: ELK-Stack (Elasticsearch, Logstash, Kibana) oder CloudWatch
- **Metriken**: Prometheus + Grafana
- **Alerts**: E-Mails bei kritischen Fehlern

---

## 9. Erweiterungspunkte (Future Work)

- **Multiplayer-Lobby**: Bessere Spieler-Matching-Systeme
- **KI-Gegner**: Bot-Spieler für Solo-Sessions
- **Mobile-App**: Native iOS/Android-Apps
- **Statistiken**: Erweiterte Spielerprofile und Achievements
- **Turniere**: Multi-Game-Turnierformate

---

## 10. Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| Regeln-Interpretation unklar | Mittel | Hoch | Detaillierte Regel-Dokumentation, Unit-Tests |
| Spielstand-Verlust | Niedrig | Sehr Hoch | Redundante Backups, Transaktionales Logging |
| Performance-Probleme bei vielen Sessions | Niedrig | Mittel | Load-Testing, Caching-Strategie |
| Sicherheitslücken | Niedrig | Sehr Hoch | Code-Reviews, Security-Audits, OWASP Top 10 |

---

## 11. Glossar

| Begriff | Definition |
|---|---|
| Deck | Gesamtheit aller 52 Spielkarten |
| Hand | Die Karten, die ein Spieler besitzt |
| Zug | Eine Aktion eines Spielers (Karte spielen, passen) |
| Runde | Ein kompletter Durchgang aller Spieler |
| Variante | Alternative Regelsets (z.B. "Klassisch", "Turbo") |
| Session | Eine Spielsession von Anfang bis Ende |
| Spielleiter | Spieler mit HOST-Rolle, startet das Spiel |
| Persistenz | Speicherung von Spielständen |

