import { Card } from "@/components/ui/card";
import { IconReports } from "@/components/ui/icons";

export default function RelatoriosPage() {
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-ink">Relatórios</h2>
        <p className="mt-1 text-[12.5px] text-ink-secondary">Relatórios consolidados da operação</p>
      </div>

      <Card className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-[#a68bff]">
          <IconReports className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-ink">Relatórios avançados em breve</h3>
        <p className="max-w-sm text-sm text-ink-secondary">
          Os dados consolidados de vendas, estoque e financeiro já estão disponíveis no Dashboard.
          Exportações e relatórios customizados chegam em uma próxima versão.
        </p>
      </Card>
    </div>
  );
}
