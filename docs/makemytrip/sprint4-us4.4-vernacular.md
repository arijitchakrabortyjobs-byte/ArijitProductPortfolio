# US-4.4 — Vernacular Localisation for Tier 2/3 Users — 6 Languages
**Sprint 4 | MakeMyTrip Ground Transport | AI-Powered Personalized Bus Discovery**

---

## Purpose
50% of voice queries from Tier 2/3 cities come in regional languages (Myra data, Nov 2025). Yet the personalization UI — labels, chips, tooltips, trust strips — is English-only. A "Picked for you" chip in English means nothing to a first-generation smartphone user in Nagpur or Guntur. This story localises all personalization-related UI strings across 6 Indian languages.

---

## Languages in Scope

| Language | Code | States / Regions | MMT Tier 2/3 User Share |
|---|---|---|---|
| Hindi | `hi` | UP, MP, Bihar, Rajasthan, Delhi NCR periphery | 38% |
| Marathi | `mr` | Maharashtra (non-Mumbai) | 12% |
| Telugu | `te` | Andhra Pradesh, Telangana | 11% |
| Tamil | `ta` | Tamil Nadu | 10% |
| Kannada | `kn` | Karnataka (non-Bengaluru) | 8% |
| Bengali | `bn` | West Bengal, Bangladesh border | 7% |

> Total: 86% of Tier 2/3 Ground Transport sessions covered by these 6 languages.

---

## String Inventory — All Personalisation UI Strings

| String Key | English | Hindi | Marathi | Telugu | Tamil | Kannada | Bengali |
|---|---|---|---|---|---|---|---|
| `label.picked_for_you` | Picked for you | आपके लिए चुना | तुमच्यासाठी निवडले | మీకోసం ఎంచుకున్నది | உங்களுக்காக தேர்ந்தெடுக்கப்பட்டது | ನಿಮಗಾಗಿ ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ | আপনার জন্য বাছাই |
| `label.top_pick_route` | Top pick for this route | इस रूट की टॉप बस | या मार्गाची टॉप बस | ఈ రూట్‌లో టాప్ బస్ | இந்த வழியில் சிறந்த பேருந்து | ಈ ಮಾರ್ಗದ ಟಾಪ್ ಬಸ್ | এই রুটের সেরা বাস |
| `label.recommended` | Recommended for you | आपके लिए सुझाव | तुमच्यासाठी सुचवलेले | మీకు సిఫారసు చేయబడింది | உங்களுக்கு பரிந்துரைக்கப்பட்டது | ನಿಮಗೆ ಶಿಫಾರಸು | আপনার জন্য প্রস্তাবিত |
| `tooltip.past_trips` | Based on your past trips | आपकी पिछली यात्राओं के आधार पर | तुमच्या मागील प्रवासांवर आधारित | మీ గత ప్రయాణాల ఆధారంగా | உங்கள் கடந்த பயணங்களின் அடிப்படையில் | ನಿಮ್ಮ ಹಿಂದಿನ ಪ್ರಯಾಣಗಳ ಆಧಾರದಲ್ಲಿ | আপনার আগের ভ্রমণের ভিত্তিতে |
| `chip.showing_sleeper` | Showing Sleeper buses first | पहले स्लीपर बसें दिखा रहे हैं | आधी स्लीपर बस दाखवत आहे | ముందు స్లీపర్ బస్సులు చూపిస్తోంది | முதலில் ஸ்லீப்பர் பேருந்துகள் | ಮೊದಲು ಸ್ಲೀಪರ್ ಬಸ್ಸುಗಳು | প্রথমে স্লিপার বাস দেখাচ্ছে |
| `chip.preferred_timing` | Showing Morning buses first | पहले सुबह की बसें | आधी सकाळच्या बस | ముందు ఉదయపు బస్సులు | முதலில் காலை பேருந்துகள் | ಮೊದಲು ಬೆಳಗಿನ ಬಸ್ಸುಗಳು | প্রথমে সকালের বাস |
| `reset.cta` | Reset preferences | प्राथमिकताएं रीसेट करें | प्राधान्ये रीसेट करा | ప్రాధాన్యతలను రీసెట్ చేయండి | விருப்பங்களை மீட்டமை | ಆದ್ಯತೆಗಳನ್ನು ರಿಸೆಟ್ ಮಾಡಿ | পছন্দ রিসেট করুন |
| `graduation.toast` | Your picks are getting personal | आपके सफर के हिसाब से | तुमच्या प्रवासानुसार | మీ ప్రయాణానికి అనుగుణంగా | உங்கள் பயணத்திற்கு ஏற்ப | ನಿಮ್ಮ ಪ್ರಯಾಣಕ್ಕೆ ಅನುಗುಣವಾಗಿ | আপনার যাত্রার সাথে মিলিয়ে |

---

## Language Detection Priority

```
1. User's explicit MMT app language setting (highest priority)
2. Device OS language setting
3. SIM card registered state → map to dominant language
4. Default: English
```

---

## QA Process

Each translation must be reviewed by a native speaker, not a translation tool.

| Language | QA Reviewer Type | Review Criteria |
|---|---|---|
| Hindi | Internal native speaker (available in-house) | Natural phrasing, not literal translation |
| Marathi | External vendor (Bombay-based) | Avoid Hindi-ified Marathi |
| Telugu | External vendor | Andhra vs Telangana dialect check |
| Tamil | External vendor | Formal vs colloquial register check |
| Kannada | External vendor | Urban vs rural phrasing check |
| Bengali | External vendor | West Bengal vs Bangladesh variant |

### QA Checklist per Language
- [ ] All 8 strings translated
- [ ] Character length fits UI component constraints (no overflow)
- [ ] No Google Translate artifacts (literal phrasing)
- [ ] Right-to-left rendering check (not applicable for these 6 languages)
- [ ] Tested on device with that language setting active

---

## Technical Implementation

- Strings stored in i18n JSON files: `src/i18n/{lang_code}.json`
- Loaded at app startup via React i18next
- Fallback: if string missing in language file → English
- Font support: Ensure Noto Sans is loaded for all 6 scripts

---

## Success Metrics

| Metric | Target |
|---|---|
| Tier 2/3 session duration (variant vs control) | +10% |
| Tier 2/3 personalization label tap rate | +25% vs English baseline |
| Cold-start strip engagement in regional language | +30% vs English |
| Zero critical QA errors post-launch | ✅ |

---

## Sign-Off Checklist

- [ ] All 8 strings × 6 languages = 48 translations completed
- [ ] Native speaker QA sign-off for all 6 languages
- [ ] UI overflow tested for each language (longest strings: Kannada, Tamil)
- [ ] Language detection logic tested with 6 device configurations
- [ ] i18n fallback to English confirmed working

---

## Owner & Timeline
- **PM:** Own translation brief, review QA sign-offs
- **Engineering:** i18n integration, language detection logic
- **Localisation Vendor:** Translations + QA (3 languages external)
- **Due:** End of Sprint 4 (Week 8)
