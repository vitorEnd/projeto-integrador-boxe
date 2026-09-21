import { PrismaClient, Category, Experience, Goal } from "@prisma/client";

const prisma = new PrismaClient();
const all = Object.values(Goal);
const items: [string, string, Category, Experience, Goal[]][] = [
  ["Pular corda", "Ritmo leve e postura estável.", "AQUECIMENTO", "INICIANTE", all],
  ["Shadowboxing", "Movimentos de boxe sem contato.", "TECNICA", "INICIANTE", all],
  ["Jab e direto no saco", "Alternar golpes com controle.", "TECNICA", "INICIANTE", all],
  ["Sequência jab-direto", "Praticar combinação e retorno da guarda.", "TECNICA", "INICIANTE", all],
  ["Manopla técnica", "Sequência orientada pelo treinador.", "TECNICA", "INTERMEDIARIO", ["TECNICA", "CONDICIONAMENTO"]],
  ["Trabalho de footwork", "Deslocamento e equilíbrio.", "TECNICA", "INICIANTE", ["TECNICA", "CONDICIONAMENTO", "EMAGRECIMENTO"]],
  ["Esquiva e defesa", "Prática de defesa com controle.", "TECNICA", "INTERMEDIARIO", ["TECNICA", "CONDICIONAMENTO"]],
  ["Burpee", "Movimento corporal em ritmo confortável.", "CARDIO", "INTERMEDIARIO", ["EMAGRECIMENTO", "CONDICIONAMENTO"]],
  ["Mountain climber", "Alternar joelhos em posição de prancha.", "CARDIO", "INICIANTE", ["EMAGRECIMENTO", "CONDICIONAMENTO"]],
  ["Prancha", "Manter estabilidade do tronco.", "CORE", "INICIANTE", ["EMAGRECIMENTO", "GANHO_MASSA"]],
  ["Abdominal", "Executar com movimento controlado.", "CORE", "INICIANTE", ["EMAGRECIMENTO", "GANHO_MASSA"]],
  ["Flexão", "Ajustar apoio conforme orientação.", "FORCA", "INICIANTE", ["GANHO_MASSA"]],
  ["Agachamento", "Manter alinhamento durante o movimento.", "FORCA", "INICIANTE", ["GANHO_MASSA"]],
  ["Mobilidade de ombros", "Movimentos suaves dos ombros.", "MOBILIDADE", "INICIANTE", ["CONDICIONAMENTO", "TECNICA"]],
  ["Corrida estacionária", "Correr no lugar em ritmo controlado.", "CARDIO", "INICIANTE", ["EMAGRECIMENTO", "CONDICIONAMENTO"]],
];

async function main() {
  for (const [name, description, category, minExperienceLevel, goals] of items) {
    await prisma.exercise.upsert({
      where: { name },
      update: { description, category, minExperienceLevel, goalTags: goals.join(",") },
      create: { name, description, category, minExperienceLevel, goalTags: goals.join(",") },
    });
  }
  console.log(`${items.length} exercícios disponíveis.`);
}
main().finally(() => prisma.$disconnect());
