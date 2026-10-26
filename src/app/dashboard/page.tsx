import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const labels: Record<string, string> = {
  INICIANTE: "Iniciante", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado",
  EMAGRECIMENTO: "Emagrecimento", GANHO_MASSA: "Ganho de massa",
  CONDICIONAMENTO: "Condicionamento", TECNICA: "Técnica",
};

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const [profile, latest, logCount, weekLogs, recentLogs] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.workout.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { exercises: true } } } }),
    prisma.workoutLog.count({ where: { userId: user.id } }),
    prisma.workoutLog.findMany({ where: { userId: user.id, performedAt: { gte: weekStart } }, select: { durationMinutes: true } }),
    prisma.workoutLog.findMany({ where: { userId: user.id }, orderBy: { performedAt: "desc" }, take: 3 }),
  ]);

  const next = !profile
    ? { title: "Complete seu perfil", description: "Leva cerca de um minuto e permite personalizar os treinos.", href: "/perfil", action: "Preencher perfil" }
    : !latest
      ? { title: "Gere seu primeiro treino", description: "Vamos combinar objetivo, experiência e frequência para montar sua sessão.", href: "/treinos/gerar", action: "Gerar treinamento" }
      : logCount === 0
        ? { title: "Pronto para começar?", description: "Abra seu treino, use o modo guiado e registre quando terminar.", href: `/treinos/${latest.id}`, action: "Iniciar meu treino" }
        : { title: "Continue sua sequência", description: "Seu histórico já começou. Faça uma nova sessão ou veja sua evolução.", href: `/treinos/${latest.id}`, action: "Treinar agora" };

  const weekMinutes = weekLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const target = profile?.frequencyDays ?? 0;
  const progress = target ? Math.min(100, Math.round((weekLogs.length / target) * 100)) : 0;

  return <div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Painel do aluno</p><h1 className="page-title">Olá, {user.name.split(" ")[0]} 👋</h1><p className="mt-2 text-neutral-400">Seu treino e seu progresso, sem complicação.</p></div>
      {latest && <Link href={`/treinos/${latest.id}`} className="btn-secondary">Ver treino atual</Link>}
    </header>

    <section className="relative overflow-hidden rounded-3xl border border-red-800/50 bg-gradient-to-br from-red-950 via-neutral-900 to-neutral-900 p-6 shadow-2xl shadow-red-950/20 sm:p-8">
      <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-red-600/10 blur-2xl" />
      <div className="relative max-w-2xl"><p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">Seu próximo passo</p><h2 className="mt-3 text-2xl font-black sm:text-3xl">{next.title}</h2><p className="mt-3 text-neutral-300">{next.description}</p><Link href={next.href} className="btn mt-6">{next.action}<span aria-hidden="true">→</span></Link></div>
    </section>

    <section aria-labelledby="resumo-semana">
      <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow">Resumo</p><h2 id="resumo-semana" className="mt-1 text-xl font-bold">Esta semana</h2></div><Link href="/evolucao" className="text-sm font-semibold text-red-400 hover:text-red-300">Ver evolução →</Link></div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card md:col-span-2">
          <div className="flex items-center justify-between"><div><p className="text-sm text-neutral-400">Meta semanal</p><p className="mt-1 text-2xl font-black">{weekLogs.length} de {target || "—"} treinos</p></div><span className="grid h-14 w-14 place-items-center rounded-full border-4 border-red-500/30 text-sm font-black text-red-300">{target ? `${progress}%` : "—"}</span></div>
          <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-neutral-800" role="progressbar" aria-label="Progresso da meta semanal" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-orange-500 transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="mt-3 text-sm text-neutral-400">{target ? weekLogs.length >= target ? "Meta cumprida. Excelente consistência!" : `Faltam ${target - weekLogs.length} treino(s) para a meta definida no perfil.` : "Complete o perfil para definir sua frequência semanal."}</p>
        </div>
        <div className="card flex flex-col justify-between"><div><p className="text-sm text-neutral-400">Tempo treinado</p><p className="mt-2 text-4xl font-black">{weekMinutes}<span className="ml-1 text-lg text-neutral-500">min</span></p></div><p className="mt-5 text-sm text-neutral-500">Somente treinos registrados nesta semana.</p></div>
      </div>
    </section>

    <section aria-labelledby="jornada"><div className="mb-4"><p className="eyebrow">Jornada</p><h2 id="jornada" className="mt-1 text-xl font-bold">Como funciona</h2></div>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { number: 1, title: "Perfil", done: !!profile, href: "/perfil", detail: profile ? "Tudo preenchido" : "Informe seus dados" },
          { number: 2, title: "Treinamento", done: !!latest, href: latest ? `/treinos/${latest.id}` : profile ? "/treinos/gerar" : "/perfil", detail: latest ? `${latest._count.exercises} exercícios` : "Gere seu plano" },
          { number: 3, title: "Registro", done: logCount > 0, href: latest ? `/treinos/${latest.id}` : "/treinos/gerar", detail: logCount > 0 ? `${logCount} realizado(s)` : "Registre a sessão" },
          { number: 4, title: "Evolução", done: logCount > 1, href: "/evolucao", detail: logCount > 1 ? "Compare resultados" : "Construa seu histórico" },
        ].map((step) => <li key={step.number}><Link href={step.href} className="card card-interactive block h-full"><div className="flex items-center justify-between"><span className="text-xs font-black text-red-400">ETAPA {step.number}</span><span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${step.done ? "bg-emerald-500/20 text-emerald-300" : "bg-neutral-800 text-neutral-500"}`}>{step.done ? "✓" : step.number}</span></div><h3 className="mt-4 font-bold">{step.title}</h3><p className="mt-1 text-sm text-neutral-400">{step.detail}</p></Link></li>)}
      </ol>
    </section>

    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Seu perfil</h2><Link href="/perfil" className="text-sm font-semibold text-red-400">{profile ? "Editar" : "Completar"}</Link></div>{profile ? <div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm">{labels[profile.goal]}</span><span className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm">{labels[profile.experience]}</span><span className="rounded-full bg-neutral-800 px-3 py-1.5 text-sm">{profile.frequencyDays}x por semana</span></div> : <p className="mt-3 text-sm text-neutral-400">Seu treino fica mais adequado depois que você informa objetivo e experiência.</p>}</section>
      <section className="card"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Últimas atividades</h2>{recentLogs.length > 0 && <Link href="/evolucao" className="text-sm font-semibold text-red-400">Histórico</Link>}</div>{recentLogs.length ? <ul className="mt-3 divide-y divide-neutral-800">{recentLogs.map((log) => <li className="flex items-center justify-between gap-3 py-3 text-sm" key={log.id}><div><strong>Treino #{log.workoutId}</strong><p className="text-neutral-500">{log.performedAt.toLocaleDateString("pt-BR")}</p></div><span className="text-neutral-300">{log.durationMinutes} min · esforço {log.perceivedEffort}</span></li>)}</ul> : <p className="mt-3 text-sm text-neutral-400">Ao concluir um treino, ele aparecerá aqui.</p>}</section>
    </div>
  </div>;
}
