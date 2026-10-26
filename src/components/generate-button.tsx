"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function GenerateButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false), [error, setError] = useState(""), [success, setSuccess] = useState("");
  async function generate() {
    setLoading(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/workouts/generate", { method: "POST" });
      const data = await response.json();
      if (!response.ok) { setError(data.error); return; }
      setSuccess(data.message); router.push(`/treinos/${data.id}`); router.refresh();
    } catch { setError("Falha de conexão. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <div className="space-y-3"><button onClick={generate} disabled={loading} className="btn w-full sm:w-auto">{loading ? "Montando seu treino..." : "Gerar novo treinamento"}<span aria-hidden="true">→</span></button>{error && <p role="alert" className="status-error">{error}</p>}{success && <p role="status" className="status-success">{success}</p>}</div>;
}
