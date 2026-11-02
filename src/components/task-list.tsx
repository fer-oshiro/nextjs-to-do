"use client";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { TaskCard } from "@/components/task-card";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { taskListInput } from "@/lib/schemas/task";
import { useTRPC } from "@/trpc/client";

export function TaskList() {
  const trpc = useTRPC();
  // Os dados já vêm hidratados do SSR (ver app/page.tsx), então o "suspense"
  // aqui não chega a suspender no primeiro render.
  const { data } = useSuspenseInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(taskListInput, {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }),
  );

  const tasks = data.pages.flatMap((page) => page.items);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Nenhuma tarefa ainda</CardTitle>
          <CardDescription>Crie a primeira para começar.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} />
        </li>
      ))}
    </ul>
  );
}
