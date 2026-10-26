import "./globals.css";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import AppNav from "@/components/app-nav";

export const metadata: Metadata = {
  title: { default: "Boxing | Treinamentos", template: "%s | Boxing" },
  description: "Plataforma de apoio ao treinamento e à evolução no boxe",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  return <html lang="pt-BR"><body>
    <AppNav user={user ? { name: user.name } : null} />
    <main className="mx-auto min-h-[calc(100vh-5rem)] max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    <footer className="border-t border-white/5 px-4 py-6 text-center text-xs text-neutral-600">Boxing · apoio ao treinamento com acompanhamento individual</footer>
  </body></html>;
}
