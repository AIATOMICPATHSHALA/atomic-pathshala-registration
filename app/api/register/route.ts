import { NextResponse } from "next/server";
import type { ApiResponse, RegistrationPayload, StudentClass } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHONE_PATTERN = /^[6-9]\d{9}$/;
const CLASS_OPTIONS: StudentClass[] = ["Class 11", "Class 12", "Dropper"];
const DEFAULT_GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxlKqlBVIQHCo7kkgsMFoUukkojsyjYMwjSuKrbjvbIHjUv_blewe4Fjr9akZYvQR14/exec";
const FALLBACK_SESSION = {
  meetLink: "https://meet.google.com/xxx-xxxx-xxx",
  date: "Sunday, 27 July 2026",
  time: "7:00 PM - 8:30 PM IST",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getGoogleScriptUrl(): string {
  return (
    process.env.GOOGLE_SCRIPT_URL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL?.trim() ||
    DEFAULT_GOOGLE_SCRIPT_URL
  );
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ success: false, message }, { status });
}

export async function POST(request: Request) {
  let parsed: unknown;

  try {
    parsed = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  if (!isRecord(parsed)) {
    return jsonError("Invalid request body.", 400);
  }

  const name = getString(parsed.name);
  const phone = getString(parsed.phone).replace(/\D/g, "");
  const studentClass = getString(parsed.class);
  const email = getString(parsed.email);
  const timestamp = getString(parsed.timestamp) || new Date().toISOString();

  if (!name || !phone || !email || !studentClass) {
  return jsonError("Please fill all required fields.", 400);
}

  if (name.length < 3) {
    return jsonError("Name must be at least 3 characters.", 400);
  }

  if (!PHONE_PATTERN.test(phone)) {
    return jsonError("Enter a valid 10-digit Indian mobile number.", 400);
  }

  if (!CLASS_OPTIONS.includes(studentClass as StudentClass)) {
    return jsonError("Please select a valid class.", 400);
  }

  const endpoint = getGoogleScriptUrl();

  const payload: RegistrationPayload & { action: "register" } = {
  action: "register",
  name,
  phone,
  email,
  class: studentClass as StudentClass,
  timestamp,
};

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return jsonError("Could not reach the registration server. Please try again.", 503);
  }

  if (!response.ok) {
    return jsonError("Registration server error. Please try again.", 502);
  }

  const rawText = await response.text();
let data: ApiResponse;
try {
  data = JSON.parse(rawText) as ApiResponse;
} catch {
  return jsonError("DEBUG RAW: " + rawText.slice(0, 500), 502);
}

  if (data.status === "error" || data.success === false) {
    return jsonError(data.message || "Registration failed. Please try again.", 400);
  }

  if (data.status !== "success" && data.success !== true) {
    return jsonError(data.message || "Registration failed. Please try again.", 502);
  }

  return NextResponse.json(
    { success: true, session: data.session ?? FALLBACK_SESSION },
    { status: 200 }
  );
}
