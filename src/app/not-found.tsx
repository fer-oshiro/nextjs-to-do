import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Não encontrado</CardTitle>
        <CardDescription>Esta página não existe ou a tarefa foi excluída.</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild>
          <Link href="/">Ver tarefas</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
