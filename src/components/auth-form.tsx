"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "register" | "login" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      router.push(mode === "login" ? "/dashboard" : "/login?cadastro=ok");
      router.refresh();
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setLoading(false); }
  }

  const registering = mode === "register";
  return <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/80 shadow-2xl shadow-black/30 lg:grid-cols-[1.05fr_1fr]">
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-red-800 via-red-950 to-neutral-950 p-10 lg:flex lg:flex-col lg:justify-between">
      <div className="absolute -right-16 top-16 h-56 w-56 rounded-full border-[35px] border-white/5" />
      <div className="relative"><p className="text-sm font-black uppercase tracking-[0.25em] text-red-200">Seu ritmo. Seu progresso.</p><h2 className="mt-5 max-w-md text-4xl font-black leading-tight text-balance">Treine com direção e acompanhe cada conquista.</h2><p className="mt-5 max-w-md text-red-100/70">Uma rotina simples para montar o treino, registrar a sessão e enxergar a evolução.</p></div>
      <ul className="relative mt-16 space-y-4 text-sm text-red-50/90">
        <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10">✓</span>Treinos adaptados ao seu objetivo e experiência</li>
        <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10">✓</span>Modo guiado para acompanhar cada exercício</li>
        <li className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10">✓</span>Histórico, minutos, esforço, calorias e peso</li>
      </ul>
    </aside>

    <section className="p-6 sm:p-10 lg:p-12">
      <p className="eyebrow">{registering ? "Comece agora" : "Bem-vindo de volta"}</p>
      <h1 className="mt-2 text-3xl font-black">{registering ? "Crie sua conta" : "Entre na sua conta"}</h1>
      <p className="mb-7 mt-2 text-sm text-neutral-400">{registering ? "São só três dados. Depois você completa seu perfil." : "Acesse seus treinos e continue de onde parou."}</p>
      <form onSubmit={submit} className="space-y-4">
        {registering && <label className="field block">Nome completo<input name="name" required maxLength={100} autoComplete="name" placeholder="Como podemos chamar você?" /></label>}
        <label className="field block">E-mail<input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="voce@exemplo.com" /></label>
        <label className="field block">Senha
          <span className="relative block"><input className="pr-20" name="password" type={showPassword ? "text" : "password"} required minLength={registering ? 8 : undefined} autoComplete={registering ? "new-password" : "current-password"} placeholder={registering ? "Mínimo de 8 caracteres" : "Sua senha"} /><button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-2 my-auto h-9 rounded-lg px-3 text-xs font-bold text-neutral-400 hover:bg-neutral-800 hover:text-white" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? "Ocultar" : "Mostrar"}</button></span>
        </label>
        {error && <p role="alert" className="status-error">{error}</p>}
        <button className="btn mt-2 w-full" disabled={loading}>{loading ? "Aguarde..." : registering ? "Criar minha conta" : "Entrar"}<span aria-hidden="true">→</span></button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-400">{registering ? "Já possui uma conta?" : "Primeira vez por aqui?"} <Link className="font-bold text-red-400 hover:text-red-300" href={registering ? "/login" : "/cadastro"}>{registering ? "Entrar" : "Criar conta grátis"}</Link></p>
      {registering && <p className="mt-5 text-center text-xs text-neutral-600">Seus dados são usados apenas para personalizar e registrar os treinos.</p>}
    </section>
  </div>;
}
