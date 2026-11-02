"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { Task } from "@/lib/schemas/task";
import { useTRPC } from "@/trpc/client";

export function DeleteTaskButton({ task }: { task: Pick<Task, "id" | "titulo"> }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteTask = useMutation(
    trpc.task.delete.mutationOptions({
      // A mutation só termina depois que a lista for recarregada; assim o
      // dialog fecha e o card some ao mesmo tempo, sem "piscar".
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: trpc.task.list.pathKey() });
        setOpen(false);
        toast.success("Tarefa excluída", { description: task.titulo });
      },
      onError: (error) => {
        toast.error("Não foi possível excluir a tarefa", { description: error.message });
      },
    }),
  );

  return (
    // Durante a exclusão o dialog não pode ser fechado (Esc / clique fora).
    <AlertDialog open={open} onOpenChange={(next) => !deleteTask.isPending && setOpen(next)}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Excluir tarefa ${task.titulo}`}>
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{task.titulo}&rdquo; será removida. Essa ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTask.isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteTask.isPending}
            onClick={(event) => {
              // Impede o fechamento automático; quem fecha é o onSuccess.
              event.preventDefault();
              deleteTask.mutate({ id: task.id });
            }}
          >
            {deleteTask.isPending && <Spinner aria-label="Excluindo" />}
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
