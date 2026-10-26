"use client";

import { useEffect, useState } from "react";

export type WorkoutPlayerItem = {
  id: number;
  order: number;
  name: string;
  category: string;
  description: string;
  sets: number | null;
  reps: string | null;
  durationSeconds: number | null;
  restSeconds: number;
  notes: string | null;
};

function formatTimer(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function WorkoutPlayer({ items }: { items: WorkoutPlayerItem[] }) {
  const [completed, setCompleted] = useState<Set<number>>(() => new Set());
  const [activeIndex, setActiveIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const activeDuration = items[activeIndex]?.durationSeconds ?? 60;
  const [secondsLeft, setSecondsLeft] = useState(activeDuration);
  const percentage = Math.round((completed.size / items.length) * 100);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) { setRunning(false); return 0; }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const completedLabel = `${completed.size} de ${items.length} exercícios concluídos`;

  function selectExercise(index: number) {
    setActiveIndex(index);
    setRunning(false);
    setSecondsLeft(items[index].durationSeconds ?? 60);
  }

  function toggleComplete(id: number) {
    setCompleted((current) => {
      const updated = new Set(current);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  }

  function goToNext() {
    const nextIndex = items.findIndex((item, index) => index > activeIndex && !completed.has(item.id));
    if (nextIndex >= 0) selectExercise(nextIndex);
  }

  const active = items[activeIndex];
  return <section aria-labelledby="modo-guiado" className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Nova função</p><h2 id="modo-guiado" className="mt-1 text-2xl font-black">Modo treino guiado</h2><p className="mt-1 text-sm text-neutral-400">Marque cada etapa enquanto treina. O checklist fica apenas nesta tela.</p></div>
      <div className="min-w-48 text-right"><p className="text-sm font-semibold" aria-live="polite">{completedLabel}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800" role="progressbar" aria-label="Exercícios concluídos" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-500 transition-all" style={{ width: `${percentage}%` }} /></div></div>
    </div>

    <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
      <ol className="space-y-3">
        {items.map((item, index) => {
          const done = completed.has(item.id);
          const selected = index === activeIndex;
          return <li key={item.id} className={`rounded-2xl border p-4 transition ${selected ? "border-red-500 bg-red-950/25" : "border-neutral-800 bg-neutral-900/70"} ${done ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-3">
              <button type="button" onClick={() => toggleComplete(item.id)} className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-sm font-black transition ${done ? "border-emerald-500 bg-emerald-500 text-neutral-950" : "border-neutral-600 text-transparent hover:border-red-400"}`} aria-label={`${done ? "Desmarcar" : "Marcar"} ${item.name} como concluído`}>✓</button>
              <button type="button" onClick={() => selectExercise(index)} className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-black text-red-400">{String(item.order).padStart(2, "0")}</span><h3 className={`font-bold ${done ? "line-through" : ""}`}>{item.name}</h3><span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-400">{item.category}</span></div>
                <p className="mt-1 text-sm text-neutral-400">{item.description}</p>
                <p className="mt-2 text-sm font-semibold text-neutral-200">{item.sets} séries · {item.reps ? `${item.reps} repetições` : `${item.durationSeconds} segundos`} · descanso de {item.restSeconds}s</p>
                {item.notes && <p className="mt-1 text-xs text-orange-300">Dica: {item.notes}</p>}
              </button>
            </div>
          </li>;
        })}
      </ol>

      <aside className="card h-fit lg:sticky lg:top-28">
        <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Exercício atual</p><h3 className="mt-2 text-xl font-black">{active.name}</h3><p className="mt-1 text-sm text-neutral-400">Use o cronômetro para a execução ou para controlar uma rodada.</p>
        <p className="my-6 text-center font-mono text-5xl font-black tabular-nums" aria-live="polite">{formatTimer(secondsLeft)}</p>
        <div className="grid grid-cols-2 gap-2"><button type="button" className="btn" onClick={() => { if (secondsLeft === 0) setSecondsLeft(activeDuration); setRunning((value) => !value); }}>{running ? "Pausar" : secondsLeft === 0 ? "Reiniciar" : "Iniciar"}</button><button type="button" className="btn-secondary" onClick={() => { setRunning(false); setSecondsLeft(activeDuration); }}>Resetar</button></div>
        <button type="button" className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-neutral-400 hover:bg-neutral-800 hover:text-white" onClick={() => { if (!completed.has(active.id)) toggleComplete(active.id); goToNext(); }}>{completed.has(active.id) ? "Ir para o próximo" : "Concluir e avançar →"}</button>
        {percentage === 100 && <p role="status" className="status-success mt-4 text-center">Treino concluído! Registre a sessão logo abaixo.</p>}
      </aside>
    </div>
  </section>;
}
