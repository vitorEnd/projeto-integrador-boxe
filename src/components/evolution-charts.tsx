type TrainingDay = { label: string; minutes: number };
type WeightPoint = { label: string; value: number };

export default function EvolutionCharts({ trainingDays, weightPoints }: { trainingDays: TrainingDay[]; weightPoints: WeightPoint[] }) {
  const maxMinutes = Math.max(1, ...trainingDays.map((day) => day.minutes));
  const minWeight = weightPoints.length ? Math.min(...weightPoints.map((point) => point.value)) : 0;
  const maxWeight = weightPoints.length ? Math.max(...weightPoints.map((point) => point.value)) : 0;
  const weightRange = Math.max(1, maxWeight - minWeight);
  const points = weightPoints.map((point, index) => {
    const x = weightPoints.length === 1 ? 280 : 26 + (index * 508) / (weightPoints.length - 1);
    const y = 150 - ((point.value - minWeight) / weightRange) * 110;
    return { ...point, x, y };
  });

  return <section aria-labelledby="graficos-evolucao">
    <div className="mb-4"><p className="eyebrow">Visão rápida</p><h2 id="graficos-evolucao" className="mt-1 text-xl font-bold">Seus dados em gráficos</h2></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card"><div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Minutos nos últimos 7 dias</h3><p className="mt-1 text-sm text-neutral-500">Treinos registrados por dia</p></div><span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300">{trainingDays.reduce((sum, day) => sum + day.minutes, 0)} min</span></div>
        <div className="mt-6 flex h-44 items-end gap-2" role="img" aria-label={trainingDays.map((day) => `${day.label}: ${day.minutes} minutos`).join(", ")}>
          {trainingDays.map((day) => <div className="flex h-full min-w-0 flex-1 flex-col justify-end text-center" key={day.label}><span className="mb-1 text-[10px] font-bold text-neutral-400">{day.minutes || ""}</span><div className={`mx-auto w-full max-w-10 rounded-t-lg transition ${day.minutes ? "bg-gradient-to-t from-red-700 to-red-400" : "bg-neutral-800"}`} style={{ height: day.minutes ? `${Math.max(12, (day.minutes / maxMinutes) * 120)}px` : "4px" }} /><span className="mt-2 text-[11px] capitalize text-neutral-500">{day.label}</span></div>)}
        </div>
      </div>

      <div className="card"><div className="flex items-center justify-between gap-3"><div><h3 className="font-bold">Tendência de peso</h3><p className="mt-1 text-sm text-neutral-500">Até 8 pesagens mais recentes</p></div>{weightPoints.length > 0 && <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-300">{weightPoints.at(-1)?.value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg</span>}</div>
        {weightPoints.length > 0 ? <div className="mt-5 overflow-hidden" role="img" aria-label={weightPoints.map((point) => `${point.label}: ${point.value} quilos`).join(", ")}><svg className="h-44 w-full" viewBox="0 0 560 180" aria-hidden="true" preserveAspectRatio="none"><defs><linearGradient id="weight-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fb923c" stopOpacity="0.35" /><stop offset="100%" stopColor="#fb923c" stopOpacity="0" /></linearGradient></defs>{points.length > 1 && <><polygon points={`26,160 ${points.map((point) => `${point.x},${point.y}`).join(" ")} 534,160`} fill="url(#weight-area)" /><polyline points={points.map((point) => `${point.x},${point.y}`).join(" ")} fill="none" stroke="#fb923c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></>}{points.map((point) => <g key={`${point.label}-${point.value}`}><circle cx={point.x} cy={point.y} r="6" fill="#0a0a0a" stroke="#fb923c" strokeWidth="3" vectorEffect="non-scaling-stroke" /><text x={point.x} y="176" fill="#737373" fontSize="12" textAnchor="middle">{point.label}</text></g>)}</svg></div> : <div className="mt-6 grid h-44 place-items-center rounded-xl border border-dashed border-neutral-800 text-center text-sm text-neutral-500"><p>Registre pesagens para visualizar<br />a tendência neste gráfico.</p></div>}
      </div>
    </div>
  </section>;
}
