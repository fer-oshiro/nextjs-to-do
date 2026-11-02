import { z } from "zod";

/**
 * Schemas compartilhados entre o backend (input das procedures tRPC) e o
 * frontend (zodResolver do formulário). Assim a regra "título obrigatório"
 * existe em um único lugar e as duas pontas nunca divergem.
 */
export const taskCreateSchema = z.object({
  // trim() antes do min(1): um título só com espaços também é inválido.
  titulo: z
    .string()
    .trim()
    .min(1, "O título é obrigatório")
    .max(120, "O título deve ter no máximo 120 caracteres"),
  descricao: z
    .string()
    .trim()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres")
    .optional(),
});

export const taskUpdateSchema = taskCreateSchema.extend({
  id: z.string().min(1),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: Date;
  dataAtualizacao?: Date;
};

/**
 * Input da listagem usado tanto no prefetch do servidor quanto no hook do
 * cliente. Precisa ser idêntico nos dois lados para gerar a mesma query key,
 * senão o cliente ignoraria os dados vindos do SSR e buscaria tudo de novo.
 */
export const taskListInput = { limit: 10 };
