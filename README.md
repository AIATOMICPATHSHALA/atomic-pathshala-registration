# Atomic Pathshala - Biology Strategy Session Registration

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
| ------------------- | ----------------------------------------- |
| `/`                 | Redirects to `/register`                  |
| `/register`         | Hero + registration form                  |
| `/register/success` | Confirmation, session details, Meet button |

## Connecting Google Sheets and auto Meet-link

The registration flow is now one step: the student enters name, mobile number, and class, then submits the form. The backend saves the row to your Sheet and returns the currently scheduled session's date, time, and Google Meet link. The Meet session is auto-created via the Google Calendar API and reused until that session starts.

1. Create a Google Sheet with header row: `Name | Phone | Class | Timestamp`.
2. In the sheet: **Extensions -> Apps Script**, replace the contents with [`google-apps-script/Code.gs`](./google-apps-script/Code.gs).
3. **Services (+ icon) -> add "Google Calendar API"** (Advanced Service). Also enable the Google Calendar API in the linked Google Cloud project.
4. **Project Settings -> Script Properties**, add:

   | Property               | Example              | Notes                            |
   | ---------------------- | -------------------- | -------------------------------- |
   | `SESSION_WEEKDAY`      | `SUNDAY`             | Day the session recurs on        |
   | `SESSION_HOUR`         | `19`                 | 24-hr, script timezone          |
   | `SESSION_MINUTE`       | `0`                  |                                  |
   | `SESSION_DURATION_MIN` | `90`                 |                                  |
   | `CALENDAR_ID`          | optional             | Defaults to your primary calendar |
   | `FALLBACK_MEET_LINK`   | `https://meet...`    | Optional fallback if Calendar fails |

   Also set **Project Settings -> Time zone** to `Asia/Kolkata`.

5. **Deploy -> New deployment -> Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the generated `/exec` URL into `.env.local`:

   ```env
   GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
   ```

   `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` is still supported as a fallback for older deployments.

7. Redeploy the Next.js app.

If Calendar/Meet creation ever fails, registration still succeeds. The backend falls back to `FALLBACK_MEET_LINK` or a placeholder link and logs the error.

## Editing the session details

The success page (`app/register/success/page.tsx`) reads the real date/time/Meet link handed off from registration and stored briefly in `sessionStorage`. The `FALLBACK_SESSION` constant is only used if someone opens `/register/success` directly without registering.

## Design notes

- Palette: near-black `#0A0A0A`, soft white `#FAFAF8`, gold `#D4AF37`.
- Type: Fraunces (display) + Inter (body) + IBM Plex Mono (labels/data).
- Signature element: an animated orbiting-atom motif behind the headline and success icon.
- Validation: name required (min 3 chars), phone must match a 10-digit Indian mobile pattern (`^[6-9]\d{9}$`), class required.
- Flow: fill details -> **Register Now** -> save to Sheet -> redirect to `/register/success`.
- Submission calls the local Next.js route `/api/register`, which then saves to Apps Script server-side. This avoids browser CORS issues and keeps the form stable on Vercel.

## Production build

```bash
npm run build
npm run start
```
