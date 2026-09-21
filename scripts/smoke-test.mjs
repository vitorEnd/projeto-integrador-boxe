import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const base = process.env.APP_URL || "http://localhost:3000";
const email = `teste-${randomUUID()}@example.com`;
const otherEmail = `outro-${randomUUID()}@example.com`;
const password = "Teste12345!";
const createdEmails = [email, otherEmail];

async function request(path, method = "GET", data, cookie) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { ...(data ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: data ? JSON.stringify(data) : undefined,
    redirect: "manual",
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();
  return { status: response.status, body, cookie: response.headers.get("set-cookie")?.split(";")[0] };
}

function expect(result, status, label) {
  if (result.status !== status) throw new Error(`${label}: esperado ${status}, recebido ${result.status}: ${JSON.stringify(result.body).slice(0, 250)}`);
  console.log(`${label}: HTTP ${status}`);
}

try {
  expect(await request("/api/auth/register", "POST", { name: "", email, password }), 400, "Cadastro inválido");
  expect(await request("/api/auth/register", "POST", { name: "Aluno Teste", email, password }), 201, "Cadastro");
  expect(await request("/api/auth/register", "POST", { name: "Aluno Teste", email, password }), 409, "E-mail duplicado");
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  if (user.passwordHash === password) throw new Error("Senha não foi protegida.");
  const login = await request("/api/auth/login", "POST", { email, password });
  expect(login, 200, "Login");
  const cookie = login.cookie;
  if (!cookie) throw new Error("Cookie de sessão ausente.");
  expect(await request("/dashboard", "GET", undefined, cookie), 200, "Dashboard autenticado");
  expect(await request("/api/workouts/generate", "POST", undefined, cookie), 400, "Treino sem perfil");
  expect(await request("/api/profile", "PUT", { age: 25, heightCm: 175, weightKg: 75, experience: "INICIANTE", goal: "EMAGRECIMENTO", frequencyDays: 3 }, cookie), 200, "Perfil");
  const performedAt = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
  const yesterday = new Date(`${performedAt}T12:00:00Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  expect(await request("/api/weights", "POST", { recordedOn: performedAt, weightKg: -2 }, cookie), 400, "Peso inválido");
  expect(await request("/api/weights", "POST", { recordedOn: yesterday.toISOString().slice(0, 10), weightKg: 76 }, cookie), 201, "Pesagem anterior");
  expect(await request("/api/weights", "POST", { recordedOn: performedAt, weightKg: 74.5 }, cookie), 201, "Pesagem atual");
  const weightCount = await prisma.weightLog.count({ where: { userId: user.id } });
  if (weightCount !== 2) throw new Error(`Histórico de peso incorreto: ${weightCount}`);
  const currentProfile = await prisma.profile.findUniqueOrThrow({ where: { userId: user.id } });
  if (currentProfile.weightKg !== 74.5) throw new Error("Peso atual do perfil não foi atualizado.");
  const generated = await request("/api/workouts/generate", "POST", undefined, cookie);
  expect(generated, 201, "Geração do treino");
  const id = generated.body.id;
  const workout = await prisma.workout.findUniqueOrThrow({ where: { id }, include: { exercises: true } });
  if (workout.exercises.length !== 4) throw new Error(`Quantidade inesperada de exercícios: ${workout.exercises.length}`);
  expect(await request(`/treinos/${id}`, "GET", undefined, cookie), 200, "Visualização do treino");
  expect(await request(`/api/workouts/${id}/complete`, "POST", { performedAt, durationMinutes: 0, perceivedEffort: 5 }, cookie), 400, "Registro inválido");
  expect(await request(`/api/workouts/${id}/complete`, "POST", { performedAt, durationMinutes: 35, perceivedEffort: 6 }, cookie), 201, "Registro do treino");
  const logCount = await prisma.workoutLog.count({ where: { userId: user.id, workoutId: id } });
  if (logCount !== 1) throw new Error("Registro não encontrado no MySQL.");
  const evolution = await request("/evolucao", "GET", undefined, cookie);
  expect(evolution, 200, "Evolução");
  if (!evolution.body.includes("Histórico de treinamentos")) throw new Error("Histórico não apareceu na página.");
  const expectedCalories = Math.round(5.8 * 3.5 * 74.5 * 35 / 200);
  if (!evolution.body.includes("Calorias queimadas (estimativa)") || !evolution.body.includes(`~${expectedCalories} kcal`) || !evolution.body.includes("Acompanhar peso")) throw new Error("Calorias ou acompanhamento de peso não apareceram corretamente na evolução.");
  expect(await request("/api/auth/register", "POST", { name: "Outro Aluno", email: otherEmail, password }), 201, "Segundo aluno");
  const otherLogin = await request("/api/auth/login", "POST", { email: otherEmail, password });
  expect(otherLogin, 200, "Login do segundo aluno");
  expect(await request(`/api/workouts/${id}/complete`, "POST", { performedAt, durationMinutes: 30, perceivedEffort: 5 }, otherLogin.cookie), 404, "Proteção de treino alheio");
  console.log("Fluxos UC01, UC03, UC04 e UC05 verificados com MySQL.");
} finally {
  await prisma.user.deleteMany({ where: { email: { in: createdEmails } } });
  await prisma.$disconnect();
}
