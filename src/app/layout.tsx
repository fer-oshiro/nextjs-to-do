import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarefas",
  description: "Gerenciador de tarefas simples com Next.js 15 e tRPC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <TRPCReactProvider>
          <main className="mx-auto w-full max-w-2xl px-4 py-10">{children}</main>
        </TRPCReactProvider>
        <Toaster closeButton />
      </body>
    </html>
  );
}
