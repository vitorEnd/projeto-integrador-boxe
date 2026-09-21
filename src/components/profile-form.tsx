"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@prisma/client";
import Link from "next/link";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      setSuccess("Perfil salvo com sucesso."); router.refresh();
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit} className="card grid gap-4 sm:grid-cols-2"><label className="field">Idade<input name="age" type="number" min="1" max="120" required defaultValue={profile?.age} /></label><label className="field">Altura (cm)<input name="heightCm" type="number" step="0.1" min="0.1" required defaultValue={profile?.heightCm} /></label><label className="field">Peso atual (kg)<input name="weightKg" type="number" step="0.1" min="0.1" max="1000" required defaultValue={profile?.weightKg} /></label><label className="field">Dias por semana<input name="frequencyDays" type="number" min="1" max="7" required defaultValue={profile?.frequencyDays ?? 3} /></label><label className="field">Nível<select name="experience" defaultValue={profile?.experience ?? "INICIANTE"}><option value="INICIANTE">Iniciante</option><option value="INTERMEDIARIO">Intermediário</option><option value="AVANCADO">Avançado</option></select></label><label className="field">Objetivo<select name="goal" defaultValue={profile?.goal ?? "CONDICIONAMENTO"}><option value="EMAGRECIMENTO">Emagrecimento</option><option value="GANHO_MASSA">Ganho de massa</option><option value="CONDICIONAMENTO">Condicionamento</option><option value="TECNICA">Técnica</option></select></label>{error && <p role="alert" className="text-red-400 sm:col-span-2">{error}</p>}{success && <div role="status" className="flex flex-wrap items-center gap-3 text-green-400 sm:col-span-2"><span>{success}</span><Link href="/treinos/gerar" className="underline">Próximo: gerar treino →</Link></div>}<button className="btn sm:col-span-2" disabled={loading}>{loading ? "Salvando..." : "Salvar perfil"}</button></form>;
}
