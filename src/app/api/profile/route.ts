import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseProfile } from "@/lib/validations";
import { todayInBrazil } from "@/lib/dates";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar autenticado." }, { status: 401 });
  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar autenticado." }, { status: 401 });
  let data;
  try {
    data = parseProfile(await request.json());
  } catch (error) {
    return NextResponse.json({ error: error instanceof SyntaxError ? "Dados inválidos." : error instanceof Error ? error.message : "Dados inválidos." }, { status: 400 });
  }
  try {
    const recordedOn = new Date(`${todayInBrazil()}T00:00:00.000Z`);
    const profile = await prisma.$transaction(async (tx) => {
      const previous = await tx.profile.findUnique({ where: { userId: user.id } });
      const saved = await tx.profile.upsert({ where: { userId: user.id }, update: data, create: { ...data, userId: user.id } });
      if (!previous || previous.weightKg !== data.weightKg) {
        await tx.weightLog.upsert({
          where: { userId_recordedOn: { userId: user.id, recordedOn } },
          update: { weightKg: data.weightKg },
          create: { userId: user.id, weightKg: data.weightKg, recordedOn },
        });
      }
      return saved;
    });
    return NextResponse.json({ profile, message: "Perfil salvo com sucesso." });
  } catch {
    return NextResponse.json({ error: "Não foi possível salvar o perfil." }, { status: 500 });
  }
}
