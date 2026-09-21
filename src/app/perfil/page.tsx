import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/profile-form";
export default async function Perfil() {
  const user = await getCurrentUser(); if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  return <div className="mx-auto max-w-2xl"><h1 className="mb-2 text-3xl font-bold">{profile ? "Seu perfil" : "Complete seu perfil"}</h1><p className="mb-6 text-neutral-400">Objetivo, nível e frequência definem a sugestão de treino. Seu peso inicial aparece no acompanhamento quando o objetivo é emagrecimento.</p><ProfileForm profile={profile} /></div>;
}
