import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { estimateCalories } from "@/services/calorie-estimate";
import WeightForm from "@/components/weight-form";

const formatWeight = (value: number) => `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)} kg`;

export default async function Evolucao() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, logs, weights, latestWorkout] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.workoutLog.findMany({ where: { userId: user.id }, orderBy: { performedAt: "desc" } }),
    prisma.weightLog.findMany({ where: { userId: user.id }, orderBy: { recordedOn: "asc" } }),
    prisma.workout.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const weightFor = (date: Date) => {
    const day = date.toISOString().slice(0, 10);
    let weight = weights[0]?.weightKg ?? profile?.weightKg ?? null;
    for (const entry of weights) {
      if (entry.recordedOn.toISOString().slice(0, 10) <= day) weight = entry.weightKg;
      else break;
    }
    return weight;
  };
  const history = logs.map((log) => {
    const weight = weightFor(log.performedAt);
    return { log, calories: weight ? estimateCalories(log.durationMinutes, weight) : null };
  });
  const total = logs.length;
  const minutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const effort = logs.reduce((sum, log) => sum + log.perceivedEffort, 0);
  const calories = history.reduce((sum, entry) => sum + (entry.calories ?? 0), 0);
  const now = new Date();
  const countDays = (days: number) => {
    const start = new Date(now);
    start.setDate(start.getDate() - days);
    return logs.filter((log) => log.performedAt >= start).length;
  };
  const metrics = [
    { label: "Treinos realizados", value: total },
    { label: "Calorias queimadas (estimativa)", value: `${calories} kcal`, accent: true },
    { label: "Minutos treinados", value: minutes },
    { label: "Média de duração", value: total ? `${Math.round(minutes / total)} min` : "—" },
    { label: "Média de esforço", value: total ? `${(effort / total).toFixed(1)} / 10` : "—" },
    { label: "Últimos 7 / 30 dias", value: `${countDays(7)} / ${countDays(30)}` },
  ];
  const firstWeight = weights[0];
  const lastWeight = weights.at(-1);
  const change = firstWeight && lastWeight ? lastWeight.weightKg - firstWeight.weightKg : 0;

  return <div className="space-y-8">
    <header>
      <p className="mb-1 text-sm font-bold uppercase tracking-widest text-boxing">Acompanhamento</p>
      <h1 className="text-3xl font-bold">Sua evolução</h1>
      <p className="mt-2 text-neutral-400">Veja seus treinos registrados e acompanhe seu peso em um só lugar.</p>
    </header>

    <section aria-label="Indicadores dos treinos" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => <div className={`card ${metric.accent ? "border-boxing" : ""}`} key={metric.label}>
        <p className="text-sm text-neutral-400">{metric.label}</p>
        <p className="mt-2 text-2xl font-bold">{metric.value}</p>
      </div>)}
    </section>

    <details className="text-sm text-neutral-400">
      <summary className="cursor-pointer text-neutral-300">Como são estimadas as calorias?</summary>
      <p className="mt-2">A estimativa usa a duração do treino, o peso registrado para a data e 5,8 MET para boxe no saco. É um valor aproximado; o treino pode ter intensidades diferentes.</p>
      <p className="mt-1">Referências: <a className="underline" href="https://pacompendium.com/sports/" target="_blank" rel="noreferrer">Compêndio de Atividades Físicas</a> e <a className="underline" href="https://www.acefitness.org/continuingeducation/courses/support_items/OLC-MATH-10/coursecontent.pdf" target="_blank" rel="noreferrer">fórmula de MET do ACE</a>.</p>
    </details>

    {profile?.goal === "EMAGRECIMENTO" && <section className="card" id="peso">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-xl font-bold">Acompanhar peso</h2><p className="mt-1 text-sm text-neutral-400">Registre uma pesagem por data. Se informar a mesma data de novo, o valor é atualizado.</p></div>
        {lastWeight && <div className="rounded-lg bg-neutral-800 px-4 py-2 text-right"><p className="text-xs text-neutral-400">Peso mais recente</p><p className="text-xl font-bold">{formatWeight(lastWeight.weightKg)}</p></div>}
      </div>
      <WeightForm />
      {weights.length > 1 && <p className="mt-5 text-sm text-neutral-300">Mudança desde a primeira pesagem: <strong>{change > 0 ? "+" : ""}{formatWeight(change)}</strong></p>}
      {weights.length === 1 && <p className="mt-5 text-sm text-neutral-400">Registre uma nova pesagem em outra data para comparar.</p>}
      <h3 className="mt-6 font-semibold">Histórico de peso</h3>
      {weights.length ? <ul className="mt-2 divide-y divide-neutral-800">{[...weights].reverse().slice(0, 20).map((entry) => <li key={entry.id} className="flex justify-between gap-3 py-2 text-sm"><span>{entry.recordedOn.toLocaleDateString("pt-BR", { timeZone: "UTC" })}</span><strong>{formatWeight(entry.weightKg)}</strong></li>)}</ul> : <p className="mt-2 text-sm text-neutral-400">Nenhuma pesagem registrada ainda.</p>}
    </section>}

    {!profile && <div className="card"><p>Complete seu perfil para gerar treinos e acompanhar seu peso.</p><Link href="/perfil" className="btn mt-4">Completar perfil</Link></div>}

    <section>
      <h2 className="mb-4 text-xl font-bold">Histórico de treinamentos</h2>
      {total === 0 ? <div className="card"><p>Você ainda não possui treinamentos registrados.</p><Link href={latestWorkout ? `/treinos/${latestWorkout.id}` : profile ? "/treinos/gerar" : "/perfil"} className="btn mt-4">{latestWorkout ? "Registrar meu treino" : profile ? "Gerar meu treino" : "Completar perfil"}</Link></div> : <>
        {total === 1 && <p className="mb-4 rounded-lg border border-yellow-700 bg-yellow-950 p-4 text-yellow-100">Ainda não existem dados suficientes para identificar uma evolução significativa.</p>}
        <div className="space-y-3">{history.slice(0, 20).map(({ log, calories: logCalories }) => <div className="card flex flex-wrap items-center justify-between gap-2" key={log.id}>
          <div><p className="font-semibold">Treino #{log.workoutId} · {log.performedAt.toLocaleDateString("pt-BR")}</p><p className="text-sm text-neutral-400">{log.durationMinutes} min · esforço {log.perceivedEffort}/10 · {logCalories === null ? "calorias indisponíveis" : `~${logCalories} kcal`}</p>{log.notes && <p className="mt-1 text-sm">{log.notes}</p>}</div>
          <Link href={`/treinos/${log.workoutId}`} className="text-sm text-boxing underline">Ver treino</Link>
        </div>)}</div>
      </>}
    </section>
  </div>;
}
