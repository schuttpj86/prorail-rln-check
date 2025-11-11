# Bijlage 3 Report Generation - User Guide

## Overview

The ProRail Cable Route Evaluator now includes a **Bijlage 3 Report Generator** that creates EMC compliance reports that align 100% with the official "Bijlage 3: Template tbv basisrapportage EMC" from RLN00398-V004.

This feature allows you to automatically generate professionally formatted reports for each high voltage connection trace that has been evaluated through the flowchart (Steps A & B).

---

## When to Use Bijlage 3 Reports

Use the Bijlage 3 report generator when:

- ✅ Your high voltage connection has been **evaluated using the RLN00398-V004 flowchart**
- ✅ The evaluation completed at **Step A or Step B** (basic compliance checks)
- ✅ You need to document compliance for **ProRail submission**
- ✅ You want a report that **exactly follows the official template structure**

**Do NOT use** this generator if:
- ❌ Your project requires a **detailed EMC study (Steps C/D)** → Use Bijlage 4 template instead
- ❌ The route has **not been evaluated yet** → Run evaluation first
- ❌ You need a **comparative report for multiple routes** → Use the comparative report function

---

## How to Generate a Bijlage 3 Report

### Step 1: Draw and Configure Your Route

1. Use the drawing tools to create a high voltage connection trace
2. Configure the route metadata:
   - Infrastructure type (cable/overhead)
   - Voltage (kV)
   - Circuit configuration
   - Fault clearing time
   - Joints/moffen locations

### Step 2: Run the Evaluation

1. Click the **⚡ Evaluate** button on your route card
2. Wait for the flowchart evaluation to complete
3. Review the results (Initial check, Step A, Step B)

### Step 3: Export the Bijlage 3 Report

1. On the route card, click the **📋 Bijlage 3** button (blue document icon)
2. The report will be generated and downloaded automatically
3. The file will be named: `ProRail-RLN00398-V004-Bijlage3-[RouteName]-[Date].md`

---

## Report Structure

The generated Bijlage 3 report includes the following sections, exactly as specified in RLN00398-V004:

### Document Header
- ProRail logo and RLN00398 reference
- Document title, version, author, date
- Page numbers in footer

### Title and Introduction Block
- Fixed Dutch text from the official template
- Explanation of the template purpose and scope
- Instructions for the engineer

### Inhoudsopgave (Table of Contents)
1. Inleiding (Introduction)
2. Situatieomschrijving (Situation Description)
3. RLN00398 quick-scan
- Bijlage A: Onderbouwing

### Section 1: Inleiding
- Fixed Dutch text explaining the RLN00398 purpose
- Auto-filled project description

### Section 2: Situatieomschrijving
- Auto-generated map/figure placeholder
- Project location details:
  - Railway line (Spoorweg)
  - Geocode
  - Kilometer marker (Spoor km)
- Technical parameters table
- Instructions for adding project/bore drawings

### Section 3: RLN00398 Quick-scan

**Tabel 1: Onderbouwing flowchart aspecten**

The table includes all requirements with J/N/n.v.t. status:

| Eis | Voldaan | Toelichting |
|-----|---------|-------------|
| **Initial** - Distance outside zone | AUTO-FILL | Distance measurement + reference |
| **A1** - Circuit in delta configuration | AUTO-FILL | Configuration details + drawing reference |
| **A2** - No homopolar current path | AUTO-FILL | Grounding scheme + G3 reference |
| **A3** - Single-phase fault risk small | AUTO-FILL | Joint/earth point distances + drawing reference |
| **B4** - Outside penetration zone | AUTO-FILL | Distance/parallel run + drawing reference |
| **B5** - Crossing angle 80-100° | AUTO-FILL | Angle measurement + drawing reference |
| **B6** - Distance to technical room >20m | AUTO-FILL | Distance measurement + drawing reference |
| **B7** - Fault clearing <100ms | AUTO-FILL | Protection system details + justification |

**Conclusie (Conclusion)**
- Auto-generated based on evaluation results:
  - ✅ If compliant: "Geen sprake van ontoelaatbare beïnvloeding"
  - ❌ If requires further study: "Unity study en/of EMC-detailstudie vereist"

### Bijlage A: Onderbouwing

Detailed justification for each requirement:
- **(Initial)** - Distance calculation methodology
- **(A) 1-3** - Step A checks with technical details
- **(B) 4-7** - Step B checks with measurements

Each section includes:
- Requirement text
- Status (VOLDOET / VOLDOET NIET / NIET VAN TOEPASSING)
- Technical details and measurements
- Placeholders for engineer to add drawings/specifications

---

## Converting to DOCX/PDF

The report is generated as **Markdown (.md)** format. To convert to DOCX or PDF:

### Option 1: Using Pandoc (Recommended)

```powershell
# Convert to DOCX with ProRail template
pandoc ProRail-RLN00398-V004-Bijlage3-Route1-2025-11-06.md -o report.docx --reference-doc=prorail-template.docx

# Convert to PDF
pandoc ProRail-RLN00398-V004-Bijlage3-Route1-2025-11-06.md -o report.pdf
```

**Install Pandoc:**
- Windows: `choco install pandoc` or download from https://pandoc.org/
- macOS: `brew install pandoc`

### Option 2: Online Converters

- **Markdown to DOCX:** https://cloudconvert.com/md-to-docx
- **Markdown to PDF:** https://www.markdowntopdf.com/

### Option 3: VS Code + Markdown PDF Extension

1. Install "Markdown PDF" extension in VS Code
2. Open the `.md` file
3. Right-click → "Markdown PDF: Export (pdf)"

---

## Customizing Report Information

You can customize the report information by passing options to the export function:

```javascript
// In browser console or custom integration:
exportBijlage3Report('route-id-123', {
  projectDescription: 'Nieuwe 110 kV kabelverbinding tussen Station A en Station B',
  railwayLine: 'Amsterdam - Utrecht',
  geocode: 'Gcd-ABC-123',
  kilometerMarker: '45.2',
  documentTitle: 'EMC studie 110kV verbinding Station A-B',
  documentVersion: 'V002',
  author: 'Ir. J. Pietersen'
});
```

**Alternatively**, add these fields to your route metadata before evaluation:

```javascript
route.metadata.projectDescription = 'Nieuwe 110 kV kabelverbinding...';
route.metadata.railwayLine = 'Amsterdam - Utrecht';
route.metadata.geocode = 'Gcd-ABC-123';
route.metadata.kilometerMarker = '45.2';
```

---

## Template Compliance Checklist

The generated report ensures 100% compliance with Bijlage 3 by:

### Fixed Content (Never Changed)
- ✅ All Dutch template text is preserved exactly
- ✅ Section headings match the official template
- ✅ Instructions in square brackets `[...]` are preserved
- ✅ Table structure matches Tabel 1 format

### Auto-Filled Content
- ✅ Project description from route metadata
- ✅ Location details (railway line, geocode, km marker)
- ✅ Technical parameters (voltage, infrastructure type, etc.)
- ✅ Compliance status per requirement (J/N/n.v.t.)
- ✅ Distance measurements from spatial analysis
- ✅ Evaluation results and conclusions

### Placeholders for Engineer
- ✅ `[INSTRUCTIE: ...]` - Instructions for what to add
- ✅ `[AUTO-FILL: ...]` - Fields to be completed if not available
- ✅ `[Te bepalen]` - Fields requiring manual input
- ✅ Drawing references - Engineer must add project drawings

---

## Examples

### Example 1: Compliant Underground Cable

**Scenario:**
- 110 kV underground cable
- 850m from nearest track
- All Step A & B checks pass

**Generated Report:**
- ✅ Initial check PASSES (>700m for >24kV)
- ℹ️ Steps A & B not evaluated (not needed)
- ✅ Conclusion: "Geen verdere EMC studie vereist"

### Example 2: Cable Requiring Step B Evaluation

**Scenario:**
- 25 kV underground cable
- 15m from track (within zone)
- Crosses at 85° angle
- Joints >31m from track
- Technical room 25m away

**Generated Report:**
- ❌ Initial check FAILS (within zone)
- ✅ Step A.1-A.3: All PASS
- ✅ Step B.4: PASS (crossing, no parallel run)
- ✅ Step B.5: PASS (85° within 80-100°)
- ✅ Step B.6: PASS (>20m to technical room)
- ✅ Step B.7: PASS (<100ms clearing time)
- ✅ Conclusion: "Geen sprake van ontoelaatbare beïnvloeding"

### Example 3: Requires Unity Study

**Scenario:**
- 150 kV overhead line
- 350m parallel run with track
- All checks pass except requires further study

**Generated Report:**
- ❌ Initial check FAILS (within 700m zone)
- ✅ Step A.1-A.3: All PASS
- ❌ Step B.4: FAIL (parallel run within zone)
- ❌ Conclusion: "Unity study en EMC-detailstudie vereist"
- ℹ️ Next step: Use Bijlage 4 template for detailed study

---

## Frequently Asked Questions

### Q: Can I edit the generated report?

**A:** Yes! The report is in Markdown format which is plain text. You can:
- Edit with any text editor (VS Code, Notepad++, etc.)
- Add missing information in placeholder sections
- Insert images/figures
- Adjust formatting before converting to DOCX/PDF

### Q: What if some information is missing?

**A:** The report will include placeholders like `[AUTO-FILL]`, `[Te bepalen]`, or `[INSTRUCTIE: ...]` for missing information. You should:
1. Review the generated report
2. Fill in missing details manually
3. Add required drawings and specifications
4. Have a qualified engineer review and sign

### Q: Do I need to add drawings myself?

**A:** Yes. The template requires specific drawings:
- Project overview map (Figure 1)
- Circuit configuration drawings (for A.1)
- Single-line diagram with grounding (for A.2)
- Joint/earth point location drawings (for A.3)
- Track crossing/parallel run drawings (for B.4-B.6)
- Protection system documentation (for B.7)

You must add these after generating the report.

### Q: Can I generate reports for multiple routes at once?

**A:** Currently, Bijlage 3 reports are generated per individual trace (per connection). This aligns with the standard's requirement to document each high voltage connection separately. For comparing multiple alternative routes, use the comparative report function instead.

### Q: What if my project requires a detailed EMC study (Step C/D)?

**A:** If the flowchart evaluation indicates that Steps C or D are required:
1. This template is no longer sufficient (as noted in the conclusion)
2. You must perform unity study and/or EMC detail study
3. Use **Bijlage 4 template** for detailed studies
4. The current tool will indicate this in the evaluation results

### Q: How do I know if the report is ProRail compliant?

**A:** The report is designed to be 100% compliant with Bijlage 3 by:
- Following the exact structure from RLN00398-V004
- Using all official Dutch text verbatim
- Including all required sections and tables
- Maintaining proper references and citations

However, **you must**:
- ✅ Complete all placeholder fields
- ✅ Add required drawings and specifications
- ✅ Have a qualified engineer review the report
- ✅ Ensure all technical data is accurate

---

## Technical Implementation

### Code Architecture

```
src/utils/v4/
├── bijlage3ReportGenerator.js    # Bijlage 3 template generator
├── reportGenerator.js             # Report orchestrator
└── flowchartEvaluator.js         # Flowchart evaluation logic
```

### Key Functions

**`generateBijlage3Report(evaluationResult, routeData, projectInfo, format)`**
- Main entry point for report generation
- Returns Markdown or JSON format
- Accepts custom project information

**`generateTraceReport(trace, evaluationResult, projectInfo)`**
- Convenience wrapper for single trace export
- Prepares route data and calls generator
- Returns Markdown content ready for download

**`downloadBijlage3Report(content, projectName)`**
- Handles file download with proper naming
- Generates timestamp-based filenames
- Triggers browser download

### Data Flow

```
User Action (Click Export)
  ↓
exportBijlage3Report(routeId)
  ↓
Import bijlage3ReportGenerator module
  ↓
Prepare project info & route data
  ↓
generateTraceReport()
  ↓
Bijlage3ReportGenerator.generateMarkdown()
  ↓
Generate sections (Header, TOC, Sections 1-3, Bijlage A)
  ↓
Build requirements table from flowchart results
  ↓
Generate onderbouwing with technical details
  ↓
Return complete Markdown document
  ↓
downloadBijlage3Report()
  ↓
Download to user's computer
```

---

## Best Practices

### Before Generating Reports

1. **Complete Route Configuration**
   - Fill in all metadata fields
   - Mark joint locations accurately
   - Verify voltage and system parameters

2. **Run Thorough Evaluation**
   - Ensure evaluation completes successfully
   - Review all check results
   - Verify distance measurements

3. **Review Spatial Data**
   - Check that track distances are correct
   - Verify technical room locations
   - Confirm crossing angles if applicable

### After Generating Reports

1. **Review Generated Content**
   - Check all auto-filled fields
   - Verify technical parameters
   - Ensure measurements are accurate

2. **Complete Placeholders**
   - Fill in `[AUTO-FILL]` fields
   - Add project description details
   - Insert drawing references

3. **Add Supporting Documentation**
   - Project overview map
   - Circuit diagrams
   - Protection system details
   - Single-line diagrams

4. **Quality Assurance**
   - Have engineer review
   - Verify compliance with RLN00398-V004
   - Check calculations and measurements
   - Ensure all drawings are included

### For ProRail Submission

1. **Convert to DOCX**
   - Use official ProRail template if available
   - Maintain formatting and structure
   - Add company logo and branding

2. **Include All Appendices**
   - Project drawings (scaled and dimensioned)
   - Single-line diagrams
   - Protection system documentation
   - Network parameters

3. **Engineer Sign-off**
   - Have qualified engineer review and sign
   - Include professional engineer stamp
   - Add contact information

---

## Troubleshooting

### Issue: "Please evaluate the route before generating a report"

**Solution:** Click the **⚡ Evaluate** button on the route card first, wait for evaluation to complete, then try exporting again.

### Issue: Report shows many `[AUTO-FILL]` placeholders

**Solution:** Fill in route metadata fields before evaluation:
- Go to route card → expand details
- Fill in infrastructure type, voltage, circuit config
- Add joint locations if applicable
- Re-evaluate the route

### Issue: Distance measurements show "n.v.t." or "Infinity"

**Solution:** 
- Ensure railway track layers are loaded
- Verify route is drawn near tracks
- Check that spatial queries are working
- Try re-drawing the route closer to infrastructure

### Issue: Crossing angle not detected

**Solution:**
- Ensure route actually crosses the track
- Check that the crossing angle is between 80-100°
- Verify track geometry is loaded correctly
- If crossing is shallow, it may be detected as parallel run

### Issue: Cannot convert to DOCX/PDF

**Solution:**
- Install Pandoc for command-line conversion
- Use online converter services
- Or edit in VS Code with Markdown PDF extension

---

## Support and Feedback

For questions, issues, or suggestions regarding the Bijlage 3 report generator:

1. Check this documentation first
2. Review the RLN00398-V004 standard (Bijlage 3)
3. Consult with ProRail EMC specialists
4. Contact the development team

---

## Version History

- **V004-001** (2025-11-06): Initial implementation
  - Complete Bijlage 3 template structure
  - Auto-filled requirements table
  - Onderbouwing section with technical details
  - Markdown export with download functionality

---

## Related Documentation

- **RLN00398-V004 Standard**: Official ProRail EMC guideline
- **Bijlage 3**: Template tbv basisrapportage EMC
- **EVALUATION_WORKFLOW_SUMMARY.md**: Flowchart evaluation workflow
- **README.md**: General application documentation
- **ARCHITECTURE.md**: Technical system architecture
