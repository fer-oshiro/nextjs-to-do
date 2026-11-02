import { createTRPCRouter } from "@/server/trpc";
import { taskRouter } from "./task";

export const appRouter = createTRPCRouter({
  task: taskRouter,
});

/** Só o tipo vai para o cliente: é daqui que vem a tipagem ponta a ponta. */
export type AppRouter = typeof appRouter;
