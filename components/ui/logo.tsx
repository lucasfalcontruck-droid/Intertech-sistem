/** components/ui/logo.tsx — Logo da Intertech, com largura calculada a partir da altura. */
import Image from "next/image";

const ASPECT_RATIO = 769 / 159;

export function Logo({ className, height = 26 }: { className?: string; height?: number }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="intertech"
      width={Math.round(height * ASPECT_RATIO)}
      height={height}
      priority
      className={className}
    />
  );
}
