import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold/80">404</p>
      <h1 className="font-display text-2xl font-semibold text-paper">Page not found</h1>
      <p className="max-w-xs text-sm text-paper/60">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/register"
        className="mt-2 rounded-lg bg-gold px-6 py-3 text-sm font-semibold text-ink transition hover:bg-gold-bright"
      >
        Go to registration
      </Link>
    </div>
  );
}
