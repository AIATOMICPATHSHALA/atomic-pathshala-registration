import type { RegisterApiResponse, RegistrationPayload, SessionInfo } from "./types";

export class ApiError extends Error {}

async function callRegisterApi(body: RegistrationPayload): Promise<RegisterApiResponse> {
  let response: Response;

  try {
    response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check your internet connection and try again."
    );
  }

  let data: RegisterApiResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Unexpected server response. Please try again.");
  }

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

/** Saves the registration to the Sheet and returns the live session details. */
export async function registerStudent(payload: RegistrationPayload): Promise<SessionInfo> {
  const data = await callRegisterApi(payload);
  if (!data.session) {
    throw new ApiError("Registered, but session details are missing. Please contact support.");
  }
  return data.session;
}
