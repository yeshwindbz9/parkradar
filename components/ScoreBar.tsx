type ScoreBarProps = {
  score: number;
};

export function ScoreBar({ score }: ScoreBarProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">Parking likelihood</span>
        <span className="font-semibold text-emerald-300">{safeScore}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-emerald-400 transition-all duration-500"
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}