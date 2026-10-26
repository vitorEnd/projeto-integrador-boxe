"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function CompleteForm({ workoutId }: { workoutId: number }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError(""); setSuccess("");
    try {
      const response = await fetch(`/api/workouts/${workoutId}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      setSuccess(result.message);
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="card scroll-mt-28 space-y-5 border-emerald-900/50" id="registrar"><div><p className="eyebrow text-emerald-400">Finalização</p><h2 className="mt-1 text-2xl font-black">Como foi o treino?</h2><p className="mt-1 text-sm text-neutral-400">Este registro alimenta sua meta semanal e os gráficos de evolução.</p></div><div className="grid gap-4 sm:grid-cols-3"><label className="field">Data<input name="performedAt" type="date" max={today} defaultValue={today} required /></label><label className="field">Duração <span className="font-normal text-neutral-500">(min)</span><input name="durationMinutes" type="number" min="1" max="1440" placeholder="Ex.: 35" required /></label><label className="field">Esforço percebido<select name="perceivedEffort" defaultValue="" required><option value="" disabled>Selecione de 1 a 10</option>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option value={value} key={value}>{value} — {value <= 3 ? "leve" : value <= 6 ? "moderado" : value <= 8 ? "intenso" : "máximo"}</option>)}</select></label></div><label className="field block">Observação <span className="font-normal text-neutral-500">(opcional)</span><textarea name="notes" maxLength={500} rows={3} placeholder="Ex.: Melhorei o ritmo e senti mais facilidade nos golpes." /></label>{error && <p role="alert" className="status-error">{error}</p>}{success && <div role="status" className="status-success flex flex-wrap items-center justify-between gap-3"><span>{success}</span><Link href="/evolucao" className="font-bold underline">Ver minha evolução →</Link></div>}<button disabled={loading} className="btn w-full sm:w-auto">{loading ? "Salvando registro..." : "Salvar treino realizado"}</button></form>;
}
