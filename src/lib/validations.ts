import { Experience, Goal } from "@prisma/client";

export function validEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

export function parseProfile(body: Record<string, unknown>) {
  if (!body || typeof body !== "object") throw new Error("Informe os dados do perfil.");
  const age = Number(body.age), heightCm = Number(body.heightCm);
  const weightKg = Number(body.weightKg), frequencyDays = Number(body.frequencyDays);
  if (!Number.isInteger(age) || age < 1 || age > 120) throw new Error("Idade deve estar entre 1 e 120 anos.");
  if (!Number.isFinite(heightCm) || heightCm <= 0) throw new Error("Altura deve ser maior que zero.");
  if (!Number.isFinite(weightKg) || weightKg <= 0 || weightKg > 1000) throw new Error("Informe um peso válido em kg.");
  if (!Number.isInteger(frequencyDays) || frequencyDays < 1 || frequencyDays > 7) throw new Error("Frequência deve estar entre 1 e 7 dias.");
  if (!Object.values(Experience).includes(body.experience as Experience)) throw new Error("Selecione um nível válido.");
  if (!Object.values(Goal).includes(body.goal as Goal)) throw new Error("Selecione um objetivo válido.");
  return { age, heightCm, weightKg, frequencyDays, experience: body.experience as Experience, goal: body.goal as Goal };
}
