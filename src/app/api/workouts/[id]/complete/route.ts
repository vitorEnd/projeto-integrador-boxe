import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Você precisa estar autenticado." }, { status: 401 });
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Treinamento inexistente." }, { status: 404 });
  try {
    const workout = await prisma.workout.findUnique({ where: { id } });
    if (!workout || workout.userId !== user.id) return NextResponse.json({ error: "Treinamento inexistente." }, { status: 404 });
    const body = await request.json();
    const durationMinutes = Number(body.durationMinutes);
    const perceivedEffort = Number(body.perceivedEffort);
    if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) return NextResponse.json({ error: "Duração deve ser maior que zero." }, { status: 400 });
    if (!Number.isInteger(perceivedEffort) || perceivedEffort < 1 || perceivedEffort > 10) return NextResponse.json({ error: "Esforço percebido deve estar entre 1 e 10." }, { status: 400 });
    if (typeof body.performedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(body.performedAt)) return NextResponse.json({ error: "Informe a data da realização." }, { status: 400 });
    const performedAt = new Date(`${body.performedAt}T12:00:00Z`);
    const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    if (Number.isNaN(performedAt.getTime()) || performedAt.toISOString().slice(0, 10) !== body.performedAt || body.performedAt > today) return NextResponse.json({ error: "Informe uma data válida até hoje." }, { status: 400 });
    const notes = typeof body.notes === "string" ? body.notes.trim() : "";
    if (notes.length > 500) return NextResponse.json({ error: "Observação muito longa." }, { status: 400 });
    const log = await prisma.workoutLog.create({ data: { userId: user.id, workoutId: id, performedAt, durationMinutes, perceivedEffort, notes: notes || null } });
    return NextResponse.json({ id: log.id, message: "Treinamento registrado com sucesso." }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível registrar o treinamento." }, { status: 500 });
  }
}
