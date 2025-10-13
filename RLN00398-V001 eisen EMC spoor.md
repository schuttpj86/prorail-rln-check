# Assetmanagement

Richtlijn

Beleid elektromagnetische beïnvloeding van
hoogspanningsverbindingen op de hoofd-
spoorweginfrastructuur.

Beherende instantie:
Inhoud verantwoordelijke:
Status:

AM Architectuur en Techniek
AM Treinbeveiliging
Definitief

Datum van kracht:
01-11-2013

Versie:
001

Documentnummer:
RLN00398

© 2013 Behoudens de in of krachtens de Auteurswet 1912 gestelde uitzonderingen mag niets
uit deze uitgave worden verveelvoudigd en/of openbaar gemaakt door middel van druk,
fotokopie, microfilm of op welke andere wijze dan ook, zonder de voorafgaande schriftelijke
toestemming van de auteur.

© 2013 Apart from the exceptions in or by virtue of the 1912 copyright law no part
of this document may be reproduced or published by print, photocopying,
microfilm or any other means without written permission from the author.

model versie  2012

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

INHOUD

1

2

2.1
2.2
2.3
2.4

3

4

5

5.1
5.2
5.3

6

6.1
6.2
6.3
6.4
6.5
6.6

Revisiegegevens ....................................................................................... 3

Algemeen .................................................................................................. 4
Scope ...................................................................................................................................4
Van kracht verklaarde voorschriften ....................................................................................4
Geraadpleegde literatuur .....................................................................................................5
Definities en afkortingen ......................................................................................................5

Inleiding ..................................................................................................... 7

Opsomming van ongewenste gebeurtenissen ....................................... 8

Beleid ten aanzien van hoogspanningsverbindingen ........................... 9
Eisen aan hoogspanningslijnen: ..........................................................................................9
Eisen aan hoogspanningskabels. ........................................................................................9
Modelstudie ........................................................................................................................10

Uitgangspunten ten behoeve van modellering .................................... 11
Algemeen ...........................................................................................................................11
Modellering Hoogspanningsverbinding ..............................................................................11
Faalwijzen Hoogspanningsverbinding/kabel ......................................................................12
Modellering Railinfrastructuur ............................................................................................12
Faalwijzen Railinfrastructuur ..............................................................................................14
Modellering van de koppelweg ..........................................................................................14

7

Beoordelingscriteria ............................................................................... 15

Bijlage 1 B1 bovenleiding systeem geleider configuratie .................................... 17

Richtlijn

 RLN00398

pag. 2 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

1

 Revisiegegevens

Datum

Versie  Hoofdstuk/ paragraaf  Wijziging

08-01-2013

0.17

Initiële versie voor review

13-03-2013

0.18

alle

Verwerking commentaar van technisch inhoudelijke interne en externe
deskundigen

06-05-2013

0.19

Titel + hfdst

2, 3, 4, 5

Verwerking mondeling commentaar juridische toets. Hoofdstuk 5
omgewerkt tot technisch beleid van ProRail. Hierbij technische richtlij-
nen van interne deskundige TB verwerkt.

08-07-2013

0.20

Alle hoofdstukken

Verwerking interne review versie 0.19 door interne deskundigen TB,
EV, ICT + verwerking externe review versie 0.19 door externe deskun-
digen + verwerking review Jurist V&C.

26-08-2013

0.21

Hfdst 2, 3,  4

Kleine tekstuele verbeteringen, zonder wijziging van de inhoud.

8-09-2013

0.22

Hfdst 2.1, Hfdstk 5.1.5
en 5.2.3

Versie ten behoeve van validatie

Naar aanleding van validatie EV: Scope explicieter gemaakt, door te
benoemen dat kabels en leidingen van ProRail buiten de richtlijn val-
len. Zone van 700 meter verlaagd naar 11 meter bij niet kruisende
hoogspanningsverbindingen langs geëlektrificeerde sporen 25 kV, 75
Hz.

Richtlijn

 RLN00398

pag. 3 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

2

Algemeen

Deze richtlijn beschrijft het beleid van ProRail met betrekking tot de toegestane elektromagnetische
invloed van hoogspanningsverbindingen in beheer bij derden op de hoofdspoorweginfrastructuur in
Nederland.

2.1

Scope
Deze richtlijn is van toepassing op hoogspanningslijnen en hoogspanningskabels ─ niet zijnde ProRail
lijnen en kabels ─ met een nominale spanning van > 1 kV en een nominale bedrijfsfrequentie van ≤ 1
kHz op, onder of boven de hoofdspoorweginfrastructuur. Tevens is de richtlijn van toepassing op
hoogspanningslijnen en hoogspanningskabels ─ niet zijnde ProRail lijnen en kabels ─ in de zone bui-
ten het terrein behorende tot de hoofdspoorweginfrastructuur, voor zover het betreft:

1.  Het gebied als beschreven in artikel 20 van de Spoorwegwet1;
2.  Het gebied daarbuiten, voor zover genoemde lijnen en kabels elektromagnetische invloed

hebben op de spoorweginfrastructuur.

Dit document bevat de eisen aan de hoogspanningsverbindingen in beheer bij derden en geeft een
onderbouwing van deze eisen. Deze onderbouwing vloeit voort uit de eisen voor de veiligheid voor
personen die zich op of nabij de spoorbaan bevinden en uit de RAMSHE eisen aan de systemen en
apparatuur van de hoofdspoorweginfrastructuur.

2.2

Van kracht verklaarde voorschriften

Ref. nr.

Naam document

[A]

[B]

[C]

[D]

[E]

[F]

[G]

[H]

[J]

Veiligheidsvoorschrift voor werkzaamheden aan (of in de nabijheid
van) elektrische hoogspanningsinstallaties van ProRail, Deel 2:
Aanvullende bepalingen 1500Vdc-tractie-energievoorziening (TEV),
3kV 75 Hz ac-voedingen voor treinbeheersings- en beveiligingsin-
stallaties (TBB)

Nummer

RLN00128-2

Status

Actueel

Wederzijdse beïnvloeding van

buisleidingen en hoogspanningssystemen

NEN 3654:2012

Ontwerp

Bovengrondse elektrische lijnen boven 45 kV wisselspanning - Deel
1 en 3: Verzameling van nationale normatieve aspecten

NEN-EN 50341-
1:2001

Spoorwegtoepassingen - Isolatie-coördinatie - Deel 1: Basiseisen -
Slagwijdten en kruipwegen voor alle elektrische en elektronische
uitrusting

NEN-EN 50341-
3:2001

NEN-EN 50124-
1:2001

Spoorwegen en soortgelijk geleid vervoer - Vaste installaties - Elek-
trische veiligheid, aarding en retourstromen - Deel 1: Eisen in ver-
band met bescherming tegen elektrische schok

NEN-EN 50122-
1:2011

Actueel, inclusief
aanvullingen en
correcties

Actueel, inclusief
aanvullingen en
correcties

Actueel, inclusief
aanvullingen en
correcties

Spoorwegen en soortgelijk geleid vervoer - Elektromagnetische
compatibiliteit - Deel 4: Emissie en immuniteit van sein- en telecom-
municatieapparatuur

NEN-EN 50121-
4:2006

Actueel

Spoorwegen en soortgelijk geleid vervoer - Elektromagnetische
compatibiliteit - Deel 5: Emissie en immuniteit van vast opgestelde
voedingsinstallaties en apparatuur

NEN-EN 50121-
5:2006

Actueel

Ontwerpvoorschrift Tractieenergievoorzieningsysteem; Bovenleiding
Bovenleidingsysteem B1

OVS00024-5.1 V5

Actueel

Spoorwegen en soortgelijk geleid vervoer - Elektromagnetische
compatibiliteit - Deel 3-1: Rollend materieel - Treinen en complete
voertuigen

NEN-EN 50121-3-
1:2006

Actueel

1 Uittreksel artikel 20 lid 1 SPW: Bij een hoofdspoorweg wordt de begrenzing van de hoofdspoorweg …… aan weerszijden
gevormd door een lijn liggend op een afstand van elf meter.

Richtlijn

 RLN00398

pag. 4 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

2.3

Geraadpleegde literatuur

Ref. nr.

Naam document

[1]

Ello Weits, Grenswaarden voor homopolaire stromen

Nummer

Status

RLN00398

[2]

[3]

[4]

[5]

[6]

[7]

[8]

Statistische analyse van metingen aan een 110kV-kabel (Hoogeveen)
en twee 220kV-lijnen (Hessenweg), Movares, Kenmerk CO-EW-
120006291 - Versie 2.0, Utrecht, 13 april 2012

R. Koopal, R.M. Paulussen, UITGANGSPUNTEN EM-
BEÏNVLOEDING

BETUWEROUTE - BESTAANDE PRORAIL INFRASTRUCTUUR,
POBR, 29 september 2005 Versie 2.2

Ello Weits, Jeroen van Waes, Nick Stalman, Frank Gerritsen, Uit-
gangspunten EM-beïnvloeding van de HSL-Zuid op de bestaande
ProRail infrastructuur voor “Vrijgavetraject wijzigingen ProRail voor-
schriften; fase 3” t.b.v. parallelloop met de HSL-Zuid, Holland Railcon-
sult, IF114250_320.02, Versie 2.0, 11 maart 2005

R. Koopal, Onderbouwing werkhypothesen m.b.t. GRS enkelbenige-
en dubbelbenige geïsoleerde spoorstroomlopen. Aanvulling voor
“Vrijgavetraject wijzigingen ProRail voorschriften; fase 3” t.b.v. parallel-
loop met de HSL-Zuid, ProRail BB21/25kV Kenmerk BB21-25kV-
060281, Versie 1.0, 11 januari 2007

B. Vedelaar, G.W. Keijzer, M. Voesenek, Onderbouwing werkhypothe-
sen m.b.t. GRS enkelbenige- en dubbelbenige geїsoleerde spoor-
stroomlopen voor “Vrijgavetraject wijzigingen ProRail voorschriften;
fase 3” t.b.v. parallelloop met de HSL-Zuid, Holland Railconsult,
IF127500_230_3A0, Versie 1.5, 20 mei 2005

Harm van Dijk, Toegestane 50Hz CM stroom door het spoor bij dub-
belbenige spoorstroomlopen op de parallelloop met 25kV baanvakken,
Movares, VS-HDI-20100122-01, versie 2, 19 maart 2010

ITU K26 1998 ( verwijzing naar Whitebook: Directives concerning the
protection of telecommunication lines against harmful effects from
electric power and electrified railway lines, Geneva, 1988)

RICHTLIJN 2004/40/EG VAN HET EUROPEES PARLEMENT EN DE
RAAD van 29 april 2004 betreffende de minimumvoorschriften inzake
gezondheid en veiligheid met betrekking tot de blootstelling van werk-
nemers aan de risico's van fysische agentia (elektromagnetische
velden) (18de bijzondere richtlijn in de zin van artikel 16, lid 1, van
Richtlijn 89/391/EEG)

2004/40/EG

Actueel

[9]

Spanningskarakteristieken in openbare elektriciteitsnetten

NEN-EN
50160:2010

Actueel

[10]

[11]

[12]

[13]

ICNIRP GUIDELINES for limiting exposure to time-varying electric and
magnetic fields (1 Hz – 100 kHz) published in: HEALTH PHYSICS
99(6):818‐836; 2010

Mail M. Nusselder/R. Koopal van 28 maart 2013

Mail V.J.P. Plasmeijer/H. Steenkamp dd. 21 november 2012

RICHTLIJN 2004/108/EG VAN HET EUROPEES PARLEMENT EN
DE RAAD van 15 december 2004 betreffende de onderlinge aanpas-
sing van de wetgevingen van de lidstaten inzake elektromagnetische
compatibiliteit en tot intrekking van Richtlijn 89/336/EEG

2004/108/EG

Actueel

2.4

Definities en afkortingen

Term

Verklaring

IB-kabel

Interlokale blokkabel t.b.v. treinbeveiligingsinstallaties

IT-kabel

Interlokale telecomkabel (telecomkabel)

OR-blad

Overzicht Retour tekening van treinbeveiligingsinstallaties

OS

RH

Onderstation van Energievoorziening

Relaishuis van Treinbeveiliging

SPW

Spoorwegwet

Richtlijn

 RLN00398

pag. 5 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

EM

EMC

VLD

CM

DM

BS

Elektromagnetische

Elektromagnetische compatibiliteit

Volt Limiter Device

Common Mode

Differential Mode

Bovenkant spoorstaaf

hswi

Hoofdspoorweginfrastructuur

RAMSHE

Reliability, Availability, Maintainability, Safety, Health, Environment

TPR

Track Repeater Relais

Richtlijn

 RLN00398

pag. 6 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

3

Inleiding

In het geval van een hoogspanningsverbinding, dat wil zeggen een hoogspanningslijn of hoogspan-
ningskabel in de nabijheid van de hswi moet rekening worden gehouden met de elektromagnetische
beïnvloeding van de hoogspanningsverbinding op de hswi. Er is sprake van ontoelaatbare beïnvloe-
ding in die gevallen dat de beïnvloeding kan leiden tot onveilige situaties voor personeel en/of de aan-
tasting van de RAMSHE criteria van de hswi.

Deze richtlijn geeft invulling aan het beleid van ProRail in hoedanigheid van beheerder van de hswi
met betrekking tot de aanleg, wijziging2 en instandhouding van hoogspanningsverbindingen. Deze
richtlijn zal worden gehanteerd bij de behandeling van aanvragen voor vergunning ex artikel 19 van de
Spoorwegwet3  maar ook reactief in geschillenprocedures in het kader van omgevingsvergunningen,
bestemmingsplannen of tracébesluiten.

Hoofdstuk 4 bevat een opsomming van ongewenste gebeurtenissen ten aanzien van personen en
systemen.

Hoofdstuk 5 bevat het ProRail beleid ten aanzien van hoogspanningsverbindingen in beheer bij der-
den.

Hoofdstuk 6 beschrijft de modellering van locatiespecifieke studies.

Hoofdstuk 7 beschrijft de beoordelingscriteria van de modelstudie.

2 Hieronder wordt verstaan wijziging van o.a.:
  Geleiderdoorsnede;

  Geleiderpositie;



Fasevolgorde;

  Wijze van aarding (direct, blusspoel geaard, etc);

  Maximale fasestroom en homopolaire stroom in normal bedrijf en/of kortsluitsituaties;



Tracé hoogspanningslijn;

Aantal circuits per mast.


3 Uittreksel artikel 19 lid 1 SPW: Het is verboden zonder vergunning …… binnen de begrenzing van de hoofdspoorweg aan, op,
in, onder, boven of naast de hoofdspoorweg, bouwwerken of andere opstallen op te richten, te doen aanbrengen of te hebben,
dan wel daarmee verband houdende werkzaamheden uit te voeren of te doen uitvoeren.

Richtlijn

 RLN00398

pag. 7 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

4

Opsomming van ongewenste gebeurtenissen

In het geval van een hoogspanningsverbinding boven of in de nabijheid van de hswi moet rekening
worden gehouden met de risico’s van elektromagnetische beïnvloeding van de hoogspanningsverbin-
ding op de hswi.
Wanneer de beïnvloeding te groot wordt kan dit leiden tot onveilige situaties, verstoring van de func-
tionaliteit van de hswi en/of de treindienstregeling of versnelde veroudering van de hswi.
Spoorvoertuigen kunnen ook hinder ondervinden van de beïnvloeding van hoogspanningsverbindin-
gen. Daar waar dit beïnvloedingsmechanisme bekend is, is dit in deze richtlijn aangegeven. Algemeen
geldt dat voldaan moet worden aan de Europese richtlijn 2004/108/EG [13] die geldt voor de elektro-
magnetische beïnvloeding.
De volgende ongewenste gebeurtenissen worden onderscheiden:
1.  gevaar voor electrocutie van personen op spoorwegterrein

a)  Personen kunnen blootgesteld worden aan te hoge aanraakspanningen, bijvoorbeeld

bij het aanraken van metalen objecten en het werken aan kabels en
(boven-)leidingen;

b)  Personen kunnen blootgesteld worden aan capacitieve ontladingen, bijvoorbeeld bij
het aanraken van metalen objecten en het werken aan kabels en (boven-)leidingen.

2.  beïnvloeding van systemen in de hswi

a)  De goede werking van treindetectiecircuits, van het type spoorstroomlopen, kan ver-

stoord worden door 50Hz verzadiging;

b)  Spoorvoertuigen kunnen ten gevolge van de 50Hz-beïnvloeding, te hoge 75Hz stoor-
stromen produceren en daarmee de goede werking van treindetectie verstoren;
c)  Relaisschakelingen met diode ( bijv. grendel/HRDR) kunnen verstoord worden door

50Hz beïnvloeding;

d)  Apparatuur kan ten gevolge van te hoge 50Hz spanningen defect raken bij kortsluitin-

gen in het hoogspanningsnet;

e)  Overspanningsbeveiligingen kunnen defect raken ten gevolge van 50Hz beïnvloeding.

Richtlijn

 RLN00398

pag. 8 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

5

Beleid ten aanzien van hoogspanningsverbindingen

Er wordt onderscheid gemaakt tussen de eisen aan hoogspanningslijnen en hoogspanningskabels.
Indien niet aan de eisen wordt voldaan, dient te worden gehandeld volgens het bepaalde in 5.3.

5.1

Eisen aan hoogspanningslijnen:

1.  De hoogspanningslijn dient de spoorbaan haaks te kruisen met een hoek Ѱ, waarbij 80 ≤ Ѱ

≤100 graden, zie figuur 1;

2.  De minimale afstand (clearance) van de hoogspanningslijn tot de bovenleiding dient te vol-

doen aan NEN-EN 50341-1:2001 en NEN-EN 50341-3:2001;

3.  De hoogspanningslijn dient in het kruisende veld met de spoorbaan dubbelzijdig afgespannen

te zijn, in verband met kans op breuk;

4.  Een eerste orde lijnfout dient binnen maximaal 100 ms afgeschakeld te zijn;
5.  Niet kruisende hoogspanningslijnen;

a.  Niet kruisende hoogspanningslijnen mogen niet aanwezig zijn binnen een afstand van

b.

– horizontaal gemeten - 700 m uit het hart van de buitenste spoorbaan;
In afwijking van punt 5a geldt een afstand van 11 meter bij geëlektrificeerde sporen
met een tractiespanning van 25 kV, 50 Hz;

6.  De blootstelling van de mens conform NEN EN 50341-3:2001[C], mag niet meer bedragen

dan  100 µT op 1 m boven BS;

7.  Hoogspanningsmasten mogen niet worden geplaatst binnen een afstand van ten minste 31 m

uit het hart buitenste spoor  (20+ 11);

8.  Hoogspanningslijnen mogen niet aanwezig zijn binnen een afstand van – horizontaal gemeten

– 20 m vanaf de dichtst bij zijnde gevel van een technische ruimte.

hoogspanningsverbinding

700m

afstand tot tech-
nische ruimtes
20m

Figuur 1

Ѱ =800-1000

spoorbaan

700m

5.2

Eisen aan hoogspanningskabels.

1.  De hoogspanningskabel dient de spoorbaan haaks te kruisen met een hoek Ѱ, waarbij 80 ≤ Ѱ

≤100 graden, zie figuur 1;

2.  Een eerste orde kabelfout dient binnen maximaal 100 ms afgeschakeld te zijn;
3.  Niet kruisende hoogspanningskabels met een nominale spanning van ≥ 35 kV:

a.  Niet kruisende hoogspanningskabels met een nominale spanning van ≥ 35 kV mogen
niet aanwezig zijn binnen een afstand van 700 m vanaf het hart van het buitenste
spoor;

Richtlijn

 RLN00398

pag. 9 /17

RLN00398

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

b.

In afwijking van punt 3a geldt een afstand van 11 meter bij geëlektrificeerde sporen
met een tractiespanning van 25 kV, 50 Hz;

4.  Niet kruisende drie-aderige hoogspanningskabels met een nominale spanning < 35 kV mogen

niet aanwezig zijn binnen een afstand van 11 m vanaf het hart buitenste spoor;

5.  Niet kruisende enkelfasige hoogspanningskabels in driehoek ligging met een nominale span-
ning van < 35 kV mogen niet aanwezig zijn in het gebied binnen een afstand van 11 m vanaf
het hart buitenste spoor;

6.  Hoogspanningskabels mogen niet aanwezig zijn binnen een afstand van 20 m gemeten vanaf

de dichtst bij zijnde gevel van een technische ruimte;

7.  Kabels dienen in een elektrisch geïsoleerde buis onder het spoor doorgevoerd te worden;
8.  Binnen een afstand van ten minste 31 m uit het hart buitenste spoor  (20+ 11)mogen zich

geen aardpunten of moffen bevinden.

5.3

Modelstudie
Indien de hoogspanningslijnen, c.q. de hoogspanningskabels niet aan de bovengenoemde eisen vol-
doen, dan dient een lokatiespecifieke studie plaats te vinden. De studie dient conform de uitgangspun-
ten van de modellering van Hoofdstuk 6 plaats te vinden. De uitkomsten dienen te worden beoordeeld
op basis van Hoofdstuk 7. Indien de hoogspanningsverbinding niet aan de beoordelingscriteria vol-
doet, dient nader overleg plaats te vinden tussen betrokken partijen over de verdere maatregelen.
Hierbij kan sprake zijn van bijvoorbeeld een tracéwijziging of het verhogen van de immuniteit van de
ProRail installaties voor de EM-velden.

Richtlijn

 RLN00398

pag. 10 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

6

Uitgangspunten ten behoeve van modellering

6.1

Algemeen

Nr.

G1

G2

G3

Uitgangspunt

Bron, achtergrond en toelichting

Elektrakabels mogen geen elektromagnetische
invloed hebben op de veilige exploitatie van de
hswi.

Witte Boekje Art 52: Elektrakabels mogen geen
elektromagnetische invloed hebben op de veili-
ge exploitatie van de spoorweg.

Indien een nieuwe hoogspanningsverbinding een
bijdrage levert van maximaal 20% van het beoor-
delingscriterium voor alle bedrijfstoestanden,
uitgezonderd kortsluitingen, behoeven niet alle
bestaande verbindingen te worden gemodelleerd.
Bij hogere bijdrage moeten ook de bestaande
verbindingen binnen een afstand van 1x de in-
dringdiepte in de grond worden meegenomen in
de berekeningen.

Drie-aderige hoogspanningskabels <35kV mogen
buiten beschouwing gelaten worden, indien het
technisch onmogelijk is dat er een homopolaire
stroom loopt.

Hier is gekozen voor 20% conform Ontwerp-
NEN3654;2012 Bijlage D. [B]

De indringdiepte wordt geacht 700 meter te zijn.

Bijvoorbeeld indien het een drie aderige kabel
betreft, waarbij ten minste één zijde van de
kabel in driehoek is geschakeld.

G4

Capacitieve beïnvloeding: Dit wordt niet berekend.  Capacitieve beïnvloeding is geregeld in de

overige ProRail regelgeving, zowel ten aanzien
van de werkvoorschriften onder en in de omge-
ving van hoogspanningsverbindingen, als voor
de ontwerpvoorschriften voor het plaatsen van
geleidende objecten onder en in de omgeving
van hoogspanningsverbindingen. [A]

6.2

Modellering Hoogspanningsverbinding

Nr.

T1

T2

Uitgangspunt

Bron, achtergrond en toelichting

Bij geleiderbreuk wordt de hoogspanningslijn
direct (normaliter binnen 100 msec) afgescha-
keld. In de praktijk wordt hier voor wat betreft de
elektrische beïnvloeding dan ook geen rekening
mee gehouden. Voor mechanische beïnvloeding
(minimale afstand boven de spoorstaven en
boven het bovenleidingsysteem) moet er echter
wel rekening mee worden gehouden.

De hoogspanningslijn/kabel wordt gemodelleerd
volgens het werkelijke mastbeeld/werkelijke kabel-
bed.

Bij hoogspanningslijnen dient voor het bepalen
van de elektrische en magnetische velden bij een
spoorlijn, rekening gehouden te worden met de
minimale hoogten van de geleiders volgens het
ontwerp. De minimale hoogte van de geleiders is
gebaseerd op de hoogste temperatuur, de hoog-
ten van de masten en de afstand tussen de mas-
ten.

Voor de mechanische beïnvloeding dient met
breuk in één van de velden in een vak, niet zijnde
het kruisende veld, rekening te worden gehouden
met een grotere zeeg. Toepassing van speciale
ophangingen (halfverankeringen) of afspanningen
aan beide zijden van de kruising kunnen het extra
doorhangen van de geleiders bij breuk in een
ander veld verkleinen. De minimale afstand boven
spoorstaven bij breuk dient te voldoen aan NEN-
EN 50341-3, art. 5.4.5.3. [C].

Voor het berekenen van de inductieve beïnvloe-
ding van een hoogspanningslijn wordt de hoogte
van de geleiders berekend door de gemiddelde
ophanghoogte van een geleider aan beide zijden
van het veld te verminderen met 2/3 deel van de
maximale zeeg.

T3

Bij de berekening van lijnen en kabels dient mini-
maal rekening worden gehouden met:







De maximale stroombelasting bij normaal
bedrijf per circuit;

De maximale stroombelasting bij afwijkend
bedrijf per circuit (onderhoud);

De maximale één- en driefasen kortsluitstro-

Onder onderhoud wordt verstaan de situatie dat
bij het uitschakelen van een verbinding het
totale vermogen wordt overgenomen door de
overblijvende verbinding(en).

Opmerking: Indien de netbeheerder de stroom/
het kortsluitvermogen laat toenemen boven de
berekende waarden, dan dient deze situatie
opnieuw bij ProRail aangemeld te worden.

Richtlijn

 RLN00398

pag. 11 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

men.

Kortsluitingen in grondkabels ten gevolge van
werkzaamheden worden niet gemodelleerd.

T4

Bij de berekening dient minimaal rekening worden
gehouden met 10% asymmetrie bij:





Bij normaal bedrijf per circuit;

Bij afwijkend bedrijf per circuit (onderhoud).

Als uitgangspunt voor de asymmetrie wordt 10%
van de maximale stroom gehanteerd.

T5

De gebieden dienen te worden gespecificeerd
waar een eerste orde lijn- of kabelfout niet binnen
100 msec afgeschakeld wordt.

Op basis van het dossier Hoogeveen Beilen is
9% gedefinieerd als maximale onbalans.
((cid:1835)(cid:1844)+(cid:1835)(cid:1845)+(cid:1835)(cid:1846))/(3(cid:1835)B)  [1].

Hierbij dient rekening gehouden te worden met
het type hoofdbeveiliging, of er communicatie tus-
sen de stations aanwezig is en of deze redun-
dant is. Daarnaast dient rekening gehouden te
worden met de eigen tijd van de vermogens-
schakelaar.

De kans op falen van de vermogensscha-
kelaar/relais tijdens een kortsluiting wordt vol-
doende klein geacht.

6.3

Faalwijzen Hoogspanningsverbinding/kabel

Nr.

FT1

Uitgangspunt

Bron, achtergrond en toelichting

Bij kortsluitingen dient rekening te worden gehou-
den met:

De aanvrager dient aan te geven welke faalwij-
zen van toepassing zijn.





1 fase kortsluitingen;

3 fasen kortsluitingen.

6.4

Modellering Railinfrastructuur

Nr.

P1

P2

P3

P4

P5

P6

P7

Uitgangspunt

Bron, achtergrond en toelichting

De minimale afstand (clearance) van de hoog-
spanningslijn tot de bovenleiding dient te voldoen
aan NEN-EN 50341-3 [C].

Bovenleiding systeem geleider configuratie: zie
bijlage 1.

Voor de modellering wordt bovenleidingsysteem
B1 toegepast.

Locaties van onder- en schakelstations dienen
conform vigerende OR bladen te worden gemodel-
leerd.

OR bladen kunnen opgevraagd worden bij de
Servicedesk Infra Informatie via 088-231 2990
of infrainformatie@prorail.nl.

Locaties van dwarsverbindingen dienen conform
vigerende OR bladen te worden gemodelleerd.

Afleidweerstand van spoorstaven: beschouwd
worden configuraties met een spoorstaaf-aarde
weerstand van 100, 10 en 2.5 km.

Retour van DC baanvakken worden afgesloten
met een karakteristieke impedantie van:
Zafsluit=√(Rafleid x Zlangs)

OR bladen kunnen opgevraagd worden bij de
Servicedesk Infra Informatie via 088-231 2990
of infrainformatie@prorail.nl.

Genoemde waarden zijn per spoorstaaf.

Zlangs(voor 50Hz) berekenen uit de som van de
parallelle impedantie van de spoorstaven en het
retourpad aarde waarbij:





Impedantie spoorstaven: 0,044 Ω/km per
spoorstaaf

retour pad aarde bij 50Hz: (0,050 + j 0,880)
Ω/km (nog te onderbouwen in een volgen-
de uitgave)

Modellering van Zlangs mag ook op basis van
meetwaarden.

De minimale 50 Hz onderstationsimpedantie (tus-
sen bovenleiding en spoorstaven) op het
1500 VDC-baanvak is:

Zie [2]

(0,007 + j0,082) Ω.

Bij het recuperen van een trein (energie terug
leveren) kan de gelijkrichter in een onderstation

Voor 50Hz stromen, gedraagt het onderstation
zich dan als een open verbinding; de 50Hz

Richtlijn

 RLN00398

pag. 12 /17

RLN00398

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

sperren.

spanning tussen bovenleiding en spoor is dan
maximaal.

P8

Voor de afstand van het kabelbed tot het hart van
het buitenspoor dient 4.5m meter te worden ge-
hanteerd.

P9

Het kabelbed bij parallelloop bevat:

Conform [2], [3].

3kV 75 Hz kabel (2x16) met een aardscherm van
16 mm2. De 3kV kabel is tweezijdig geaard bij de
onderstations. De totale DC  weerstand van de
kabelmantel en twee aardverspreidingsweerstan-
den is 7,5 Ω.

IB-kabel (62 x 0,8 aderig), zwevend uitgevoerd.

IT kabel: Gearmeerde PIWY-IT-kabel met een
kabelscherm van 30 mm2, zwevend uitgevoerd.

P10

Voor de diepte van de kabelgeul dient 1,2m onder
BS (0,6 m onder maaiveld) te worden gehanteerd.
Hierin liggen de IB en IT kabel. De 3kV kabel dient
hier 0.3 m onder worden verondersteld.

P11

DM spanning kabels

De magnetische beïnvloeding bij circuitaders in
één kabel mag verwaarloosbaar worden veronder-
steld.

Voor de modellering wordt de 3kV kabel geacht
te lopen van OS naar OS.

Voor de modellering worden de IB en IT kabel
geacht te lopen van RH naar RH.

De totale DC weerstand van de kabelmantel en
twee aardverspreidingsweerstanden kan vari-
eren van 5 tot 10 Ω. De berekeningen hoeven
slechts te worden uitgevoerd met 7,5 Ω.

Omdat de mantel van de 3kV kabel verbonden
is met de metalen HS kast is deze spanning
voor generiek publiek toegankelijk.

De feitelijke diepte van de kabelgeul is: tussen
de 0,9m en de 1,5m onder BS. Voor de model-
lering wordt het gemiddelde toegepast. Uitge-
gaan wordt van een maximale breedte van de
geul van 60 cm.

Circuitaders in gescheiden kabels worden bui-
ten beschouwing gelaten.

P12

CM spanning kabels

Om de worst case spanning te verkrijgen, dienen
in de modellering de kabelcircuits aan één zijde te
worden geaard.

Indien het scherm of de ader van een kabelcir-
cuit aan één zijde aan aarde ligt, zal de hoogste
spanning tussen een ader van de IB-kabel en
aarde of tussen het scherm van de IT-kabel en
aarde komen te staan.

Richtlijn

 RLN00398

pag. 13 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

6.5

Faalwijzen Railinfrastructuur

Opmerking: Daar waar mogelijk dient gebruik gemaakt te worden van een Worst Case benadering.

Uitgangspunt

Bron, achtergrond en toelichting

Nr.

FP1

FP2

Er bevindt zich een defecte VLD-O6 in de railinfra-
structuur. Bij een defect ontstaat hier een verbin-
ding spoorstaaf aarde met een afleidweerstand
van 0.25 Ω.

Er bevindt zich een defecte paalspoorstaafverbin-
ding. Bij een defect ontstaat hier een verbinding
spoorstaaf aarde met een afleidweerstand van 2.5
Ω. Gerekend dient te worden met 4 defecte paal-
spoorstaafverbindingen behorende bij 4 opeenvol-
gende bovenleidingpalen.

FP3

Er bevindt zich een tweede defecte VLD-O (zie
FP1) op afstand met een afleidweerstand van 0.25
Ω (modelleren als lopende aardfout).

Bij kruisingen moet de 50 Hz stroom via aarde
lokaal binnentreden. Een aardfout is hierbij
maatgevend.

Een VLD-O wordt toegepast bij kunstwerken en
kan een zeer lage afleidweerstand hebben. Bij
aanwezigheid stalen bruggen, betonnen kunst-
werken doorrekenen met 0.25 Ω.

Bij afwezigheid van een VLD-O zullen paal-
spoorstaafverbindingen maatgevend zijn. Paal-
spoorstaafverbindingen worden bij elk metalen
portaal van een bovenleidingveld toegepast.
Deze gaan echter veelvuldig defect en als deze
defect gaan betreft het vaak meerdere velden
achter elkaar. Daarom wordt uitgegaan van 4
defecte paalspoorstaafverbindingen.

Bij parallelloop kan een verder gelegen aardfout
een hefboompje vormen waarmee de spanning
omhoog gaat. Ook hier is de VLD-O maatge-
vend. Een aardfout op afstand komt in de prak-
tijk altijd voor. Deze 0.25 Ω aardfout is aanwezig
in de parallel lopende spoorbaan.

6.6

Modellering van de koppelweg

Nr.

K1

K2

Uitgangspunt

Bron, achtergrond en toelichting

De soortelijke weerstand van de grond bedraagt
vanaf 30m diepte 70 m.

Indien meetwaarden bekend zijn van de grond tot
op indringdiepte, dan kunnen deze meetwaarden
worden gehanteerd.

De soortelijke weerstand E van de toplaag kan
variëren tussen de 10 m en 1000 m.

Er wordt met een homogeen bodemmodel
gerekend, identiek aan het HSL uitgangspunten
document  [3].

Onder toplaag wordt verstaan tot 30m diepte.

6 Voltage Limiter Device type O, Zie NEN-EN50122-1[E]

Richtlijn

 RLN00398

pag. 14 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

7

Beoordelingscriteria

Nr.

B1

Uitgangspunt

Bron, achtergrond en toelichting

CM beoordeling railinfra (Spoorstroomlopen:
type Enkelbenig zijn bepalend).

Beoordelingscriterium voor continue verschijn-
selen:

  Max 20 VCM;

  Max 58 ACM.

CM beoordeling railinfra (Spoorstroomlopen:
type Enkelbenig zijn bepalend).

Beoordelingscriterium voor kortsluitverschijn-
selen:

  Max 65 VCM voor verschijnselen
>100 msec en <=500 msec;

  Max 58 ACM voor verschijnselen
>100 msec en <=500 msec.

B2

CM beoordeling railinfra (voor baanvakken met
alleen dubbelbenige spoorstroomlopen):

  Max 65 VCM voor verschijnselen langer

dan 100 msec;

  Max 250 ACM voor verschijnselen langer

dan 100 msec.

B3

CM spanning aders railinfra apparatuur:

B4

B5





150V continue;

650V 100 msec.

Psofometrische stoorspanning op modemver-
bindingen:

  Maximaal -45dBmp voor dataverbindin-

gen;

  Maximaal 10Ap in bovenleiding.

Definities conform NEN-EN 50121-3-1, Annex
A [J].

50Hz spanningscomponent in de 1500 VDC
tractiespanning:

  Maximaal 7V/25V (>1s) ( beschikbaar-

heid/veiligheid).

Continue verschijnselen:





20V OVS60111-2 hoofdstuk 5.5 (Oud
OV231.116 blad 2) 700m op basis van 2A
criterium met 10Ω aardfout [uitzoeken];

58A OVS60111-3 hoofdstuk 3.3 (Oud
OV231.112 blad 4) 700m op basis van 2A.
Zie [4].

Let op: Voor 50 Hz spoorstroomlopen
(OVS60111-6,7) geldt een criterium van 0,5 A.

Kortsluitverschijnselen:

  OVS60111-2 hoofdstuk 5.5 (Oud

OV231.116 blad 2) op maximale lengte
600m heeft deze een immuniteit van 65V.
Zie [5];



58A OVS60111-3 hoofdstuk 3.3 (Oud
OV231.112 blad 4) 700m op basis van 2A
criterium (nog te onderbouwen). Zie [5].

Indien beveiliging staat op een clearance time
<=100msec dan hoeven kortsluitingen ten be-
hoeve van EB spoorstroomlopen niet te worden
beoordeeld.

Zie [6]

Indien beveiliging staat op een clearance time
<=100msec dan hoeven kortsluitingen ten be-
hoeve van dubbelbenige spoorstroomlopen niet
te worden beoordeeld.

NEN-EN 50124-1:2001, inclusief aanvullingen
en correcties [D].

Telecom verbindingen kunnen worden beïnvloed
door geïnduceerde spanningen. CM spanning
die op aderparen worden geïnduceerd vertalen
zich via kleine asymetrieën in de apparatuur [7].
In eerste benadering kan worden aangenomen
dat de LCL van de apparatuur -46dB is.

Ook is bij toelating van treinen altijd geëist dat
de psometrische stroom onder de 10Ap ligt.
Telecom verbindingen verdwijnen (invoering
GSM en verglazing) maar deze waarden geven
ook een bescherming tegen netresonantie en
beïnvloeding van lussen.

Voor normale verbindingen is deze eis nooit
maatgevend; echter wanneer deze verbinding
aansluit op een HVDC verbinding of een groot-
verbruiker met veel vermogenselektronica,
(bijvoorbeeld een aluminium fabriek, hoogovens,
e.d.) wordt een nadere toetsing verwacht.

Voor HSL-Zuid is bij een waarde van 75V 50Hz
vastgesteld dat het materieel onder de 5.3A 75Hz
blijft. [3]

Voor enkelbenige spoorstroomlopen wordt een
grenswaarde van 0.5A75Hz /1.8A75Hz [4] (beschik-
baarheid/veiligheid) gehanteerd. Wanneer deze
lineair worden geschaald (aanname), dan komt
men uit op een spanning van 7V/25V.

1s tijd is gebaseerd op aanwezigheid TPR.

Richtlijn

 RLN00398

pag. 15 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

B6

Aanraakspanning kabelmantel-aarde en
spoorstaven-aarde conform NEN-EN 50122-
1:2011, inclusief aanvullingen en correcties [E]

B7

Magneetvelden conform:





NEN-EN 50121-4 [F]

NEN-EN 50121-5 [G]

B8

Maximale Power Frequency Magnetic Field
dient een factor 10 lager te zijn dan de immu-
niteitswaarden uit de norm.

Elektrische velden van een hoogspanningslijn
mogen tot een hoogte van ten minste 1 m
boven het hoogste punt van een spoorlijn niet
groter zijn dan 10 kV/m, rekening houdend met
de nominale spanning van de hoogspannings-
lijn, vermeerderd met 10% (hoogste systeem-
spanning) en rekening houdend met de maxi-
male asymmetrie van 1%.

B9

100 µT op 1 m boven maaiveld.

NEN-EN 50122 deel 3 wordt in het kader van
deze berekeningen niet gehanteerd. Volstaan
wordt met de waarden genoemd in NEN-EN
50122-1 [12].

Risico oudere apparatuur is niet getest. Er zijn
geen aanwijzingen dat dit een probleem hoeft te
zijn. Aangenomen wordt dat alle apparatuur aan
de norm voldoet.

Voor blootstelling van werknemers aan 50 Hz
elektrische velden is in richtlijn 2004/40/EG [8]
van het Europees Parlement en de Raad een
actiewaarde van 10 kV/m gegeven. Om zonder
aanvullende maatregelen toch werkzaamheden
te kunnen uitvoeren in en nabij een spoorlijn,
moet in het gebied waarbinnen zich tijdens
uitvoering van werkzaamheden mensen kunnen
begeven, het elektrische veld kleiner zijn dan
deze actiewaarde.

Uit praktische overwegingen wordt ervan uitge-
gaan dat zich tot een hoogte van 1 m boven het
hoogste punt van onderdelen van de spoorlijn
mensen kunnen bevinden.

De Netcode Elektriciteit van 4 maart 2012 ver-
wijst voor de kwaliteit van de transportdienst
naar NEN 50160:2000 [9]. Hieruit is af te leiden
dat de spanning in het hoogspanningsnet maxi-
maal 10% hoger kan zijn dan de nominale span-
ning. De asymmetrie (spanning) is beperkt tot
1% (inverse component ≤ 1% van de normale
component gedurende 99,9% van de over 10
minuten gemiddelde waarden gedurende een
beschouwingsperiode van een week).

Volgens de ICNIRP richtlijn voor Limiting expo-
sure to time-varying electric and magnetic fields
(1 Hz – 100 kHz), gepubliceerd in Health Phy-
sics 99(6):818-836; 2010 [10] moet voor alge-
mene bevolking rekening worden gehouden met
een grenswaarde van 200 µT en voor beroeps-
bevolking (occupasional exposure) 500 µT.

IN NEN-EN 50341-3 (art. 5.6.1) [C] is aanbevo-
len om op 1 m boven maaiveld een grenswaarde
te hanteren van 100 µT.

Richtlijn

 RLN00398

pag. 16 /17

Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi

RLN00398

Bijlage 1 B1 bovenleiding systeem geleider configuratie

Zie ook OVS000024-5.1 [H].

1500 Vdc-sporen

spoorstaaf 1 spoor 1

spoorstaaf 2 spoor 1

draagkabel spoor 1

rijdraad 1 spoor 1

rijdraad 2 spoor 1

versterkingsgeleider spoor 1

spoorstaaf 1 spoor 2

spoorstaaf 2 spoor 2

draagkabel spoor 2

rijdraad 1 spoor 2

rijdraad 2 spoor 2

versterkingsgeleider spoor 2

Weerstand
[Ω/km]

Diameter [mm]

x coördinaat [m]

y coördinaat [m]

0.044

0.044

0.121

0.183

0.183

0.121

0.044

0.044

0.121

0.183

0.183

0.121

9.60

9.60

1.36

1.20

1.20

1.36

9.60

9.60

1.36

1.20

1.20

1.36

-2,72

-1,28

-2

-2,02

-1,98

-5,22

2,72

1,28

2

2,02

1,98

5,22

0.05

0.05

8.50

5.50

5.50

8.50

0.05

0.05

8.50

5.50

5.50

8.50

Richtlijn

 RLN00398

pag. 17 /17