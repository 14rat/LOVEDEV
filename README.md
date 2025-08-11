# LoveDev 💕

Uma plataforma moderna para criar sites românticos personalizados com roteamento dinâmico por subdomínio.

## 🌟 Funcionalidades

- **Autenticação Segura**: Sistema de login integrado com Supabase
- **Sites Personalizados**: Crie sites românticos únicos com cores e conteúdo customizáveis  
- **Roteamento Dinâmico**: Cada projeto tem seu próprio subdomínio
- **Interface Moderna**: UI responsiva construída com React e Tailwind CSS
- **Gerenciamento Completo**: Sistema de draft/publicação para seus projetos

## 🚀 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript  
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Autenticação**: Supabase Auth
- **UI Components**: Radix UI + shadcn/ui

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- Conta Supabase

## ⚡ Instalação Rápida

1. **Clone o repositório**
   ```bash
   git clone <seu-repositorio>
   cd lovedev
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas credenciais
   ```

4. **Configure o banco de dados**
   ```bash
   npm run db:push
   ```

5. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

## 🔧 Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/lovedev
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
NODE_ENV=development
```

## 📖 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm start` - Executa a aplicação em produção
- `npm run db:push` - Aplica mudanças no schema do banco
- `npm run check` - Verifica tipos TypeScript

## 🏗️ Estrutura do Projeto

```
├── client/          # Frontend React
├── server/          # Backend Express  
├── shared/          # Código compartilhado
├── migrations/      # Migrações do banco
└── dist/           # Build de produção
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Se você tiver alguma dúvida ou problema, abra uma [issue](../../issues) no GitHub.
