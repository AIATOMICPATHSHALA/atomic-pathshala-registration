export default function SuccessIcon() {
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <span className="absolute inset-0 rounded-full border-2 border-gold animate-ring-grow" />
      <span className="absolute inset-0 rounded-full border-2 border-gold animate-ring-grow [animation-delay:0.4s]" />
      <div className="relative flex h-24 w-24 animate-pop items-center justify-center rounded-full bg-gold shadow-[0_0_40px_-6px_rgba(212,175,55,0.65)]">
        <svg
          width="44"
          height="44"
          viewBox="0 0 24 24"
          fill="none"
          className="text-ink"
        >
          <path
            d="M4 12.5L9.2 18L20 6"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="48"
            className="animate-draw-check"
          />
        </svg>
      </div>
    </div>
  );
}
