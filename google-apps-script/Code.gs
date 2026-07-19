/**
 * Atomic Pathshala - Registration + Auto Meet-Link Google Apps Script
 * ---------------------------------------------------------------------------
 * WHAT THIS DOES
 * 1. register -> saves the registration row to the Sheet and returns the
 *                current live session's date/time/Meet link.
 *
 * SETUP
 * 1. Sheet: header row -> Name | Phone | Class | Timestamp
 * 2. Extensions -> Apps Script, paste this file over Code.gs.
 * 3. Services (+ icon) -> add "Google Calendar API" (Advanced Service).
 *    Also enable "Google Calendar API" in the linked Google Cloud project.
 * 4. Project Settings -> Script Properties, add:
 *      SESSION_WEEKDAY       e.g. SUNDAY
 *      SESSION_HOUR          e.g. 19        (24-hr, script timezone)
 *      SESSION_MINUTE        e.g. 0
 *      SESSION_DURATION_MIN  e.g. 90
 *      CALENDAR_ID           optional, defaults to "primary"
 *      FALLBACK_MEET_LINK    optional fallback link
 *    Project Settings -> Time zone: set to Asia/Kolkata.
 * 5. Deploy -> New deployment -> Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 * 6. Copy the /exec URL into GOOGLE_SCRIPT_URL in .env.local/Vercel.
 */

const SHEET_NAME = "Sheet1";
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const CLASS_OPTIONS = ["Class 11", "Class 12", "Dropper"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    switch (data.action) {
      case "register":
        return handleRegister(data);
      default:
        return jsonResponse({ status: "error", message: "Unknown action." });
    }
  } catch (err) {
    return jsonResponse({ status: "error", message: err.message });
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

function handleRegister(data) {
  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const studentClass = String(data.class || "").trim();
  const timestamp = data.timestamp || new Date().toISOString();

  if (!name || !phone || !studentClass) {
    return jsonResponse({ status: "error", message: "Missing required fields." });
  }
  if (!PHONE_PATTERN.test(phone)) {
    return jsonResponse({ status: "error", message: "Invalid mobile number." });
  }
  if (CLASS_OPTIONS.indexOf(studentClass) === -1) {
    return jsonResponse({ status: "error", message: "Invalid class selected." });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([name, phone, studentClass, timestamp]);

  const session = getOrCreateSession();
  return jsonResponse({ status: "success", message: "Registration saved.", session: session });
}

// ---------------------------------------------------------------------------
// Auto-generated Google Meet session (Google Calendar Advanced Service)
// ---------------------------------------------------------------------------

/**
 * Reuses the currently scheduled session if it has not started yet;
 * otherwise creates the next one on Google Calendar with a Meet link.
 */
function getOrCreateSession() {
  const props = PropertiesService.getScriptProperties();
  const storedStart = props.getProperty("SESSION_START");
  const storedLink = props.getProperty("SESSION_MEET_LINK");
  const now = new Date();

  if (storedStart && storedLink && new Date(storedStart) > now) {
    return formatSession(new Date(storedStart), storedLink);
  }

  try {
    const start = nextSessionStart();
    const end = new Date(start.getTime() + getSessionDurationMinutes() * 60000);
    const event = createMeetEvent(start, end);

    props.setProperty("SESSION_EVENT_ID", event.id);
    props.setProperty("SESSION_START", start.toISOString());
    props.setProperty("SESSION_MEET_LINK", event.meetLink);

    return formatSession(start, event.meetLink);
  } catch (err) {
    Logger.log("Calendar event creation failed: " + err.message);
    const fallbackLink =
      props.getProperty("FALLBACK_MEET_LINK") || "https://meet.google.com/xxx-xxxx-xxx";
    return formatSession(nextSessionStart(), fallbackLink);
  }
}

function nextSessionStart() {
  const props = PropertiesService.getScriptProperties();
  const targetWeekday = (props.getProperty("SESSION_WEEKDAY") || "SUNDAY").toUpperCase();
  const hour = Number(props.getProperty("SESSION_HOUR") || 19);
  const minute = Number(props.getProperty("SESSION_MINUTE") || 0);
  const weekdays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const targetIndex = weekdays.indexOf(targetWeekday);

  const now = new Date();
  const date = new Date(now);
  date.setHours(hour, minute, 0, 0);

  let diff = (targetIndex - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff);
  if (date <= now) date.setDate(date.getDate() + 7);

  return date;
}

function getSessionDurationMinutes() {
  return Number(PropertiesService.getScriptProperties().getProperty("SESSION_DURATION_MIN") || 90);
}

function createMeetEvent(start, end) {
  const calendarId = PropertiesService.getScriptProperties().getProperty("CALENDAR_ID") || "primary";

  const event = {
    summary: "Atomic Pathshala - Free Biology Strategy & Roadmap Session",
    description: "Live NEET Biology strategy, roadmap, study plan, NCERT approach and doubt discussion.",
    start: { dateTime: start.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: end.toISOString(), timeZone: "Asia/Kolkata" },
    conferenceData: {
      createRequest: {
        requestId: Utilities.getUuid(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  const created = Calendar.Events.insert(event, calendarId, { conferenceDataVersion: 1 });
  const meetLink =
    created.hangoutLink ||
    (created.conferenceData &&
      created.conferenceData.entryPoints &&
      created.conferenceData.entryPoints[0].uri);

  return { id: created.id, meetLink: meetLink };
}

function formatSession(start, meetLink) {
  const end = new Date(start.getTime() + getSessionDurationMinutes() * 60000);
  return {
    date: Utilities.formatDate(start, "Asia/Kolkata", "EEEE, d MMMM yyyy"),
    time:
      Utilities.formatDate(start, "Asia/Kolkata", "h:mm a") +
      " - " +
      Utilities.formatDate(end, "Asia/Kolkata", "h:mm a") +
      " IST",
    meetLink: meetLink,
  };
}

// ---------------------------------------------------------------------------

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
