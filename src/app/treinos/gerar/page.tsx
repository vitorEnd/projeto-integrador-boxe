import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GenerateButton from "@/components/generate-button";

const labels: Record<string, string> = { INICIANTE: "Iniciante", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado", EMAGRECIMENTO: "Emagrecimento", GANHO_MASSA: "Ganho de massa", CONDICIONAMENTO: "Condicionamento", TECNICA: "Técnica" };

export default async function Gerar() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [profile, recentWorkouts] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.workout.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 4, include: { _count: { select: { exercises: true, logs: true } } } }),
  ]);

  return <div className="space-y-8">
    <header><p className="eyebrow">Treinamentos</p><h1 className="page-title">Monte seu próximo treino</h1><p className="mt-2 max-w-2xl text-neutral-400">O sistema combina seu objetivo, nível e rotina com os exercícios disponíveis.</p></header>

    {profile ? <section className="grid gap-4 lg:grid-cols-[1fr_.7fr]">
      <div className="card border-red-900/60 bg-gradient-to-br from-neutral-900 to-red-950/30"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Perfil usado na geração</h2><Link href="/perfil" className="text-sm font-bold text-red-400 hover:text-red-300">Editar</Link></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-neutral-950/60 p-4"><p className="text-xs text-neutral-500">Objetivo</p><strong className="mt-1 block">{labels[profile.goal]}</strong></div><div className="rounded-xl bg-neutral-950/60 p-4"><p className="text-xs text-neutral-500">Experiência</p><strong className="mt-1 block">{labels[profile.experience]}</strong></div><div className="rounded-xl bg-neutral-950/60 p-4"><p className="text-xs text-neutral-500">Frequência</p><strong className="mt-1 block">{profile.frequencyDays}x por semana</strong></div></div><div className="mt-6"><GenerateButton /></div></div>
      <aside className="card"><p className="text-xs font-black uppercase tracking-widest text-neutral-500">O que acontece agora</p><ol className="mt-4 space-y-4 text-sm"><li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-500/15 font-bold text-red-300">1</span><p><strong className="block">Seleção</strong><span className="text-neutral-500">Exercícios compatíveis são consultados no banco.</span></p></li><li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-500/15 font-bold text-red-300">2</span><p><strong className="block">Organização</strong><span className="text-neutral-500">Séries, repetições e descanso são ajustados.</span></p></li><li className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-500/15 font-bold text-red-300">3</span><p><strong className="block">Treino guiado</strong><span className="text-neutral-500">Você recebe checklist e cronômetro.</span></p></li></ol></aside>
    </section> : <section className="card max-w-2xl border-orange-800/50"><p className="eyebrow text-orange-400">Falta uma etapa</p><h2 className="mt-2 text-xl font-bold">Complete seu perfil primeiro</h2><p className="mt-2 text-neutral-400">Precisamos do objetivo, experiência e frequência para gerar um treino coerente.</p><Link href="/perfil" className="btn mt-5">Completar perfil →</Link></section>}

    <section aria-labelledby="treinos-anteriores"><div className="mb-4"><p className="eyebrow">Histórico</p><h2 id="treinos-anteriores" className="mt-1 text-xl font-bold">Treinos gerados</h2></div>{recentWorkouts.length ? <div className="grid gap-3 sm:grid-cols-2">{recentWorkouts.map((workout, index) => <Link className="card card-interactive flex items-center justify-between gap-4" href={`/treinos/${workout.id}`} key={workout.id}><div><div className="flex items-center gap-2"><h3 className="font-bold">Treino #{workout.id}</h3>{index === 0 && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-black uppercase text-red-300">Atual</span>}</div><p className="mt-1 text-sm text-neutral-500">{workout._count.exercises} exercícios · {labels[workout.goal]}</p><p className="mt-1 text-xs text-neutral-600">Criado em {workout.createdAt.toLocaleDateString("pt-BR")} · {workout._count.logs} registro(s)</p></div><span className="text-xl text-neutral-600">→</span></Link>)}</div> : <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center text-sm text-neutral-500">Seu primeiro treino aparecerá aqui depois da geração.</div>}</section>
  </div>;
}
