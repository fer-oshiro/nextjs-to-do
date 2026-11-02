import "server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { cache } from "react";

import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";
import { makeQueryClient } from "./query-client";

/** `cache()` garante um QueryClient por requisição, compartilhado entre os Server Components. */
export const getQueryClient = cache(makeQueryClient);

/**
 * Proxy do tRPC para Server Components: chama o router direto, sem HTTP.
 * Gera as mesmas query keys do client, então o que for buscado aqui é
 * reaproveitado pelos hooks no navegador após a hidratação.
 */
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

export function HydrateClient({ children }: { children: React.ReactNode }) {
  return <HydrationBoundary state={dehydrate(getQueryClient())}>{children}</HydrationBoundary>;
}
