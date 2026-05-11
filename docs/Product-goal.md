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
 - 1. Das Spiel soll vom Spielleiter (die person die das spiel hostet) nach erreichen der mindestspieler anzahl des Spielmodus gestartet werden können.
- 2.Das System soll Karten automatisch mischen und an alle Spieler verteilen.
- 3. Die Spielregeln sollen unter Einstellungen jederzeit einsehbar und nach Spielvarianten geordnet sein.
- 4.Das System soll verschiedene Spielvarianten auswählbar machen.
- 5.Das System soll Spielstände speichern und später wiederherstellen können.
 - 6.Das System soll Punkte automatisch berechnen und anzeigen.
  - 7.Das System soll Spielern ermöglichen, ihre Züge digital auszuführen.

### 2.2 Soll-Kontext
<img width="314" height="1570" alt="image" src="https://github.com/user-attachments/assets/fc3dc7ae-c3c5-4ddd-a198-1af8b4827ead" />

<img width="1139" height="212" alt="image" src="https://github.com/user-attachments/assets/7b38c004-d6e7-494d-afe0-6a35e6a17265" />

#### 1.3.4 Rollen Erklärung
- Die Spieler sind die Personen die das Programm nutzen zu ihrer Unterhaltung
- Die Admin verwalten die Regeln und passen sie bei bedarf an 


### 2.3 Nicht-funktionelle Ziele(QZ)
  - Attraktivität: Es soll bei der Umfrage im Rahmen eines Workshops mit dem Kunden nach eine Zufriedenheits überprüfung über die Benutzeroberfläche eine mindestens  durschnitts Zufriedenheit von 7,5/10 erreicht werden und kein punkt darf eine durschnitts zufriedenheit von unter 5 erhalten
  - Zeitverhalten:  Das System darf bei jeder Funktion eine höchstzeit von 2 Sekunden haben ,außnahme zu dieser Regel bildet die Start Funktion und die Lade Funktion diese dürfen höchstens 20 Sekunden dauern
  - Reife:  Das System soll eine hohe Fehlerfreiheit aufweisen, sodass während des Spielbetriebs maximal 1 kritischer Fehler(also ein Fehler der das Fortführen der Spielrunde nicht möglich macht; Einfrieren der Oberfläche oder Absturz des Programms) pro 100 Spielrunden auftreten darf. Zusätzlich soll die Verfügbarkeit des Systems im laufenden Betrieb mindestens 98 % betragen, sodass stabile und unterbrechungsarme Spielsessions gewährleistet sind.


  



