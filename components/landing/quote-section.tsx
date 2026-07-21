import { initials } from "@/lib/utils";

export function QuoteSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center sm:p-14">
        <p className="text-[19px] font-medium leading-relaxed text-ink sm:text-[22px]">
          &ldquo;Construímos esse sistema para ter clareza total da operação — vendas, estoque e
          financeiro em um só lugar, sem depender de planilhas.&rdquo;
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <div className="bg-accent-gradient flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-bold text-white">
            {initials("Lucas Falcon")}
          </div>
          <div className="text-left">
            <div className="text-[13px] font-semibold text-ink">Lucas Falcon</div>
            <div className="text-[11.5px] text-ink-muted">Fundador, Intertech</div>
          </div>
        </div>
      </div>
    </section>
  );
}
