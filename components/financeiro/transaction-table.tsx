"use client";

import { TransactionStatus } from "@prisma/client";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { IconCheck, IconTrash } from "@/components/ui/icons";
import { EmptyState } from "@/components/ui/state";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

const STATUS_BADGE: Record<TransactionStatus, { variant: BadgeVariant; label: string }> = {
  PENDENTE: { variant: "pending", label: "Pendente" },
  A_VENCER: { variant: "low", label: "A vencer" },
  PAGO: { variant: "paid", label: "Pago" },
};

export function TransactionTable({
  transactions,
  descriptionHeader,
  onMarkPaid,
  onDelete,
}: {
  transactions: Transaction[];
  descriptionHeader: string;
  onMarkPaid: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (transactions.length === 0) {
    return <EmptyState message="Nenhum lançamento cadastrado." />;
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border">
          {[descriptionHeader, "Valor", "Vencimento", "Status", ""].map((h) => (
            <th
              key={h}
              className="px-3 pb-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {transactions.map((t) => (
          <tr key={t.id} className="border-b border-white/4 last:border-none hover:bg-white/2">
            <td className="px-3 py-3.5 text-sm">{t.description}</td>
            <td className="px-3 py-3.5 text-sm">{formatCurrency(t.amount)}</td>
            <td className="px-3 py-3.5 text-sm text-ink-secondary">{formatDate(t.dueDate)}</td>
            <td className="px-3 py-3.5">
              <Badge variant={STATUS_BADGE[t.status].variant}>{STATUS_BADGE[t.status].label}</Badge>
            </td>
            <td className="px-3 py-3.5">
              <div className="flex justify-end gap-1.5">
                {t.status !== TransactionStatus.PAGO && (
                  <button
                    onClick={() => onMarkPaid(t.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-success/10 hover:text-success"
                    aria-label="Marcar como pago"
                    title="Marcar como pago"
                  >
                    <IconCheck className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(t.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-danger/10 hover:text-danger"
                  aria-label="Excluir"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
