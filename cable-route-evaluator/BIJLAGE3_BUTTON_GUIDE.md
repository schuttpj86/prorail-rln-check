# 📋 Bijlage 3 Export Button - Visual Guide

## Where to Find the Bijlage 3 Export Button

### Route Card Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Route Card - "Route 1"                                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  📍 Route Name: 110kV Cable Connection                       │
│  📏 Length: 2.5 km                                           │
│  ⚡ Status: Evaluated                                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [⚡ Evaluate]  [🔍 View]  [✏️ Edit]               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Export Actions:                                     │   │
│  │                                                       │   │
│  │  [💾 JSON]  [📄 Report]  [📋 Bijlage 3]  [▶ Details]│   │
│  │                             ↑                        │   │
│  │                    CLICK HERE!                       │   │
│  │                  (Blue document icon)                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Button Description

| Button | Icon | Color | Tooltip | Action |
|--------|------|-------|---------|--------|
| 💾 JSON | Download arrow | Gray | "Export route as JSON file" | Download route geometry |
| 📄 Report | Document lines | Gray | "Export professional evaluation report" | Download general report |
| **📋 Bijlage 3** | **Document filled** | **Blue (#007cb0)** | **"Export Bijlage 3 compliant report (RLN00398-V004)"** | **Download Bijlage 3 report** |
| ▶ Details | Arrow right | Gray | "Expand to edit route details" | Expand/collapse details |

---

## Button States

### Normal State
```
┌──────────┐
│    📋    │  ← Blue icon (#007cb0)
└──────────┘
```

### Hover State
```
┌──────────┐
│    📋    │  ← Light blue background (#e8f4f8)
└──────────┘    Darker blue icon (#005a87)
```

### After Click (Success)
```
┌──────────┐
│    ✅    │  ← Green checkmark
│ Exported!│
└──────────┘
```
*Returns to normal after 2 seconds*

---

## Visual Flow

```
User sees route card
         ↓
Clicks ⚡ Evaluate
         ↓
Evaluation completes
         ↓
Spots blue 📋 button
         ↓
Clicks 📋 Bijlage 3
         ↓
Alert: "Generating report..."
         ↓
Report downloads
         ↓
Success feedback ✅
         ↓
File in Downloads folder
```

---

## Icon Comparison

To help identify the correct button:

```
💾 JSON     = Regular gray download arrow
             Use for: Route geometry export

📄 Report   = Regular gray document with lines
             Use for: General evaluation report

📋 Bijlage  = BLUE filled document icon ★
             Use for: ProRail-compliant Bijlage 3 report
             THIS IS THE ONE YOU WANT!

▶ Details   = Gray expand arrow
             Use for: Show/hide route details
```

---

## Screenshot Reference

When you open the application, you should see:

```
┌────────────────────────────────────────────────────────────┐
│                     ProRail EMC Evaluator                  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Routes Panel (Left)                   Map (Right)         │
│  ═════════════════                    ═════════            │
│                                                             │
│  ┌───────────────────────────┐                            │
│  │ 📍 Route 1                │       [Interactive Map]    │
│  │ 110kV Cable               │                            │
│  │                           │                            │
│  │ [💾] [📄] [📋] [▶]       │                            │
│  │              ↑            │                            │
│  │         Blue icon         │                            │
│  └───────────────────────────┘                            │
│                                                             │
│  ┌───────────────────────────┐                            │
│  │ 📍 Route 2                │                            │
│  │ 150kV Overhead            │                            │
│  │                           │                            │
│  │ [💾] [📄] [📋] [▶]       │                            │
│  └───────────────────────────┘                            │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Quick Action Guide

### To Export a Bijlage 3 Report:

1. **Find your route** in the Routes panel (left side)
2. **Ensure it's evaluated** (shows ✅ status)
3. **Look for the blue document icon** (📋) - 3rd button from left
4. **Click the blue icon**
5. **Wait for download** (file appears in Downloads folder)

### File Name Format:
```
ProRail-RLN00398-V004-Bijlage3-[RouteName]-[Date].md

Example:
ProRail-RLN00398-V004-Bijlage3-Route1-2025-11-06.md
```

---

## Troubleshooting

### "I don't see the blue button"
- ✅ Make sure you're looking at the **route card**, not the toolbar
- ✅ The button is in the **export actions row**
- ✅ Look for the **blue color** (all other buttons are gray)

### "Button is grayed out"
- ❌ Route must be **evaluated first**
- ✅ Click **⚡ Evaluate** button first
- ✅ Wait for evaluation to complete
- ✅ Then try the 📋 button again

### "Nothing happens when I click"
- ✅ Check browser console for errors (F12)
- ✅ Make sure route has evaluation results
- ✅ Try refreshing the page
- ✅ Check Downloads folder for the file

### "I clicked the wrong button"
- 💾 = JSON file (geometry only, not a report)
- 📄 = General report (V002 format, not Bijlage 3)
- 📋 = **Bijlage 3 report** ← This is what you want!

---

## Color Reference

To ensure you're clicking the correct button:

| Color | Button | Purpose |
|-------|--------|---------|
| Gray (#666) | 💾 JSON | Route data export |
| Gray (#666) | 📄 Report | General report |
| **Blue (#007cb0)** | **📋 Bijlage 3** | **ProRail-compliant report** ★ |
| Gray (#999) | ▶ Details | Expand/collapse |

**Remember**: Only the Bijlage 3 button is blue!

---

## Mobile / Small Screen

On smaller screens, buttons may stack:

```
┌─────────────────┐
│  Route 1        │
│                 │
│  [💾 JSON]     │
│  [📄 Report]   │
│  [📋 Bijlage 3]│  ← Still blue!
│  [▶ Details]   │
└─────────────────┘
```

---

## Success Indicators

After clicking the 📋 Bijlage 3 button:

### 1. Button Feedback
```
📋 Bijlage 3  →  ✅ Exported!
(Blue)           (Green, 2 sec)
```

### 2. Browser Alert
```
┌────────────────────────────────────┐
│  ✅ Bijlage 3 rapport geëxporteerd│
│                                    │
│  Bestand:                         │
│  ProRail-RLN00398-V004-Bijlage3-  │
│  Route1-2025-11-06.md             │
│                                    │
│  Dit rapport voldoet 100% aan de  │
│  RLN00398-V004 Bijlage 3 template.│
│                                    │
│  U kunt dit converteren naar      │
│  DOCX/PDF met Pandoc.             │
│                                    │
│            [OK]                    │
└────────────────────────────────────┘
```

### 3. File in Downloads
```
📁 Downloads/
   └── ProRail-RLN00398-V004-Bijlage3-Route1-2025-11-06.md ✅
```

---

## Need Help?

- 📖 **Full Guide**: `docs/BIJLAGE3_REPORTS.md`
- ⚡ **Quick Start**: `BIJLAGE3_QUICKREF.md`
- 🔧 **Technical**: `BIJLAGE3_IMPLEMENTATION.md`

**Can't find the button?** Make sure you:
1. Have evaluated the route (⚡ Evaluate)
2. Are looking at the route card (left panel)
3. See the export buttons row
4. Identify the BLUE document icon

---

**The blue 📋 button is your gateway to ProRail-compliant reports!**
