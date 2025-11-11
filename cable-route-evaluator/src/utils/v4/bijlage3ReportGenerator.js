/**
 * Bijlage 3 Report Generator - RLN00398-V004
 * 
 * Generates ProRail EMC Basic Reports that align 100% with "Bijlage 3: Template tbv basisrapportage EMC"
 * 
 * This generator creates DOCX/PDF reports following the exact structure defined in RLN00398-V004 Appendix 3,
 * which is used for situations where flowchart steps A and B are satisfied.
 * 
 * Report Structure:
 * - Header/Footer with RLN00398 reference and page numbers
 * - Title and Introduction Block (fixed Dutch text)
 * - Inhoudsopgave (Table of Contents)
 * - Section 1: Inleiding (Introduction)
 * - Section 2: Situatieomschrijving (Situation Description) with auto-generated map
 * - Section 3: RLN00398 Quick-scan with requirements table (Tabel 1)
 * - Bijlage A: Onderbouwing (Appendix A with justifications)
 * 
 * @module bijlage3ReportGenerator
 */

import { configV4 } from '../../config.v4.js';

/**
 * Bijlage3ReportGenerator Class
 * Generates reports compliant with RLN00398-V004 Appendix 3 template
 */
export class Bijlage3ReportGenerator {
  /**
   * @param {Object} evaluationResult - Result from FlowchartEvaluator
   * @param {Object} routeData - Route geometry and metadata
   * @param {Object} projectInfo - Project-specific information
   */
  constructor(evaluationResult, routeData, projectInfo = {}) {
    this.evaluation = evaluationResult;
    this.route = routeData;
    this.projectInfo = {
      projectDescription: projectInfo.projectDescription || '[INSERT_PLACEHOLDER]',
      railwayLine: projectInfo.railwayLine || '[AUTO-FILL]',
      geocode: projectInfo.geocode || '[AUTO-FILL]',
      kilometerMarker: projectInfo.kilometerMarker || '[AUTO-FILL]',
      documentTitle: projectInfo.documentTitle || 'EMC studie conform RLN00398',
      documentVersion: projectInfo.documentVersion || 'V001',
      author: projectInfo.author || '[Te voltooien]',
      date: projectInfo.date || new Date().toLocaleDateString('nl-NL')
    };
  }

  /**
   * Generate complete Bijlage 3 report in Markdown format
   * (Can be converted to DOCX/PDF using pandoc or similar tools)
   * 
   * @returns {string} Complete report in Markdown
   */
  generateMarkdown() {
    let report = '';

    // ==================== DOCUMENT HEADER ====================
    report += this.generateHeader();
    
    // ==================== TITLE AND INTRODUCTION BLOCK ====================
    report += this.generateTitleBlock();
    
    // ==================== INHOUDSOPGAVE ====================
    report += this.generateTableOfContents();
    
    // ==================== SECTION 1: INLEIDING ====================
    report += this.generateSection1_Inleiding();
    
    // ==================== SECTION 2: SITUATIEOMSCHRIJVING ====================
    report += this.generateSection2_Situatieomschrijving();
    
    // ==================== SECTION 3: RLN00398 QUICK-SCAN ====================
    report += this.generateSection3_QuickScan();
    
    // ==================== BIJLAGE A: ONDERBOUWING ====================
    report += this.generateBijlageA_Onderbouwing();
    
    return report;
  }

  /**
   * Generate document header with ProRail logo and RLN00398 reference
   */
  generateHeader() {
    return `---
title: "${this.projectInfo.documentTitle}"
subtitle: "Beleid elektromagnetische beïnvloeding van hoogspanningsverbindingen op de hswi"
author: "${this.projectInfo.author}"
date: "${this.projectInfo.date}"
version: "${this.projectInfo.documentVersion}"
standard: "RLN00398-V004"
header-left: "ProRail"
header-right: "RLN00398"
footer-left: "Richtlijn"
footer-center: "V004"
footer-right: "pag. [pageno] / [totalpages]"
---

`;
  }

  /**
   * Generate title and introduction block (fixed Dutch text from template)
   */
  generateTitleBlock() {
    return `# Bijlage 3: Template tbv basisrapportage EMC

## Indeling voor basisrapportage EMC studie conform RLN00398

## EMC studie conform RLN00398

---

*Dit basistemplate is geschikt voor situaties waarvoor men in de flowchart in H5.2 van de RLN00398 voldoet voordat punt 8) bereikt wordt (dus voldoen aan de eisen in (A) en (B)). Dit template is opgesteld om in deze gevallen ten behoeve van ProRail te komen tot een eenduidige rapportage van een RLN00398 EMC studie. Met dit template hebben deze EMC rapporten voor ProRail een herkenbare inhoud, en worden de meest voorkomende valkuilen en tekortkomingen voorkomen.*

*De hoofdstukken bevatten een vastgestelde indeling, en bevatten voorgestelde tekstfragmenten. Bij voorkeur worden de figuren overeenkomstig de voorbeeldfiguren uitgevoerd.*

*Suggesties, aandachtspunten en toelichting zijn tussen rechte haken [ ] geplaatst.*

*De template is gebaseerd op RLN00398 versie 004.*

*Het is aan de auteur om de documentgegevens aan te passen (titel, versie nr., etc.)*

---

\\pagebreak

`;
  }

  /**
   * Generate table of contents
   */
  generateTableOfContents() {
    return `## Inhoudsopgave

1. Inleiding
2. Situatieomschrijving
3. RLN00398 quick-scan op basis van de flowchart in hoofdstuk 5.2
Bijlage A: Onderbouwing van punten uit tabel

\\pagebreak

`;
  }

  /**
   * Generate Section 1: Inleiding (fixed Dutch text + auto-filled project description)
   */
  generateSection1_Inleiding() {
    return `## 1. Inleiding

De RLN00398 beoogt ontoelaatbare beïnvloeding vanuit hoogspanningslijnen en hoogspanningskabels op de railinfrastructuur tijdig in beeld te brengen zodat daar indien nodig mitigatie kan plaatsvinden, bijvoorbeeld door middel van maatregelen.

De flowchart in RLN00398-V004 voorziet in een stapsgewijze aanpak om vast te stellen of er sprake kan zijn van ontoelaatbare beïnvloeding.

Deze 'Template tbv basisrapportage EMC' geeft weer welke informatie aangeleverd en gerapporteerd dient te worden voor de stappen (A) en (B), en ook het daarvoor te gebruiken format.

Dit rapport geeft invulling aan **${this.projectInfo.projectDescription}**.

\\pagebreak

`;
  }

  /**
   * Generate Section 2: Situatieomschrijving with auto-generated map and project details
   */
  generateSection2_Situatieomschrijving() {
    const metadata = this.route.metadata || {};
    
    let section = `## 2. Situatieomschrijving

`;

    // Use project description if available, otherwise show instruction
    if (this.projectInfo.projectDescription && !this.projectInfo.projectDescription.includes('INSTRUCTIE')) {
      section += `${this.projectInfo.projectDescription}\n\n`;
    } else {
      section += `**[INSTRUCTIE: Geef hier een korte omschrijving van het project en van de situatie ter plaatse. Beschrijf de aard van de werkzaamheden (nieuwe aanleg / inlussing / verzwaring etc.). Geef hierbij aan of er ook nieuwe moffen en/of aardpunten gemaakt gaan worden en/of komen te vervallen]**\n\n`;
    }

    // Auto-generate infrastructure type info if available
    if (metadata.infrastructureType) {
      const type = metadata.infrastructureType === 'cable' ? 'kabel' : 'bovengrondse lijn';
      section += `Het betreft een **${type}** verbinding met een nominale spanning van **${metadata.voltageKv || '[Te bepalen]'} kV**.\n\n`;
    }

    // Map reference - uses companion PNG file with same base name
    const mapFilename = this.projectInfo.mapFilename || 'map-projectgebied.png';
    section += `![Figuur 4: Overzicht projectgebied](./${mapFilename})\n\n`;
    section += `**[Voorbeeld]** *Figuur 4: Overzicht projectgebied.*\n\n`;
    section += `*De geplande werkzaamheden vinden plaats nabij Spoorweg <....>, Geocode <....>, Spoor km <....>*\n\n`;
    section += `**[Voeg ook een verwijzing toe naar de bijlage(n) met de relevante project- en/of boortekening(en). Geef op de tekening aan: (1) afstand hart buitenste spoor tot het tracé en (2) afstand hart buitenste spoor tot nieuwe aardpunten of moffen.]**\n\n`;

    // Location details
    section += `De geplande werkzaamheden vinden plaats nabij:\n\n`;
    section += `- **Spoorweg:** ${this.projectInfo.railwayLine}\n`;
    section += `- **Geocode:** ${this.projectInfo.geocode}\n`;
    section += `- **Spoor km:** ${this.projectInfo.kilometerMarker}\n\n`;

    // Technical details
    section += `**Technische gegevens hoogspanningsverbinding:**\n\n`;
    section += `| Parameter | Waarde |\n`;
    section += `|-----------|--------|\n`;
    section += `| Type infrastructuur | ${this.getInfrastructureTypeText(metadata.infrastructureType)} |\n`;
    section += `| Nominale spanning | ${metadata.voltageKv || '[Te bepalen]'} kV |\n`;
    section += `| Tracé lengte | ${this.formatDistance(this.route.length)} |\n`;
    
    if (metadata.infrastructureType === 'cable') {
      section += `| Circuit configuratie | ${metadata.hasDeltaOrMulticore ? 'Driehoek gebundeld / Multicore' : '[Te bepalen]'} |\n`;
      section += `| Aarding | ${metadata.hasPadCurrentControl ? 'Enkel geaard sterpunt' : '[Te bepalen]'} |\n`;
    } else {
      section += `| Driehoek configuratie | ${metadata.hasDeltaFormation ? 'Ja' : '[Te bepalen]'} |\n`;
    }
    
    section += `| Foutuitschakeltijd | ${metadata.faultClearingTimeMs || '[Te bepalen]'} ms |\n\n`;

    section += `\\pagebreak\n\n`;
    
    return section;
  }

  /**
   * Generate Section 3: RLN00398 Quick-scan with Tabel 1
   */
  generateSection3_QuickScan() {
    let section = `## 3. RLN00398 quick-scan op basis van de flowchart in hoofdstuk 5.2

In dit hoofdstuk is het resultaat van de flowchart in hoofdstuk 5.2 van de RLN00398-V004 vastgelegd.

Voor een hoogspanningsverbinding dienen de bijbehorende vragen van de flowchart in paragraaf 5.2 van de RLN00398-V004 te worden beantwoord. De resultaten zijn weergegeven in onderstaande Tabel 1.

### Tabel 1: Onderbouwing flowchart aspecten

**[INSTRUCTIE: indien uitgebreidere toelichting nodig is, dat in bijlage A doen met een verwijzing vanuit de tabel]**

`;

    // Generate the requirements table
    section += this.generateRequirementsTable();

    // Concluding remarks based on evaluation results
    section += this.generateConcludingRemarks();

    section += `\\pagebreak\n\n`;
    
    return section;
  }

  /**
   * Generate Tabel 1 with all requirements (Initial, A.1-A.3, B.4-B.7)
   */
  generateRequirementsTable() {
    const flowchart = this.evaluation.flowchartResults || {};
    const metadata = this.route.metadata || {};
    
    let table = `| Eis ProRail | Voldaan (J/N/n.v.t.) | Korte toelichting en/of verwijzing naar bijlage |\n`;
    table += `|:------------|:---------------------|:-------------------------------------------------|\n`;

    // Initial Distance Check
    table += this.generateInitialRow(flowchart.initial, metadata);

    // Step A checks (only shown if Initial fails)
    if (!flowchart.initial?.passes) {
      table += this.generateStepARows(flowchart.stepA, metadata);
      
      // Step B checks (only shown if Step A passes)
      if (flowchart.stepA?.passes) {
        table += this.generateStepBRows(flowchart.stepB, metadata);
      }
    }

    table += `\n`;
    
    return table;
  }

  /**
   * Generate Initial distance check row
   */
  generateInitialRow(initialResult, metadata) {
    if (!initialResult) {
      return `| **Initial** Bevindt hoogspanningsverbinding zich buiten zone | N | Niet geëvalueerd |\n`;
    }

    const voltage = metadata.voltageKv || 0;
    const distance = initialResult.details?.distance;
    const passes = initialResult.passes;
    
    let criterion = voltage > 24 ? '>24 kV buiten 700m zone' : '≤24 kV buiten 31m zone';
    let toelichting = `${criterion}. Gemeten afstand: ${distance ? distance.toFixed(1) + ' m' : 'n.v.t.'}`;
    
    if (passes) {
      toelichting += ' - VOLDOET (geen verdere studie vereist)';
    }
    
    return `| **Initial** Bevindt hoogspanningsverbinding zich buiten zone | ${passes ? 'J' : 'N'} | ${toelichting} [zie Bijlage A] |\n`;
  }

  /**
   * Generate Step A rows (A.1-A.3)
   */
  generateStepARows(stepAResult, metadata) {
    if (!stepAResult) {
      return '';
    }

    let rows = `| *Indien niet voldaan aan bovenstaande eis, dan dienen onderstaande aspecten te voldoen:* | | |\n`;

    const checks = stepAResult.checks || [];
    
    // A.1 - Circuit configuration
    const circuitCheck = checks[0];
    rows += `| **A1** (Lijn-)circuit in driehoek (bij kabel: driehoek gebundeld of multicore, bij lijn: in driehoek configuratie opgehangen) | `;
    rows += `${this.getVoldaanStatus(circuitCheck?.status)} | `;
    rows += `${circuitCheck?.message || '[Te bepalen]'} [specificatie/tekening] [zie Bijlage A] |\n`;

    // A.2 - Homopolar current control
    const padCheck = checks[1];
    rows += `| **A2** Geen pad voor homopolaire stroom (enkel geaard sterpunt) | `;
    rows += `${this.getVoldaanStatus(padCheck?.status)} | `;
    rows += `${padCheck?.message || '[Te bepalen]'} [aantonen G3, in ieder geval met single-line van de verbinding, waarop de aarding inzichtelijk is] [zie Bijlage A] |\n`;

    // A.3 - Single-phase fault risk
    const faultCheck = checks[2];
    rows += `| **A3** Kans op 1 fase sluiting met aarde nabij spoor voldoende klein (geen moffen of aardpunten binnen 31m van hart buitenste spoor) | `;
    rows += `${this.getVoldaanStatus(faultCheck?.status)} | `;
    rows += `${faultCheck?.message || '[Te bepalen]'} [tekening met moffen, aardpunten en/of mastfundaties in de maatvoering t.o.v. het buitenste spoor] [zie Bijlage A] |\n`;

    return rows;
  }

  /**
   * Generate Step B rows (B.4-B.7)
   */
  generateStepBRows(stepBResult, metadata) {
    if (!stepBResult) {
      return '';
    }

    let rows = `| *Indien aan alle drie bovenstaande aspecten wordt voldaan, dan dienen onderstaande aspecten te voldoen:* | | |\n`;

    const checks = stepBResult.checks || [];
    
    // B.4 - Penetration zone distance
    const zoneCheck = checks[0];
    rows += `| **B4** loopt midden/hoogspanning verbinding buiten zone (>24 kV buiten 700 m zone, ≤24 kV buiten 11 m zone, of is er binnen deze zones geen parallelloop en wordt voldaan aan (5) en (6)) | `;
    rows += `${this.getVoldaanStatus(zoneCheck?.status)} | `;
    rows += `${zoneCheck?.message || '[Te bepalen]'} [tracétekening met parallelloop in de maatvoering t.o.v. het spoor] [zie Bijlage A] |\n`;

    // B.5 - Crossing angle
    const angleCheck = checks[1];
    if (angleCheck && angleCheck.status !== 'not_applicable') {
      rows += `| **B5** kruist de verbinding het spoor ongeveer haaks (80 tot 100 graden) | `;
      rows += `${this.getVoldaanStatus(angleCheck.status)} | `;
      rows += `${angleCheck.message || '[Te bepalen]'} [tracétekening in de maatvoering (kruisingshoek) t.o.v. het spoor] [zie Bijlage A] |\n`;
    }

    // B.6 - Technical room distance
    const techCheck = checks[2];
    rows += `| **B6** bevindt de verbinding zich op een afstand >20m vanaf een dichtsbijzijnde technische ruimte (gebouw, geen kast) | `;
    rows += `${this.getVoldaanStatus(techCheck?.status)} | `;
    rows += `${techCheck?.message || '[Te bepalen]'} [tracétekening in de maatvoering t.o.v. spoorse gebouwen] [zie Bijlage A] |\n`;

    // B.7 - Fault clearing time
    const protectionCheck = checks[3];
    rows += `| **B7** Wordt een eerste orde lijnfout binnen 100ms afgeschakeld | `;
    rows += `${this.getVoldaanStatus(protectionCheck?.status)} | `;
    rows += `${protectionCheck?.message || '[Te bepalen]'} [onderbouwing beveiligingsconcept en/of risicobeschouwing en onderbouwing van faalfrequentie] [zie Bijlage A] |\n`;

    return rows;
  }

  /**
   * Generate concluding remarks based on evaluation results
   */
  generateConcludingRemarks() {
    const status = this.evaluation.status;
    
    let remarks = `### Conclusie\n\n`;
    
    if (status === 'compliant') {
      remarks += `Uit punt 1 t/m 7 van de flowchart in hoofdstuk 5.2 in de RLN00398-V004 (hierboven als tabel weergegeven) volgt dat er geen sprake is van ontoelaatbare beïnvloeding, en is de onderbouwing daarvoor aanwezig. Hierdoor kan een ontoelaatbare beïnvloeding op de ProRail railinfrastructuur worden uitgesloten. Verdere beschouwing volgens de flowchart in hoofdstuk 5.2 is niet noodzakelijk.\n\n`;
    } else {
      remarks += `Uit punt 1 t/m 7 van de flowchart in hoofdstuk 5.2 van de RLN00398-V004 (hierboven als tabel weergegeven) volgt dat er sprake kan zijn van ontoelaatbare beïnvloeding. Hierdoor kan een ontoelaatbare beïnvloeding op de ProRail railinfrastructuur niet worden uitgesloten. De flowchart in hoofdstuk 5.2 dient verder gevolgd te worden om in meer detail te bepalen of er wel of geen ontoelaatbare beïnvloeding van de ProRail infrastructuur kan zijn. Daarvoor dient een unity study te worden uitgevoerd en, indien nodig, een EMC-detailstudie te worden uitgevoerd.\n\n`;
    }

    remarks += `*Indien op basis van bovenstaande aspecten nog niet de conclusie is bereikt dat de situatie voldoet, dan is deze template niet meer voldoende en dient de template voor een EMC-detailstudie gebruikt te worden.*\n\n`;
    
    return remarks;
  }

  /**
   * Generate Bijlage A: Onderbouwing
   */
  generateBijlageA_Onderbouwing() {
    let bijlage = `## Bijlage A: Onderbouwing van punten uit tabel

Deze bijlage bevat de gedetailleerde onderbouwing van de antwoorden gegeven in Tabel 1 van hoofdstuk 3.

`;

    // Initial distance onderbouwing
    bijlage += this.generateInitialOnderbouwing();

    // Step A onderbouwing
    bijlage += this.generateStepAOnderbouwing();

    // Step B onderbouwing
    bijlage += this.generateStepBOnderbouwing();

    return bijlage;
  }

  /**
   * Generate Initial distance onderbouwing
   */
  generateInitialOnderbouwing() {
    const flowchart = this.evaluation.flowchartResults || {};
    const initial = flowchart.initial;
    
    if (!initial) {
      return '';
    }

    const metadata = this.route.metadata || {};
    const voltage = metadata.voltageKv || 0;
    const distance = initial.details?.distance;
    
    let section = `### (Initial) Afstand hoogspanningsverbinding tot spoor\n\n`;
    
    if (voltage > 24) {
      section += `De hoogspanningsverbinding heeft een nominale spanning van **${voltage} kV** (>24 kV).\n\n`;
      section += `Volgens de flowchart in RLN00398-V004 §5.2 moet een verbinding >24 kV zich buiten 700 m van het hart van het buitenste spoor bevinden om geen verdere EMC studie te vereisen.\n\n`;
      section += `De gemeten minimale afstand tussen het tracé en het hart van het buitenste spoor bedraagt **${distance ? distance.toFixed(1) : 'n.v.t.'} m**.\n\n`;
      
      if (initial.passes) {
        section += `**Conclusie:** De verbinding bevindt zich op >700 m afstand en voldoet daarom aan de initiële afstandseis. Geen verdere EMC studie vereist.\n\n`;
      } else {
        section += `**Conclusie:** De verbinding bevindt zich binnen 700 m van het spoor en voldoet daarom niet aan de initiële afstandseis. Verdere evaluatie volgens stappen A en B is vereist.\n\n`;
      }
    } else {
      section += `De hoogspanningsverbinding heeft een nominale spanning van **${voltage} kV** (≤24 kV).\n\n`;
      section += `Volgens de flowchart in RLN00398-V004 §5.2 moet een verbinding ≤24 kV zich buiten 31 m van het hart van het buitenste spoor bevinden om geen verdere EMC studie te vereisen.\n\n`;
      section += `De gemeten minimale afstand tussen het tracé en het hart van het buitenste spoor bedraagt **${distance ? distance.toFixed(1) : 'n.v.t.'} m**.\n\n`;
      
      if (initial.passes) {
        section += `**Conclusie:** De verbinding bevindt zich op >31 m afstand en voldoet daarom aan de initiële afstandseis. Geen verdere EMC studie vereist.\n\n`;
      } else {
        section += `**Conclusie:** De verbinding bevindt zich binnen 31 m van het spoor en voldoet daarom niet aan de initiële afstandseis. Verdere evaluatie volgens stappen A en B is vereist.\n\n`;
      }
    }
    
    return section;
  }

  /**
   * Generate Step A onderbouwing
   */
  generateStepAOnderbouwing() {
    const flowchart = this.evaluation.flowchartResults || {};
    const stepA = flowchart.stepA;
    
    if (!stepA || !flowchart.initial || flowchart.initial.passes) {
      return '';
    }

    const metadata = this.route.metadata || {};
    const checks = stepA.checks || [];
    
    let section = `### (A) Basisconstructie en foutrisico checks\n\n`;

    // A.1 - Circuit configuration
    section += `#### (A) 1 - Circuit configuratie\n\n`;
    const circuitCheck = checks[0];
    if (metadata.infrastructureType === 'cable') {
      section += `Het betreft een **kabel** verbinding.\n\n`;
      section += `Eis: De kabel moet in driehoek gebundeld zijn of een multicore kabel zijn.\n\n`;
      section += `Status: **${this.getVoldaanText(circuitCheck?.status)}**\n\n`;
      if (circuitCheck?.message) {
        section += `Toelichting: ${circuitCheck.message}\n\n`;
      }
      section += `*[Voeg hier specificatie/tekening toe van de kabelconfiguratie]*\n\n`;
    } else {
      section += `Het betreft een **bovengrondse lijn**.\n\n`;
      section += `Eis: De lijn moet in driehoek configuratie zijn opgehangen.\n\n`;
      section += `Status: **${this.getVoldaanText(circuitCheck?.status)}**\n\n`;
      if (circuitCheck?.message) {
        section += `Toelichting: ${circuitCheck.message}\n\n`;
      }
      section += `*[Voeg hier tekening toe van de masten en geleider configuratie]*\n\n`;
    }

    // A.2 - Homopolar current control
    section += `#### (A) 2 - Homopolaire stroom beheersing\n\n`;
    const padCheck = checks[1];
    section += `Eis: Er mag geen pad zijn voor homopolaire stroom (enkel geaard sterpunt).\n\n`;
    section += `Status: **${this.getVoldaanText(padCheck?.status)}**\n\n`;
    if (padCheck?.message) {
      section += `Toelichting: ${padCheck.message}\n\n`;
    }
    section += `*[Voeg hier single-line diagram toe waarop de aarding inzichtelijk is, conform G3]*\n\n`;

    // A.3 - Single-phase fault risk
    section += `#### (A) 3 - Eenfase sluiting risico\n\n`;
    const faultCheck = checks[2];
    section += `Eis: De kans op een 1-fase sluiting met aarde nabij het spoor moet voldoende klein zijn. Dit betekent dat moffen en aardpunten op minimaal 31 m van het hart van het buitenste spoor moeten liggen.\n\n`;
    section += `Status: **${this.getVoldaanText(faultCheck?.status)}**\n\n`;
    if (faultCheck?.message) {
      section += `Toelichting: ${faultCheck.message}\n\n`;
    }
    section += `*[Voeg hier tekening toe met moffen, aardpunten en/of mastfundaties in de maatvoering t.o.v. het buitenste spoor]*\n\n`;

    return section;
  }

  /**
   * Generate Step B onderbouwing
   */
  generateStepBOnderbouwing() {
    const flowchart = this.evaluation.flowchartResults || {};
    const stepB = flowchart.stepB;
    
    if (!stepB || !flowchart.stepA || !flowchart.stepA.passes) {
      return '';
    }

    const metadata = this.route.metadata || {};
    const checks = stepB.checks || [];
    
    let section = `### (B) Parallelloop en kruising checks\n\n`;

    // B.4 - Penetration zone
    section += `#### (B) 4 - Zone afstand\n\n`;
    const zoneCheck = checks[0];
    const voltage = metadata.voltageKv || 0;
    if (voltage > 24) {
      section += `Voor een verbinding >24 kV moet het tracé buiten 700 m van het hart van het buitenste spoor lopen, tenzij er binnen deze zone geen parallelloop is en wordt voldaan aan B.5 en B.6.\n\n`;
    } else {
      section += `Voor een verbinding ≤24 kV moet het tracé buiten 11 m van het hart van het buitenste spoor lopen, tenzij er binnen deze zone geen parallelloop is en wordt voldaan aan B.5 en B.6.\n\n`;
    }
    section += `Status: **${this.getVoldaanText(zoneCheck?.status)}**\n\n`;
    if (zoneCheck?.message) {
      section += `Toelichting: ${zoneCheck.message}\n\n`;
    }
    section += `*[Voeg hier tracétekening toe met parallelloop in de maatvoering t.o.v. het spoor]*\n\n`;

    // B.5 - Crossing angle (if applicable)
    const angleCheck = checks[1];
    if (angleCheck && angleCheck.status !== 'not_applicable') {
      section += `#### (B) 5 - Kruisingshoek\n\n`;
      section += `Indien de verbinding het spoor kruist, moet dit ongeveer haaks gebeuren (80 tot 100 graden).\n\n`;
      section += `Status: **${this.getVoldaanText(angleCheck.status)}**\n\n`;
      if (angleCheck.message) {
        section += `Toelichting: ${angleCheck.message}\n\n`;
      }
      section += `*[Voeg hier tracétekening toe met kruisingshoek in de maatvoering]*\n\n`;
    }

    // B.6 - Technical room distance
    section += `#### (B) 6 - Afstand tot technische ruimte\n\n`;
    const techCheck = checks[2];
    section += `De verbinding moet zich op een afstand >20 m van de dichtstbijzijnde technische ruimte (gebouw, geen kast) bevinden.\n\n`;
    section += `Status: **${this.getVoldaanText(techCheck?.status)}**\n\n`;
    if (techCheck?.message) {
      section += `Toelichting: ${techCheck.message}\n\n`;
    }
    section += `*[Voeg hier tracétekening toe met afstanden tot spoorse gebouwen]*\n\n`;

    // B.7 - Protection clearing time
    section += `#### (B) 7 - Beveiligingsuitschakeltijd\n\n`;
    const protectionCheck = checks[3];
    section += `Een eerste orde lijnfout moet binnen 100 ms worden afgeschakeld.\n\n`;
    section += `Status: **${this.getVoldaanText(protectionCheck?.status)}**\n\n`;
    if (protectionCheck?.message) {
      section += `Toelichting: ${protectionCheck.message}\n\n`;
    }
    section += `*[Voeg hier onderbouwing toe van het beveiligingsconcept en/of risicobeschouwing]*\n\n`;

    return section;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Convert check status to J/N/n.v.t. format
   */
  getVoldaanStatus(status) {
    switch (status) {
      case 'pass': return 'J';
      case 'fail': return 'N';
      case 'not_applicable': return 'n.v.t.';
      case 'not_evaluated':
      case 'pending':
      default: return 'N';
    }
  }

  /**
   * Convert check status to full text
   */
  getVoldaanText(status) {
    switch (status) {
      case 'pass': return 'VOLDOET (J)';
      case 'fail': return 'VOLDOET NIET (N)';
      case 'not_applicable': return 'NIET VAN TOEPASSING (n.v.t.)';
      case 'not_evaluated':
      case 'pending':
      default: return 'NOG TE BEPALEN';
    }
  }

  /**
   * Get infrastructure type text in Dutch
   */
  getInfrastructureTypeText(type) {
    switch (type) {
      case 'cable': return 'Kabel (ondergronds)';
      case 'overhead': return 'Bovengrondse lijn';
      default: return '[Te bepalen]';
    }
  }

  /**
   * Format distance with appropriate units
   */
  formatDistance(meters) {
    if (!meters) return 'n.v.t.';
    if (meters < 1000) {
      return `${meters.toFixed(1)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  }
}

/**
 * Generate Bijlage 3 report for a single trace/route
 * 
 * @param {Object} evaluationResult - Result from FlowchartEvaluator
 * @param {Object} routeData - Route geometry and metadata
 * @param {Object} projectInfo - Project-specific information
 * @param {string} format - Output format ('markdown', 'html', 'json')
 * @returns {string|Object} Generated report
 */
export function generateBijlage3Report(evaluationResult, routeData, projectInfo = {}, format = 'markdown') {
  const generator = new Bijlage3ReportGenerator(evaluationResult, routeData, projectInfo);
  
  switch (format) {
    case 'markdown':
      return generator.generateMarkdown();
    case 'json':
      return {
        metadata: {
          template: 'Bijlage 3: Template tbv basisrapportage EMC',
          standard: 'RLN00398-V004',
          generatedAt: new Date().toISOString(),
          projectInfo: generator.projectInfo
        },
        content: generator.generateMarkdown(),
        evaluation: evaluationResult,
        route: routeData
      };
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Download Bijlage 3 report as Markdown file
 * 
 * @param {string} content - Report content in Markdown
 * @param {string} projectName - Project name for filename
 */
export function downloadBijlage3Report(content, projectName = 'EMC-Studie') {
  const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-');
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `ProRail-RLN00398-V004-Bijlage3-${safeName}-${timestamp}.md`;
  
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default {
  Bijlage3ReportGenerator,
  generateBijlage3Report,
  downloadBijlage3Report
};
