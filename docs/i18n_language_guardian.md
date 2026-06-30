# KalpX — Nightly i18n Language Guardian Plan

## Purpose

KalpX development may happen in English during the day.
Every night, the i18n agent must make sure the product remains fully available in Hindi and Telugu by auditing new frontend and backend user-facing English strings, translating them with KalpX voice, wiring them correctly, validating the code, and committing safe changes to the `dev` branch.

This is not only a translation task.
This is a language-quality and product-voice task.

The goal is to make KalpX feel equally natural in English, Hindi, and Telugu — not like English was translated later.

---

## Product Philosophy

KalpX language must feel:
- rooted
- simple
- warm
- modern
- non-preachy
- emotionally clear
- spiritually natural
- easy for families and young users
- usable in 1–5 minutes

KalpX should never sound:
- religious in a heavy way
- lecture-like
- overly Sanskritized
- AI-generated
- corporate
- dramatic
- guilt-based
- fear-based
- guru-like

KalpX should help users begin gently.
The product voice should feel like:
- a calm saathi
- a grounded daily nudge
- a simple bridge to roots
- not a sermon
- not a scripture lecture
- not a motivational poster

---

## Core Operating Principle

There is no arbitrary cap on files or strings.
Large i18n diffs are expected when new development happens.
The agent must translate all safe user-facing strings, even if the change is large.
Risk is judged by category, meaning, and code safety — not by volume.
Safe i18n work should be completed nightly so dev stays multilingual by default.

---

## Production Philosophy

Do not run a separate translation pass for production.
Do not retranslate during prod deployment.

The correct flow is:
```
English development during the day
↓
Nightly i18n language guardian translates safe strings on dev
↓
Validated multilingual code/content stays on dev
↓
Normal dev → prod deployment promotes the same translations
↓
Prod receives already-localized content
```

This prevents translation drift between dev and prod.
`dev` is the localization source of truth.

---

## Branch and Deployment Rules

The agent may commit and push only to: `dev`

The agent must never push to:
- `main`
- `production`
- `release`
- `hotfix`

The agent must never deploy automatically.
The agent's responsibility ends after validated i18n commits are pushed to `dev`.

---

## Repositories

### Frontend
Repository: `paragbhasin/kalpx-app-rn`

Scan:
- `apps/web/src/**/*.tsx`
- `apps/mobile/src/**/*.tsx`
- `apps/web/src/locales/en.ts`
- `apps/web/src/locales/hi.ts`
- `apps/web/src/locales/te.ts`
- `apps/mobile/src/config/locales/en.json`
- `apps/mobile/src/config/locales/hi.json`
- `apps/mobile/src/config/locales/te.json`

### Backend
Repository: `paragbhasin/KalpX`

Scan:
- `core/**/*.py`
- `core/**/*.yaml`
- `core/data_seed/**/*.yaml`
- `core/data_seed/**/*.csv`

Look for:
- Python locale dicts with `en` but missing `hi`/`te`
- YAML content keys missing `__hi` or `__te`
- Notification content templates missing locale branches
- User-facing API response strings in views/serializers

---

## Safe Strings to Translate

Translate and wire safe user-facing product copy, including:
- screen titles
- section headings
- button text
- empty states
- onboarding copy
- practice labels
- sankalp labels
- mantra labels
- wisdom card display text
- Tell Mitra user-facing labels
- Daily Rhythm labels
- Inner Path labels
- room labels
- community display copy
- frontend JSX copy
- backend YAML display content
- Python locale dictionaries with clear en/hi/te structure
- notification title/body text only when content-only

---

## Protected Strings — Skip and Report

Never modify:
- migrations
- tests
- admin-only strings
- internal logs
- debug strings
- `console.log` strings
- analytics event names
- tracking event names
- API contract keys
- database field names
- enum values
- classifier strings
- NLP prompt strings
- LLM/system prompts
- safety phrases
- crisis copy
- emergency copy
- legal copy
- privacy copy
- consent copy
- medical copy
- payment copy
- compliance copy
- notification timing logic
- notification gating logic
- notification eligibility logic
- rate limits
- feature flags
- route names
- test IDs
- URLs
- CSS class names
- TypeScript type strings

If these contain English, do not translate them. Add them to the report under **skipped protected strings**.

---

## KalpX Meaning Rules

Before translating, understand what kind of product moment the string belongs to.

Classify each string as one of:
- `action`
- `reassurance`
- `reflection`
- `practice`
- `guidance`
- `error`
- `empty state`
- `notification`
- `community`
- `onboarding`
- `safety/protected`

Then translate based on intent, not word-for-word.

**Examples:**

"Continue" — This is an action. Keep it short.
- हिंदी: जारी रखो
- తెలుగు: కొనసాగించు

"Your practice awaits" — This is reassurance + practice. Keep it warm, not dramatic.
- हिंदी: आपकी साधना इंतज़ार कर रही है
- తెలుగు: మీ సాధన మీ కోసం వేచి ఉంది

"Something went wrong" — This is an error. Keep it simple, not spiritual.
- हिंदी: कुछ ठीक नहीं हुआ
- తెలుగు: ఏదో సరిగ్గా జరగలేదు

Do not turn simple product copy into spiritual discourse.

---

## Hindi Voice

Use natural Tier 2/3 conversational Hindi.
Think Lucknow, Bhopal, Patna, Indore, Jaipur family WhatsApp clarity — not textbook Hindi.

**Tone:** simple, warm, natural, direct, non-preachy, not bookish, not overly Sanskritized, not corporate

**Avoid:**
- परिवर्तन → use **बदलाव**
- स्थिर → use **सुकून / टिकाव**
- स्पष्ट → use **साफ़**
- जीवंत → use **ज़िंदा**
- आध्यात्मिक जीवन → use **साधना**
- कक्ष → use **जगह**
- विफलता → use **कमज़ोरी**
- पूर्ण हुआ → use **हो गया**
- प्रकट → use **दिख रहा / हो रहा**

**CTA examples:**
| English | Hindi |
|---|---|
| Continue | जारी रखो |
| Done | हो गया |
| Start | शुरू करो |
| Try again | फिर से कोशिश करो |
| Not right now | अभी नहीं |
| What's happening? | क्या हो रहा है? |
| Save | सेव करो |
| Share | शेयर करो |
| Open | खोलो |
| Close | बंद करो |

Use **करो** for short product actions.
Use **करें** only when the copy is formal, safety-related, legal, privacy-related, counselor-related, or policy-related.

---

## Telugu Voice

Use natural everyday Telugu.
Think Hyderabad/Vijayawada daily app usage — simple, clear, and warm.

**Tone:** simple, warm, natural, not overly formal, not overly Sanskritized, not literary, not preachy

**Examples:**
| English | Telugu |
|---|---|
| Continue | కొనసాగించు |
| Done | అయిపోయింది |
| Start | ప్రారంభించు |
| Try again | మళ్లీ ప్రయత్నించు |
| Not right now | ఇప్పుడే కాదు |
| What's happening? | ఏమి జరుగుతోంది? |
| Your practice awaits | మీ సాధన మీ కోసం వేచి ఉంది |
| Welcome back | తిరిగి స్వాగతం |
| Save | సేవ్ చేయి |
| Share | షేర్ చేయి |

Keep Telugu emotionally simple. Do not make it grand or poetic unless the English source is already poetic.

---

## Sanatan Language Rules

Keep core Sanatan terms when natural:

**Hindi:** साधना, संकल्प, मंत्र, भक्ति, विवेक, शरणागति, ध्यान, सेवा, नाम, प्रसाद

**Telugu:** సాధన, సంకల్పం, మంత్రం, భక్తి, ధ్యానం, సేవ, నామం, ప్రసాదం

But do not overuse these terms. Use Sanatan terms only when the product surface naturally calls for them.

**Examples:**
- "Practice" → साधना / సాధన — Good when context is spiritual practice
- "Practice again" → फिर से कोशिश करो / మళ్లీ ప్రయత్నించు — Better when context is retrying an action

The agent must understand context before choosing spiritual words.

---

## Mitra Voice Rules

Mitra must feel like a calm, present saathi.

Mitra should not sound like: a guru, a therapist, a god voice, an AI assistant, a corporate chatbot.

Mitra voice should be: gentle, grounded, third-person, non-invasive, non-judgmental.

**Hindi — Mitra must use third person:**
- ✅ मित्र यहाँ है
- ❌ मैं यहाँ हूँ

Telugu Mitra should also avoid over-personal "I am your guru/helper" style. Keep Mitra simple and present.

---

## Notification Voice Rules

Notifications should feel like a gentle nudge, not pressure.

**Allowed tone:** soft reminder, small invitation, daily rhythm support, warm return

**Avoid:** guilt, fear, urgency, FOMO, spiritual pressure, overpromising

- ✅ आपकी साधना इंतज़ार कर रही है
- ❌ अपनी आध्यात्मिक यात्रा अभी पूर्ण करें

The agent may localize notification title/body text only when it is content-only.

**Never change:** event type, category, schedule, quiet hours, cooldown, daily cap, min gap, eligibility, push gates, delivery logic, analytics names, template IDs.

If content and logic are mixed, skip and report.

---

## Existing Translation Rules

Preserve existing Hindi and Telugu translations unless:
- the English source changed
- the translation is missing
- the translation is clearly broken
- the translation is mismatched
- the translation is duplicated incorrectly

Do not rewrite good existing translations just for style.
Do not create a second translation for the same English string unless context requires a different meaning.
Reuse existing keys wherever possible.

---

## Duplicate Key Rules

Before adding a new key:
- search existing locale files
- reuse matching keys where appropriate
- avoid duplicate keys
- keep key names aligned with feature/component names
- preserve nearby naming conventions

If the same English phrase has different meaning in different contexts, create separate keys.

**Example:** "Practice" may mean spiritual साधना or try/rehearse. Do not reuse blindly across different meanings.

---

## Frontend Wiring Rules

When a safe hardcoded string is found:
1. Add or reuse the correct translation key
2. Add Hindi and Telugu
3. Import `useTranslation` using the correct path depth
4. Add the hook only inside a valid React function component
5. Replace the hardcoded string with `t('key.name')`

```tsx
const { t } = useTranslation();
<button>{t('sectionName.continue')}</button>
```

For variables:
```tsx
t('greetingCard.welcomeUser').replace('{displayName}', name)
```

**Do not insert hooks:**
- at module level
- inside conditionals
- inside loops
- inside nested helper functions
- inside callbacks
- inside class components
- inside non-React utilities
- after early returns if hook order changes

If safe wiring is unclear, skip and report.

---

## Backend Wiring Rules

**YAML:**
```yaml
label: "Your practice awaits"
label__hi: "आपकी साधना इंतज़ार कर रही है"
label__te: "మీ సాధన మీ కోసం వేచి ఉంది"
```

**Python locale dicts:**
```python
_GREETING = {
    'en': 'Welcome back',
    'hi': 'वापस आए, अच्छा लगा',
    'te': 'తిరిగి స్వాగతం',
}
```

Do not change backend structure or logic. Only add missing locale branches where the string is clearly user-facing display content.

---

## Error and Empty State Rules

Errors should be clear and simple. Do not spiritualize errors.

- ✅ कुछ ठीक नहीं हुआ
- ❌ आपकी साधना में बाधा आई

Empty states should feel calm and helpful.
- ✅ अभी कुछ नहीं है
- ✅ Better with next action: अभी कुछ नहीं है। शुरू करने के लिए एक संकल्प चुनो।

Do not make empty states sound like failure.

---

## UI Length and Readability

Hindi and Telugu can be longer than English.

Flag any translation that may overflow: buttons, tabs, bottom navigation, small cards, notification titles, modals, onboarding screens.

If a short natural translation is possible, use it. If shortening would damage meaning, keep the translation and flag it in the report.

---

## Validation Before Commit

### Frontend
Run:
- `pnpm --filter web typecheck` (or nearest equivalent)
- `pnpm --filter web build:dev`
- Mobile typecheck if available

Also verify:
- locale files parse correctly
- en/hi/te key parity is preserved
- no duplicate locale keys were created
- React hook rules were not violated

### Backend
Run:
- `python manage.py check`
- `python manage.py makemigrations --check --dry-run`
- touched-area tests if practical

Also verify:
- YAML files parse correctly
- Python files compile
- locale dicts remain valid
- notification templates remain valid
- no protected files were modified

---

## Commit Rules

Commit only if:
- branch is `dev`
- checks pass
- no protected files were modified
- no unsafe strings were rewritten
- React wiring is safe
- translations are not uncertain

**Commit messages:**

```
Frontend:  feat(i18n): nightly language audit — YYYY-MM-DD
Backend:   feat(i18n): nightly backend language audit — YYYY-MM-DD
No changes: i18n audit complete — no new strings found on YYYY-MM-DD
Partial:   i18n audit complete — safe changes committed; risky strings skipped on YYYY-MM-DD
Fail:      i18n audit failed validation — no commit made on YYYY-MM-DD
```

---

## Report Format

Always produce a report every night:

```
# Nightly i18n Language Guardian Report — YYYY-MM-DD

## Result
No new strings found / Safe changes committed / Partial / Validation failed

## Scale of Change
- Files changed:
- Frontend strings translated:
- Backend strings translated:
- Hindi strings added:
- Telugu strings added:
- Existing translations reused:
- Existing translations preserved:

## Product Voice Summary
- Strings translated as simple product actions:
- Strings translated as spiritual practice copy:
- Strings kept non-spiritual because context was functional:
- Mitra voice strings updated:
- Notification nudge strings updated:

## Frontend Summary
- Components wired:
- Locale keys added:
- Existing keys reused:
- Hardcoded strings remaining:
- Strings skipped as ambiguous:

## Backend Summary
- YAML entries updated:
- Python locale dicts updated:
- Notification content branches updated:
- Views/serializers updated:
- Protected strings skipped:

## Risk / Review Flags
- Legal/privacy/payment/consent/safety strings skipped:
- Classifier/NLP/prompt strings skipped:
- Notification logic skipped:
- Ambiguous strings requiring human review:
- Long translations that may affect UI:
- Strings where spiritual meaning was uncertain:

## Validation
Frontend:
- Typecheck:
- Build:
- Locale parity:
- Duplicate key check:

Backend:
- manage.py check:
- makemigrations dry-run:
- YAML parse:
- Python compile:
- Touched-area tests:

## Commits
Frontend: [commit hash or none]
Backend:  [commit hash or none]

## Production Note
No production translation pass was run. These translations are now on dev
and should flow to prod through the normal dev-to-prod deployment process.
```

---

## Final Instruction

Do not cap safe i18n work.
KalpX should remain multilingual by default.
Every safe user-facing English string added during the day should be translated into Hindi and Telugu overnight on `dev`.

Be conservative with protected categories.
Be aggressive about completing safe localization coverage.

Do not behave like a generic translation bot.
**Behave like a KalpX language guardian.**

Protect the product voice.
Keep the language rooted, simple, warm, modern, and non-preachy.

When the string is clearly safe user-facing product copy — translate it, wire it, validate it, and commit it to `dev`.

When the string is protected, ambiguous, safety-sensitive, legal, privacy-related, payment-related, consent-related, classifier-related, prompt-related, or logic-related — skip it and report it.
