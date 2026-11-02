# Tarefas: Next.js 15 + tRPC

Aplicação simples de gerenciamento de tarefas. O backend guarda as tarefas **em memória** e as expõe via **tRPC**. O frontend lista as tarefas com **SSR** e **infinite scroll**, e permite criar, editar e excluir com validação e feedback visual.

**Demo:** _em breve_ (hospedado no Render; ver [Deploy](#deploy))

## Funcionalidades

- **Listagem com SSR**: o HTML já chega do servidor com a primeira página de tarefas.
- **Infinite scroll**: as próximas páginas carregam conforme a rolagem (paginação por cursor).
- **Excluir na listagem**: dialog de confirmação e toast de sucesso ou erro.
- **Criar e editar**: um único formulário, com o título obrigatório validado no cliente e no servidor.
- **Estados de UI**: skeletons durante o carregamento, botões desabilitados com spinner durante as ações, estado vazio, página de erro com "Tentar novamente" e 404 para tarefa inexistente.

## Como rodar

Requisitos: Node.js 24 (versão fixada no `.nvmrc`).

```bash
nvm use           # ou: instale o Node 24 manualmente
npm install
npm run prepare   # ativa os git hooks (ver "Segurança do npm" abaixo)
npm run dev       # http://localhost:3000
```

Outros scripts: `npm run build`, `npm start`, `npm run lint`, `npm run format` (Prettier).

Não há variáveis de ambiente nem segredos. Ao iniciar, o servidor cria ~25 tarefas fictícias.

## Stack

| Necessidade                | Escolha                                           | Por quê                                                       |
| -------------------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Framework                  | Next.js 15 (App Router)                           | Server Components para o SSR; route handler para a API        |
| API                        | tRPC v11                                          | Tipagem ponta a ponta sem gerar código nem escrever contratos |
| Cache / estado do servidor | TanStack Query (via `@trpc/tanstack-react-query`) | Hidratação do SSR, infinite query, invalidação após mutations |
| Validação                  | zod                                               | O **mesmo schema** valida o input do tRPC e o formulário      |
| Serialização               | superjson                                         | `dataCriacao` chega no cliente como `Date`, não como string   |
| Formulário                 | react-hook-form + `@hookform/resolvers/zod`       | Estado do form com hooks e validação pelo schema              |
| UI                         | shadcn/ui + Tailwind CSS                          | Componentes acessíveis prontos (dialog, toast, skeleton…)     |
| Infinite scroll            | `react-intersection-observer`                     | Detecta quando o fim da lista entra na tela                   |

## Arquitetura

```
src/
  lib/schemas/task.ts         # schemas zod + tipo Task (compartilhados entre front e back)
  server/
    db.ts                     # "banco" em memória (Map) + seed
    trpc.ts                   # initTRPC, superjson e formatação dos erros de validação
    routers/task.ts           # list, byId, create, update, delete
    routers/_app.ts           # appRouter e o tipo AppRouter
  app/
    api/trpc/[trpc]/route.ts  # endpoint HTTP do tRPC
    page.tsx                  # listagem (SSR)
    tasks/new/page.tsx        # criar
    tasks/[id]/edit/page.tsx  # editar (SSR, 404 se não existir)
    loading.tsx, error.tsx, not-found.tsx
  trpc/
    client.tsx                # provider do React Query + tRPC (navegador)
    server.tsx                # proxy do tRPC para Server Components (sem HTTP)
    query-client.ts           # configuração compartilhada do QueryClient
  components/                 # task-list, task-card, task-form, delete-task-button, ui/ (shadcn)
```

### Fluxo do SSR

1. `app/page.tsx` (Server Component) chama `prefetchInfiniteQuery` usando o proxy de `trpc/server.tsx`. O proxy executa o router **direto no processo**, sem requisição HTTP.
2. O resultado vai para o `QueryClient` da requisição, que é serializado com superjson pelo `<HydrateClient>`.
3. No navegador, `useSuspenseInfiniteQuery` encontra os dados já em cache (mesma query key) e renderiza sem nova busca. As páginas seguintes vêm via HTTP (`/api/trpc`).

### API (tRPC)

| Procedure     | Tipo     | Input                                                                     | Erros                                   |
| ------------- | -------- | ------------------------------------------------------------------------- | --------------------------------------- |
| `task.list`   | query    | `{ limit?: 1–50 (padrão 10), cursor?: string }` → `{ items, nextCursor }` | `BAD_REQUEST` se o cursor for inválido  |
| `task.byId`   | query    | `{ id }`                                                                  | `NOT_FOUND`                             |
| `task.create` | mutation | `{ titulo, descricao? }`                                                  | `BAD_REQUEST` se o título estiver vazio |
| `task.update` | mutation | `{ id, titulo, descricao? }`                                              | `BAD_REQUEST`, `NOT_FOUND`              |
| `task.delete` | mutation | `{ id }`                                                                  | `NOT_FOUND`                             |

Modelo: `{ id, titulo, descricao?, dataCriacao, dataAtualizacao? }`.

Exemplo de erro (título só com espaços):

```bash
curl -X POST localhost:3000/api/trpc/task.create \
  -H 'content-type: application/json' -d '{"json":{"titulo":"  "}}'
# → 400, message: "O título é obrigatório", data.zodError.fieldErrors.titulo
```

## Decisões

- **Schema único no zod**: `taskCreateSchema` é o input do `create` e o resolver do formulário. O `trim()` antes do `min(1)` faz um título só com espaços contar como vazio, nos dois lados.
- **Erros legíveis**: o `errorFormatter` troca a mensagem padrão do zod (um JSON) pelas mensagens dos campos e expõe `zodError` com os erros por campo. No formulário, esses erros aparecem embaixo do input e também viram um toast.
- **Paginação por cursor** (e não por offset): o cursor é `timestamp_id` da última tarefa da página. Se alguém criar ou excluir tarefas durante a rolagem, a próxima página continua do ponto certo, sem pular nem repetir itens.
- **Store no `globalThis`**: em dev, o HMR recarrega os módulos. Com o `Map` pendurado no global, as tarefas não somem a cada save.
- **Fuso fixo na formatação de datas** (`America/Sao_Paulo`): o card é renderizado no servidor (UTC) e hidratado no navegador. Com o mesmo fuso nos dois lados, não há erro de hidratação.
- **Invalidação após mutations**: depois de criar, editar ou excluir, a query `task.list` é invalidada. Na exclusão, o dialog só fecha depois que a lista foi recarregada, para o card não "piscar".

## Deploy

O app roda no **Render**, configurado pelo [`render.yaml`](render.yaml): um único processo Node (`next start`) sempre ligado. Para publicar, basta ir em **New → Blueprint** no Render e apontar para este repositório. Não há variáveis de ambiente.

### Por que não serverless (Vercel, AWS Lambda)?

Como o enunciado pede, as tarefas ficam **em memória**, sem banco. Isso exige que todas as requisições caiam no **mesmo processo**. No serverless isso não acontece: na Vercel, a página (SSR) e a API (`/api/trpc`) rodam em funções separadas, cada uma com a sua memória e o seu seed. O resultado era que tarefas vindas do SSR não eram encontradas ao editar ou excluir pela API.

### Limitações do demo

- No plano grátis, o Render desliga o serviço após ~15 min sem acessos. O primeiro acesso depois disso leva cerca de 1 minuto, e os dados **voltam ao seed**.
- Cada novo deploy também volta os dados ao seed.

Para persistir de verdade (e poder usar serverless), bastaria trocar `src/server/db.ts` por Redis/Postgres mantendo as mesmas funções: o router não muda.

## Segurança do npm

O `.npmrc` tem `ignore-scripts=true`, então scripts `preinstall`/`postinstall` de dependências não rodam no `npm install` (proteção contra pacotes maliciosos). O efeito colateral é que o `prepare` (que ativa os hooks do husky) também não roda sozinho, por isso o `npm run prepare` no passo a passo. `dev` e `build` funcionam normalmente.

## Commits

Conventional Commits, validados por **commitlint** no hook `commit-msg`. O hook `pre-commit` roda ESLint e Prettier nos arquivos staged (**lint-staged**).

## Padronização do ambiente

- `.nvmrc` e `engines` no `package.json`: Node 24 local e no Render.
- `.editorconfig`: indentação, fim de linha e encoding iguais em qualquer editor.
- **Prettier** (com `prettier-plugin-tailwindcss`, que ordena as classes) para formatação e **ESLint** para qualidade; o `eslint-config-prettier` evita conflito entre os dois.
- `.vscode/`: extensões recomendadas e formatação ao salvar.
