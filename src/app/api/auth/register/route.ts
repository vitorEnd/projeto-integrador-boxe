import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validEmail } from "@/lib/validations";
import { databaseMessage, isDatabaseUnavailable } from "@/lib/database-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = body.password;
    if (!name || !email || !password) return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    if (name.length > 100 || !validEmail(email)) return NextResponse.json({ error: "Informe nome e e-mail válidos." }, { status: 400 });
    if (typeof password !== "string" || password.length < 8) return NextResponse.json({ error: "A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
    if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    const user = await prisma.user.create({ data: { name, email, passwordHash: await hash(password, 10) } });
    return NextResponse.json({ id: user.id, message: "Cadastro realizado com sucesso." }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    if (isDatabaseUnavailable(error)) return NextResponse.json({ error: databaseMessage }, { status: 503 });
    return NextResponse.json({ error: "Não foi possível concluir o cadastro." }, { status: 500 });
  }
}
