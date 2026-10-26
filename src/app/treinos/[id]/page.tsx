import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompleteForm from "@/components/complete-form";
import WorkoutPlayer from "@/components/workout-player";

const labels: Record<string, string> = { INICIANTE: "Iniciante", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado", EMAGRECIMENTO: "Emagrecimento", GANHO_MASSA: "Ganho de massa", CONDICIONAMENTO: "Condicionamento", TECNICA: "Técnica", AQUECIMENTO: "Aquecimento", CARDIO: "Cardio", FORCA: "Força", CORE: "Core", MOBILIDADE: "Mobilidade" };

export default async function Treino({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const workout = await prisma.workout.findFirst({ where: { id, userId: user.id }, include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } } });
  if (!workout) notFound();

  const playerItems = workout.exercises.map((item) => ({
    id: item.id, order: item.order, name: item.exercise.name, category: labels[item.exercise.category] || item.exercise.category,
    description: item.exercise.description, sets: item.sets, reps: item.reps, durationSeconds: item.durationSeconds,
    restSeconds: item.restSeconds, notes: item.notes,
  }));
  const estimatedMinutes = Math.max(1, Math.round(workout.exercises.reduce((total, item) => total + (item.sets ?? 1) * (item.durationSeconds ?? 60) + Math.max(0, (item.sets ?? 1) - 1) * item.restSeconds, 0) / 60));

  return <div className="space-y-8">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Treino #{workout.id}</p><h1 className="page-title">Seu treinamento</h1><p className="mt-2 text-neutral-400">Siga no seu ritmo e priorize a execução correta.</p></div><div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-right"><p className="text-xs text-neutral-500">Tempo estimado</p><p className="font-bold">~{estimatedMinutes} minutos</p></div></header>
    <section className="card grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumo do treinamento"><div><p className="text-neutral-500">Objetivo</p><strong className="mt-1 block">{labels[workout.goal]}</strong></div><div><p className="text-neutral-500">Nível</p><strong className="mt-1 block">{labels[workout.experience]}</strong></div><div><p className="text-neutral-500">Frequência</p><strong className="mt-1 block">{workout.frequencyDays} dias/semana</strong></div><div><p className="text-neutral-500">Criado em</p><strong className="mt-1 block">{workout.createdAt.toLocaleDateString("pt-BR")}</strong></div></section>
    <WorkoutPlayer items={playerItems} />
    <CompleteForm workoutId={workout.id} />
    <p className="text-center text-xs text-neutral-600">Este treino é uma sugestão de apoio. O treinador pode orientar adaptações.</p>
  </div>;
}
