#!/bin/bash

# Script para fazer upload do projeto para GitHub
# Usando token de acesso pessoal

echo "Iniciando upload para GitHub..."

# Criar uma pasta temporária para o novo repositório
rm -rf /tmp/lovedev_upload
mkdir -p /tmp/lovedev_upload
cd /tmp/lovedev_upload

# Inicializar novo repositório Git
git init

# Configurar credenciais
git config user.name "14rat"
git config user.email "14rat@github.com"

# Copiar todos os arquivos do projeto (exceto .git, node_modules, etc.)
echo "Copiando arquivos do projeto..."
cp -r /home/runner/workspace/* . 2>/dev/null || true
cp /home/runner/workspace/.* . 2>/dev/null || true

# Remover arquivos desnecessários
echo "Removendo arquivos desnecessários..."
rm -rf .git node_modules dist build .next *.log __pycache__ .venv .DS_Store .vscode LoveSiteGen.zip upload_to_github.sh .cache .local .upm 2>/dev/null || true

# Verificar se os arquivos foram copiados
echo "Arquivos copiados:"
ls -la

# Adicionar todos os arquivos
echo "Adicionando arquivos ao Git..."
git add .

# Verificar status
echo "Status do Git:"
git status

# Fazer commit inicial
echo "Fazendo commit..."
git commit -m "Upload inicial do projeto LOVEDEV - MVP de sites românticos personalizados"

# Adicionar repositório remoto com token
echo "Configurando repositório remoto..."
git remote add origin https://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@github.com/14rat/LOVEDEV.git

# Fazer push para o repositório
echo "Fazendo push para GitHub..."
git branch -M main
git push -u origin main --force

echo "Upload concluído com sucesso!"
echo "Seu projeto está agora disponível em: https://github.com/14rat/LOVEDEV"