import type { ApiResponse, RegistrationPayload, SessionInfo } from "./types";

export class ApiError extends Error {}

function getEndpoint(): string {
  const endpoint = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  if (!endpoint) {
    throw new ApiError(
      "Registration endpoint is not configured. Set NEXT_PUBLIC_GOOGLE_SCRIPT_URL."
    );
  }
  return endpoint;
}

/**
 * All requests are sent as "text/plain" instead of "application/json".
 * Apps Script web apps don't handle the CORS preflight (OPTIONS) request
 * that browsers send for a JSON content-type, so a "simple request"
 * (text/plain) is used instead while the backend still does
 * JSON.parse(e.postData.contents).
 */
async function callAppsScript(body: Record<string, unknown>): Promise<ApiResponse> {
  let response: Response;

  try {
    response = await fetch(getEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your internet connection and try again."
    );
  }

  if (!response.ok) {
    throw new ApiError("Server error. Please try again in a moment.");
  }

  let data: ApiResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Unexpected server response. Please try again.");
  }

  if (data.status === "error") {
    throw new ApiError(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

/** Step 1: request a 6-digit OTP to be sent to the student's mobile number. */
export async function sendOtp(phone: string): Promise<void> {
  await callAppsScript({ action: "sendOtp", phone });
}

/**
 * Step 2: verify the OTP. On success the Apps Script backend also saves
 * the registration to the Sheet and returns the live session's
 * auto-generated Google Meet link, date, and time.
 */
export async function verifyOtpAndRegister(
  payload: RegistrationPayload
): Promise<SessionInfo> {
  const data = await callAppsScript({ action: "verifyOtp", ...payload });
  if (!data.session) {
    throw new ApiError("Registered, but session details are missing. Please contact support.");
  }
  return data.session;
}
