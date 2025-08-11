#!/bin/bash

# Script melhorado para fazer upload do projeto para GitHub

echo "=== Iniciando upload para GitHub ==="

# Remover pasta temporária se existir
rm -rf /tmp/lovedev_repo
mkdir -p /tmp/lovedev_repo

echo "Copiando arquivos do projeto..."
# Copiar arquivos principais
cp /home/runner/workspace/*.* /tmp/lovedev_repo/ 2>/dev/null || true
cp -r /home/runner/workspace/client /tmp/lovedev_repo/ 2>/dev/null || true
cp -r /home/runner/workspace/server /tmp/lovedev_repo/ 2>/dev/null || true
cp -r /home/runner/workspace/shared /tmp/lovedev_repo/ 2>/dev/null || true
cp -r /home/runner/workspace/migrations /tmp/lovedev_repo/ 2>/dev/null || true

# Ir para o diretório do projeto
cd /tmp/lovedev_repo

echo "Arquivos copiados:"
ls -la

# Inicializar Git
echo "Inicializando repositório Git..."
git init

# Configurar Git
echo "Configurando Git..."
git config user.name "14rat"
git config user.email "14rat@users.noreply.github.com"

# Adicionar arquivos
echo "Adicionando arquivos..."
git add .

# Verificar o que foi adicionado
echo "Status do repositório:"
git status --short

# Fazer commit
echo "Fazendo commit..."
if git commit -m "Upload inicial: MVP de sites românticos personalizados com Node.js e React

- Sistema de autenticação com Supabase
- Roteamento dinâmico por subdomínios 
- Frontend React com Tailwind CSS
- Backend Node.js/Express
- Banco de dados PostgreSQL com Drizzle ORM
- Upload de imagens e geração de sites personalizados"; then
    echo "Commit realizado com sucesso!"
else
    echo "Erro no commit. Verificando se há arquivos para adicionar..."
    git status
    exit 1
fi

# Configurar remote
echo "Configurando repositório remoto..."
git remote add origin https://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@github.com/14rat/LOVEDEV.git

# Push para GitHub
echo "Enviando para GitHub..."
git branch -M main
if git push -u origin main --force; then
    echo "=== SUCESSO! ==="
    echo "Projeto enviado para: https://github.com/14rat/LOVEDEV"
    echo "Você pode agora acessar seu repositório no GitHub!"
else
    echo "Erro ao fazer push. Verificando detalhes..."
    git remote -v
    git log --oneline
fi