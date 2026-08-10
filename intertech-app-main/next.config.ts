import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  // Fixa a raiz do projeto aqui mesmo: como esta pasta vive dentro do
  // repositório do sistema principal (que tem seu próprio package-lock.json),
  // o Next.js tentava adivinhar a raiz errado e misturava os dois projetos.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
