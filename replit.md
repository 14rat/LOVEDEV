# LoveDev - Plataforma de Sites Românticos Personalizados

## Visão Geral do Projeto
LoveDev é uma plataforma completa para criar sites românticos personalizados com roteamento dinâmico por subdomínio e autenticação Supabase. Permite aos usuários criar e personalizar sites românticos únicos com cores, imagens e conteúdo personalizados.

## Arquitetura do Projeto

### Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Autenticação**: Supabase Auth
- **Roteamento**: Wouter (frontend) + Express (backend)
- **UI Components**: Radix UI + shadcn/ui + Lucide React
- **Styling**: Tailwind CSS + CSS Variables para tema

### Estrutura de Diretórios
```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários e configurações
│   │   └── hooks/         # Custom hooks
├── server/                # Backend Express
│   ├── controllers/       # Controladores da API
│   ├── middleware/        # Middlewares Express
│   ├── routes.ts         # Definição das rotas
│   └── storage.ts        # Interface de armazenamento
├── shared/               # Código compartilhado
│   └── schema.ts         # Schema Drizzle + Zod
├── migrations/           # Migrações do banco
└── dist/                # Build de produção
```

### Funcionalidades Principais
1. **Autenticação de Usuários**: Login/cadastro via Supabase
2. **Criação de Projetos**: Interface para criar sites românticos
3. **Personalização Avançada**: 
   - Cores personalizadas (primária, secundária, fundo)
   - Upload de imagens
   - Texto e conteúdo personalizável
   - Emoji de chuva configurável
4. **Roteamento por Subdomínio**: Cada projeto tem seu próprio subdomínio
5. **Preview e Publicação**: Sistema de draft/published
6. **Interface Responsiva**: Design adaptativo para todos os dispositivos

### Modelos de Dados

#### Users
- `id`: UUID (primary key)
- `email`: String único
- `createdAt`, `updatedAt`: Timestamps

#### Projects
- `id`: Serial (primary key)
- `userId`: UUID (foreign key)
- `name`: Nome do projeto
- `slug`: URL slug único
- `status`: Enum (draft/published)
- `mainTitle`, `subtitle`, `description`: Conteúdo personalizado
- `primaryColor`, `secondaryColor`, `backgroundColor`: Cores hexadecimais
- `imagePath`: Caminho da imagem
- `rainEmoji`: Emoji personalizado
- `createdAt`, `updatedAt`, `publishedAt`: Timestamps

## Configuração de Desenvolvimento

### Variáveis de Ambiente Necessárias
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
PORT=5000
NODE_ENV=development
```

### Scripts Disponíveis
- `npm run dev`: Desenvolvimento com hot reload
- `npm run build`: Build para produção
- `npm start`: Execução em produção
- `npm run db:push`: Aplicar mudanças no schema

### Fluxo de Desenvolvimento
1. Frontend e backend rodam na mesma porta (5000)
2. Vite serve o frontend em desenvolvimento
3. Express serve a API e arquivos estáticos
4. Hot reload automático para mudanças

## Preferências do Usuário
- Idioma: Português
- Comunicação: Simples e direta, sem termos técnicos
- Estilo: Foco em resultados práticos

## Mudanças Recentes
- **11/08/2025**: Preparação para upload no GitHub
- Estrutura completa do projeto funcionando
- Sistema de autenticação implementado
- CRUD de projetos implementado
- Interface de usuário completa

## Próximos Passos
- Upload para repositório GitHub
- Configuração de deploy automático
- Documentação de API
- Testes automatizados