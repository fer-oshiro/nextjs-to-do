import { TRPCError } from "@trpc/server";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { TaskForm } from "@/components/task-form";
import { Card, CardContent } from "@/components/ui/card";
import { getQueryClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

/** SSR: a tarefa é buscada no servidor e o formulário já abre preenchido. */
export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const task = await getQueryClient()
    .fetchQuery(trpc.task.byId.queryOptions({ id }))
    .catch((error) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") return null;
      throw error;
    });

  if (!task) notFound();

  return (
    <>
      <PageHeader title="Editar tarefa" />
      <Card>
        <CardContent>
          <TaskForm task={{ id: task.id, titulo: task.titulo, descricao: task.descricao }} />
        </CardContent>
      </Card>
    </>
  );
}
