import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/profile-form";

export default async function Perfil() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  return <div className="mx-auto max-w-3xl"><header className="mb-7"><p className="eyebrow">Personalização</p><h1 className="page-title">{profile ? "Seu perfil" : "Conte um pouco sobre você"}</h1><p className="mt-2 max-w-2xl text-neutral-400">Essas informações orientam o volume e o tipo de treino. Você pode alterá-las quando sua rotina mudar.</p></header><ProfileForm profile={profile} /></div>;
}
