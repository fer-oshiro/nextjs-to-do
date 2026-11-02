import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-6 flex flex-col items-start gap-3">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/">
          <ArrowLeftIcon />
          Voltar
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </header>
  );
}
