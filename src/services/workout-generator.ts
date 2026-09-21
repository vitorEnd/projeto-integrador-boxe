import { Category, Exercise, Experience, Goal, Profile } from "@prisma/client";

const priorities: Record<Goal, Category[]> = {
  EMAGRECIMENTO: ["CARDIO", "TECNICA", "CORE", "AQUECIMENTO"],
  GANHO_MASSA: ["FORCA", "CORE", "TECNICA", "AQUECIMENTO"],
  CONDICIONAMENTO: ["CARDIO", "TECNICA", "MOBILIDADE", "AQUECIMENTO"],
  TECNICA: ["TECNICA", "AQUECIMENTO", "MOBILIDADE"],
};
const rank: Record<Experience, number> = { INICIANTE: 0, INTERMEDIARIO: 1, AVANCADO: 2 };
const volume: Record<Experience, { count: number; sets: number; rest: number }> = {
  INICIANTE: { count: 4, sets: 2, rest: 90 },
  INTERMEDIARIO: { count: 5, sets: 3, rest: 60 },
  AVANCADO: { count: 6, sets: 4, rest: 45 },
};

export function generateWorkoutPlan(profile: Profile, exercises: Exercise[]) {
  const target = volume[profile.experience];
  const count = Math.max(3, target.count + (profile.frequencyDays <= 2 ? 1 : profile.frequencyDays >= 5 ? -1 : 0));
  const allowed = exercises.filter((e) =>
    rank[e.minExperienceLevel] <= rank[profile.experience] &&
    e.goalTags.split(",").includes(profile.goal),
  );
  const selected = priorities[profile.goal].flatMap((category) =>
    allowed.filter((e) => e.category === category).sort((a, b) => a.id - b.id),
  ).slice(0, count);
  if (selected.length < count) return null;
  return selected.map((exercise, index) => ({
    exerciseId: exercise.id,
    order: index + 1,
    sets: target.sets,
    reps: ["FORCA", "CORE", "TECNICA"].includes(exercise.category) ? "10 a 12" : null,
    durationSeconds: ["CARDIO", "AQUECIMENTO", "MOBILIDADE"].includes(exercise.category) ? 60 : null,
    restSeconds: target.rest,
    notes: exercise.category === "TECNICA" ? "Priorize a execução correta." : null,
  }));
}
