import type { Task, TaskCreateInput, TaskUpdateInput } from "@/lib/schemas/task";

/**
 * "Banco" em memória.
 *
 * O Map fica no `globalThis` porque, em desenvolvimento, o Next recarrega os
 * módulos a cada alteração (HMR). Uma variável de módulo comum seria recriada
 * e as tarefas sumiriam a cada save. Pendurado no global, o Map sobrevive.
 *
 * Em produção (serverless) a memória é por instância: os dados podem resetar
 * em um cold start ou novo deploy. Ver README. Trocar este arquivo por
 * Redis/Postgres não exige mudar o router, que só conhece as funções abaixo.
 */
const globalForDb = globalThis as unknown as { taskStore?: Map<string, Task> };

const store = (globalForDb.taskStore ??= seed());

/** Ordem da listagem: mais recentes primeiro; id desempata timestamps iguais. */
function compareDesc(a: Task, b: Task) {
  const diff = b.dataCriacao.getTime() - a.dataCriacao.getTime();
  if (diff !== 0) return diff;
  return a.id < b.id ? 1 : a.id > b.id ? -1 : 0;
}

/**
 * O cursor é "<timestamp>_<id>" da última tarefa da página, e não um índice
 * (offset). Assim, se uma tarefa for criada ou excluída enquanto o usuário
 * rola a lista, a próxima página continua do ponto certo, sem pular nem
 * repetir itens.
 */
export function toCursor(task: Task) {
  return `${task.dataCriacao.getTime()}_${task.id}`;
}

function isAfterCursor(task: Task, cursor: string) {
  const sep = cursor.indexOf("_");
  const ms = Number(cursor.slice(0, sep));
  const id = cursor.slice(sep + 1);
  const t = task.dataCriacao.getTime();
  return t < ms || (t === ms && task.id < id);
}

export function listTasks({ limit, cursor }: { limit: number; cursor?: string | null }) {
  const sorted = [...store.values()].sort(compareDesc);
  const start = cursor ? sorted.findIndex((t) => isAfterCursor(t, cursor)) : 0;
  const rest = start === -1 ? [] : sorted.slice(start);

  const items = rest.slice(0, limit);
  const nextCursor = rest.length > limit ? toCursor(items[items.length - 1]) : null;
  return { items, nextCursor };
}

export function getTask(id: string) {
  return store.get(id);
}

export function createTask(input: TaskCreateInput) {
  const task: Task = {
    id: crypto.randomUUID(),
    titulo: input.titulo,
    descricao: input.descricao || undefined,
    dataCriacao: new Date(),
  };
  store.set(task.id, task);
  return task;
}

/** Retorna `undefined` se a tarefa não existir; o router converte em NOT_FOUND. */
export function updateTask({ id, ...input }: TaskUpdateInput) {
  const current = store.get(id);
  if (!current) return undefined;

  const updated: Task = {
    ...current,
    titulo: input.titulo,
    descricao: input.descricao || undefined,
    dataAtualizacao: new Date(),
  };
  store.set(id, updated);
  return updated;
}

export function deleteTask(id: string) {
  return store.delete(id);
}

/** Tarefas fictícias para a lista nunca começar vazia (e o scroll ter o que paginar). */
function seed() {
  const exemplos: Array<[string, string?]> = [
    [
      "Revisar pull request do módulo de relatórios",
      "Conferir testes e nomes de variáveis antes de aprovar.",
    ],
    ["Atualizar dependências do projeto"],
    ["Escrever documentação da API", "Endpoints de tarefas: criar, listar, editar e excluir."],
    ["Preparar apresentação da sprint"],
    ["Corrigir bug no filtro de datas", "O filtro ignora o último dia do intervalo."],
    ["Planejar reunião de retrospectiva"],
    ["Comprar café para o escritório"],
    ["Configurar pipeline de CI", "Rodar lint e build a cada push."],
    ["Responder e-mails pendentes"],
    ["Organizar backlog do produto", "Priorizar itens com maior impacto para o usuário."],
    ["Testar fluxo de cadastro no mobile"],
    ["Criar protótipo da nova tela inicial"],
    ["Revisar métricas de desempenho", "Comparar tempo de carregamento antes e depois do deploy."],
    ["Agendar consulta no dentista"],
    ["Ler capítulo sobre arquitetura limpa"],
    ["Refatorar componente de tabela", "Extrair paginação para um hook reutilizável."],
    ["Fazer backup das fotos"],
    ["Estudar Server Components do React"],
    ["Pagar conta de internet"],
    ["Atualizar currículo", "Incluir os projetos mais recentes."],
    ["Montar lista de compras da semana"],
    ["Revisar acessibilidade do formulário", "Labels, contraste e navegação por teclado."],
    ["Limpar caixa de entrada"],
    ["Escrever testes para o serviço de tarefas"],
    ["Planejar viagem de fim de ano"],
  ];

  const now = Date.now();
  const hour = 60 * 60 * 1000;

  return new Map(
    exemplos.map(([titulo, descricao], i): [string, Task] => {
      const id = crypto.randomUUID();
      // Datas espaçadas de 5 em 5 horas para a ordenação ficar visível na UI.
      return [id, { id, titulo, descricao, dataCriacao: new Date(now - (i + 1) * 5 * hour) }];
    }),
  );
}
