/** components/landing/stats-bar.tsx — Faixa de estatísticas em destaque na landing page. */
const STATS = [
  { value: "3", label: "canais de venda integrados" },
  { value: "+4.400", label: "pedidos monitorados por mês" },
  { value: "R$ 486k+", label: "em vendas mensais consolidadas" },
  { value: "100%", label: "dos dados em um só lugar" },
];

export function StatsBar() {
  return (
    <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-8 border-y border-white/5 px-6 py-10 sm:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="text-center sm:text-left">
          <div className="text-2xl font-extrabold text-ink sm:text-3xl">{stat.value}</div>
          <div className="mt-1 text-[12.5px] leading-snug text-ink-secondary">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
