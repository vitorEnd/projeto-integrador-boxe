"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function WeightForm() {
  const router = useRouter();
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/weights", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error); return; }
      setSuccess(result.message);
      (event.target as HTMLFormElement).reset();
      router.refresh();
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
    <label className="field">Data da pesagem<input name="recordedOn" type="date" max={today} defaultValue={today} required /></label>
    <label className="field">Peso (kg)<input name="weightKg" type="number" step="0.1" min="0.1" max="1000" placeholder="Ex.: 74,5" required /></label>
    <button className="btn h-[42px]" disabled={loading}>{loading ? "Salvando..." : "Registrar peso"}</button>
    {error && <p role="alert" className="text-sm text-red-400 sm:col-span-3">{error}</p>}
    {success && <p role="status" className="text-sm text-green-400 sm:col-span-3">{success}</p>}
  </form>;
}
