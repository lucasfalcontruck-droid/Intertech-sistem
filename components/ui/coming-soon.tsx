/** components/ui/coming-soon.tsx — Placeholder exibido em telas/relatórios ainda não implementados. */
import type { ComponentType, SVGProps } from "react";
import { Card } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-[#a68bff]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-secondary">{description}</p>
    </Card>
  );
}
