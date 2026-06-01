---
layout: default
title: Project Management
---

# Project Management

## Überblick

Dieses Dokument behandelt die projektspezifischen Aspekte wie Risiken, Projektplanung und Management-Aktivitäten.

---

## 1. Risiken (Risk Management)

Risiken sind Unsicherheiten, die das Projekt beeinflussen könnten. Sie gehören nicht ins Solution Design, sondern werden hier zentral verwaltet.

### 1.1 Identifizierte Risiken

| # | Risiko | Beschreibung | Wahrscheinlichkeit | Auswirkung | Mitigation |
|---|--------|-------------|-------------------|-----------|------------|
| R1 | Zeitdruck bei Implementierung | Die Komplexität der Spiellogik erfordert mehr Zeit als geplant | Mittel | Hoch | Iterative Entwicklung, Priorisierung von Core Features |
| R2 | Missverständnisse bei Anforderungen | PG und SD könnten unterschiedlich interpretiert werden | Mittel | Mittel | Regelmäßige Reviews, Klare Dokumentation |
| R3 | Performance-Probleme | Die Spiellogik könnte bei Optimierung problematisch sein | Niedrig | Mittel | Early Performance Testing, Profiling |
| R4 | Integration von AML-File | Technische Integration könnte schwieriger als erwartet sein | Niedrig | Mittel | Frühzeitige Prototypen, Dokumentation beachten |

### 1.2 Risk Tracking

Bei jedem Sprint werden die Risiken neu bewertet und der Status aktualisiert.

---

## 2. Qualitätssicherung

### 2.1 Testing-Strategie

Wie gehen wir an die Tests heran? Wie genau machen wir sie?

- **Unit Tests**: Für einzelne Methoden der State Machine
- **Integration Tests**: Für die Zusammenarbeit zwischen Komponenten
- **System Tests**: Für den gesamten Spielablauf
- **Validierungstests**: Besonders für Input Validation (siehe 6.1 im SD)

### 2.2 Definition of Done

Code-Änderungen sind nur dann fertig, wenn:
1. Alle Unit Tests bestehen
2. Code-Review durchgeführt wurde
3. Dokumentation aktualisiert ist
4. Input Validation funktioniert korrekt

---

## 3. Dokumentation & Reviews

### 3.1 Regelmäßige Überprüfung

Bei jedem Sprint prüfen ob die Dokumentation noch aktuell ist.
- **PG**: Änderungen bei neuen oder geänderten Anforderungen
- **SD**: Änderungen bei Design-Entscheidungen
- **Technical Execution**: Bleibt immer gleich

### 3.2 Dokumentation-Standards

- Alle Anforderungen gehören ins **Product Goal**
- Im SD sollten stattdessen die **Umsetzungspläne** der Anforderungen stehen
- Bei Referenzierung von Anforderungen → Link auf PG
- Risiken gehören hier rein (**Project Management**)
- Glossar gehört ins separate **Glossar.md**

---

## 4. Deployment

Die Projektdokumentation wird über GitHub Pages veröffentlicht. Bei jedem Push auf den `main`-Branch startet automatisch der GitHub-Actions-Workflow `Deploy documentation to GitHub Pages`.

### 4.1 Deployment-Test

Nach Änderungen an der Dokumentation wird geprüft, ob:

1. Der Workflow erfolgreich abgeschlossen wurde.
2. Die GitHub-Pages-Startseite erreichbar ist.
3. Die geänderte Dokumentationsseite online aktualisiert wurde.
