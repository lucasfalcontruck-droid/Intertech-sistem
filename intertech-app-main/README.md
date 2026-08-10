# Intertech Vendedor de Rua

App para o vendedor de rua registrar pedidos com fluxo offline-first, **vinculado ao sistema principal da Intertech** (SISTEMA DEFINITIVO): o catálogo e o estoque exibidos são os reais, e todo pedido feito aqui é criado lá — no canal "Vendedor de Rua" — e desconta o estoque de verdade.

## Funcionalidades

- Registro de pedidos (multi-produto) pelo vendedor, em qualquer condição de rede.
- Catálogo e estoque puxados em tempo real do sistema principal da Intertech.
- Persistência local em `localStorage` para fila offline.
- Sincronização automática ao voltar online — os pedidos da fila são enviados ao sistema principal.
- Todo pedido registrado aqui aparece no sistema principal (tela Pedidos, canal "Vendedor de Rua") e desconta o estoque real dos produtos vendidos.

## Execução

1. Copie `.env.example` para `.env`.
2. Preencha `INTERTECH_API_URL` com o endereço do sistema principal (ex.: `http://localhost:3000`, ou a URL do túnel/deploy quando o vendedor não estiver na mesma rede) e `INTERTECH_API_KEY` com **a mesma chave** configurada em `VENDEDOR_APP_API_KEY` no `.env` do sistema principal.
3. Instale dependências:
   `npm install`
4. Inicie o app:
   `npm run dev`

O banco SQLite local (`DATABASE_URL`, `prisma/`) não é mais usado pelo catálogo nem pelos pedidos — ficou só como resquício do protótipo original. Pode ignorar os passos de `prisma generate`/`migrate`/`seed`.

## Arquitetura

- `app/page.tsx`: tela principal do vendedor (catálogo, carrinho, fila offline).
- `app/api/products/route.ts`: repassa o catálogo real do sistema principal.
- `app/api/orders/route.ts`: registra um pedido online no sistema principal.
- `app/api/orders/sync/route.ts`: sincroniza a fila offline com o sistema principal.
- `lib/order-service.ts`: monta e envia o pedido para o sistema principal.
- `lib/intertech-client.ts`: cliente HTTP autenticado (por chave) que fala com o sistema principal.

## Do lado do sistema principal (SISTEMA DEFINITIVO)

- `app/api/integrations/vendedor/products/route.ts`: expõe o catálogo real (autenticado por chave).
- `app/api/integrations/vendedor/orders/route.ts`: recebe o pedido, valida estoque, cria o `Order`/`OrderItem` (`platform: VENDEDOR_RUA`) e desconta o estoque numa transação atômica.
- `lib/integrations/vendedor-auth.ts`: confere a chave (`VENDEDOR_APP_API_KEY`) no header `x-vendedor-api-key`.
