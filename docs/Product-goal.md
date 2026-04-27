# Product-Goal

## 1\. Ist-Zustand

### 1.1 Wie wird heute gearbeitet?

* Spieler nutzen ein einfaches Kartendeck, das ohne digitale Unterstützung oder Zusatzmaterial auskommt. Die Regeln werden meist mündlich erklärt und variieren je nach Runde.
* Das Spiel wird in kleinen Gruppen gespielt, wobei viel Zeit für das Sortieren, Mischen und Erklären der Karten verloren geht.





### 1.2 das Problem/Bedürfnis damit?

* Neue Spieler fühlen sich oft überfordert, weil die Regeln nicht einheitlich dokumentiert sind und Interpretationsspielraum lassen. Dadurch entstehen Missverständnisse und das Spieltempo leidet.
* Viele wünschen sich klarere Strukturen, schnellere Runden und zusätzliche Spielvarianten, um langfristig motiviert zu bleiben.





### 1.3 Ist-Kontext
#### 1.3.1 UML Use-Case Diagramm – Beschreibung

##### Akteure
- Spieler
- Admin/Spielleiter
- System (digitale Kartenspiel-App)

##### Wichtigste Use-Cases
- Spiel starten
- Regeln anzeigen
- Karten automatisch mischen
- Karten austeilen
- Zug ausführen
- Spielvarianten auswählen
- Spielstand speichern
- Regeln verwalten (Admin)

##### Textuelle Beziehungen
- Spieler → Spiel starten → System  
- Spieler → Regeln anzeigen → System  
- Spieler → Karten automatisch mischen → System  
- Spieler → Karten austeilen → System  
- Spieler → Zug ausführen → System  
- Spieler → Spielvarianten auswählen → System  
- Admin → Regeln verwalten → System  

---

#### 1.3.2 DFD – Data Flow Diagram (Level 0)

##### Externe Entitäten
- Spieler  
- Admin  

##### Prozesse
- P1: Spielverwaltung  
- P2: Kartenlogik  
- P3: Regel- und Variantenverwaltung  

##### Datenspeicher
- D1: Regeldatenbank  
- D2: Kartendeck-Datenbank  
- D3: Spielstände/Statistiken  

##### Datenflüsse
- Spieler → Startsignal → P1  
- P1 → Spielstatus → Spieler  
- Spieler → Aktion/Zug → P2  
- P2 → Ergebnis/Neue Karten → Spieler  
- Admin → Regeländerungen → P3  
- P3 → Regelsatz → P1, P2  

---

#### 1.3.3 API – Beispielhafte Endpunkte

##### Spielverwaltung
- `POST /game/start` – Startet ein neues Spiel, gibt Spiel-ID zurück.  
- `POST /game/{id}/join` – Spieler tritt einer Runde bei.  
- `GET /game/{id}/state` – Liefert aktuellen Spielstatus.  

##### Kartenlogik
- `POST /game/{id}/shuffle` – Mischt das Deck.  
- `POST /game/{id}/deal` – Teilt Karten an Spieler aus.  
- `POST /game/{id}/play` – Spieler führt einen Zug aus.  
- `GET /game/{id}/hand/{player}` – Gibt Handkarten eines Spielers zurück.  

##### Regelverwaltung
- `GET /rules` – Liefert alle Regeln.  
- `POST /rules/update` – Aktualisiert Regelsätze (Admin).  
- `GET /variants` – Liefert verfügbare Spielvarianten.  

---

#### 1.3.4 UI-Beschreibung inkl. Rollen

##### Rolle: Spieler – Hauptbildschirm
- Oben: Spielstatus (Runde, aktiver Spieler, Punkte).  
- Mitte: Spielfeld mit abgelegten Karten.  
- Unten: Handkarten des Spielers (horizontal scrollbar).  
- Links: Button „Regeln anzeigen“.  
- Rechts: Button „Spielvarianten“.  

##### Rolle: Admin – Admin-Dashboard
- Liste aller Regelsätze.  
- Aktionen: „Bearbeiten“, „Neue Variante“, „Regeln exportieren“.  
- Statistikbereich: durchschnittliche Spieldauer, beliebteste Varianten.  

---

#### 1.3.5 Vorhandene/gelebte Geschäftsprozesse

##### Spielvorbereitung
- Spieler treffen sich physisch, mischen Karten manuell und erklären Regeln mündlich.  
- Rollen (z. B. Dealer) werden spontan vergeben.  

##### Spielablauf
- Spieler ziehen Karten, spielen Züge und diskutieren Regeln bei Unklarheiten.  
- Bei Streitfällen wird improvisiert oder abgestimmt.  

##### Rundenabschluss
- Punkte werden manuell gezählt.  
- Karten werden neu sortiert und gemischt.  

##### Wissensweitergabe
- Regeln werden mündlich weitergegeben, oft unvollständig oder unterschiedlich interpretiert.  

---

#### 1.3.6 Gesetzliche Vorschriften (relevant für digitale Umsetzung)

- Datenschutz: DSGVO (Nutzerdaten, Accounts, Statistiken).  
- Urheberrecht: UrhG (Kartendesigns, Grafiken, Namen).  
- Verbraucherschutz: Preisangaben, digitale Inhalte, ggf. In-App-Käufe.  
- Jugendschutz: Altersfreigaben, Online-Spiel-Richtlinien.


