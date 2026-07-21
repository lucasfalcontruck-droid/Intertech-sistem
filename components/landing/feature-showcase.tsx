import { IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function FeatureShowcase({
  id,
  eyebrow,
  title,
  highlight,
  bullets,
  visual,
  reverse = false,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  highlight: string;
  bullets: string[];
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section id={id} className="px-6 py-16">
      <div
        className={cn(
          "mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2",
          reverse && "md:[&>*:first-child]:order-2",
        )}
      >
        <div className="animate-fade-in-up">
          <div className="mb-3 text-[11.5px] font-bold uppercase tracking-wider text-[#a68bff]">
            {eyebrow}
          </div>
          <h2 className="text-[26px] font-extrabold leading-tight text-ink sm:text-[30px]">
            {title} <span className="text-gradient-accent">{highlight}</span>
          </h2>
          <ul className="mt-6 flex flex-col gap-3.5">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5 text-[14px] text-ink-secondary">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <IconCheck className="h-3 w-3" />
                </span>
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-in-up flex justify-center" style={{ animationDelay: "0.1s" }}>
          {visual}
        </div>
      </div>
    </section>
  );
}
