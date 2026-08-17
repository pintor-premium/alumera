# PLATAFORMA ALUMERA

Este é o ecossistema digital completo da **ALUMERA** — soluções personalizadas em ACM para o mercado imobiliário de alto padrão. A plataforma integra o site institucional, o portfólio público administrável, o Portal do Profissional (Arquitetos e Engenheiros) e o painel CRM Administrativo (controle operacional, financeiro, orçamentos e contratos).

---

## 🚀 Tecnologias Utilizadas (Stack)

- **Frontend/Backend**: Next.js 16 (App Router) + TypeScript + React 19
- **Estilização**: Tailwind CSS v4 + Design System Premium (Dourado, Marrom e Tons Escuros)
- **Banco de Dados & Autenticação**: Supabase PostgreSQL + Supabase Auth
- **Armazenamento de Arquivos**: Supabase Storage (Buckets privados e públicos)
- **Hospedagem & Deploy**: Vercel

---

## 📂 Estrutura de Diretórios

```bash
codigo-alumera/
├── public/                  # Arquivos estáticos (imagens reais da Alumera, logos, etc.)
│   └── imagens/             # Assets da marca (cozinha, suite, logo, icones)
├── src/
│   ├── app/                 # Roteamento e layouts (Next.js App Router)
│   │   ├── (public)/        # Site público (/a-alumera, /solucoes, /projetos, /contato)
│   │   ├── (auth)/          # Telas de login, cadastro e redefinição de senha
│   │   ├── portal/          # Área restrita de Arquitetos e Engenheiros
│   │   ├── admin/           # Painel CRM Administrativo (Protegido por perfil)
│   │   ├── globals.css      # Design System e variáveis de tema CSS
│   │   └── layout.tsx       # Layout raiz e ToastProvider
│   ├── components/          # Componentes reutilizáveis (Header, Footer, Toast)
│   ├── lib/
│   │   └── supabase/        # Integração e clientes SSR do Supabase
│   └── middleware.ts        # Controle de sessão e proteção de rotas
├── supabase_schema.sql      # Script SQL completo de tabelas, RLS e triggers
├── package.json             # Dependências e scripts
└── README.md                # Esta documentação
```

---

## 🛠️ Instalação e Execução Local

### 1. Clonar e Instalar Dependências
No diretório do projeto, execute:
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Renomeie o arquivo `.env.example` para `.env.local` e preencha as credenciais do seu projeto Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 3. Executar em Desenvolvimento
Inicie o servidor local:
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

---

## 💾 Configuração do Supabase (Banco de Dados, RLS e Storage)

### 1. Modelagem e Migrations
1. Acesse o painel do seu projeto no **[Supabase](https://supabase.com)**.
2. Abra a aba **SQL Editor** no menu lateral esquerdo.
3. Clique em **New query**.
4. Copie todo o conteúdo do arquivo [`supabase_schema.sql`](file:///c:/Users/sandr/Desktop/PLATAFORMA%20ALUMERA/codigo-alumera/supabase_schema.sql) da raiz deste projeto e cole no editor.
5. Clique em **Run** para criar a estrutura completa do banco de dados.

### O que este script SQL cria automaticamente:
- **Tabelas de Negócio**: `usuarios`, `perfis_profissionais`, `servicos`, `projetos`, `arquivos_projeto`, `orcamentos`, `contratos`, `transacoes_financeiras`, `categorias_financeiras`, `notificacoes` e `atividades`.
- **Triggers**:
  - `handle_new_user`: Disparado ao cadastrar uma conta via Supabase Auth. Ele insere automaticamente o registro na tabela `usuarios` e, caso seja Arquiteto ou Engenheiro, cria seu perfil em `perfis_profissionais`.
  - **Administrador Automático**: Se o e-mail de cadastro for `alumera@gmail.com`, o trigger atribui a ele o perfil `administrador`.
- **Row Level Security (RLS)**: Proteção em nível de linha em todas as tabelas. Os profissionais só conseguem ler/escrever seus próprios projetos/mensagens, enquanto a equipe administrativa possui acesso irrestrito.
- **Buckets de Storage**:
  - `arquivos-projetos` (Privado - uploads de plantas técnicas de até 500MB)
  - `contratos` (Privado - PDFs de contratos assinados de até 500MB)
  - `portfolio` (Público - imagens do site público)
  - `avatar` (Público - avatares)
- **Seed Iniciais**: Insere os serviços de ACM de partida e as categorias financeiras de receitas e despesas.

---

## 👤 Como Criar o Administrador Inicial

1. Acesse a tela de cadastro público da aplicação em `http://localhost:3000/cadastro` (ou na tela de login, clique para criar conta).
2. Cadastre-se utilizando obrigatoriamente o e-mail:
   - **E-mail**: `alumera@gmail.com`
   - **Senha**: De sua preferência (mínimo de 6 caracteres).
3. Conclua o cadastro. O trigger do banco identificará o e-mail e ativará as permissões de **administrador completo**.
4. Você será redirecionado para o painel CRM Administrativo `/admin`.

*Nota: Para criar outras funções como operacional ou financeiro, você pode alterar o campo `perfil` do usuário diretamente na tabela `public.usuarios` no editor de tabelas do Supabase.*

---

## ⚡ Publicação na Vercel (Deploy)

### 1. Preparação
Certifique-se de que o projeto foi buildado localmente com sucesso:
```bash
npm run build
```

### 2. Deploy via Vercel CLI ou GitHub
- **Opção A (GitHub)**: Suba o código para um repositório privado no GitHub, conecte sua conta da Vercel ao repositório e selecione o framework "Next.js".
- **Opção B (CLI)**: No terminal da pasta do projeto, execute:
  ```bash
  vercel
  ```

### 3. Configurar Variáveis de Ambiente na Vercel
Nas configurações do seu projeto na Vercel (Settings > Environment Variables), adicione:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

*Importante: O domínio definitivo pode ser configurado na seção Domains da Vercel apontando seus registros DNS.*
