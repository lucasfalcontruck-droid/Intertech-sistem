# Intertech ERP

ERP web para a operação da Intertech em marketplaces (Mercado Livre, Shopee e TikTok Shop): vendas, estoque, financeiro e integrações, em um painel único.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- **Backend:** Route Handlers do Next.js
- **Banco de dados:** PostgreSQL + Prisma ORM
- **Autenticação:** NextAuth.js (Credentials + JWT)
- **Gráficos:** Recharts
- **Dados/estado:** TanStack Query (React Query)

## Estrutura de pastas

```
app/
  (auth)/login/        # tela de login (fora do shell autenticado)
  (app)/                # rotas protegidas (sidebar + topbar)
    dashboard/
    marketplace/
    estoque/
    financeiro/
    pedidos/
    relatorios/
    configuracoes/
  api/                  # route handlers (dashboard, marketplace, products, transactions...)
components/
  ui/                   # primitivos de design system (Badge, Card, KpiCard, Modal, ícones...)
  charts/               # gráficos Recharts
  layout/                # Sidebar, Topbar
  dashboard/ marketplace/ estoque/ financeiro/ auth/
hooks/                  # hooks React Query por domínio
lib/
  queries/              # camada de leitura/agregação (Prisma) usada pelas API routes
  marketplace/          # adapter layer dos marketplaces (mock hoje, plugável no futuro)
  validation/           # schemas Zod para as API routes
prisma/
  schema.prisma
  seed.ts
```

## Setup local

### 1. Pré-requisitos

- Node.js 20+
- PostgreSQL rodando localmente (ou acessível via `DATABASE_URL`)

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e ajuste:

```bash
cp .env.example .env
```

```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/intertech_erp?schema=public"
AUTH_SECRET="gere com: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

Crie o banco (se ainda não existir):

```bash
createdb intertech_erp
```

### 4. Rodar as migrations

```bash
npx prisma migrate dev
```

### 5. Popular o banco com dados de demonstração

```bash
npm run db:seed
```

Isso cria um usuário administrador, as 3 integrações de marketplace, ~34 produtos (incluindo os itens com estoque baixo/esgotado usados como referência), ~4.400 pedidos distribuídos nos últimos 30 dias (com os totais mensais de Mercado Livre/Shopee/TikTok Shop batendo com os valores de referência) e os lançamentos financeiros (contas a receber/pagar, DRE, histórico de 6 meses de fluxo de caixa).

### 6. Iniciar o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) — você será redirecionado para o login.

**Login de demonstração:**

- E-mail: `admin@intertech.com`
- Senha: `intertech123`

## Scripts disponíveis

| Comando                  | Descrição                                      |
| ------------------------- | ----------------------------------------------- |
| `npm run dev`              | Inicia o servidor de desenvolvimento             |
| `npm run build`            | Build de produção                                |
| `npm run start`            | Sobe o build de produção                         |
| `npm run lint`             | ESLint                                           |
| `npm run format`           | Formata o projeto com Prettier                   |
| `npm run prisma:migrate`   | Roda `prisma migrate dev`                        |
| `npm run prisma:studio`    | Abre o Prisma Studio                             |
| `npm run db:seed`          | Popula o banco com dados de demonstração         |

## Módulos

- **Dashboard:** KPIs do dia (vendas, pedidos, ticket médio, estoque baixo), vendas por plataforma, participação por canal, evolução diária, estoque baixo e pedidos recentes.
- **Marketplace:** cards de integração por canal (status, vendas, taxa, repasse líquido), sincronização mock, evolução de 6 meses e comparativo de canais.
- **Estoque:** KPIs, filtros, CRUD completo de produtos (criar/editar/excluir/ajustar estoque) e giro de estoque por categoria.
- **Financeiro:** KPIs, fluxo de caixa (6 meses), contas a receber/pagar com CRUD e "marcar como pago", e DRE simplificado calculado a partir dos lançamentos.
- **Pedidos / Configurações / Relatórios:** módulos complementares (listagem de pedidos com filtros, dados da empresa/usuários/integrações, e um placeholder para relatórios avançados).

## Camada de integração com marketplaces

`lib/marketplace/` define uma interface (`MarketplaceAdapter`) com `getSales()`, `getOrders()` e `syncInventory()`, hoje implementada sobre os dados seedados no banco (`SeedBackedMarketplaceAdapter`). Para integrar com as APIs reais do Mercado Livre, Shopee e TikTok Shop no futuro, basta criar uma nova implementação dessa interface por plataforma — nenhuma tela ou rota precisa mudar.

### Conexão real com o Mercado Livre (OAuth)

Já existe um fluxo OAuth2 completo para conectar a conta real do Mercado Livre (independente do adapter mock acima):

1. Crie uma aplicação em [developers.mercadolivre.com.br/devcenter](https://developers.mercadolivre.com.br/devcenter) com **Redirect URI** = `http://localhost:3000/api/marketplace/mercadolivre/callback` e escopos `read` + `offline_access`.
2. Preencha no `.env`:
   ```
   MERCADOLIVRE_CLIENT_ID="..."
   MERCADOLIVRE_CLIENT_SECRET="..."
   MERCADOLIVRE_REDIRECT_URI="http://localhost:3000/api/marketplace/mercadolivre/callback"
   ```
3. Na tela **Marketplace**, clique em "Configurar" no card do Mercado Livre — você será redirecionado para autorizar o app na sua conta real.
4. Depois de autorizar, use "Testar conexão real" para confirmar (busca seus dados reais de usuário e os últimos pedidos via `GET /api/marketplace/mercadolivre/test`).

Implementação em `lib/marketplace/mercadolivre-client.ts` (chamadas à API real), `lib/marketplace/mercadolivre-auth.ts` (renovação automática de token) e `app/api/marketplace/mercadolivre/*` (rotas de connect/callback/test). Os tokens ficam salvos em `PlatformIntegration.credentials`.

Isso **conecta e autentica** a conta — ainda não importa os pedidos reais para dentro do Dashboard/Estoque (que hoje continuam lendo os dados seedados). Isso é um próximo passo natural, caso façam sentido para o negócio.

## Notas de segurança

- Nenhuma credencial é commitada: `.env` está no `.gitignore`, use `.env.example` como referência.
- Todas as rotas internas são protegidas por middleware (`middleware.ts`) que exige sessão autenticada; chamadas de API sem sessão recebem `401`.
