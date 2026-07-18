/**
 * Atomic Pathshala — Registration + OTP + Auto Meet-Link Google Apps Script
 * ---------------------------------------------------------------------------
 * WHAT THIS DOES
 * 1. sendOtp    -> generates a 6-digit OTP, caches it for 5 min, texts it
 *                  via Fast2SMS.
 * 2. verifyOtp  -> checks the OTP, saves the registration row to the Sheet,
 *                  and returns the current live session's date/time/Meet
 *                  link — auto-created (and reused) via Google Calendar.
 *
 * SETUP
 * 1. Sheet: header row -> Name | Phone | Class | Timestamp
 * 2. Extensions -> Apps Script, paste this file over Code.gs.
 * 3. Services (+ icon) -> add "Google Calendar API" (Advanced Service).
 *    Also enable "Google Calendar API" in the linked Google Cloud project
 *    (Apps Script will show a link to do this the first time you save).
 * 4. Project Settings -> Script Properties, add:
 *      FAST2SMS_API_KEY      your Fast2SMS API key (fast2sms.com)
 *      SESSION_WEEKDAY       e.g. SUNDAY
 *      SESSION_HOUR          e.g. 19        (24-hr, script timezone)
 *      SESSION_MINUTE        e.g. 0
 *      SESSION_DURATION_MIN  e.g. 90
 *      CALENDAR_ID           optional, defaults to "primary"
 *    Project Settings -> Time zone: set to Asia/Kolkata.
 *    If FAST2SMS_API_KEY is left empty, OTPs are written to
 *    Executions/Logs instead of being texted — handy while testing.
 * 5. Deploy -> New deployment -> Web app.
 *      Execute as: Me
 *      Who has access: Anyone
 * 6. Copy the /exec URL into NEXT_PUBLIC_GOOGLE_SCRIPT_URL in .env.local.
 */

const SHEET_NAME = "Sheet1";
const OTP_TTL_SECONDS = 300; // 5 minutes
const PHONE_PATTERN = /^[6-9]\d{9}$/;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    switch (data.action) {
      case "sendOtp":
        return handleSendOtp(data);
      case "verifyOtp":
        return handleVerifyOtp(data);
      default:
        return jsonResponse({ status: "error", message: "Unknown action." });
    }
  } catch (err) {
    return jsonResponse({ status: "error", message: err.message });
  }
}

// ---------------------------------------------------------------------------
// OTP
// ---------------------------------------------------------------------------

function handleSendOtp(data) {
  const phone = String(data.phone || "").trim();

  if (!PHONE_PATTERN.test(phone)) {
    return jsonResponse({ status: "error", message: "Invalid mobile number." });
  }

  const otp = generateOtp();
  CacheService.getScriptCache().put("otp_" + phone, otp, OTP_TTL_SECONDS);

  const sent = sendOtpSms(phone, otp);
  if (!sent) {
    return jsonResponse({ status: "error", message: "Could not send OTP. Please try again." });
  }

  return jsonResponse({ status: "success", message: "OTP sent." });
}

function handleVerifyOtp(data) {
  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const studentClass = String(data.class || "").trim();
  const otp = String(data.otp || "").trim();
  const timestamp = data.timestamp || new Date().toISOString();

  if (!name || !phone || !studentClass || !otp) {
    return jsonResponse({ status: "error", message: "Missing required fields." });
  }
  if (!PHONE_PATTERN.test(phone)) {
    return jsonResponse({ status: "error", message: "Invalid mobile number." });
  }

  const cache = CacheService.getScriptCache();
  const cachedOtp = cache.get("otp_" + phone);

  if (!cachedOtp) {
    return jsonResponse({ status: "error", message: "OTP expired. Please request a new one." });
  }
  if (cachedOtp !== otp) {
    return jsonResponse({ status: "error", message: "Incorrect OTP. Please try again." });
  }

  cache.remove("otp_" + phone); // one-time use

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([name, phone, studentClass, timestamp]);

  const session = getOrCreateSession();
  return jsonResponse({ status: "success", message: "Registration saved.", session: session });
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sendOtpSms(phone, otp) {
  const apiKey = PropertiesService.getScriptProperties().getProperty("FAST2SMS_API_KEY");

  if (!apiKey) {
    // Dev convenience: no SMS key configured yet, so log the OTP instead
    // of failing. Check Executions in the Apps Script editor to read it.
    Logger.log("FAST2SMS_API_KEY not set. OTP for " + phone + " is " + otp);
    return true;
  }

  const response = UrlFetchApp.fetch("https://www.fast2sms.com/dev/bulkV2", {
    method: "post",
    headers: { authorization: apiKey },
    payload: { route: "otp", variables_values: otp, numbers: phone },
    muteHttpExceptions: true,
  });

  try {
    const result = JSON.parse(response.getContentText());
    return result.return === true;
  } catch (err) {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Auto-generated Google Meet session (Google Calendar Advanced Service)
// ---------------------------------------------------------------------------

/**
 * Reuses the currently scheduled session if it hasn't started yet;
 * otherwise creates the next one on Google Calendar with a Meet link
 * attached, and remembers it in Script Properties.
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
    // Registration still succeeds even if Calendar/Meet creation fails —
    // fall back to a manually shareable link so no student is blocked.
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
    summary: "Atomic Pathshala — Free Biology Strategy & Roadmap Session",
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

  // Requires the "Google Calendar API" Advanced Service to be enabled.
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
      " – " +
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
