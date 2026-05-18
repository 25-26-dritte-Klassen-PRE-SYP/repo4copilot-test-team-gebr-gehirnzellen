# Glossar

## Überblick

Dieses Dokument definiert alle wichtigen Begriffe und Konzepte des Projekts präzise.

---

## Spielbezogene Begriffe

### Ungültiger Zug (Invalid Move)

**Definition**: Ein Zug ist ungültig, wenn er eine oder mehrere der folgenden Bedingungen erfüllt:

1. **Regelverstoß**: Der Zug verstößt gegen die Spielregeln
   - Beispiel: Ein Spieler versucht, sich auf ein Feld zu bewegen, das nicht erlaubt ist

2. **Ungültiger Spielzustand**: Der Zug kann im aktuellen Spielzustand nicht durchgeführt werden
   - Beispiel: Ein Zug wird in einer Phase versucht, in der er nicht erlaubt ist

3. **Input-Validierungsfehler**: Der Zug hat invalide Eingabeparameter
   - Das Zielfeld existiert nicht
   - Die Zug-Notation ist falsch formatiert
   - Die Spieler-ID ist ungültig

4. **State-Machine Konflikt**: Der Zug passt nicht zum aktuellen Zustand der State Machine
   - Beispiel: Ein Zug wird in einem Zustand versucht, für den er nicht definiert ist

5. **Nicht verfügbare Ressourcen**: Notwendige Ressourcen für den Zug sind nicht vorhanden
   - Beispiel: Der Spieler hat nicht genug Punkte/Ressourcen für eine Aktion

**Konsequenz**: Ungültige Züge werden vom System abgelehnt und führen zu einer Fehlermeldung für den Spieler. Der Spielzustand ändert sich nicht.

**Siehe auch**: Solution_Design.md - Kapitel 5.2 (State Machine) und 6.1 (Input Validation)

---

### Spielzustand (Game State)

**Definition**: Der Spielzustand ist die Gesamtheit aller relevanten Informationen zu einem bestimmten Zeitpunkt im Spiel:
- Position aller Spieler
- Verfügbare Ressourcen
- Aktuelle Phase des Spiels
- Welcher Spieler ist am Zug

---

### State Machine

**Definition**: Ein Zustandsautomatensystem, das die verschiedenen Zustände des Spiels und die zulässigen Übergänge zwischen diesen Zuständen definiert.

**Details**: Siehe Solution_Design.md - Kapitel 5.2 für detaillierte Methoden und Übergänge.

---

## Dokumentations-Begriffe

### Product Goal (PG)

**Definition**: Das Strategiedokument, das die Anforderungen und Ziele des Produkts aus Kundensicht beschreibt.

**Inhalt sollte sein**:
- Anforderungen
- Spielablauf (aus Kundensicht verständlich)
- Ziele und Vision

---

### Solution Design (SD)

**Definition**: Das technische Designdokument für die Implementierung.

**Inhalt sollte sein**:
- Technische Architektur
- Umsetzungspläne der Anforderungen (mit Referenzen auf PG)
- Komponenten und deren Schnittstellen
- Design-Entscheidungen mit Begründung und Alternativen

**Inhalt gehört NICHT rein**:
- Anforderungen (gehören ins PG)
- Risiken (gehören ins Project_Management.md)
- Glossar (gehört ins Glossar.md)

---

### Technical Execution (TE)

**Definition**: Die technische Dokumentation der Implementierung.

**Besonderheit**: Bleibt über Sprints hinweg gleich und wird nur bei notwendigen technischen Änderungen aktualisiert.

---

## AML-File

**Definition**: Die Konfigurationsdatei für das Spiel (Wert unklar - siehe Repo-Dokumentation).

**Speicherort**: Sollte als eigenes Dokument im Repo stehen, nicht in anderen Dokumenten eingebettet sein.

---

## Weitere Begriffe

### Input Validation

**Definition**: Der Prozess, um sicherzustellen, dass alle Benutzereingaben den erwarteten Anforderungen entsprechen.

**Kritisch für**: Ungültige Züge erkennen und abweisen

**Zu definieren in**: Solution_Design.md - Kapitel 6.1 (muss genauer definiert werden)

---

### Schnittstellen (Interfaces)

**Definition**: Definierte Verbindungspunkte zwischen verschiedenen Komponenten des Systems.

**Anmerkung**: Im SD sollten alle Schnittstellen an einem Ort dokumentiert sein, nicht an verschiedenen Stellen verstreut.

---
