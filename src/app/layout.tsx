import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";

export const metadata: Metadata = { title: "Boxing | Treinamentos", description: "Plataforma de apoio ao treinamento de boxe" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return <html lang="pt-BR"><body><header className="border-b border-neutral-800"><nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4"><Link href={user ? "/dashboard" : "/login"} className="text-xl font-black tracking-wide"><span className="text-boxing">BOX</span>ING</Link><div className="flex items-center gap-4 text-sm">{user ? <><Link href="/dashboard">Início</Link><Link href="/treinos/gerar">Treinos</Link><Link href="/evolucao">Evolução</Link><Link href="/perfil">Perfil</Link><LogoutButton /></> : <><Link href="/login">Entrar</Link><Link href="/cadastro">Cadastrar</Link></>}</div></nav></header><main className="mx-auto max-w-5xl px-4 py-8">{children}</main></body></html>;
}
