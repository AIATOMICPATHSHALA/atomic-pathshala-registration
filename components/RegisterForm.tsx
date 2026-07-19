"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Toast from "./Toast";
import { registerStudent, ApiError } from "@/lib/api";
import type { RegistrationFormValues, StudentClass } from "@/lib/types";

const CLASS_OPTIONS: StudentClass[] = ["Class 11", "Class 12", "Dropper"];
const SESSION_STORAGE_KEY = "atomic_pathshala_session";

export default function RegisterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormValues>({
    mode: "onTouched",
    defaultValues: { name: "", phone: "", studentClass: "" },
  });

  const onSubmit = async (values: RegistrationFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const session = await registerStudent({
        name: values.name.trim(),
        phone: values.phone.trim(),
        class: values.studentClass as StudentClass,
        timestamp: new Date().toISOString(),
      });

      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      setToast({ message: "Registered successfully. Redirecting...", variant: "success" });
      router.push("/register/success");
    } catch (err) {
      setToast({
        message: err instanceof ApiError ? err.message : "Something went wrong. Please try again.",
        variant: "error",
      });
      setIsSubmitting(false);
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
            Reserve your spot
          </h2>
        </div>

        <div className="space-y-5">
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
              disabled={isSubmitting}
              className={`w-full rounded-lg border bg-ink px-4 py-3 text-base text-paper placeholder:text-paper/30 outline-none transition focus:border-gold disabled:opacity-60 ${
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            type="submit"
            disabled={isSubmitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gold px-6 py-3.5 text-base font-semibold text-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                Registering...
              </>
            ) : (
              <>
                Register Now
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">
                  -&gt;
                </span>
              </>
            )}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-paper/35">
            Your details will be saved for the live session.
          </p>
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
