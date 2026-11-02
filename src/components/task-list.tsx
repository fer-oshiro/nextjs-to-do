"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { TaskCard, TaskCardSkeleton } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { taskListInput } from "@/lib/schemas/task";
import { useTRPC } from "@/trpc/client";

export function TaskList() {
  const trpc = useTRPC();
  // Os dados já vêm hidratados do SSR (ver app/page.tsx), então o "suspense"
  // aqui não chega a suspender no primeiro render.
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } =
    useSuspenseInfiniteQuery(
      trpc.task.list.infiniteQueryOptions(taskListInput, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }),
    );

  // Infinite scroll: um elemento "sentinela" no fim da lista. Quando ele entra
  // na tela (com 200px de antecedência), busca a próxima página pelo cursor.
  const { ref: sentinelRef, inView } = useInView({ rootMargin: "200px" });

  useEffect(() => {
    // Em caso de erro, para de tentar sozinho; o usuário decide pelo botão.
    if (inView && hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  const tasks = data.pages.flatMap((page) => page.items);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Nenhuma tarefa ainda</CardTitle>
          <CardDescription>Crie a primeira para começar.</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild>
            <Link href="/tasks/new">Nova tarefa</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {tasks.map((task) => (
          <li key={task.id}>
            <TaskCard task={task} />
          </li>
        ))}
      </ul>

      {isFetchingNextPage ? (
        <TaskCardSkeleton />
      ) : isFetchNextPageError ? (
        <div role="alert" className="flex flex-col items-center gap-2 py-4 text-sm">
          <p className="text-destructive">Não foi possível carregar mais tarefas.</p>
          <Button variant="outline" size="sm" onClick={() => fetchNextPage()}>
            Tentar novamente
          </Button>
        </div>
      ) : hasNextPage ? (
        <div ref={sentinelRef} aria-hidden className="h-px" />
      ) : (
        data.pages.length > 1 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Você chegou ao fim da lista.
          </p>
        )
      )}
    </div>
  );
}
