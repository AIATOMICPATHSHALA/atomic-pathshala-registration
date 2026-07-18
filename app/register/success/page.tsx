"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AtomOrbit from "@/components/AtomOrbit";
import SuccessIcon from "@/components/SuccessIcon";
import type { SessionInfo } from "@/lib/types";

/**
 * Fallback session details — used only if someone opens this page directly
 * without completing registration (so the page never renders blank).
 * The real values are auto-generated per session by the Apps Script backend
 * (via the Google Calendar API) and handed off from the registration step.
 */
const FALLBACK_SESSION: SessionInfo = {
  meetLink: "https://meet.google.com/xxx-xxxx-xxx",
  date: "Sunday, 27 July 2026",
  time: "7:00 PM – 8:30 PM IST",
};

const SESSION_STORAGE_KEY = "atomic_pathshala_session";

const INSTRUCTIONS = [
  "Join 10 minutes early",
  "Keep your microphone muted",
  "Keep notebook and pen ready",
];

export default function SuccessPage() {
  const [session, setSession] = useState<SessionInfo>(FALLBACK_SESSION);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) setSession(JSON.parse(stored));
    } catch {
      // ignore malformed/missing storage, fallback stays in place
    }
  }, []);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-ink bg-grain px-5 py-16">
      <AtomOrbit className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 opacity-40" />

      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <SuccessIcon />

        <h1 className="mt-7 font-display text-3xl font-semibold text-paper sm:text-4xl">
          Registration Successful 🎉
        </h1>

        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-paper/60">
          Thank you for registering. You are successfully registered for the
          Biology Strategy Session.
        </p>

        <div className="mt-8 grid w-full grid-cols-2 gap-3">
          <div className="rounded-xl border border-ink-line bg-ink-soft/70 px-4 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">
              Session date
            </p>
            <p className="mt-1.5 text-sm font-medium text-paper">{session.date}</p>
          </div>
          <div className="rounded-xl border border-ink-line bg-ink-soft/70 px-4 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">
              Session time
            </p>
            <p className="mt-1.5 text-sm font-medium text-paper">{session.time}</p>
          </div>
        </div>

        <a
          href={session.meetLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-gold px-6 py-4 text-base font-semibold text-ink shadow-[0_10px_30px_-8px_rgba(212,175,55,0.55)] transition hover:bg-gold-bright active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6.5C3 5.67 3.67 5 4.5 5H13.5C14.33 5 15 5.67 15 6.5V17.5C15 18.33 14.33 19 13.5 19H4.5C3.67 19 3 18.33 3 17.5V6.5Z"
              fill="currentColor"
            />
            <path d="M16.5 9.5L21 6.5V17.5L16.5 14.5V9.5Z" fill="currentColor" />
          </svg>
          Join Google Meet
        </a>

        <div className="mt-10 w-full rounded-xl border border-ink-line bg-ink-soft/60 p-5 text-left">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-gold/80">
            Important instructions
          </p>
          <ul className="space-y-2.5">
            {INSTRUCTIONS.map((instruction) => (
              <li key={instruction} className="flex items-start gap-3 text-sm text-paper/80">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/register"
          className="mt-8 text-xs text-paper/40 underline-offset-4 transition hover:text-gold hover:underline"
        >
          Back to registration page
        </Link>
      </div>
    </main>
  );
}
