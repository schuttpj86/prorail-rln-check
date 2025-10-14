# Language Toggle Feature Implementation

## Overview
Added bilingual support (English/Dutch) to the ProRail Cable Route Evaluator with a language toggle button in the header.

## Files Created

### 1. `/src/i18n/translations.js`
Complete internationalization (i18n) module with:
- **Translations object** containing all UI strings in both English and Dutch
- **Technical terminology** from RLN00398-V001 document:
  - Dutch: "EV Gebouwen (Technische Ruimtes)", "Aarding (Aardingspunten)", "Spoorbaanhartlijn", "Wissel", "Overweg", "Spoortakdeel", "Tracé", "Kokertracé"
  - English equivalents for all ProRail-specific terms
- **Helper functions**:
  - `getCurrentLanguage()` - Get language from localStorage (default: 'en')
  - `setCurrentLanguage(lang)` - Persist language preference
  - `t(key, lang)` - Translation lookup function
  - `updateTranslations(lang)` - Update all translatable DOM elements

## Files Modified

### 1. `/src/main.js`
- Added import: `import { getCurrentLanguage, setCurrentLanguage, t, updateTranslations } from "./i18n/translations.js"`
- Updated `setupUI()` function:
  - Initialize language on app load
  - Add language toggle button event listener
  - Toggle between 🇬🇧 EN and 🇳🇱 NL
  - Update document language attribute
  - Persist preference to localStorage

### 2. `/index.html`
- Added language toggle button to header: `<button id="lang-toggle">🇳🇱 NL</button>`
- Added `data-i18n` attributes to translatable elements:
  - Main title: `data-i18n="appTitle"`
  - Help/Settings buttons
  - Routes panel header
  - Drawing control tooltips
- Button placement: Between main title and Help/Settings buttons

### 3. `/src/style.css`
- Added specific styling for `#lang-toggle`:
  - Darker background (#1a1a1a) to stand out
  - Min-width of 70px for consistent sizing
  - Enhanced hover state (#2a2a2a)
  - Matches header design system

## How It Works

### 1. **Initialization**
```javascript
const currentLang = getCurrentLanguage(); // Loads from localStorage or defaults to 'en'
updateTranslations(currentLang);          // Updates all [data-i18n] elements
```

### 2. **Language Toggle**
```javascript
langToggle.addEventListener('click', () => {
  const newLang = getCurrentLanguage() === 'en' ? 'nl' : 'en';
  setCurrentLanguage(newLang);           // Save to localStorage
  updateTranslations(newLang);            // Update UI
  langToggle.textContent = newLang === 'en' ? '🇳🇱 NL' : '🇬🇧 EN';
  document.documentElement.lang = newLang; // Update HTML lang attribute
});
```

### 3. **DOM Updates**
The `updateTranslations()` function finds all elements with special attributes:
- `data-i18n` → Updates `textContent`
- `data-i18n-aria` → Updates `aria-label`
- `data-i18n-title` → Updates `title` (tooltips)

## Translation Coverage

### ✅ Currently Translated
- Application title and subtitle
- Drawing controls (Start/Finish/Cancel/Clear)
- Route management (Routes, Length, Evaluate, Delete)
- Evaluation results (Passed/Failed/Pending)
- All ProRail layer names (from RLN00398):
  - Technical Rooms (EV Gebouwen)
  - Earthing Points (Aarding)
  - Railway Tracks (Spoorbaanhartlijn)
  - Switches (Wissel)
  - Level Crossings (Overweg)
  - Track Sections (Spoortakdeel)
  - Cable Routes (Tracé)
  - Conduit Routes (Kokertracé)
- Distance measurements
- Compliance messages
- UI elements (Close, Save, Cancel, etc.)
- Help text

### 🔄 To Be Extended
To translate additional UI elements, simply:
1. Add translation keys to `/src/i18n/translations.js`
2. Add `data-i18n="yourKey"` attribute to HTML elements
3. Translations update automatically on language toggle

## Usage

### For Users
1. Click the **🇳🇱 NL** or **🇬🇧 EN** button in the top-right header
2. Language preference is saved automatically
3. Preference persists across sessions (localStorage)

### For Developers
```javascript
// Get translation
import { t } from './i18n/translations.js';
const text = t('routeName'); // Returns "Route" or "Route" based on current language

// Add new translations
// In translations.js, add to both en and nl objects:
en: {
  newKey: "English text",
  ...
},
nl: {
  newKey: "Nederlandse tekst",
  ...
}

// Use in HTML
<button data-i18n="newKey">Default Text</button>
```

## Technical Terms Reference (RLN00398-V001)

| English | Dutch (Official ProRail) |
|---------|-------------------------|
| Technical Rooms | EV Gebouwen (Technische Ruimtes) |
| Earthing Points | Aarding (Aardingspunten) |
| Railway Tracks | Spoorbaanhartlijn |
| Switches | Wissel |
| Level Crossings | Overweg |
| Track Sections | Spoortakdeel |
| Cable Routes | Tracé |
| Conduit Routes | Kokertracé |
| Structures & Buildings | Bouwwerken & Gebouwen |
| Energy Supply System | Energievoorzieningssysteem |
| Train Protection System | Treinbeveiligingssysteem |
| Cable Situation | Kabelsituatie |
| Track Objects | Spoorobjecten |

## Benefits

1. ✅ **Accessibility**: Dutch-speaking engineers can use native terminology
2. ✅ **Compliance**: Uses official ProRail terminology from RLN00398
3. ✅ **Persistent**: Language preference saved in localStorage
4. ✅ **Extensible**: Easy to add more translations
5. ✅ **Professional**: Flag emojis provide clear visual feedback
6. ✅ **Maintainable**: Centralized translation management

## Next Steps (Optional Enhancements)

1. **Dynamic Route List Translation**: Update route cards when language changes
2. **Evaluation Report Translation**: Translate EMC rule descriptions dynamically
3. **Console Logging**: Multilingual console messages
4. **Date/Number Formatting**: Locale-specific formatting (e.g., "3,5 km" vs "3.5 km")
5. **Welcome Message Translation**: Translate the onboarding modal
6. **Export/Reports**: Generate reports in selected language

## Testing

### Test Checklist
- [ ] Language toggle button appears in header
- [ ] Button shows correct flag emoji (🇳🇱 or 🇬🇧)
- [ ] Clicking button toggles language
- [ ] UI text updates immediately
- [ ] Language preference persists after page reload
- [ ] All layer names use ProRail terminology
- [ ] Tooltips update correctly
- [ ] Console shows language change confirmation

## Browser Compatibility
- ✅ LocalStorage support (all modern browsers)
- ✅ Flag emoji support (all modern browsers)
- ✅ ES6 modules (all modern browsers)
- ✅ Fallback to English if translation missing
