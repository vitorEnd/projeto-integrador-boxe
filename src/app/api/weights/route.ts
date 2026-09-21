import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDateOnly } from "@/lib/dates";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar autenticado." }, { status: 401 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const weightKg = Number(body.weightKg);
    const recordedOn = parseDateOnly(body.recordedOn);
    if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 1000) return NextResponse.json({ error: "Informe um peso válido em kg." }, { status: 400 });
    if (!recordedOn) return NextResponse.json({ error: "Informe uma data válida até hoje." }, { status: 400 });
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile || profile.goal !== "EMAGRECIMENTO") return NextResponse.json({ error: "Defina emagrecimento como objetivo no perfil para acompanhar o peso." }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const saved = await tx.weightLog.upsert({
        where: { userId_recordedOn: { userId: user.id, recordedOn } },
        update: { weightKg }, create: { userId: user.id, recordedOn, weightKg },
      });
      const latest = await tx.weightLog.findFirst({ where: { userId: user.id }, orderBy: { recordedOn: "desc" } });
      if (latest) await tx.profile.update({ where: { userId: user.id }, data: { weightKg: latest.weightKg } });
      return saved;
    });
    return NextResponse.json({ id: result.id, message: "Peso registrado com sucesso." }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível registrar o peso." }, { status: 500 });
  }
}
