"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "register" | "login" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      setMessage(result.message);
      if (mode === "login") { router.push("/dashboard"); router.refresh(); }
      else { router.push("/login?cadastro=ok"); router.refresh(); }
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <div className="mx-auto max-w-md card"><h1 className="mb-2 text-2xl font-bold">{mode === "register" ? "Criar conta" : "Entrar"}</h1><p className="mb-6 text-neutral-400">{mode === "register" ? "Comece seu acompanhamento de boxe." : "Acesse seus treinamentos."}</p><form onSubmit={submit} className="space-y-4">{mode === "register" && <label className="field block">Nome<input name="name" required maxLength={100} autoComplete="name" /></label>}<label className="field block">E-mail<input name="email" type="email" required autoComplete="email" /></label><label className="field block">Senha<input name="password" type="password" required minLength={mode === "register" ? 8 : undefined} autoComplete={mode === "register" ? "new-password" : "current-password"} /></label>{error && <p role="alert" className="text-sm text-red-400">{error}</p>}{message && <p role="status" className="text-sm text-green-400">{message}</p>}<button className="btn w-full" disabled={loading}>{loading ? "Aguarde..." : mode === "register" ? "Cadastrar" : "Entrar"}</button></form><p className="mt-5 text-sm text-neutral-400">{mode === "register" ? "Já possui conta?" : "Ainda não possui conta?"} <Link className="text-white underline" href={mode === "register" ? "/login" : "/cadastro"}>{mode === "register" ? "Entrar" : "Cadastre-se"}</Link></p></div>;
}
