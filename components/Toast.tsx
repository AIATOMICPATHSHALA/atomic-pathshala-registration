"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  variant?: "success" | "error";
  onClose: () => void;
}

export default function Toast({ message, variant = "error", onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4200);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = variant === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-sm animate-fade-up items-start gap-3 rounded-xl border bg-ink-raised/95 px-4 py-3.5 shadow-2xl backdrop-blur sm:inset-x-auto sm:right-6"
      style={{
        borderColor: isError ? "#5A2A2A" : "#8A7128",
        backgroundColor: "#1C1C1CF2",
      }}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          isError ? "bg-red-500/15 text-red-400" : "bg-gold/15 text-gold"
        }`}
      >
        {isError ? "!" : "✓"}
      </span>
      <p className="text-sm leading-snug text-paper/90">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss notification"
        className="ml-auto text-paper/40 transition hover:text-paper"
      >
        ✕
      </button>
    </div>
  );
}
