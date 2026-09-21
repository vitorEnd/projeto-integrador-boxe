"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
export default function CompleteForm({ workoutId }: { workoutId: number }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [loading, setLoading] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState("");
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
  return <form onSubmit={submit} className="card space-y-4"><h2 className="text-xl font-bold">Registrar como realizado</h2><div className="grid gap-4 sm:grid-cols-3"><label className="field">Data<input name="performedAt" type="date" max={today} defaultValue={today} required /></label><label className="field">Duração (minutos)<input name="durationMinutes" type="number" min="1" required /></label><label className="field">Esforço percebido (1 a 10)<input name="perceivedEffort" type="number" min="1" max="10" required /></label></div><label className="field block">Observação opcional<textarea name="notes" maxLength={500} rows={2} /></label>{error && <p role="alert" className="text-red-400">{error}</p>}{success && <p role="status" className="text-green-400">{success} <Link href="/evolucao" className="underline">Ver evolução</Link></p>}<button disabled={loading} className="btn">{loading ? "Registrando..." : "Registrar como realizado"}</button></form>;
}
