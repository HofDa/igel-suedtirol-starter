# Branding und Logo

## Aktuelles Asset

`public/logo-igelprojekt.png` ist die Bild-Wortmarke des b\*nature-Igelprojekts:
Wortzeichen, Igel-Silhouette und die gestrichelte Straßenlinie. Sie wird im
Kopfbereich neben dem Projektnamen ausgeliefert.

**Die Datei ist ein Rasterbild und noch nicht das endgültige Produktionsasset.**
Sie wurde aus `Logo_Igelprojekt_Farbe.jpg` beschnitten und auf 320 px Höhe
skaliert. **Sie ist nicht freigestellt:** entgegen einer früheren Fassung
dieses Dokuments ist jedes Pixel deckend, der Grund ist ein nahezu weißes
`#fefefe`. Die Bildmarke bringt ihr weißes Rechteck also selbst mit und kann
nur auf weißem Grund stehen, ohne als Kasten sichtbar zu werden. Vor dem
öffentlichen Einsatz zu erledigen:

1. das Logo als sauberes SVG aus der Quelldatei exportieren und
   `public/logo-igelprojekt.png` ersetzen,
2. App-Icons unter `public/icons/` aus dem finalen SVG neu erzeugen,
3. Schutzraum und Mindestgrößen dokumentieren,
4. Urheber- und Nutzungsrechte klären,
5. eine Variante für dunkle Hintergründe ergänzen. Solange die Bildmarke
   ihren eigenen weißen Grund mitbringt, ist der Schutzraum (`logo-plate`) in
   beiden Fassungen weiß: hell verschwindet er im Seitengrund, dunkel
   verschmilzt er mit dem Grund der Bildmarke. Erst ein echtes freigestelltes
   SVG erlaubt dort einen eigenen Ton.

`public/logo-hedgehog.svg` ist das alte, neutrale Platzhalterlogo. Es wird von
der Anwendung nicht mehr verwendet und kann entfernt werden, sobald die
App-Icons neu erzeugt sind.

Die öffentliche Oberfläche bleibt unabhängig von der Systemeinstellung hell.
Weiß und Sand wechseln sich als Seitengrund ab. Eine dunkle Fassung wird erst
mit einem expliziten Schalter aktiv.

Eine gespeicherte Abstimmungs-Webseite ist kein geeignetes Produktionsasset: Sie
enthält Seitenmarkup, Skripte und Metadaten statt eines isolierten Logos.
Deshalb wurde sie nicht in das Repository kopiert.

## Farben

Das Igelprojekt ist eine Untersite von b\*nature (bnature.bz) und übernimmt
Grund, Schriftfarben, Sand und Typografie der Dachmarke. Die **Handlungsfarbe
kommt jedoch aus dem eigenen Projektlogo**: Das Blattgrün steht in jeder
Kopfzeile über der Schaltfläche, und eine Handlungsfarbe, die mit der Bildmarke
direkt darüber nicht zusammenpasst, liest sich wie zwei aneinandergeheftete
Marken. Die vollständigen Rollen und Begründungen stehen in `DESIGN.md`; die
Werte selbst liegen in `src/app/globals.css`.

| Name     | Wert      | Herkunft                                            |
| -------- | --------- | --------------------------------------------------- |
| Blatt    | `#1ea600` | Grün des Igelprojekt-Logos – **die Handlungsfarbe** |
| Tiefblatt | `#166f00` | abgedunkelt, für grüne Schrift und Überschriften   |
| Moosgrün | `#2f6b3d` | „geprüft" (Leiter der Dachmarke)                    |
| Sand     | `#f3eee7` | zweiter Seitengrund der Dachmarke                   |
| Tinte    | `#374151` | neutrale Schriftfarbe der Dachmarke                 |
| Blüte    | `#fb8cdb` | Pink der Figur im Wortzeichen des Projektlogos      |

Blatt und Blüte stammen aus dem Projektlogo, alles Übrige von der Dachmarke.
Der Blattwert ist aus der Bilddatei abgetastet: 72 % der grünen Pixel liegen
auf `#1da600` und bestätigen damit das in den Markenunterlagen angegebene
`#1ea600`.

Diese Regeln sind bindend, weil sie sonst erfahrungsgemäß wieder verwässern:

- **Grün ist die einzige Handlungsfarbe, und zwar das Blattgrün des Logos.**
  Es liegt unverändert gefüllt auf jeder Schaltfläche. Entscheidend ist die
  Beschriftung: Weiß auf Blattgrün erreicht nur 3,23:1, dunkles Braunschwarz
  dagegen 5,80:1. Wo Grün selbst Schrift, Symbol oder erste Überschrift ist,
  kommt das abgedunkelte `#166f00` zum Einsatz (6,35:1 auf Weiß).
- **Jede grüne Fläche auf hellem Grund trägt eine Haarlinie in Textfarbe.**
  Als Fläche erreicht das Blattgrün gegen Weiß 3,23:1 und gegen den Sandgrund
  nur 2,80:1 – unter der 3:1-Schwelle für Umrisse von Bedienelementen.
- **Helles Blattgrün heißt handeln, tiefes Moosgrün heißt geprüft.** Die beiden
  Töne liegen weit genug auseinander, dass der Farbton sie unterscheidet.
- **Die dunkle Fassung übernimmt den Grund der Dachmarke, nicht ihr Grün.**
  Die Handlungsfläche bleibt das Blattgrün mit dunkler Beschriftung; nur grüne
  Schrift wechselt auf den aufgehellten Ton `#3fd41f`.
- **Pink trägt nie Text und ist weder Handlung noch Warnung.** Es kennzeichnet
  Beobachtungsdaten auf Karten und darf als weiche, organische Schmuckfläche
  öffentliche Seiten freundlicher machen. Es steht immer mit einem Umriss in
  Textfarbe, weil es gegen Weiß nur 2,13:1 erreicht. Warnungen haben eine
  eigene Rolle (`danger`).

Die gestrichelte Straßenlinie aus dem Logo ist im System die sichtbare
Auszeichnung für „vorläufig, noch kein Nachweis“ – Demowerte, ungeprüfte
Meldungen und ausstehende Rechtstexte tragen sie.

## Gestaltungsprinzip „Garten-Feldbuch"

Die öffentliche Oberfläche verbindet eine warme Gartenwelt mit der Ruhe eines
wissenschaftlichen Feldbuchs – im Rahmen der Dachmarke. Weiß und Sand wechseln
sich als Seitengrund ab, genau wie in den Abschnitten von bnature.bz.
Organische Blattsilhouetten und großzügige Flächen
sprechen Natur- und Tierfreundinnen an; feine Linien,
klare Lesespalten und die zurückhaltende Messwertschrift halten die Anwendung
fachlich glaubwürdig. Öffentliche Inhaltsseiten vermeiden dichte Kachelraster.
Die Meldeauswahl ist eine einzige übersichtliche Wegeliste, und der Ablauf
„melden – prüfen – schützen“ wird als ruhige Sequenz statt als Dashboard
gezeigt.

## Typografie

- Überschriften und Fließtext verwenden **Inter**, die Schrift der Dachmarke,
  geladen in den Schnitten 400, 500, 600 und 700. Überschriften stehen
  durchgehend in 600; 700 und 800 kommen in der Oberfläche nicht vor.
- Messwerte – Belegnummern, Koordinaten, Genauigkeiten, Zähler und
  Rasterreferenzen – verwenden **Martian Mono** in 400 und 600. Die
  Festbreitenschrift steht für tatsächliche Messung; sie ist keine technische
  Verkleidung für Fließtext. Sie ist die einzige typografische Ergänzung
  dieser Untersite: die Dachmarke veröffentlicht keine Messwerte.
- Beide Familien werden über `@fontsource/inter` und
  `@fontsource/martian-mono` lokal ausgeliefert. Dadurch benötigen Entwicklung,
  Build und Seitenaufruf keine Verbindung zu Google Fonts – die Dachmarke lädt
  Inter von dort, diese Untersite bewusst nicht.
- Die Fallback-Ketten lauten `ui-sans-serif, system-ui, sans-serif` und
  `ui-monospace, SFMono-Regular, monospace`.
- Beide Schriften stehen unter der SIL Open Font License 1.1; die Lizenzen sind
  in den installierten Paketen enthalten.

## Sprachumschaltung und Barrierefreiheit

Kompakte Sprachkürzel (z. B. `DE`, `IT`) und barrierefreie, beschreibende
Namen (`aria-label`) für die Sprachauswahl werden nicht im Code erzeugt,
sondern redaktionell über die Übersetzungsdateien (`messages/de.json`,
`messages/it.json`) verwaltet.
