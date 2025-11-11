---
title: "EMC studie Route 2"
subtitle: "Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi"
author: "[Te voltooien]"
date: "6-11-2025"
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

Het betreft een **kabel** verbinding met een nominale spanning van **20 kV**.

![Figuur 1: Overzicht projectgebied](map-projectgebied.png)

*Figuur 1: Overzicht projectgebied met hoogspanningsverbinding (rood), spoorbaanhartlijnen (blauw), en relevante infrastructuur*

De geplande werkzaamheden vinden plaats nabij:

- **Spoorweg:** [AUTO-FILL: Spoorweg naam]
- **Geocode:** [AUTO-FILL: Geocode]
- **Spoor km:** [AUTO-FILL: Spoor km]

**Technische gegevens hoogspanningsverbinding:**

| Parameter | Waarde |
|-----------|--------|
| Type infrastructuur | Kabel (ondergronds) |
| Nominale spanning | 20 kV |
| Tracé lengte | 2.19 km |
| Circuit configuratie | Driehoek gebundeld / Multicore |
| Aarding | Enkel geaard sterpunt |
| Foutuitschakeltijd | 100 ms |

**[INSTRUCTIE: Voeg ook een verwijzing toe naar de bijlage(n) met de relevante project- en/of boortekening(en). Geef op de tekening aan:**
**(1) afstand hart buitenste spoor tot het tracé en**
**(2) afstand hart buitenste spoor tot nieuwe aardpunten of moffen.]**

\pagebreak

## 3. RLN00398 quick-scan op basis van de flowchart in hoofdstuk 5.2

In dit hoofdstuk is het resultaat van de flowchart in hoofdstuk 5.2 van de RLN00398-V004 vastgelegd.

Voor een hoogspanningsverbinding dienen de bijbehorende vragen van de flowchart in paragraaf 5.2 van de RLN00398-V004 te worden beantwoord. De resultaten zijn weergegeven in onderstaande Tabel 1.

### Tabel 1: Onderbouwing flowchart aspecten

**[INSTRUCTIE: indien uitgebreidere toelichting nodig is, dat in bijlage A doen met een verwijzing vanuit de tabel]**

| Eis ProRail | Voldaan (J/N/n.v.t.) | Korte toelichting en/of verwijzing naar bijlage |
|:------------|:---------------------|:-------------------------------------------------|
| **Initial** Bevindt hoogspanningsverbinding zich buiten zone | J | ≤24 kV buiten 31m zone. Gemeten afstand: 693.3 m - VOLDOET (geen verdere studie vereist) [zie Bijlage A] |

### Conclusie

Uit punt 1 t/m 7 van de flowchart in hoofdstuk 5.2 in de RLN00398-V004 (hierboven als tabel weergegeven) volgt dat er geen sprake is van ontoelaatbare beïnvloeding, en is de onderbouwing daarvoor aanwezig. Hierdoor kan een ontoelaatbare beïnvloeding op de ProRail railinfrastructuur worden uitgesloten. Verdere beschouwing volgens de flowchart in hoofdstuk 5.2 is niet noodzakelijk.

*Indien op basis van bovenstaande aspecten nog niet de conclusie is bereikt dat de situatie voldoet, dan is deze template niet meer voldoende en dient de template voor een EMC-detailstudie gebruikt te worden.*

\pagebreak

## Bijlage A: Onderbouwing van punten uit tabel

Deze bijlage bevat de gedetailleerde onderbouwing van de antwoorden gegeven in Tabel 1 van hoofdstuk 3.

### (Initial) Afstand hoogspanningsverbinding tot spoor

De hoogspanningsverbinding heeft een nominale spanning van **20 kV** (≤24 kV).

Volgens de flowchart in RLN00398-V004 §5.2 moet een verbinding ≤24 kV zich buiten 31 m van het hart van het buitenste spoor bevinden om geen verdere EMC studie te vereisen.

De gemeten minimale afstand tussen het tracé en het hart van het buitenste spoor bedraagt **693.3 m**.

**Conclusie:** De verbinding bevindt zich op >31 m afstand en voldoet daarom aan de initiële afstandseis. Geen verdere EMC studie vereist.

