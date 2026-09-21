import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { databaseMessage, isDatabaseUnavailable } from "@/lib/database-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const { email, password } = body;
    if (typeof email !== "string" || typeof password !== "string") return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await compare(password, user.passwordHash))) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    await createSession(user.id);
    return NextResponse.json({ message: "Login realizado com sucesso." });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    if (isDatabaseUnavailable(error)) return NextResponse.json({ error: databaseMessage }, { status: 503 });
    return NextResponse.json({ error: "Não foi possível entrar." }, { status: 500 });
  }
}
