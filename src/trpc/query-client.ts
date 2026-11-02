import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Com SSR, evita que o cliente refaça a busca logo após a hidratação.
        staleTime: 30 * 1000,
      },
      // O estado do React Query vai do servidor para o cliente serializado.
      // Usar superjson aqui mantém os Date como Date nessa passagem.
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
      hydrate: {
        deserializeData: superjson.deserialize,
      },
    },
  });
}
