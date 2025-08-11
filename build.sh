#!/bin/bash

# Script de build personalizado para Vercel
echo "🔨 Iniciando build do projeto..."

# Build do frontend com Vite
echo "📦 Building frontend..."
npm run build

# Criar diretório dist se não existir
mkdir -p dist

# Build do backend com esbuild
echo "🚀 Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "✅ Build concluído com sucesso!"