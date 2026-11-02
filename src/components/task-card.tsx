import { PencilIcon } from "lucide-react";
import Link from "next/link";

import { DeleteTaskButton } from "@/components/delete-task-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import type { Task } from "@/lib/schemas/task";

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="break-words">{task.titulo}</CardTitle>
        <CardDescription className="flex flex-wrap items-center gap-2">
          <time dateTime={task.dataCriacao.toISOString()}>Criada em {formatDate(task.dataCriacao)}</time>
          {task.dataAtualizacao && <Badge variant="secondary">Editada</Badge>}
        </CardDescription>
        <CardAction className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/tasks/${task.id}/edit`} aria-label={`Editar tarefa ${task.titulo}`}>
              <PencilIcon />
            </Link>
          </Button>
          <DeleteTaskButton task={task} />
        </CardAction>
      </CardHeader>
      {task.descricao && (
        <CardContent>
          <p className="text-muted-foreground text-sm break-words whitespace-pre-line">{task.descricao}</p>
        </CardContent>
      )}
    </Card>
  );
}

export function TaskCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}
