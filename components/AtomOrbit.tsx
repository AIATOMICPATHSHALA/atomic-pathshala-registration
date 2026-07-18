export default function AtomOrbit({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
    >
      <div className="relative h-full w-full">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 animate-orbit rounded-full border border-gold-dim/40 [transform-style:preserve-3d]">
          <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-bright shadow-[0_0_10px_2px_rgba(232,199,102,0.6)]" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 animate-orbit-reverse rounded-full border border-gold-dim/30" style={{ transform: "translate(-50%, -50%) rotate(58deg)" }}>
          <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold shadow-[0_0_10px_2px_rgba(212,175,55,0.55)]" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 animate-orbit-fast rounded-full border border-gold-dim/50" style={{ transform: "translate(-50%, -50%) rotate(-40deg)" }}>
          <span className="absolute -top-[3px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-gold-bright shadow-[0_0_10px_2px_rgba(232,199,102,0.6)]" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_24px_6px_rgba(212,175,55,0.45)]" />
      </div>
    </div>
  );
}
