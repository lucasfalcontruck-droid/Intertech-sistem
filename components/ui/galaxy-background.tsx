/**
 * components/ui/galaxy-background.tsx — Fundo animado (blobs + estrelas) usado
 * na tela de login e na landing page.
 */

/** Deterministic pseudo-random in [0, 1), stable across server and client renders. */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const STAR_COUNT = 140;
const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  top: seeded(i * 3.1) * 100,
  left: seeded(i * 7.7 + 1) * 100,
  size: 1 + seeded(i * 5.3 + 2) * 1.6,
  duration: 2.5 + seeded(i * 2.1 + 3) * 3.5,
  delay: seeded(i * 4.4 + 4) * 5,
  minOpacity: 0.1 + seeded(i * 6.6 + 5) * 0.2,
  maxOpacity: 0.6 + seeded(i * 8.8 + 6) * 0.4,
}));

export function GalaxyBackground({
  className,
  fixed = false,
}: {
  className?: string;
  fixed?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none inset-0 overflow-hidden ${fixed ? "fixed" : "absolute"} ${className ?? ""}`}
    >
      <div className="animate-blob absolute -left-1/4 top-[-10%] h-[55%] w-[55%] rounded-full bg-[#4b3bef] opacity-25 blur-[110px]" />
      <div
        className="animate-blob absolute right-[-15%] top-[15%] h-[45%] w-[45%] rounded-full bg-[#7c5cff] opacity-20 blur-[110px]"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="animate-blob absolute bottom-[-15%] left-[15%] h-[50%] w-[50%] rounded-full bg-[#241a5e] opacity-40 blur-[110px]"
        style={{ animationDelay: "8s" }}
      />

      {stars.map((star, i) => (
        <span
          key={i}
          className="animate-twinkle absolute rounded-full bg-white"
          style={
            {
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              "--twinkle-min": star.minOpacity,
              "--twinkle-max": star.maxOpacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
