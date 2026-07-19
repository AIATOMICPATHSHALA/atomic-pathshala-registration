const SHEET_NAME = "Sheet1";
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CLASS_OPTIONS = ["Class 11", "Class 12", "Dropper"];

const SESSION_DATE = "Tuesday, 21 July 2026";
const SESSION_TIME = "8:00 PM - 9:30 PM IST";
const SESSION_MEET_LINK = "https://meet.google.com/myt-juhe-byj";

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

function handleRegister(data) {
  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const email = String(data.email || "").trim();
  const studentClass = String(data.class || "").trim();
  const timestamp = data.timestamp || new Date().toISOString();

  if (!name || !phone || !email || !studentClass) {
    return jsonResponse({ status: "error", message: "Missing required fields." });
  }
  if (!PHONE_PATTERN.test(phone)) {
    return jsonResponse({ status: "error", message: "Invalid mobile number." });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return jsonResponse({ status: "error", message: "Invalid email address." });
  }
  if (CLASS_OPTIONS.indexOf(studentClass) === -1) {
    return jsonResponse({ status: "error", message: "Invalid class selected." });
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([name, phone, studentClass, timestamp, email]);

  // Send confirmation email — registration still succeeds even if this fails.
  try {
    sendConfirmationEmail(name, email);
  } catch (err) {
    Logger.log("Email send failed: " + err.message);
  }

  return jsonResponse({
    status: "success",
    message: "Registration saved.",
    session: {
      date: SESSION_DATE,
      time: SESSION_TIME,
      meetLink: SESSION_MEET_LINK
    }
  });
}

function sendConfirmationEmail(name, email) {
  const subject = "You're registered! Atomic Pathshala - Biology Strategy Session";
  const body =
    "Hi " + name + ",\n\n" +
    "You're successfully registered for the Atomic Pathshala Biology Strategy & Roadmap Session.\n\n" +
    "Session date: " + SESSION_DATE + "\n" +
    "Session time: " + SESSION_TIME + "\n" +
    "Join link: " + SESSION_MEET_LINK + "\n\n" +
    "Please join 10 minutes early and keep your notebook ready.\n\n" +
    "See you there!\n" +
    "Team Atomic Pathshala";

  MailApp.sendEmail(email, subject, body);
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}