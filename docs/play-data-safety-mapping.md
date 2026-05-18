# Android Play Store — Data Safety Mapping

**Created: 2026-05-18 — Engineering Remediation E8**

This document maps all data collected by the KalpX Android app to the Play Store
Data Safety form categories. Use this to manually complete the Data Safety section
in Google Play Console before next release submission.

**IMPORTANT:** This mapping must be reviewed against the final Privacy Policy before
submission. Do not tick any Play Console category that is not reflected in the Privacy
Policy and vice versa.

---

## Data Collected

### 1. Device or other IDs

| Field | Value |
|-------|-------|
| **Type** | Device or other IDs → App set device ID / Firebase Installation ID |
| **Collected** | Yes |
| **Shared with third parties** | No (FCM token sent to Google Firebase for push delivery only; not shared with ad networks) |
| **Required or optional** | Required for push notification delivery |
| **Purpose** | App functionality — push notification delivery |
| **User can request deletion** | Yes — via in-app account deletion |

**Notes:** FCM token (push notification token) is stored server-side linked to the user account. It is rotated by Firebase automatically and cleared on account deletion.

---

### 2. Personal Info — Email address

| Field | Value |
|-------|-------|
| **Type** | Personal info → Email address |
| **Collected** | Yes (during account registration and OTP flow) |
| **Shared with third parties** | No |
| **Required or optional** | Required (account authentication) |
| **Purpose** | Account management — authentication, OTP delivery, account deletion confirmation |
| **User can request deletion** | Yes — via in-app account deletion |

---

### 3. Audio — Voice input

| Field | Value |
|-------|-------|
| **Type** | Audio → Voice or sound recordings |
| **Collected** | Yes (Voice Reflection feature, optional) |
| **Shared with third parties** | No (processed internally; raw audio purged within 24h) |
| **Required or optional** | Optional |
| **Purpose** | App functionality — voice reflection transcription |
| **User can request deletion** | Yes — audio purged automatically within 24h; transcript deleted with account |
| **Data encryption in transit** | Yes |
| **Data encryption at rest** | Yes (S3 server-side encryption) |

---

### 4. App activity

| Field | Value |
|-------|-------|
| **Type** | App activity → App interactions |
| **Collected** | Yes (practice completions, room sessions, check-ins) |
| **Shared with third parties** | No |
| **Required or optional** | Required (core app functionality) |
| **Purpose** | App functionality — practice tracking, companion intelligence, rhythm |
| **User can request deletion** | Yes — deleted with account |

---

### 5. Location (declared — used for timezone only)

| Field | Value |
|-------|-------|
| **Type** | Location → Approximate location |
| **Collected** | Indirectly (device timezone inferred at setup for quiet-hours and reminder scheduling) |
| **Shared with third parties** | No |
| **Required or optional** | Optional (can be set manually) |
| **Purpose** | App functionality — reminder scheduling, quiet hours |
| **User can request deletion** | Yes — cleared with account |

**Notes:** `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` are declared in AndroidManifest.xml. Verify at next review whether these permissions are actively used for GPS-based location or only timezone inference. Remove fine location permission if only timezone is needed.

---

## Data NOT Collected

| Data Type | Status |
|-----------|--------|
| Name | Not collected separately (profile_name is user-chosen, optional) |
| Phone number | Not collected |
| Race or ethnicity | Not collected |
| Political or religious beliefs | Not collected as structured field |
| Sexual orientation | Not collected |
| Web browsing history | Not collected |
| Purchase history | Not collected via app (retreat bookings via web only) |
| Financial info | Not collected |
| Health info | Not collected as structured field |
| Crash logs | Not collected (Sentry disabled on mobile; no crash reporting SDK active) |

---

## Third-Party SDK Data Sharing

| SDK | Purpose | Data shared |
|-----|---------|-------------|
| Firebase Cloud Messaging | Push notification delivery | FCM token, notification payload (no user PII in payload) |
| Firebase (Analytics) | **DISABLED** — `IS_ANALYTICS_ENABLED: false` in GoogleService-Info.plist | None |

---

## How to Complete Play Console Data Safety Form

1. Go to Play Console → your app → Policy → Data Safety
2. Select "Yes" for "Does your app collect or share any of the required user data types?"
3. Tick: Device or other IDs, Email address, Voice or sound recordings, App interactions, Approximate location
4. For each type: set purpose, required/optional, deletion eligibility
5. For "Data shared": mark all as "Not shared" (no ad networks; Firebase FCM is a data processor, not a data recipient for Play Console purposes — verify this interpretation with legal)
6. Save and submit — Google will ask you to add a privacy policy URL

---

## Open Actions Before Submission

- [ ] Legal sign-off on this mapping document
- [ ] Verify fine location permission usage — remove if only timezone is needed
- [ ] Add Privacy Policy URL to Play Console listing
- [ ] Confirm Firebase FCM classification (processor vs. recipient) with legal
- [ ] Cross-check against iOS App Store privacy nutrition label for consistency
