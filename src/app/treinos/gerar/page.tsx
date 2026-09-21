import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GenerateButton from "@/components/generate-button";
const labels: Record<string, string> = { INICIANTE: "Iniciante", INTERMEDIARIO: "Intermediário", AVANCADO: "Avançado", EMAGRECIMENTO: "Emagrecimento", GANHO_MASSA: "Ganho de massa", CONDICIONAMENTO: "Condicionamento", TECNICA: "Técnica" };
export default async function Gerar() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  return <div className="max-w-2xl"><h1 className="mb-2 text-3xl font-bold">Gerar treinamento</h1><p className="mb-6 text-neutral-400">Confirme seu perfil. Cada geração cria um novo treino salvo no banco.</p>{profile ? <div className="card space-y-4"><div className="grid gap-3 sm:grid-cols-3"><p>Objetivo<br /><strong>{labels[profile.goal]}</strong></p><p>Nível<br /><strong>{labels[profile.experience]}</strong></p><p>Frequência<br /><strong>{profile.frequencyDays} dias/semana</strong></p></div><Link href="/perfil" className="inline-block text-sm text-boxing underline">Alterar perfil</Link><GenerateButton /></div> : <div className="card"><p className="mb-4">Complete seu perfil antes de gerar um treinamento.</p><Link href="/perfil" className="btn">Completar perfil</Link></div>}</div>;
}
