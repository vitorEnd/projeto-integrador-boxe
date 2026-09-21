// Referência: boxe no saco = 5,8 MET (Compendium of Physical Activities, 2024).
// kcal/min = MET × 3,5 × peso(kg) / 200 (American Council on Exercise).
const BOXING_MET = 5.8;

export function estimateCalories(durationMinutes: number, weightKg: number) {
  return Math.round((BOXING_MET * 3.5 * weightKg * durationMinutes) / 200);
}
