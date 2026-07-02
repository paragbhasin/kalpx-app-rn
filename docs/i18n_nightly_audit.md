# KalpX — Nightly i18n Translation Audit

## Overview

A cloud agent runs every night at **1:30 AM IST** and automatically audits both the frontend and backend codebases for hardcoded English strings, translates them into Hindi and Telugu, and commits the changes to the `dev` branch.

No manual intervention required. Every new screen or string added during the day gets picked up and translated overnight.

---

## Schedule

| Field | Value |
|---|---|
| Trigger | Every night at 1:30 AM IST (20:00 UTC) |
| Agent | Claude Sonnet 4.6 cloud agent |
| Routine ID | `trig_019HLFZriN81PDBs4KQfKkus` |
| Manage | https://claude.ai/code/routines/trig_019HLFZriN81PDBs4KQfKkus |

---

## What It Scans

### Frontend — `paragbhasin/kalpx-app-rn`

| Target | Path |
|---|---|
| Web components | `apps/web/src/**/*.tsx` |
| Mobile components | `apps/mobile/src/**/*.tsx` |
| Web locale files | `apps/web/src/locales/en.ts`, `hi.ts`, `te.ts` |
| Mobile locale files | `apps/mobile/src/config/locales/en.json`, `hi.json`, `te.json` |

**What it looks for:** Any JSX string literal or template string that is hardcoded directly in a component instead of going through the `t()` translation function.

**What it skips:** prop names, element IDs, URLs, `console.log` statements, `className` values, TypeScript type strings, test IDs, icon-only aria-labels.

### Backend — `paragbhasin/KalpX`

| Target | What it looks for |
|---|---|
| Python locale dicts | Dicts with `en` key but missing `hi` / `te` key (e.g. `_GREETING = {'en': 'Hello'}`) |
| YAML content files | Keys with English content missing `__hi` or `__te` variants |
| Notification templates | Message templates without locale branches |
| Views / serializers | User-facing API response strings hardcoded in English |

**Files checked:** `core/**/*.py`, `core/**/*.yaml`, `core/data_seed/**/*.yaml`, `core/data_seed/**/*.csv`

**What it never touches:** classifier/NLP input strings, safety phrases (`_SAFETY_PHRASES`), internal log messages, admin-only strings, migration files, test files — these must always stay English.

---

## Translation Rules

### Hindi (hi)

The agent follows strict Tier 2/3 city conversational Hindi — the kind spoken naturally in Lucknow, Bhopal, Patna. Not bookish or purist Hindi.

**Banned words and replacements:**

| Banned | Use instead |
|---|---|
| परिवर्तन | बदलाव |
| स्थिर | सुकून / टिकाव |
| स्पष्ट | साफ़ |
| जीवंत | ज़िंदा |
| आध्यात्मिक जीवन | साधना |
| कक्ष | जगह |
| विफलता (emotional) | कमज़ोरी |

**CTA verb form:** `करो` for short imperatives (e.g. "जारी रखो", "हो गया"), `करें` only for safety/crisis copy (e.g. counselor referrals, 112 messages).

**Mitra voice:** Always third person — "मित्र यहाँ है" not "मैं यहाँ हूँ"

**Sanskrit spiritual terms:** Keep as-is — साधना, संकल्प, मंत्र, भक्ति, विवेक, शरणागति

**Good examples:**
- "Continue" → "जारी रखो" ✅ (not "आगे बढ़ें" ❌)
- "Done" → "हो गया" ✅ (not "पूर्ण हुआ" ❌)
- "What's happening" → "क्या हो रहा है" ✅ (not "क्या प्रकट हो रहा है" ❌)
- "Not right now" → "अभी नहीं" ✅

### Telugu (te)

Natural everyday Telugu. Not overly formal or Sanskritised. Follows the same spirit as the Hindi rules — the kind of Telugu a person in Hyderabad or Vijayawada would use in daily life.

---

## What the Agent Does — Step by Step

```
1. SCAN    → Find all hardcoded English strings in frontend + backend
2. TRANSLATE → Produce hi + te translations per the rules above
3. ADD KEYS  → Write new keys to all 6 locale files (web + mobile, en/hi/te)
4. WIRE      → Add useTranslation + t() calls to each frontend component
5. FIX BACKEND → Add __hi / __te to YAML files, _hi/_te to Python dicts
6. COMMIT    → Two commits: one for frontend repo, one for backend repo
7. PUSH      → Push both to origin dev
8. REPORT    → Summary of what changed
```

---

## Frontend Wiring Pattern

When the agent finds a hardcoded string in a component, it:

1. Adds the import (path depth adjusted automatically):
   ```tsx
   import { useTranslation } from '../lib/i18n';
   ```

2. Adds the hook inside the component:
   ```tsx
   const { t } = useTranslation();
   ```

3. Replaces the string:
   ```tsx
   // Before
   <button>Continue</button>

   // After
   <button>{t('sectionName.continue')}</button>
   ```

4. For strings with variables:
   ```tsx
   t('greetingCard.welcomeUser').replace('{displayName}', name)
   ```

5. If a string array is defined at module level (outside the component), it moves it inside so it can access `t`.

---

## Backend Wiring Pattern

**YAML files** — adds `__hi` and `__te` variants:
```yaml
# Before
label: "Your practice awaits"

# After
label: "Your practice awaits"
label__hi: "आपकी साधना इंतज़ार कर रही है"
label__te: "మీ సాధన వేచి ఉంది"
```

**Python locale dicts** — adds `_hi` and `_te` counterparts:
```python
# Before
_GREETING = {'en': 'Welcome back'}

# After
_GREETING = {
    'en': 'Welcome back',
    'hi': 'वापस आए, अच्छा लगा',
    'te': 'తిరిగి స్వాగతం',
}
```

---

## Commit Messages

```
feat(i18n): nightly translation audit — 2026-07-01   ← frontend repo
feat(i18n): nightly backend translation audit — 2026-07-01   ← backend repo
```

---

## How to Verify It Ran

1. Check `dev` branch commits in both repos for the date
2. View the run log at: https://claude.ai/code/routines/trig_019HLFZriN81PDBs4KQfKkus
3. If no new strings were found, the agent outputs: `"i18n audit complete — no new strings found on [date]"`

---

## One-Time Setup Required

The Claude GitHub App must be installed on both repos for the cloud agent to clone and push:

👉 https://claude.ai/code/onboarding?magic=github-app-setup

Install for:
- `paragbhasin/kalpx-app-rn`
- `paragbhasin/KalpX`

---

## What Was Done Before This Automation (Manual Audit — 2026-06-30)

Before setting up the nightly routine, a full manual audit was run:

**Frontend (web):** 25 locale sections added, 25+ components wired with `t()` calls.

Sections covered: `landing`, `downloadModal`, `programs`, `notificationsPage`, `notifPrefs`, `phoneOtp`, `cycleReflection`, `quickSupport`, `triadCards`, `additionalItems`, `librarySearchModal`, `whyThisSheet`, `whyThisL2Sheet`, `whyThisStrip`, `predictiveAlert`, `greetingCard`, `voiceConsent`, `voiceNoteSheet`, `roomEntry`, `communityTopBar`, `communityReportModal`, `communityComment`, `communityEmptyState`, `communityPostCard`, `phoneLogin`

**Frontend (mobile):** `en.json` / `hi.json` already in sync (366 keys). Telugu (`te.json`) fully completed.

**Backend:** All Tell Mitra surfaces (YAML + Python), home greeting, daily rhythm, room labels, rhythm suggestions, wisdom layers, onboarding context — all hi + te complete.

**DB items:** 210 mantras, 425 sankalps, 253 practices — 100% Hindi + Telugu coverage. 982 wisdom cards (SHIFT/ESSENCE/USEFUL FOR/ROOTED IN) — all en + hi + te.

Commit: `7f2e7e60` on `dev` (frontend), deployed to S3/CloudFront.
