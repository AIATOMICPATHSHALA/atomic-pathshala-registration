const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;
const SIX_DIGIT_OTP_PATTERN = /^\d{6}$/;

export const MSG91_SEND_OTP_URL = "https://control.msg91.com/api/v5/otp";
export const MSG91_VERIFY_OTP_URL = "https://control.msg91.com/api/v5/otp/verify";

export interface Msg91Response {
  type?: string;
  message?: string;
  code?: string | number;
  [key: string]: unknown;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeIndianMobile(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const digits = String(value).replace(/\D/g, "");
  const mobile =
    digits.length === 12 && digits.startsWith("91")
      ? digits.slice(2)
      : digits.length === 11 && digits.startsWith("0")
        ? digits.slice(1)
        : digits;

  return INDIAN_MOBILE_PATTERN.test(mobile) ? mobile : null;
}

export function normalizeOtp(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;

  const otp = String(value).replace(/\D/g, "");
  return SIX_DIGIT_OTP_PATTERN.test(otp) ? otp : null;
}

export function toMsg91Mobile(mobile: string): string {
  return `91${mobile}`;
}

export function getMsg91AuthKey(): string | null {
  return process.env.MSG91_AUTH_KEY?.trim() || null;
}

export async function parseMsg91Response(response: Response): Promise<Msg91Response> {
  const text = await response.text();
  if (!text) return {};

  try {
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : { message: String(parsed) };
  } catch {
    return { message: text };
  }
}

export function isMsg91Success(payload: Msg91Response, mode: "send" | "verify"): boolean {
  const type = payload.type?.toLowerCase();
  const message = payload.message?.toLowerCase() || "";

  if (type === "success") return true;

  const failureWords = ["error", "invalid", "incorrect", "expired", "failed", "not", "missing"];
  if (failureWords.some((word) => message.includes(word))) return false;

  if (mode === "send") {
    return message.includes("otp") && (message.includes("sent") || message.includes("send"));
  }

  return message.includes("verified") || message.includes("number_verified_successfully");
}

export function getClientErrorMessage(
  payload: Msg91Response,
  fallback: string
): string {
  const message = payload.message?.trim();
  if (!message) return fallback;

  const normalized = message.toLowerCase();
  if (normalized.includes("expired")) return "OTP expired. Please request a new one.";
  if (
    normalized.includes("invalid") ||
    normalized.includes("incorrect") ||
    normalized.includes("not match")
  ) {
    return "Invalid OTP. Please try again.";
  }
  if (normalized.includes("max") || normalized.includes("limit")) {
    return "Too many OTP attempts. Please try again later.";
  }
  if (normalized.includes("auth")) {
    return "OTP service authentication failed.";
  }

  return message.length > 180 ? `${message.slice(0, 177)}...` : message;
}

export function statusForOtpFailure(payload: Msg91Response, fallback = 502): number {
  const message = payload.message?.toLowerCase() || "";

  if (message.includes("max") || message.includes("limit")) return 429;
  if (
    message.includes("invalid") ||
    message.includes("incorrect") ||
    message.includes("expired") ||
    message.includes("not match")
  ) {
    return 400;
  }

  return fallback;
}
