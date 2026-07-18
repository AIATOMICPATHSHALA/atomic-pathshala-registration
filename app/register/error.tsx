"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold/80">
        Something went wrong
      </p>
      <h1 className="font-display text-2xl font-semibold text-paper">
        We couldn&apos;t load this page
      </h1>
      <p className="max-w-xs text-sm text-paper/60">
        Please try again. If the problem continues, refresh the page.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-bright"
      >
        Try again
      </button>
    </div>
  );
}
