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
<img width="412" height="1314" alt="image" src="https://github.com/user-attachments/assets/04d03899-5ea3-4594-8f59-366f03cb39b3" />


#### 1.3.2 DFD – Data Flow Diagram (Level 0)

<img width="1186" height="520" alt="image" src="https://github.com/user-attachments/assets/e64a35b8-64c8-4f18-bdee-1c12b31b2152" />

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

#### 1.3.4 Rollen Erklärung
- Die Spieler sind jene die von den Spielleiter zum spielen geladenen Personen mit mangelden Regelkenntnis
- Die Spielleiter sind eintweder die Regelkenner oder die Mischer oder beides gleichzeitig


 

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

## 2\. Soll-Zustand

### 2.1 Ziele
- 1. Das Spiel soll vom Spielleiter (die Person die das Spiel hostet) nach Erreichen der Mindestspieleranzahl des Spielmodus gestartet werden können.
- 2. Das System soll Karten automatisch mischen und an alle Spieler verteilen.
- 3. Die Spielregeln sollen unter Einstellungen jederzeit einsehbar und nach Spielvarianten geordnet sein.
- 4.Das System soll verschiedene Spielvarianten auswählbar machen.
- 5.Das System soll Spielstände speichern und später wiederherstellen können.
- 6. Das System soll Punkte automatisch berechnen und anzeigen.
- 7. Das System soll Spielern ermöglichen, ihre Züge digital auszuführen.

### 2.2 Soll-Kontext
#### USE-Case
<img width="314" height="1570" alt="image" src="https://github.com/user-attachments/assets/fc3dc7ae-c3c5-4ddd-a198-1af8b4827ead" />
#### DFD
<img width="1139" height="212" alt="image" src="https://github.com/user-attachments/assets/7b38c004-d6e7-494d-afe0-6a35e6a17265" />

####  Rollen Erklärung
- Die Spieler sind die Personen die das Programm zu ihrer Unterhaltung nutzen
- Die Admin verwalten die Regeln und passen sie bei Bedarf an 


### 2.3 Nicht-funktionale Ziele(QZ)
####  Änderbarkeit / Wartbarkeit
- Analysierbarkeit:Nicht wichtig für dieses Projekt, da keine langfristige Wartung oder komplexe Fehleranalyse vorgesehen ist.
- Konformität:
Nicht wichtig, da keine spezifischen externen Wartungsnormen oder Änderungsrichtlinien verpflichtend eingehalten werden müssen.
- Modifizierbarkeit:
Nicht wichtig, da das System nach Projektabschluss nur in geringem Umfang weiterentwickelt oder angepasst wird.
- Stabilität:
Nicht wichtig, da Änderungen am System im Projektkontext selten vorkommen und keine kontinuierliche Weiterentwicklung geplant ist.
- Testbarkeit / Prüfbarkeit:
Nicht wichtig, da Tests nur während der Entwicklungsphase durchgeführt werden und keine automatisierten langfristigen Testprozesse erforderlich sind.
#### Benutzbarkeit
- Attraktivität:
Es soll bei der Umfrage im Rahmen eines Workshops mit dem Kunden eine „OK“-Bewertung zum Design durch den Kunden erreicht werden.
- Bedienbarkeit:
Nicht wichtig, da keine detaillierten ergonomischen Usability-Studien oder Optimierungen vorgesehen sind.
- Erlernbarkeit:
Nicht wichtig, da die Zielgruppe das Spiel bereits kennt und keine komplexe Einarbeitung notwendig ist.
- Konformität:
Nicht wichtig, da keine formalen Usability-Normen verpflichtend umgesetzt werden müssen.
- Verständlichkeit:
Nicht wichtig, da die Spielregeln bereits durch das bekannte Kartenspielprinzip vorgegeben sind.
#### Effizienz
- Zeitverhalten:
Wenn alles in einem lokalen Netz ohne Belastung ausgeführt wird, darf das System bei jeder Funktion eine Höchstzeit von 0,3 Sekunden haben. Ausnahme: Start- und Lade-Funktion mit maximal 20 Sekunden.
- Verbrauchsverhalten:
Nicht wichtig, da keine Optimierung für CPU-, Speicher- oder Netzwerkressourcen im Projektumfang vorgesehen ist.
- Konformität:
Nicht wichtig, da keine spezifischen Effizienzstandards eingehalten werden müssen.
#### Funktionalität
- Angemessenheit:
Nicht wichtig, da die Spielregeln bereits durch das funktionale Design eindeutig definiert sind.
- Sicherheit:
Nicht wichtig, da keine sicherheitskritischen Daten oder Zahlungsprozesse verarbeitet werden.
- Interoperabilität:
Nicht wichtig, da das System nicht mit externen Systemen kommunizieren muss.
- Konformität:
Nicht wichtig, da keine gesetzlichen oder normativen Funktionsstandards relevant sind.
- Ordnungsmäßigkeit:
Nicht wichtig, da keine speziellen rechtlichen oder normativen Spielvorschriften über die Grundanforderungen hinaus bestehen.
- Richtigkeit:
Nicht wichtig, da die Spiellogik einfach gehalten ist und keine komplexen Berechnungen enthält.
#### Übertragbarkeit
- Anpassbarkeit:
Nicht wichtig, da das System nur für eine feste Umgebung (lokales oder definiertes digitales Spielsystem) entwickelt wird.
- Austauschbarkeit:
Nicht wichtig, da keine alternativen Systeme ersetzt werden müssen.
- Installierbarkeit:
Nicht wichtig, da keine komplexe Installation oder Setup-Prozesse vorgesehen sind.
- Koexistenz:
Nicht wichtig, da das System nicht parallel zu anderen ähnlichen Systemen betrieben werden muss.
- Konformität:
Nicht wichtig, da keine speziellen Portabilitätsnormen eingehalten werden müssen.
#### Zuverlässigkeit
- Fehlertoleranz:
Nicht wichtig, da keine hohe Ausfallsicherheit für kritische Systeme erforderlich ist.
- Konformität:
Nicht wichtig, da keine speziellen Zuverlässigkeitsnormen gefordert sind.
- Reife:
Das System soll eine hohe Fehlerfreiheit aufweisen, sodass während des Spielbetriebs maximal 1 kritischer Fehler (also ein Fehler, der das Fortführen der Spielrunde verhindert, z. B. Einfrieren der Oberfläche oder Absturz des Programms) pro 100 Spielrunden auftreten darf.
- Wiederherstellbarkeit:
Nicht wichtig, da keine komplexen Datenwiederherstellungsmechanismen notwendig sind und ein Neustart der Spielrunde ausreichend ist.
#### Folgende Ziele wurden besprochen aber können nicht im Rahmen des Projektes realisiert werden 
- Die Verfügbarkeit des Systems im laufenden Betrieb mindestens 98 % betragen, sodass stabile und unterbrechungsarme Spielsessions gewährleistet sind.


  



