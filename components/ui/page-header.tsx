/** components/ui/page-header.tsx — Cabeçalho padrão (título, subtítulo, ação) usado no topo das páginas. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-[12.5px] text-ink-secondary">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
