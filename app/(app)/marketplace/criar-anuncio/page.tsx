"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { ProductForm } from "@/components/estoque/product-form";
import { useCreateProduct } from "@/hooks/estoque/use-products";
import type { ProductFormInput } from "@/hooks/estoque/use-products";

/** app/(app)/marketplace/criar-anuncio/page.tsx — Formulário de criação de um novo anúncio (produto). */
export default function CriarAnuncioPage() {
  const router = useRouter();
  const createMutation = useCreateProduct();

  function handleSubmit(input: ProductFormInput) {
    createMutation.mutate(input, {
      onSuccess: () => router.push("/marketplace/anuncios"),
    });
  }

  return (
    <div>
      <PageHeader title="Criar anúncio" subtitle="Publicar um novo anúncio direto pelo sistema" />

      <Card className="max-w-2xl">
        <CardHeader
          title="Dados do anúncio"
          subtitle="O anúncio criado aqui já aparece em Estoque e em Anúncios"
        />
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/marketplace/anuncios")}
          submitting={createMutation.isPending}
          errorMessage={createMutation.error?.message}
        />
      </Card>
    </div>
  );
}
