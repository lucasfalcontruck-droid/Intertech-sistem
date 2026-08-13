"use client";

import { useState } from "react";
import Link from "next/link";
import { Platform } from "@prisma/client";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useAddStore } from "@/hooks/marketplace/use-marketplace";

/**
 * components/marketplace/add-store-modal.tsx — Botão "Conectar nova loja":
 * Mercado Livre, Shopee e TikTok Shop usam OAuth real (login direto na
 * plataforma). Vendedor de Rua não é uma plataforma externa — é o app
 * próprio da equipe de rua — então continua manual (nome + taxa).
 */
function OAuthOption({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <div className="mb-3 rounded-xl border border-border bg-card-2 p-4">
      <p className="mb-2.5 text-[12.5px] font-semibold text-ink">{title}</p>
      <p className="mb-3 text-[11.5px] leading-relaxed text-ink-muted">{description}</p>
      <Link
        href={href}
        className="flex items-center justify-center rounded-[10px] border border-border bg-white/6 px-4 py-2.5 text-[13px] font-semibold text-ink hover:bg-white/10"
      >
        Conectar com {title}
      </Link>
    </div>
  );
}

export function AddStoreModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [storeName, setStoreName] = useState("");
  const [feePercentage, setFeePercentage] = useState("");
  const addStore = useAddStore();

  function handleClose() {
    addStore.reset();
    setStoreName("");
    setFeePercentage("");
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addStore.mutate(
      { platform: Platform.VENDEDOR_RUA, storeName, feePercentage: Number(feePercentage) },
      { onSuccess: handleClose },
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Conectar nova loja">
      <OAuthOption
        title="Mercado Livre"
        description="Pode conectar quantas contas quiser, uma por vez — cada login cria uma loja."
        href="/api/marketplace/mercadolivre/connect"
      />
      <OAuthOption
        title="Shopee"
        description="Faça login com a conta da loja que quer conectar."
        href="/api/marketplace/shopee/connect"
      />
      <OAuthOption
        title="TikTok Shop"
        description="Faça login com a conta da loja que quer conectar."
        href="/api/marketplace/tiktok/connect"
      />

      <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-3.5 border-t border-border pt-4">
        <p className="text-[12.5px] font-semibold text-ink">Vendedor de Rua</p>
        <p className="-mt-2 text-[11.5px] leading-relaxed text-ink-muted">
          Não é um marketplace externo — é o app próprio da equipe de rua. Adicione manualmente.
        </p>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
            Nome/apelido
          </label>
          <input
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="Ex.: Equipe Zona Sul"
            className="w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
            Taxa (%) — normalmente 0
          </label>
          <input
            required
            type="number"
            min={0}
            max={100}
            step="0.1"
            value={feePercentage}
            onChange={(e) => setFeePercentage(e.target.value)}
            placeholder="Ex.: 0"
            className="w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent"
          />
        </div>

        {addStore.isError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
            {addStore.error.message}
          </div>
        )}

        <div className="mt-1 flex justify-end gap-2.5">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={addStore.isPending}>
            {addStore.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
