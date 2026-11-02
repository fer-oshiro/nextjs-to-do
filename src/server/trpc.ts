import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

/** Sem auth nem banco, o contexto é vazio; fica aqui como ponto de extensão. */
export const createTRPCContext = async () => ({});

const t = initTRPC.context<typeof createTRPCContext>().create({
  // superjson preserva tipos que o JSON puro perde: `dataCriacao` chega no
  // cliente como Date de verdade, e não como string.
  transformer: superjson,
  // Erros de validação viram uma mensagem legível ("O título é obrigatório")
  // e os erros por campo vão em `data.zodError` para quem quiser exibi-los.
  errorFormatter({ shape, error }) {
    const zodError =
      error.code === "BAD_REQUEST" && error.cause instanceof ZodError ? error.cause : null;

    return {
      ...shape,
      message: zodError ? zodError.issues.map((i) => i.message).join("; ") : shape.message,
      data: {
        ...shape.data,
        zodError: zodError ? z.flattenError(zodError) : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
