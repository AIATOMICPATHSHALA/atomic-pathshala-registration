import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RegisterRequestBody {
  name?: unknown;
  phone?: unknown;
  class?: unknown;
  timestamp?: unknown;
}

interface SessionInfo {
  meetLink: string;
  date: string;
  time: string;
}

function isValidIndianMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

/**
 * Fixed live-session details, shared by every registrant.
 * Update these (or the env vars) whenever you schedule a new session —
 * no code change needed if you set them via env vars.
 */
function getSessionInfo(): SessionInfo {
  return {
    meetLink: process.env.SESSION_MEET_LINK || "https://meet.google.com/xxx-xxxx-xxx",
    date: process.env.SESSION_DATE || "Sunday, 27 July 2026",
    time: process.env.SESSION_TIME || "7:00 PM \u2013 8:30 PM IST",
  };
}

export async function POST(request: Request) {
  let body: RegisterRequestBody;

  try {
    const parsed: unknown = await request.json();
    if (typeof parsed !== "object" || parsed === null) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }
    body = parsed as RegisterRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const fullName = typeof body.name === "string" ? body.name.trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const mobile = phoneRaw.replace(/^\+?91/, "").replace(/\D/g, "");
  const className = typeof body.class === "string" ? body.class.trim() : "";

  if (!fullName || fullName.length < 3) {
    return NextResponse.json(
      { success: false, message: "Please enter your full name." },
      { status: 400 }
    );
  }

  if (!isValidIndianMobile(mobile)) {
    return NextResponse.json(
      { success: false, message: "Please enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }

  if (!className) {
    return NextResponse.json(
      { success: false, message: "Please select a class." },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { success: false, message: "Registration service is not configured." },
      { status: 500 }
    );
  }

  try {
    // Field names here (fullName, mobile, className) match what the
    // Apps Script's doPost() expects — see Code.gs.
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, mobile, className }),
      redirect: "follow",
    });

    const text = await response.text();
    let result: { success?: boolean; message?: string } = {};
    try {
      result = JSON.parse(text);
    } catch {
      // Apps Script occasionally returns a plain-text redirect body;
      // treat an HTTP-OK response with an unparsable body as success.
      result = { success: response.ok };
    }

    if (!response.ok || result.success === false) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Could not save your registration. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registered successfully.",
        session: getSessionInfo(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Registration service is unavailable. Please try again." },
      { status: 503 }
    );
  }
}