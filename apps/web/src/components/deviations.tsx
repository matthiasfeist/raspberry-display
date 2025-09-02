import type { Deviation } from '@raspberry-display/api/types';

export function DeviationsList({ deviations }: { deviations: Deviation[] }) {
  if (deviations.length === 0) return null;
  return (
    <div className="flex flex-row flex-wrap gap-2 pt-2">
      {deviations.map((dev, i) => (
        <DeviationItem key={i} deviation={dev} />
      ))}
    </div>
  );
}
function DeviationItem({ deviation }: { deviation: Deviation }) {
  return (
    <div className="border-3 line-clamp-2 min-w-80 flex-1 grow overflow-hidden text-ellipsis border-yellow-400/30 bg-yellow-400/10 px-2 py-1 tracking-wide text-yellow-500">
      <span className="pr-3 font-bold">{deviation.header}</span>
      <span className="text-yellow-500/70">{deviation.details}</span>
    </div>
  );
}
