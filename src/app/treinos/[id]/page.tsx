import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CompleteForm from "@/components/complete-form";
const labels: Record<string, string> = { INICIANTE: "Iniciante", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado", EMAGRECIMENTO: "Emagrecimento", GANHO_MASSA: "Ganho de massa", CONDICIONAMENTO: "Condicionamento", TECNICA: "Técnica", AQUECIMENTO: "Aquecimento", CARDIO: "Cardio", FORCA: "Força", CORE: "Core", MOBILIDADE: "Mobilidade" };
export default async function Treino({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const id = Number((await params).id); if (!Number.isInteger(id) || id < 1) notFound();
  const workout = await prisma.workout.findFirst({ where: { id, userId: user.id }, include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" } } } });
  if (!workout) notFound();
  return <div className="space-y-6"><div><h1 className="text-3xl font-bold">Seu treinamento</h1><p className="mt-2 text-neutral-400">Sugestão de apoio. O treinador pode orientar ajustes.</p></div><div className="card grid gap-2 text-sm sm:grid-cols-4"><p>Objetivo<br /><strong>{labels[workout.goal]}</strong></p><p>Nível<br /><strong>{labels[workout.experience]}</strong></p><p>Frequência<br /><strong>{workout.frequencyDays} dias/semana</strong></p><p>Criado em<br /><strong>{workout.createdAt.toLocaleDateString("pt-BR")}</strong></p></div><ol className="space-y-3">{workout.exercises.map((item) => <li key={item.id} className="card"><div className="flex gap-3"><span className="font-bold text-boxing">{item.order}.</span><div><h2 className="font-semibold">{item.exercise.name}</h2><p className="text-sm text-neutral-400">{labels[item.exercise.category] || item.exercise.category} · {item.exercise.description}</p><p className="mt-2 text-sm">{item.sets} séries · {item.reps ? `${item.reps} repetições` : `${item.durationSeconds} segundos`} · {item.restSeconds}s de descanso</p>{item.notes && <p className="mt-1 text-xs text-neutral-400">{item.notes}</p>}</div></div></li>)}</ol><CompleteForm workoutId={workout.id} /></div>;
}
