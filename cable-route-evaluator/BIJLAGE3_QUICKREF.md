# 📋 Bijlage 3 Report Generator - Quick Reference

## What is it?

A **per-trace report generator** that creates ProRail-compliant EMC reports following the official **"Bijlage 3: Template tbv basisrapportage EMC"** from RLN00398-V004.

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Draw & Configure
- Draw your high voltage connection route
- Fill in metadata (voltage, type, fault time)
- Mark joint locations if applicable

### 2️⃣ Evaluate
- Click **⚡ Evaluate** button
- Wait for flowchart to complete
- Review results (Initial → A → B)

### 3️⃣ Export Report
- Click **📋 Bijlage 3** button (blue icon)
- Download Markdown file
- Convert to DOCX/PDF

---

## 🔘 Button Location

On each route card, look for the **blue document icon**:

```
[💾 JSON]  [📄 Report]  [📋 Bijlage 3]  [▶ Expand]
                          ↑
                    Click here!
```

**Tooltip**: "Export Bijlage 3 compliant report (RLN00398-V004)"

---

## 📄 What's in the Report?

### Auto-Generated Content:

✅ **Document Header** with ProRail branding  
✅ **Inhoudsopgave** (Table of Contents)  
✅ **Section 1**: Inleiding (Introduction)  
✅ **Section 2**: Situatieomschrijving with:
- Project location (Railway, Geocode, km)
- Technical parameters table
- Map placeholder

✅ **Section 3**: RLN00398 Quick-scan with **Tabel 1**:
- Initial distance check (J/N)
- Step A requirements (A.1-A.3) if needed
- Step B requirements (B.4-B.7) if needed
- Compliance status per requirement
- Auto-generated conclusion

✅ **Bijlage A**: Onderbouwing with:
- Detailed justifications
- Measurement details
- Drawing references
- Technical explanations

### You Need to Add:

📸 Project overview map (screenshot)  
📐 Circuit configuration drawings  
🔌 Single-line diagram with grounding  
📍 Joint/earth point location drawings  
📏 Crossing/parallel run drawings  
🛡️ Protection system documentation  

---

## 🔄 Converting to DOCX/PDF

### Option 1: Pandoc (Best Quality)
```powershell
pandoc report.md -o report.docx --reference-doc=prorail-template.docx
pandoc report.md -o report.pdf
```

### Option 2: Online Converter
- https://cloudconvert.com/md-to-docx
- https://www.markdowntopdf.com/

### Option 3: VS Code + Extension
- Install "Markdown PDF" extension
- Right-click file → "Markdown PDF: Export (pdf)"

---

## ✅ Quality Checklist

Before submitting to ProRail:

- [ ] All auto-filled fields are correct
- [ ] Project description is complete
- [ ] Location details (Railway, Geocode, km) are accurate
- [ ] Technical parameters verified
- [ ] Distance measurements confirmed
- [ ] All placeholders `[AUTO-FILL]` completed
- [ ] All required drawings added
- [ ] Qualified engineer reviewed
- [ ] Professional formatting maintained

---

## 📊 Common Scenarios

| Situation | Initial | Steps | Conclusion |
|-----------|---------|-------|------------|
| **>24kV, >700m from track** | ✅ PASS | - | No study needed |
| **Cable, 350m from track** | ❌ FAIL | A→B | Evaluate all |
| **All checks pass** | ❌ | A✅ B✅ | Compliant |
| **Parallel run in zone** | ❌ | A✅ B❌ | Unity study needed |
| **Joints <31m** | ❌ | A❌ | Detailed study needed |

---

## 🆘 Troubleshooting

### "Please evaluate the route first"
➡️ Click **⚡ Evaluate** button before exporting

### Many `[AUTO-FILL]` placeholders
➡️ Complete route metadata before evaluation

### Distance shows "n.v.t."
➡️ Ensure railway track layers are loaded  
➡️ Draw route near infrastructure

### Cannot convert to DOCX
➡️ Install Pandoc or use online converter

---

## 💡 Pro Tips

1. **Complete metadata before evaluation** for fewer placeholders
2. **Take screenshot of map** while route is visible
3. **Edit Markdown before converting** to add missing info
4. **Use ProRail DOCX template** for consistent branding
5. **Save both MD and DOCX** versions for future edits

---

## 📚 Full Documentation

- **User Guide**: `docs/BIJLAGE3_REPORTS.md` (detailed instructions)
- **Implementation**: `BIJLAGE3_IMPLEMENTATION.md` (technical details)
- **Standard**: RLN00398-V004 Bijlage 3 (official template)

---

## 🎯 Key Benefits

✅ **100% Template Compliant** - Follows official RLN00398-V004 structure  
✅ **Auto-Filled Data** - Distance, voltage, configuration from evaluation  
✅ **Per-Trace Reports** - One report per high voltage connection  
✅ **Professional Format** - Ready for ProRail submission  
✅ **Engineer-Friendly** - Clear placeholders for manual completion  

---

## ❓ Quick Q&A

**Q: Can I edit the report?**  
A: Yes! It's Markdown (plain text), edit before converting.

**Q: Do I need drawings?**  
A: Yes, engineer must add required technical drawings.

**Q: What if evaluation fails?**  
A: Report will indicate which requirements don't pass and what's needed.

**Q: Can I generate for multiple routes at once?**  
A: No, Bijlage 3 is per-connection. Use comparative report for alternatives.

**Q: Is this ProRail official?**  
A: The template structure is 100% aligned with official Bijlage 3, but reports must be reviewed by qualified engineer before submission.

---

**Need Help?** See full documentation in `docs/BIJLAGE3_REPORTS.md`

---

**Version**: V004-001 | **Date**: 2025-11-06 | **Status**: ✅ Ready to Use
