import { TaskList } from "@/components/task-list";
import { taskListInput } from "@/lib/schemas/task";
import { getQueryClient, HydrateClient, trpc } from "@/trpc/server";

// A lista muda a cada requisição (dados em memória), então nada de página estática.
export const dynamic = "force-dynamic";

/**
 * Server Component: busca a primeira página direto no router tRPC (sem HTTP),
 * guarda no QueryClient da requisição e hidrata o React Query no cliente.
 * O HTML já chega com as tarefas renderizadas.
 */
export default async function HomePage() {
  await getQueryClient().prefetchInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(taskListInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  );

  return (
    <>
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tarefas</h1>
          <p className="text-muted-foreground text-sm">Suas tarefas, das mais recentes para as mais antigas.</p>
        </div>
      </header>
      <HydrateClient>
        <TaskList />
      </HydrateClient>
    </>
  );
}
