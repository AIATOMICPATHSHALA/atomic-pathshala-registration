"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Toast from "./Toast";
import { verifyOtpAndRegister, ApiError } from "@/lib/api";
import type { RegistrationFormValues, StudentClass } from "@/lib/types";

const CLASS_OPTIONS: StudentClass[] = ["Class 11", "Class 12", "Dropper"];
const RESEND_COOLDOWN_SECONDS = 30;
const SESSION_STORAGE_KEY = "atomic_pathshala_session";

type Step = "details" | "otp";
type OtpEndpoint = "/api/send-otp" | "/api/verify-otp";

interface OtpApiResponse {
  success: boolean;
  message?: string;
}

async function postOtpRequest(
  endpoint: OtpEndpoint,
  body: Record<string, string>
): Promise<OtpApiResponse> {
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Could not reach the OTP service. Check your internet connection and try again."
    );
  }

  let data: OtpApiResponse;
  try {
    data = await response.json();
  } catch {
    throw new ApiError("Unexpected OTP service response. Please try again.");
  }

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || "OTP request failed. Please try again.");
  }

  return data;
}

async function requestOtp(mobile: string): Promise<void> {
  await postOtpRequest("/api/send-otp", { mobile });
}

async function verifyOtp(mobile: string, otp: string): Promise<void> {
  await postOtpRequest("/api/verify-otp", { mobile, otp });
}

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    mode: "onTouched",
    defaultValues: { name: "", phone: "", studentClass: "", otp: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") otpInputRef.current?.focus();
  }, [step]);

  const handleSendOtp = async () => {
    const valid = await trigger(["name", "phone", "studentClass"]);
    if (!valid || isSendingOtp) return;

    setIsSendingOtp(true);
    setIsOtpVerified(false);
    try {
      await requestOtp(getValues("phone"));
      setValue("otp", "");
      clearErrors("otp");
      setStep("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setToast({ message: "OTP sent to your mobile number.", variant: "success" });
    } catch (err) {
      setToast({
        message: err instanceof ApiError ? err.message : "Could not send OTP. Try again.",
        variant: "error",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    setIsOtpVerified(false);
    try {
      await requestOtp(getValues("phone"));
      setValue("otp", "");
      clearErrors("otp");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setToast({ message: "OTP resent.", variant: "success" });
    } catch (err) {
      setToast({
        message: err instanceof ApiError ? err.message : "Could not resend OTP.",
        variant: "error",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (values: RegistrationFormValues) => {
    if (isVerifying) return;
    setIsVerifying(true);

    try {
      const phone = values.phone.trim();
      const otp = values.otp.trim();

      if (!isOtpVerified) {
        await verifyOtp(phone, otp);
        setIsOtpVerified(true);
      }

      const session = await verifyOtpAndRegister({
        name: values.name.trim(),
        phone,
        class: values.studentClass as StudentClass,
        otp,
        timestamp: new Date().toISOString(),
      });

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      setToast({ message: "Registered successfully. Redirecting…", variant: "success" });
      router.push("/register/success");
    } catch (err) {
      setToast({
        message: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        variant: "error",
      });
      setIsVerifying(false);
    }
  };

  return (
    <div id="register-form" className="relative w-full max-w-md scroll-mt-24">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5 rounded-2xl border border-ink-line bg-ink-soft/80 p-6 shadow-[0_0_0_1px_rgba(212,175,55,0.06),0_24px_60px_-20px_rgba(0,0,0,0.7)] backdrop-blur sm:p-8"
      >
        <div className="space-y-1.5 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold/80">
            Seats are limited
          </p>
          <h2 className="font-display text-2xl font-semibold text-paper">
            {step === "details" ? "Reserve your spot" : "Verify your number"}
          </h2>
        </div>

        {/* STEP 1: details */}
        <div className={step === "details" ? "space-y-5" : "hidden"}>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-paper/80">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              autoFocus
              placeholder="e.g. Ananya Sharma"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              disabled={step !== "details"}
              className={`w-full rounded-lg border bg-ink px-4 py-3 text-base text-paper placeholder:text-paper/30 outline-none transition focus:border-gold ${
                errors.name ? "border-red-500/70" : "border-ink-line"
              }`}
              {...register("name", {
                required: "Please enter your full name",
                minLength: { value: 3, message: "Name must be at least 3 characters" },
                pattern: {
                  value: /^[A-Za-z][A-Za-z\s.'-]{1,}$/,
                  message: "Enter a valid name",
                },
              })}
            />
            {errors.name && (
              <p id="name-error" className="mt-1.5 text-xs text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-paper/80">
              Mobile number
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-paper/40">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                placeholder="98765 43210"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                disabled={step !== "details"}
                className={`w-full rounded-lg border bg-ink py-3 pl-14 pr-4 text-base tracking-wide text-paper placeholder:text-paper/30 outline-none transition focus:border-gold disabled:opacity-60 ${
                  errors.phone ? "border-red-500/70" : "border-ink-line"
                }`}
                {...register("phone", {
                  required: "Please enter your mobile number",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit Indian mobile number",
                  },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  },
                })}
              />
            </div>
            {errors.phone && (
              <p id="phone-error" className="mt-1.5 text-xs text-red-400">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="studentClass" className="mb-1.5 block text-sm font-medium text-paper/80">
              Class
            </label>
            <select
              id="studentClass"
              defaultValue=""
              disabled={step !== "details"}
              aria-invalid={!!errors.studentClass}
              aria-describedby={errors.studentClass ? "class-error" : undefined}
              className={`w-full appearance-none rounded-lg border bg-ink px-4 py-3 text-base text-paper outline-none transition focus:border-gold disabled:opacity-60 ${
                errors.studentClass ? "border-red-500/70" : "border-ink-line"
              }`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23D4AF37' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 1rem center",
              }}
              {...register("studentClass", {
                required: "Please select your class",
              })}
            >
              <option value="" disabled>
                Select your class
              </option>
              {CLASS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.studentClass && (
              <p id="class-error" className="mt-1.5 text-xs text-red-400">
                {errors.studentClass.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gold px-6 py-3.5 text-base font-semibold text-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSendingOtp ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                Sending OTP…
              </>
            ) : (
              <>
                Send OTP
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                  →
                </span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-paper/35">
            We&apos;ll text you a one-time code to confirm your number.
          </p>
        </div>

        {/* STEP 2: OTP */}
        <div className={step === "otp" ? "space-y-5" : "hidden"}>
          <p className="text-center text-sm text-paper/60">
            Enter the 6-digit code sent to{" "}
            <span className="font-medium text-paper">+91 {getValues("phone")}</span>
          </p>

          <div>
            <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-paper/80">
              OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              aria-invalid={!!errors.otp}
              aria-describedby={errors.otp ? "otp-error" : undefined}
              className={`w-full rounded-lg border bg-ink px-4 py-3 text-center text-lg tracking-[0.5em] text-paper placeholder:tracking-normal placeholder:text-paper/30 outline-none transition focus:border-gold ${
                errors.otp ? "border-red-500/70" : "border-ink-line"
              }`}
              {...(() => {
                const field = register("otp", {
                  required: "Enter the OTP sent to your phone",
                  pattern: { value: /^\d{6}$/, message: "OTP must be 6 digits" },
                  onChange: (e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  },
                });
                return {
                  ...field,
                  ref: (el: HTMLInputElement | null) => {
                    field.ref(el);
                    otpInputRef.current = el;
                  },
                };
              })()}
            />
            {errors.otp && (
              <p id="otp-error" className="mt-1.5 text-xs text-red-400">
                {errors.otp.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gold px-6 py-3.5 text-base font-semibold text-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isVerifying ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                Verifying…
              </>
            ) : (
              <>
                Verify &amp; Register
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                  →
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("details");
                setIsOtpVerified(false);
                setValue("otp", "");
                clearErrors("otp");
              }}
              className="text-paper/40 underline-offset-4 transition hover:text-gold hover:underline"
            >
              ← Edit number
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || isSendingOtp}
              className="text-paper/40 underline-offset-4 transition hover:text-gold hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </div>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
