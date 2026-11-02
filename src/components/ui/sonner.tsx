"use client";

import { cn } from "cn";
import { CircleCheckIcon, InfoIcon, Loader2Icon, TriangleAlertIcon, XIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function ToastIcon({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("flex size-10 items-center justify-center rounded-xl", className)}>
      {children}
    </span>
  );
}

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
        // Sem quadrado: no loading o spinner fica à direita, no lugar do X
        // (o sonner não mostra o botão de fechar enquanto carrega).
        loading: (
          <span className="flex size-8 items-center justify-center">
            <Loader2Icon className="size-5 animate-spin text-slate-500" />
          </span>
        ),
        close: <XIcon className="size-4" strokeWidth={2.5} />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: cn(
            "group/toast flex w-(--width) items-center gap-3 rounded-2xl border p-2 pr-2.5 shadow-lg shadow-black/5",
            "border-slate-200 bg-white",
            "data-[type=success]:border-green-200 data-[type=success]:bg-green-50",
            "data-[type=info]:border-blue-200 data-[type=info]:bg-blue-50",
            "data-[type=warning]:border-amber-200 data-[type=warning]:bg-amber-50",
            "data-[type=error]:border-red-200 data-[type=error]:bg-red-50",
            "data-[type=loading]:pl-4",
          ),
          // `relative`: o sonner envolve o ícone de loading em `.sonner-loader`, que é
          // `absolute` + centralizado (50%/50%). Sem um pai posicionado, ele iria para o
          // meio do toast; assim ele centraliza nesta caixa, que no loading fica à direita.
          icon: "relative shrink-0 group-data-[type=loading]/toast:order-last group-data-[type=loading]/toast:size-8",
          content: "flex min-w-0 flex-1 flex-col gap-0.5 py-1",
          title: "text-sm font-medium text-slate-800",
          description: "text-sm text-slate-600",
          closeButton: cn(
            "order-last flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition",
            "group-data-[type=default]/toast:hover:bg-slate-100 group-data-[type=default]/toast:hover:text-slate-900",
            "group-data-[type=success]/toast:hover:bg-green-100 group-data-[type=success]/toast:hover:text-green-900",
            "group-data-[type=info]/toast:hover:bg-blue-100 group-data-[type=info]/toast:hover:text-blue-900",
            "group-data-[type=warning]/toast:hover:bg-amber-100 group-data-[type=warning]/toast:hover:text-amber-900",
            "group-data-[type=error]/toast:hover:bg-red-100 group-data-[type=error]/toast:hover:text-red-900",
            "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none",
          ),
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
