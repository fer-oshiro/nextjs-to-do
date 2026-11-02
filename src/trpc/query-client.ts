import { defaultShouldDehydrateQuery, QueryClient } from "@tanstack/react-query";
import superjson from "superjson";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Com SSR, evita que o cliente refaça a busca logo após a hidratação.
        staleTime: 30 * 1000,
        // Por padrão ("online"), o React Query PAUSA requisições quando o navegador
        // está offline e o usuário fica preso em um loading infinito. Com "always",
        // a requisição falha e cai no tratamento de erro (toast, botão de tentar de novo).
        networkMode: "always",
      },
      mutations: {
        networkMode: "always",
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
