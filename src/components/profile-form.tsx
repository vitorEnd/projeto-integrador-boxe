"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { Profile } from "@prisma/client";
import Link from "next/link";

export default function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  return <form onSubmit={submit} className="card space-y-7">
    <fieldset><legend className="text-lg font-black">Dados físicos</legend><p className="mt-1 text-sm text-neutral-500">Usados somente nos indicadores e na estimativa de calorias.</p><div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="field">Idade<input name="age" type="number" min="1" max="120" required defaultValue={profile?.age} placeholder="Ex.: 22" /></label><label className="field">Altura <span className="font-normal text-neutral-500">(cm)</span><input name="heightCm" type="number" step="0.1" min="0.1" required defaultValue={profile?.heightCm} placeholder="Ex.: 175" /></label><label className="field">Peso atual <span className="font-normal text-neutral-500">(kg)</span><input name="weightKg" type="number" step="0.1" min="0.1" max="1000" required defaultValue={profile?.weightKg} placeholder="Ex.: 78" /></label></div></fieldset>
    <div className="h-px bg-neutral-800" />
    <fieldset><legend className="text-lg font-black">Preferências do treino</legend><p className="mt-1 text-sm text-neutral-500">Estas escolhas alteram exercícios, séries e descanso.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="field">Nível de experiência<select name="experience" defaultValue={profile?.experience ?? "INICIANTE"}><option value="INICIANTE">Iniciante</option><option value="INTERMEDIARIO">Intermediário</option><option value="AVANCADO">Avançado</option></select></label><label className="field">Objetivo principal<select name="goal" defaultValue={profile?.goal ?? "CONDICIONAMENTO"}><option value="EMAGRECIMENTO">Emagrecimento</option><option value="GANHO_MASSA">Ganho de massa</option><option value="CONDICIONAMENTO">Condicionamento</option><option value="TECNICA">Técnica</option></select></label><label className="field sm:col-span-2">Quantos dias por semana você pretende treinar?<input name="frequencyDays" type="number" min="1" max="7" required defaultValue={profile?.frequencyDays ?? 3} /><span className="block font-normal text-neutral-500">Aceitamos valores entre 1 e 7 dias.</span></label></div></fieldset>
    {error && <p role="alert" className="status-error">{error}</p>}
    {success && <div role="status" className="status-success flex flex-wrap items-center justify-between gap-3"><span>{success}</span><Link href="/treinos/gerar" className="font-bold underline">Gerar treino →</Link></div>}
    <button className="btn w-full" disabled={loading}>{loading ? "Salvando perfil..." : profile ? "Salvar alterações" : "Salvar e continuar"}<span aria-hidden="true">→</span></button>
  </form>;
}
