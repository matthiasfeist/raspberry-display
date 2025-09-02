import type { Deviation } from '@raspberry-display/api/types';

export function DeviationsList({ deviations }: { deviations: Deviation[] }) {
  if (deviations.length === 0) return null;
  return (
    <div className="pt-2 flex flex-row gap-2 flex-wrap">
      {deviations.map((dev, i) => (
        <DeviationItem key={i} deviation={dev} />
      ))}
    </div>
  );
}
function DeviationItem({ deviation }: { deviation: Deviation }) {
  return (
    <div className="flex-1 tracking-wide grow text-yellow-500 min-w-80 line-clamp-2 text-ellipsis overflow-hidden bg-yellow-400/10 border-yellow-400/30 border-3 px-2 py-1">
      <span className="font-bold pr-3">{deviation.header}</span>
      <span className="text-yellow-500/70">{deviation.details}</span>
    </div>
  );
}
