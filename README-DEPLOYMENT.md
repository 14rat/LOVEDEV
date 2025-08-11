# Deployment Guide - Vercel

Este projeto está configurado para deployment na Vercel com sistema de subdomínios funcionando perfeitamente.

## 🚀 Deployment na Vercel

### Pré-requisitos
1. Conta na Vercel
2. Banco de dados Neon PostgreSQL configurado
3. Variáveis de ambiente configuradas

### Passos para Deploy

1. **Conectar o repositório à Vercel**
   - Importe o projeto no dashboard da Vercel
   - Conecte ao seu repositório Git

2. **Configurar variáveis de ambiente na Vercel**
   ```
   DATABASE_URL=sua_url_do_neon_aqui
   NODE_ENV=production
   BASE_DOMAIN=seu-app.vercel.app
   MAX_FILE_SIZE=5242880
   ```

3. **Build e Deploy**
   - A Vercel fará o build automaticamente usando `npm run build`
   - O projeto será deployado em `https://seu-app.vercel.app`

## 🌐 Sistema de Subdomínios

### Como funciona na Vercel

1. **App principal**: `https://seu-app.vercel.app`
   - Interface de administração
   - Criação e edição de projetos

2. **Sites românticos**: `https://slug-do-projeto.seu-app.vercel.app`
   - Cada projeto publicado fica acessível em seu próprio subdomínio
   - Exemplo: `https://joao-maria.seu-app.vercel.app`

### Configuração de Domínio Personalizado (Opcional)

1. **Adicionar domínio customizado na Vercel**
   - Vá em Settings > Domains
   - Adicione seu domínio (ex: `meusite.com`)

2. **Configurar DNS**
   - Configure um wildcard A record: `*.meusite.com`
   - Aponte para os servidores da Vercel

3. **Atualizar variável BASE_DOMAIN**
   ```
   BASE_DOMAIN=meusite.com
   ```

## 📁 Estrutura de Build

```
dist/
├── index.js              # Servidor Node.js compilado
└── public/               # Frontend buildado
    ├── index.html
    └── assets/
        ├── index-[hash].css
        └── index-[hash].js
```

## 🔧 Arquivos de Configuração

- `vercel.json` - Configuração de rotas e build para Vercel
- `package.json` - Scripts de build configurados
- `vite.config.ts` - Configuração do Vite para build

## 🧪 Testar Localmente

```bash
# Build do projeto
npm run build

# Testar a versão de produção localmente
NODE_ENV=production node dist/index.js
```

## 📊 Monitoramento

A aplicação inclui:
- Health check endpoint: `/api/health`
- Logs estruturados para debugging
- Analytics básicos de visitas

## 🔒 Segurança

- Rate limiting configurado
- Headers de segurança
- Validação de input
- Sanitização XSS

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs da Vercel
2. Confirme as variáveis de ambiente
3. Teste o build localmente primeiro