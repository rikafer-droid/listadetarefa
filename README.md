# 📝 TaskFlow — Gestão Inteligente de Tarefas

Aplicação web moderna, responsiva e de alta performance para gerenciamento e acompanhamento de tarefas, com suporte a persistência em nuvem via **Supabase** e fallback resiliente em **LocalStorage**.

---

## 🚀 Funcionalidades

- **Gerenciamento Completo de Tarefas (CRUD)**: Criação, edição, conclusão rápida e exclusão com opção de "Desfazer".
- **Categorização Personalizável**: Organização de tarefas em categorias coloridas (*Trabalho*, *Pessoal*, *Estudos*, *Finanças*, *Saúde* e categorias customizadas).
- **Níveis de Prioridade**: Classificação visual por prioridades (*Alta*, *Média*, *Baixa*).
- **Filtros e Busca em Tempo Real**:
  - Filtro por status (*Todas*, *Pendentes*, *Concluídas*).
  - Filtro dinâmico por categoria e por nível de prioridade.
  - Ordenação por data de entrega, prioridade, data de criação ou título.
  - Busca instantânea por título e descrição.
- **Múltiplas Visões de Produtividade**:
  - 📋 **Tarefas**: Lista principal com cards interativos e métricas rápidas.
  - 📊 **Análises**: Gráficos visuais, taxas de conclusão e métricas por categoria e prioridade.
  - 📅 **Calendário**: Visão mensal interativa com status de tarefas por dia e criação rápida com 1 clique.
- **Persistência em Nuvem com Supabase**:
  - Sincronização em tempo real (*Realtime*).
  - Operações otimistas com resposta instantânea na interface.
  - Fallback automático para *LocalStorage* quando offline.
- **Experiência do Usuário (UX)**:
  - Animação de confetes ao concluir tarefas.
  - Notificações Toast com suporte a ação de desfazer.
  - Design limpo, moderno e acessível construído com Tailwind CSS.

---

## 🛠️ Stack Tecnológica

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Banco de Dados & Backend**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Manipulação de Datas**: [date-fns](https://date-fns.org/)
- **Efeitos Visuais**: [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) versão 18.0.0 ou superior
- Gerenciador de pacotes `npm`, `pnpm` ou `yarn`

---

## ⚙️ Instalação e Configuração

### 1. Clonar o repositório

```bash
git clone https://github.com/rikafer-droid/listatarefas.git
cd listatarefas
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie o arquivo de exemplo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Abra o arquivo `.env` e configure suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-publica-anon
```

> **Nota**: Se as variáveis do Supabase não forem fornecidas, a aplicação funcionará normalmente utilizando o armazenamento local (`LocalStorage`).

---

## 🚀 Executando o Projeto

### Modo de Desenvolvimento

```bash
npm run dev
```

A aplicação estará acessível em `http://localhost:5173`.

### Validação e Lint

```bash
npm run lint
```

### Compilação para Produção (Build)

```bash
npm run build
```

### Pré-visualização da Build de Produção

```bash
npm run preview
```

---

## 📁 Estrutura do Projeto

```text
├── public/              # Arquivos públicos e estáticos
├── src/
│   ├── assets/          # Ícones e recursos gráficos
│   ├── components/      # Componentes de interface (Navbar, TaskList, Modais, etc.)
│   ├── hooks/           # Hooks customizados (useTasks com sincronização Supabase)
│   ├── services/        # Serviços de dados (Supabase, Storage local)
│   ├── types/           # Tipagens TypeScript (Task, Category, etc.)
│   ├── App.tsx          # Componente raiz da aplicação
│   ├── main.tsx         # Ponto de entrada React
│   └── index.css        # Estilos globais e tokens Tailwind CSS
├── .env.example         # Exemplo de configuração de variáveis de ambiente
├── .gitignore           # Regras de exclusão do Git
├── package.json         # Manifesto de dependências e scripts
├── tsconfig.json        # Configurações do TypeScript
└── vite.config.ts       # Configuração do Vite
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença MIT.
