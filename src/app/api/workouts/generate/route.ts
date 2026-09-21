import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWorkoutPlan } from "@/services/workout-generator";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar autenticado." }, { status: 401 });
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Complete seu perfil antes de gerar um treinamento.", redirect: "/perfil" }, { status: 400 });
    const exercises = await prisma.exercise.findMany();
    const plan = generateWorkoutPlan(profile, exercises);
    if (!plan) return NextResponse.json({ error: "Não foi possível gerar um treinamento compatível automaticamente. Procure o treinador para avaliação ou ajuste." }, { status: 422 });
    const workout = await prisma.workout.create({
      data: { userId: user.id, goal: profile.goal, experience: profile.experience, frequencyDays: profile.frequencyDays, exercises: { create: plan } },
    });
    return NextResponse.json({ id: workout.id, message: "Treinamento gerado com sucesso." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Não foi possível gerar o treinamento." }, { status: 500 });
  }
}
