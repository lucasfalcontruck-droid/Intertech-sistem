import { PageHeader } from "@/components/ui/page-header";
import { ComingSoon } from "@/components/ui/coming-soon";
import { IconReports } from "@/components/ui/icons";

/** app/(app)/relatorios/page.tsx — Índice de Relatórios (placeholder "em breve"; os relatórios reais vivem nas subpáginas). */
export default function RelatoriosPage() {
  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Relatórios consolidados da operação" />
      <ComingSoon
        icon={IconReports}
        title="Relatórios avançados em breve"
        description="Os dados consolidados de vendas, estoque e financeiro já estão disponíveis no Dashboard. Exportações e relatórios customizados chegam em uma próxima versão."
      />
    </div>
  );
}
