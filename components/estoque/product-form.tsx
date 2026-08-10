"use client";

import { useState } from "react";
import { Platform } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { PLATFORM_LABEL } from "@/components/ui/platform-chip";
import type { Product } from "@/lib/types";
import type { ProductFormInput } from "@/hooks/estoque/use-products";

const ALL_PLATFORMS: Platform[] = [Platform.MERCADO_LIVRE, Platform.SHOPEE, Platform.TIKTOK_SHOP];

const inputClass =
  "w-full rounded-[10px] border border-border bg-card-2 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent";
const labelClass = "mb-1.5 block text-xs font-semibold text-ink-secondary";

/** components/estoque/product-form.tsx — Formulário de criação/edição de produto acabado. */
export function ProductForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  errorMessage,
}: {
  initial?: Product;
  onSubmit: (input: ProductFormInput) => void;
  onCancel: () => void;
  submitting: boolean;
  errorMessage?: string | null;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial?.price.toString() ?? "");
  const [stock, setStock] = useState(initial?.stock.toString() ?? "0");
  const [minStock, setMinStock] = useState(initial?.minStock.toString() ?? "0");
  const [costPrice, setCostPrice] = useState(initial?.costPrice?.toString() ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [channels, setChannels] = useState<Platform[]>(initial?.channels ?? []);

  function toggleChannel(platform: Platform) {
    setChannels((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      name,
      sku,
      category,
      price: Number(price),
      stock: Number(stock),
      minStock: Number(minStock),
      costPrice: costPrice ? Number(costPrice) : null,
      location: location || null,
      channels,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className={labelClass}>Nome do produto</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>SKU</label>
          <input
            className={inputClass}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Categoria</label>
          <input
            className={inputClass}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            list="category-suggestions"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Preço (R$)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Estoque atual</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Estoque mínimo</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="1"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Custo unitário (R$)</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div>
          <label className={labelClass}>Localização no estoque</label>
          <input
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex: Galpão A - Prateleira 3"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Canais vinculados</label>
        <div className="flex flex-wrap gap-2">
          {ALL_PLATFORMS.map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => toggleChannel(platform)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                channels.includes(platform)
                  ? "border-accent bg-accent/20 text-ink"
                  : "border-border bg-card-2 text-ink-secondary"
              }`}
            >
              {PLATFORM_LABEL[platform]}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-[12.5px] text-danger">
          {errorMessage}
        </div>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Salvando..." : initial ? "Salvar alterações" : "Criar produto"}
        </Button>
      </div>
    </form>
  );
}
