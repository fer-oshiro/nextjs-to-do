"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Se o erro veio de um Server Component, só o reset() não basta: o
  // refresh() pede ao servidor para renderizar a página de novo.
  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Algo deu errado</CardTitle>
        <CardDescription>Não foi possível carregar esta página. Tente novamente em instantes.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button onClick={retry} disabled={isPending}>
          {isPending && <Spinner aria-label="Carregando" />}
          Tentar novamente
        </Button>
      </CardFooter>
    </Card>
  );
}
