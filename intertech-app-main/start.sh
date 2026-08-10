#!/bin/bash

echo "🚀 Iniciando ambiente de desenvolvimento Intertech..."
echo "----------------------------------------------------"

# 1. Garantir que o serviço do PostgreSQL está rodando
if ! systemctl is-active --quiet postgresql; then
    echo "🐘 PostgreSQL está parado. Subindo o serviço..."
    sudo systemctl start postgresql
else
    echo "✅ PostgreSQL já está rodando."
fi

# 2. Gerar o cliente do Prisma
echo "📦 Gerando o Prisma Client..."
npx prisma generate

# 3. Aplicar migrações pendentes no banco
echo "🗄️ Verificando migrações do banco de dados..."
npx prisma migrate dev

# 4. Iniciar o servidor de desenvolvimento do Next.js
echo "💻 Iniciando o servidor Next.js..."
echo "----------------------------------------------------"
npm run dev
