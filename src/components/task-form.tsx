"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TRPCClientErrorLike } from "@trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  DESCRICAO_MAX,
  type Task,
  type TaskCreateInput,
  taskCreateSchema,
  TITULO_MAX,
} from "@/lib/schemas/task";
import { cn } from "@/lib/utils";
import type { AppRouter } from "@/server/routers/_app";
import { useTRPC } from "@/trpc/client";

type Props = {
  /** Sem `task`, o formulário cria uma tarefa nova; com `task`, edita a existente. */
  task?: Pick<Task, "id" | "titulo" | "descricao">;
};

export function TaskForm({ task }: Props) {
  const isEdit = Boolean(task);
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Mesmo schema zod usado como input no router: a validação do cliente é
  // idêntica à do servidor e o envio é bloqueado se o título estiver vazio.
  const form = useForm<TaskCreateInput>({
    resolver: zodResolver(taskCreateSchema),
    defaultValues: { titulo: task?.titulo ?? "", descricao: task?.descricao ?? "" },
  });

  async function onSuccess(saved: Task) {
    // Invalida list e byId para a listagem refletir a mudança ao voltar.
    await queryClient.invalidateQueries({ queryKey: trpc.task.pathKey() });
    toast.success(isEdit ? "Tarefa atualizada" : "Tarefa criada", { description: saved.titulo });
    router.push("/");
  }

  function onError(error: TRPCClientErrorLike<AppRouter>) {
    // Se o servidor recusar algum campo, o erro aparece embaixo do input...
    const fieldErrors: Partial<Record<string, string[]>> = error.data?.zodError?.fieldErrors ?? {};
    for (const name of ["titulo", "descricao"] as const) {
      const message = fieldErrors[name]?.[0];
      if (message) form.setError(name, { message });
    }
    // ...e qualquer erro (validação, tarefa inexistente, rede) vira um toast.
    toast.error(isEdit ? "Não foi possível salvar a tarefa" : "Não foi possível criar a tarefa", {
      description: error.message,
    });
  }

  const create = useMutation(trpc.task.create.mutationOptions({ onSuccess, onError }));
  const update = useMutation(trpc.task.update.mutationOptions({ onSuccess, onError }));
  // Continua true até o router.push: evita duplo envio enquanto redireciona.
  const isPending = create.isPending || update.isPending || create.isSuccess || update.isSuccess;

  function onSubmit(values: TaskCreateInput) {
    if (task) update.mutate({ id: task.id, ...values });
    else create.mutate(values);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          name="titulo"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="titulo">Título</FieldLabel>
              <Input
                {...field}
                id="titulo"
                placeholder="Ex.: Revisar relatório mensal"
                aria-invalid={fieldState.invalid}
                autoFocus
                disabled={isPending}
              />
              <div className="flex items-baseline justify-between gap-4">
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : <span />}
                <CharCount length={field.value.length} max={TITULO_MAX} />
              </div>
            </Field>
          )}
        />
        <Controller
          name="descricao"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="descricao">Descrição</FieldLabel>
              <Textarea
                {...field}
                id="descricao"
                rows={4}
                placeholder="Detalhes da tarefa"
                aria-invalid={fieldState.invalid}
                disabled={isPending}
              />
              <div className="flex items-baseline justify-between gap-4">
                {fieldState.invalid ? (
                  <FieldError errors={[fieldState.error]} />
                ) : (
                  <FieldDescription>Opcional.</FieldDescription>
                )}
                <CharCount length={field.value?.length ?? 0} max={DESCRICAO_MAX} />
              </div>
            </Field>
          )}
        />
        <Field orientation="horizontal">
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner aria-label="Salvando" />}
            {isEdit ? "Salvar alterações" : "Criar tarefa"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Cancelar</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

/** Contador "34/120": avisa do limite antes do envio; fica vermelho se passar. */
function CharCount({ length, max }: { length: number; max: number }) {
  return (
    <span
      className={cn(
        "shrink-0 text-xs text-muted-foreground tabular-nums",
        length > max && "text-destructive",
      )}
    >
      {length}/{max}
    </span>
  );
}
