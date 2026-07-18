# Atomic Pathshala — Biology Strategy Session Registration

Mobile-first registration microsite built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and React Hook Form. Goal: a student arriving from YouTube can register in under 20 seconds.

## Stack

- Next.js 15 (App Router, Server Components)
- TypeScript
- Tailwind CSS
- React Hook Form
- Google Apps Script as the backend (writes to a Google Sheet)

## Getting started

```bash
npm install
cp .env.local.example .env.local
# paste your deployed Apps Script /exec URL into .env.local
npm run dev
```

Visit `http://localhost:3000/register`.

## Pages

| Route               | Purpose                                   |
| -------------------- | ------------------------------------------ |
| `/`                   | Redirects to `/register`                   |
| `/register`           | Hero + registration form                   |
| `/register/success`   | Confirmation, session details, Meet button |

## Connecting Google Sheets, OTP & auto Meet-link

The registration flow is now two steps: **Send OTP → Verify & Register**. On successful verification, the backend saves the row to your Sheet *and* returns the currently scheduled session's date, time, and Google Meet link — auto-created via the Google Calendar API and reused until that session starts, after which the next one is generated automatically.

1. Create a Google Sheet with header row: `Name | Phone | Class | Timestamp`.
2. In the sheet: **Extensions → Apps Script**, replace the contents with [`google-apps-script/Code.gs`](./google-apps-script/Code.gs).
3. **Services (+ icon) → add "Google Calendar API"** (Advanced Service). The editor will link you to enable the Calendar API on the linked Google Cloud project the first time you save — follow that link and enable it.
4. **Project Settings → Script Properties**, add:

   | Property               | Example              | Notes                                   |
   | ----------------------- | --------------------- | ---------------------------------------- |
   | `FAST2SMS_API_KEY`       | `abc123...`            | From [fast2sms.com](https://www.fast2sms.com). Leave empty to test — OTPs are written to the Apps Script **Executions** log instead of being texted. |
   | `SESSION_WEEKDAY`        | `SUNDAY`               | Day the session recurs on                |
   | `SESSION_HOUR`           | `19`                   | 24-hr, script timezone                   |
   | `SESSION_MINUTE`         | `0`                    |                                          |
   | `SESSION_DURATION_MIN`   | `90`                   |                                          |
   | `CALENDAR_ID`            | *(optional)*           | Defaults to your primary calendar        |

   Also set **Project Settings → Time zone** to `Asia/Kolkata`.

5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the generated `/exec` URL into `.env.local`:

   ```
   NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
   ```

7. Redeploy the Next.js app (env vars are baked in at build time).

If Calendar/Meet creation ever fails (API not enabled, quota, etc.), registration still succeeds — the backend falls back to a manually-set `FALLBACK_MEET_LINK` script property (or a placeholder) so no student is blocked, and logs the error for you to check.

## Editing the session details

The success page (`app/register/success/page.tsx`) reads the real date/time/Meet link handed off from the OTP step (stored briefly in `sessionStorage`). The constant `FALLBACK_SESSION` at the top of that file is only used if someone opens `/register/success` directly without registering — update it if you want a sensible default:

```ts
const FALLBACK_SESSION: SessionInfo = {
  meetLink: "https://meet.google.com/xxx-xxxx-xxx",
  date: "Sunday, 27 July 2026",
  time: "7:00 PM – 8:30 PM IST",
};
```


## Design notes

- Palette: near-black `#0A0A0A`, soft white `#FAFAF8`, gold `#D4AF37` — no other hues.
- Type: Fraunces (display) + Inter (body) + IBM Plex Mono (labels/data).
- Signature element: an animated orbiting-atom motif behind the headline and success icon, echoing "Atomic" in the brand name.
- Validation: name required (min 3 chars), phone must match a 10-digit Indian mobile pattern (`^[6-9]\d{9}$`), class required, OTP must be 6 digits.
- Flow: fill details → **Send OTP** → enter the 6-digit code → **Verify & Register** (with resend cooldown + edit-number option) → redirect to `/register/success`.
- Submission uses `text/plain` content-type to avoid a CORS preflight against the Apps Script endpoint, with disabled/loading buttons at every step and toast-based error handling.

## Production build

```bash
npm run build
npm run start
```
