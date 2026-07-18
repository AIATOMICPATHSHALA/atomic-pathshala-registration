import { NextResponse } from "next/server";
import {
  getClientErrorMessage,
  getMsg91AuthKey,
  isMsg91Success,
  isRecord,
  MSG91_VERIFY_OTP_URL,
  normalizeIndianMobile,
  normalizeOtp,
  parseMsg91Response,
  statusForOtpFailure,
  toMsg91Mobile,
} from "@/lib/msg91";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface VerifyOtpRequestBody {
  mobile?: unknown;
  phone?: unknown;
  otp?: unknown;
}

export async function POST(request: Request) {
  let body: VerifyOtpRequestBody;

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

  const otp = normalizeOtp(body.otp);
  if (!otp) {
    return NextResponse.json(
      { success: false, message: "Enter the 6-digit OTP." },
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
    mobile: toMsg91Mobile(mobile),
    otp,
  });

  try {
    const response = await fetch(`${MSG91_VERIFY_OTP_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        accept: "application/json",
        authkey: authKey,
      },
      cache: "no-store",
    });
    const result = await parseMsg91Response(response);

    if (response.ok && isMsg91Success(result, "verify")) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(
      {
        success: false,
        message: getClientErrorMessage(result, "OTP verification failed."),
      },
      { status: statusForOtpFailure(result, response.ok ? 400 : response.status) }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "OTP service is unavailable. Please try again." },
      { status: 503 }
    );
  }
}
