"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/logout-button";

const links = [
  { href: "/dashboard", label: "Início" },
  { href: "/treinos/gerar", label: "Treinos" },
  { href: "/evolucao", label: "Evolução" },
  { href: "/perfil", label: "Perfil" },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname.startsWith(href.split("/gerar")[0]);
}

export default function AppNav({ user }: { user: { name: string } | null }) {
  const pathname = usePathname();
  const firstName = user?.name.trim().split(/\s+/)[0];
  return <header className="sticky top-0 z-40 border-b border-white/5 bg-neutral-950/85 backdrop-blur-xl">
    <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6" aria-label="Navegação principal">
      <Link href={user ? "/dashboard" : "/login"} className="group flex items-center gap-2.5" aria-label="Boxing, página inicial">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 font-black shadow-lg shadow-red-950/50 transition group-hover:rotate-3">B</span>
        <span className="text-lg font-black tracking-[0.12em]">BOXING</span>
      </Link>
      {user ? <>
        <div className="hidden items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900/70 p-1 md:flex">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition ${isActive(pathname, link.href) ? "bg-red-600 text-white shadow" : "text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}>{link.label}</Link>)}
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-neutral-400 sm:inline">Olá, <strong className="text-neutral-200">{firstName}</strong></span>
          <LogoutButton />
        </div>
      </> : <div className="flex items-center gap-2 text-sm">
        <Link href="/login" className="rounded-lg px-3 py-2 font-semibold text-neutral-300 hover:text-white">Entrar</Link>
        <Link href="/cadastro" className="rounded-lg bg-red-600 px-3.5 py-2 font-bold text-white hover:bg-red-500">Criar conta</Link>
      </div>}
    </nav>
    {user && <nav className="mx-auto flex max-w-6xl justify-around border-t border-white/5 px-2 md:hidden" aria-label="Navegação móvel">
      {links.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(pathname, link.href) ? "page" : undefined} className={`border-b-2 px-3 py-2.5 text-xs font-bold ${isActive(pathname, link.href) ? "border-red-500 text-white" : "border-transparent text-neutral-500"}`}>{link.label}</Link>)}
    </nav>}
  </header>;
}
