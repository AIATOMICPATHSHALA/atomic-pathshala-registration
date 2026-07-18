import { NextResponse } from "next/server";
import {
  getClientErrorMessage,
  getMsg91AuthKey,
  isMsg91Success,
  isRecord,
  MSG91_SEND_OTP_URL,
  normalizeIndianMobile,
  parseMsg91Response,
  statusForOtpFailure,
  toMsg91Mobile,
} from "@/lib/msg91";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface OtpRequestBody {
  mobile?: unknown;
  phone?: unknown;
}

export async function POST(request: Request) {
  let body: OtpRequestBody;

  try {
    const parsed: unknown = await request.json();
    if (!isRecord(parsed)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }
    body = parsed;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const mobile = normalizeIndianMobile(body.mobile ?? body.phone);
  if (!mobile) {
    return NextResponse.json(
      { success: false, message: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }

  const authKey = getMsg91AuthKey();
  if (!authKey) {
    return NextResponse.json(
      { success: false, message: "OTP service is not configured." },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    authkey: authKey,
    mobile: toMsg91Mobile(mobile),
    otp_length: "6",
  });

  try {
    const response = await fetch(`${MSG91_SEND_OTP_URL}?${params.toString()}`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });
    const result = await parseMsg91Response(response);

    if (response.ok && isMsg91Success(result, "send")) {
      return NextResponse.json(
        { success: true, message: "OTP Sent" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: getClientErrorMessage(result, "Could not send OTP. Please try again."),
      },
      { status: statusForOtpFailure(result, response.ok ? 502 : response.status) }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "OTP service is unavailable. Please try again." },
      { status: 503 }
    );
  }
}
