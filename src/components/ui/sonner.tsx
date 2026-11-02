"use client";

import { cn } from "cn";
import { CircleCheckIcon, InfoIcon, Loader2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Quadrado colorido com o ícone branco dentro, à esquerda do toast. */
function ToastIcon({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "flex size-10 items-center justify-center rounded-xl bg-linear-to-b shadow-sm ring-1 ring-black/5 ring-inset",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Toaster no estilo "card tingido": fundo e borda claros na cor do tipo,
 * ícone em um quadrado colorido e botão de fechar à direita.
 *
 * `unstyled` desliga o CSS visual do sonner (mantendo empilhamento, animação
 * e swipe), e as cores por tipo vêm do atributo `data-type` do próprio toast.
 */
const Toaster = (props: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <ToastIcon className="from-green-500 to-green-600">
            <CircleCheckIcon className="size-7 fill-white text-green-600" strokeWidth={2.5} />
          </ToastIcon>
        ),
        info: (
          <ToastIcon className="from-blue-500 to-blue-700">
            <InfoIcon className="size-7 fill-white text-blue-700" strokeWidth={2.5} />
          </ToastIcon>
        ),
        warning: (
          <ToastIcon className="from-amber-400 to-amber-500">
            <TriangleAlertIcon className="size-6 fill-white text-amber-500" strokeWidth={2.5} />
          </ToastIcon>
        ),
        error: (
          <ToastIcon className="from-red-500 to-red-600">
            <TriangleAlertIcon className="size-6 fill-white text-red-600" strokeWidth={2.5} />
          </ToastIcon>
        ),
        loading: (
          <ToastIcon className="from-slate-100 to-slate-200">
            <Loader2Icon className="size-5 animate-spin text-slate-600" />
          </ToastIcon>
        ),
        close: <XIcon className="size-4" strokeWidth={2.5} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "flex w-(--width) items-center gap-3 rounded-2xl border p-2 pr-2.5 shadow-lg shadow-black/5",
            "border-slate-200 bg-white",
            "data-[type=success]:border-green-200 data-[type=success]:bg-green-50",
            "data-[type=info]:border-blue-200 data-[type=info]:bg-blue-50",
            "data-[type=warning]:border-amber-200 data-[type=warning]:bg-amber-50",
            "data-[type=error]:border-red-200 data-[type=error]:bg-red-50",
          ),
          icon: "shrink-0",
          content: "flex min-w-0 flex-1 flex-col gap-0.5 py-1",
          title: "text-sm font-medium text-slate-800",
          description: "text-sm text-slate-600",
          // O sonner renderiza o X antes do conteúdo; `order-last` o leva para a direita.
          closeButton:
            "order-last flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
