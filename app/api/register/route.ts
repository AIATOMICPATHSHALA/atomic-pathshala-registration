import { NextResponse } from "next/server";
import type { ApiResponse, RegistrationPayload, StudentClass } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PHONE_PATTERN = /^[6-9]\d{9}$/;
const CLASS_OPTIONS: StudentClass[] = ["Class 11", "Class 12", "Dropper"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getGoogleScriptUrl(): string | null {
  return (
    process.env.GOOGLE_SCRIPT_URL?.trim() ||
    process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL?.trim() ||
    null
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
  const timestamp = getString(parsed.timestamp) || new Date().toISOString();

  if (!name || !phone || !studentClass) {
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
  if (!endpoint) {
    console.error("Missing GOOGLE_SCRIPT_URL or NEXT_PUBLIC_GOOGLE_SCRIPT_URL.");
    return jsonError("Registration is not connected yet. Please contact support.", 500);
  }

  const payload: RegistrationPayload & { action: "register" } = {
    action: "register",
    name,
    phone,
    class: studentClass as StudentClass,
    timestamp,
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return jsonError("Could not reach the registration server. Please try again.", 503);
  }

  if (!response.ok) {
    return jsonError("Registration server error. Please try again.", 502);
  }

  let data: ApiResponse;
  try {
    data = (await response.json()) as ApiResponse;
  } catch {
    return jsonError("Unexpected registration server response.", 502);
  }

  if (data.status === "error") {
    return jsonError(data.message || "Registration failed. Please try again.", 400);
  }

  if (!data.session) {
    return jsonError("Registered, but session details are missing. Please contact support.", 502);
  }

  return NextResponse.json({ success: true, session: data.session }, { status: 200 });
}
