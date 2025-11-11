---
title: "EMC studie New 110 kV Cable"
subtitle: "Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi"
author: "Ppet"
date: "11-11-2025"
version: "V001"
standard: "RLN00398-V004"
header-left: "ProRail"
header-right: "RLN00398"
footer-left: "Richtlijn"
footer-center: "V004"
footer-right: "pag. [pageno] / [totalpages]"
---

# Bijlage 3: Template tbv basisrapportage EMC

## Indeling voor basisrapportage EMC studie conform RLN00398

## EMC studie conform RLN00398

---

*Dit basistemplate is geschikt voor situaties waarvoor men in de flowchart in H5.2 van de RLN00398 voldoet voordat punt 8) bereikt wordt (dus voldoen aan de eisen in (A) en (B)). Dit template is opgesteld om in deze gevallen ten behoeve van ProRail te komen tot een eenduidige rapportage van een RLN00398 EMC studie. Met dit template hebben deze EMC rapporten voor ProRail een herkenbare inhoud, en worden de meest voorkomende valkuilen en tekortkomingen voorkomen.*

*De hoofdstukken bevatten een vastgestelde indeling, en bevatten voorgestelde tekstfragmenten. Bij voorkeur worden de figuren overeenkomstig de voorbeeldfiguren uitgevoerd.*

*Suggesties, aandachtspunten en toelichting zijn tussen rechte haken [ ] geplaatst.*

*De template is gebaseerd op RLN00398 versie 004.*

*Het is aan de auteur om de documentgegevens aan te passen (titel, versie nr., etc.)*

---

\pagebreak

## Inhoudsopgave

1. Inleiding
2. Situatieomschrijving
3. RLN00398 quick-scan op basis van de flowchart in hoofdstuk 5.2
Bijlage A: Onderbouwing van punten uit tabel

\pagebreak

## 1. Inleiding

De RLN00398 beoogt ontoelaatbare beïnvloeding vanuit hoogspanningslijnen en hoogspanningskabels op de railinfrastructuur tijdig in beeld te brengen zodat daar indien nodig mitigatie kan plaatsvinden, bijvoorbeeld door middel van maatregelen.

De flowchart in RLN00398-V004 voorziet in een stapsgewijze aanpak om vast te stellen of er sprake kan zijn van ontoelaatbare beïnvloeding.

Deze 'Template tbv basisrapportage EMC' geeft weer welke informatie aangeleverd en gerapporteerd dient te worden voor de stappen (A) en (B), en ook het daarvoor te gebruiken format.

Dit rapport geeft invulling aan **[INSTRUCTIE: Beschrijf het project en de werkzaamheden]**.

\pagebreak

## 2. Situatieomschrijving

**[INSTRUCTIE: Geef hier een korte omschrijving van het project en van de situatie ter plaatse. Beschrijf de aard van de werkzaamheden (nieuwe aanleg / inlussing / verzwaring etc.). Geef hierbij aan of er ook nieuwe moffen en/of aardpunten gemaakt gaan worden en/of komen te vervallen]**

Het betreft een **kabel** verbinding met een nominale spanning van **110 kV**.

![Figuur 4: Overzicht projectgebied](./map-projectgebied.png)

**[Voorbeeld]** *Figuur 4: Overzicht projectgebied.*

*De geplande werkzaamheden vinden plaats nabij Spoorweg <....>, Geocode <....>, Spoor km <....>*

**[Voeg ook een verwijzing toe naar de bijlage(n) met de relevante project- en/of boortekening(en). Geef op de tekening aan: (1) afstand hart buitenste spoor tot het tracé en (2) afstand hart buitenste spoor tot nieuwe aardpunten of moffen.]**

De geplande werkzaamheden vinden plaats nabij:

- **Spoorweg:** Vork - Kesteren
- **Geocode:** 042
- **Spoor km:** 2.9-21.5

**Technische gegevens hoogspanningsverbinding:**

| Parameter | Waarde |
|-----------|--------|
| Type infrastructuur | Kabel (ondergronds) |
| Nominale spanning | 110 kV |
| Tracé lengte | 6.15 km |
| Circuit configuratie | [Te bepalen] |
| Aarding | [Te bepalen] |
| Foutuitschakeltijd | 120 ms |

\pagebreak

## 3. RLN00398 quick-scan op basis van de flowchart in hoofdstuk 5.2

In dit hoofdstuk is het resultaat van de flowchart in hoofdstuk 5.2 van de RLN00398-V004 vastgelegd.

Voor een hoogspanningsverbinding dienen de bijbehorende vragen van de flowchart in paragraaf 5.2 van de RLN00398-V004 te worden beantwoord. De resultaten zijn weergegeven in onderstaande Tabel 1.

### Tabel 1: Onderbouwing flowchart aspecten

**[INSTRUCTIE: indien uitgebreidere toelichting nodig is, dat in bijlage A doen met een verwijzing vanuit de tabel]**

| Eis ProRail | Voldaan (J/N/n.v.t.) | Korte toelichting en/of verwijzing naar bijlage |
|:------------|:---------------------|:-------------------------------------------------|
| **Initial** Bevindt hoogspanningsverbinding zich buiten zone | N | >24 kV buiten 700m zone. Gemeten afstand: 366.1 m [zie Bijlage A] |
| *Indien niet voldaan aan bovenstaande eis, dan dienen onderstaande aspecten te voldoen:* | | |
| **A1** (Lijn-)circuit in driehoek (bij kabel: driehoek gebundeld of multicore, bij lijn: in driehoek configuratie opgehangen) | N | Cable must be single cable (3-phase) or single core in trefoil (A.1 requirement) [specificatie/tekening] [zie Bijlage A] |
| **A2** Geen pad voor homopolaire stroom (enkel geaard sterpunt) | N | Homopolar current control missing (A.2 requirement: enkel geaard sterpunt) [aantonen G3, in ieder geval met single-line van de verbinding, waarop de aarding inzichtelijk is] [zie Bijlage A] |
| **A3** Kans op 1 fase sluiting met aarde nabij spoor voldoende klein (geen moffen of aardpunten binnen 31m van hart buitenste spoor) | J | No joints or earth points provided [tekening met moffen, aardpunten en/of mastfundaties in de maatvoering t.o.v. het buitenste spoor] [zie Bijlage A] |

### Conclusie

Uit punt 1 t/m 7 van de flowchart in hoofdstuk 5.2 van de RLN00398-V004 (hierboven als tabel weergegeven) volgt dat er sprake kan zijn van ontoelaatbare beïnvloeding. Hierdoor kan een ontoelaatbare beïnvloeding op de ProRail railinfrastructuur niet worden uitgesloten. De flowchart in hoofdstuk 5.2 dient verder gevolgd te worden om in meer detail te bepalen of er wel of geen ontoelaatbare beïnvloeding van de ProRail infrastructuur kan zijn. Daarvoor dient een unity study te worden uitgevoerd en, indien nodig, een EMC-detailstudie te worden uitgevoerd.

*Indien op basis van bovenstaande aspecten nog niet de conclusie is bereikt dat de situatie voldoet, dan is deze template niet meer voldoende en dient de template voor een EMC-detailstudie gebruikt te worden.*

\pagebreak

## Bijlage A: Onderbouwing van punten uit tabel

Deze bijlage bevat de gedetailleerde onderbouwing van de antwoorden gegeven in Tabel 1 van hoofdstuk 3.

### (Initial) Afstand hoogspanningsverbinding tot spoor

De hoogspanningsverbinding heeft een nominale spanning van **110 kV** (>24 kV).

Volgens de flowchart in RLN00398-V004 §5.2 moet een verbinding >24 kV zich buiten 700 m van het hart van het buitenste spoor bevinden om geen verdere EMC studie te vereisen.

De gemeten minimale afstand tussen het tracé en het hart van het buitenste spoor bedraagt **366.1 m**.

**Conclusie:** De verbinding bevindt zich binnen 700 m van het spoor en voldoet daarom niet aan de initiële afstandseis. Verdere evaluatie volgens stappen A en B is vereist.

### (A) Basisconstructie en foutrisico checks

#### (A) 1 - Circuit configuratie

Het betreft een **kabel** verbinding.

Eis: De kabel moet in driehoek gebundeld zijn of een multicore kabel zijn.

Status: **VOLDOET NIET (N)**

Toelichting: Cable must be single cable (3-phase) or single core in trefoil (A.1 requirement)

*[Voeg hier specificatie/tekening toe van de kabelconfiguratie]*

#### (A) 2 - Homopolaire stroom beheersing

Eis: Er mag geen pad zijn voor homopolaire stroom (enkel geaard sterpunt).

Status: **VOLDOET NIET (N)**

Toelichting: Homopolar current control missing (A.2 requirement: enkel geaard sterpunt)

*[Voeg hier single-line diagram toe waarop de aarding inzichtelijk is, conform G3]*

#### (A) 3 - Eenfase sluiting risico

Eis: De kans op een 1-fase sluiting met aarde nabij het spoor moet voldoende klein zijn. Dit betekent dat moffen en aardpunten op minimaal 31 m van het hart van het buitenste spoor moeten liggen.

Status: **VOLDOET (J)**

Toelichting: No joints or earth points provided

*[Voeg hier tekening toe met moffen, aardpunten en/of mastfundaties in de maatvoering t.o.v. het buitenste spoor]*

