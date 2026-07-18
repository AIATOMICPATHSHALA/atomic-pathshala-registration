import AtomOrbit from "./AtomOrbit";

const AGENDA = [
  "NEET Biology strategy",
  "Complete roadmap",
  "Study plan",
  "NCERT approach",
  "Doubt discussion",
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-10 pt-14 sm:pt-20">
      <AtomOrbit className="absolute left-1/2 top-6 h-[520px] w-[520px] -translate-x-1/2 opacity-70 sm:top-0" />

      <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-dim/50 bg-ink-soft/80 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-gold" />
          </span>
          Live on Google Meet
        </div>

        <p className="font-mono text-xs uppercase tracking-[0.35em] text-paper/40">
          Atomic Pathshala
        </p>

        <h1 className="mt-3 animate-fade-up font-display text-balance text-[2.15rem] font-semibold leading-[1.15] text-paper sm:text-5xl">
          Free Biology Strategy &amp;{" "}
          <span className="italic text-gold">Roadmap</span> Session
        </h1>

        <p className="mt-5 max-w-sm animate-fade-up text-[15px] leading-relaxed text-paper/60 [animation-delay:120ms]">
          Join an exclusive live Google Meet session where we&apos;ll cover:
        </p>

        <ul className="mt-4 flex w-full max-w-xs animate-fade-up flex-col gap-2 [animation-delay:200ms]">
          {AGENDA.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-lg border border-ink-line bg-ink-soft/60 px-4 py-2.5 text-left text-sm text-paper/85"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              {item}
            </li>
          ))}
        </ul>

        <a
          href="#register-form"
          className="mt-8 inline-flex w-full max-w-xs animate-fade-up items-center justify-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-base font-semibold text-ink shadow-[0_10px_30px_-8px_rgba(212,175,55,0.55)] transition hover:bg-gold-bright active:scale-[0.98] [animation-delay:280ms]"
        >
          Register Now
          <span aria-hidden="true">→</span>
        </a>

        <p className="mt-3 animate-fade-up text-xs text-paper/35 [animation-delay:320ms]">
          Takes less than 20 seconds · 100% free
        </p>
      </div>
    </section>
  );
}
