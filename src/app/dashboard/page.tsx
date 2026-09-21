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
  const [profile, latest, logCount] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.workout.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.workoutLog.count({ where: { userId: user.id } }),
  ]);

  const next = !profile
    ? { title: "Complete seu perfil", description: "Informe seu objetivo, nível e frequência para receber uma sugestão de treino.", href: "/perfil", action: "Preencher perfil" }
    : !latest
      ? { title: "Gere seu primeiro treino", description: "O treino será montado com os exercícios disponíveis para o seu perfil.", href: "/treinos/gerar", action: "Gerar treinamento" }
      : logCount === 0
        ? { title: "Registre seu treino", description: "Depois de treinar, informe a duração e o esforço para iniciar seu histórico.", href: `/treinos/${latest.id}`, action: "Abrir meu treino" }
        : { title: "Veja sua evolução", description: "Confira seus registros, calorias estimadas e histórico.", href: "/evolucao", action: "Ver evolução" };

  return <div className="space-y-7">
    <header><p className="text-sm font-bold uppercase tracking-widest text-boxing">Painel do aluno</p><h1 className="mt-1 text-3xl font-bold">Olá, {user.name}</h1><p className="mt-2 text-neutral-400">Siga os passos abaixo para acompanhar seus treinos.</p></header>

    <section className="card border-boxing bg-gradient-to-br from-neutral-900 to-red-950/30">
      <p className="text-sm font-bold uppercase tracking-wider text-red-300">Próximo passo</p>
      <h2 className="mt-2 text-2xl font-bold">{next.title}</h2>
      <p className="mt-2 max-w-xl text-neutral-300">{next.description}</p>
      <Link href={next.href} className="btn mt-5">{next.action} →</Link>
    </section>

    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Etapas do acompanhamento">
      {[
        { number: 1, title: "Perfil", done: !!profile, href: "/perfil", detail: profile ? "Preenchido" : "Preencher" },
        { number: 2, title: "Treinamento", done: !!latest, href: latest ? `/treinos/${latest.id}` : profile ? "/treinos/gerar" : "/perfil", detail: latest ? "Gerado" : "Gerar" },
        { number: 3, title: "Registro", done: logCount > 0, href: latest ? `/treinos/${latest.id}` : "/treinos/gerar", detail: logCount > 0 ? `${logCount} realizado(s)` : "Registrar" },
        { number: 4, title: "Evolução", done: logCount > 0, href: "/evolucao", detail: "Acompanhar" },
      ].map((step) => <li key={step.number}><Link href={step.href} className="card block h-full hover:border-boxing"><span className="text-xs font-bold text-boxing">ETAPA {step.number}</span><h2 className="mt-2 font-bold">{step.title}</h2><p className="mt-1 text-sm text-neutral-400">{step.done ? "✓ " : "○ "}{step.detail}</p></Link></li>)}
    </ol>

    <section className="card flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="text-lg font-bold">Seu perfil</h2>{profile ? <p className="mt-1 text-sm text-neutral-300">{labels[profile.goal]} · {labels[profile.experience]} · {profile.frequencyDays} dias por semana</p> : <p className="mt-1 text-sm text-neutral-400">Ainda não preenchido.</p>}</div>
      <Link href="/perfil" className="btn-secondary">{profile ? "Editar perfil" : "Completar perfil"}</Link>
    </section>

    {profile?.goal === "EMAGRECIMENTO" && <section className="card flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-lg font-bold">Acompanhe seu peso</h2><p className="mt-1 text-sm text-neutral-400">Registre novas pesagens na página de evolução.</p></div><Link href="/evolucao#peso" className="btn-secondary">Registrar peso</Link></section>}
  </div>;
}
