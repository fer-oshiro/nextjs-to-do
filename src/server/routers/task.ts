import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { taskCreateSchema, taskUpdateSchema } from "@/lib/schemas/task";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "@/server/db";
import { createTRPCRouter, publicProcedure } from "@/server/trpc";

const idSchema = z.object({ id: z.string().min(1) });

function notFound(id: string) {
  return new TRPCError({ code: "NOT_FOUND", message: `Tarefa ${id} não encontrada` });
}

export const taskRouter = createTRPCRouter({
  /**
   * Paginação por cursor no formato que o useInfiniteQuery espera:
   * `{ items, nextCursor }`, com `nextCursor: null` na última página.
   */
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(50).default(10),
        cursor: z
          .string()
          .regex(/^\d+_.+$/, "Cursor inválido")
          .nullish(),
      }),
    )
    .query(({ input }) => listTasks(input)),

  byId: publicProcedure.input(idSchema).query(({ input }) => {
    const task = getTask(input.id);
    if (!task) throw notFound(input.id);
    return task;
  }),

  create: publicProcedure.input(taskCreateSchema).mutation(({ input }) => createTask(input)),

  update: publicProcedure.input(taskUpdateSchema).mutation(({ input }) => {
    const task = updateTask(input);
    if (!task) throw notFound(input.id);
    return task;
  }),

  delete: publicProcedure.input(idSchema).mutation(({ input }) => {
    if (!deleteTask(input.id)) throw notFound(input.id);
    return { id: input.id };
  }),
});
