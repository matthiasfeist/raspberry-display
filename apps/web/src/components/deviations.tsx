import type { Deviation } from '@raspberry-display/api/types';
import chroma from 'chroma-js';

const deviationColor = chroma.scale(['#facc15', '#f87171']).domain([15, 50]);

export function DeviationsList({
  deviations,
  showDebugLevel,
}: {
  deviations: Deviation[];
  showDebugLevel?: boolean;
}) {
  if (deviations.length === 0) return null;
  deviations.sort((a, b) => b.priority - a.priority);

  return (
    <div className="flex flex-row flex-wrap gap-2 pt-2">
      {deviations.map((dev, i) => (
        <DeviationItem
          key={i}
          deviation={dev}
          showDebugLevel={showDebugLevel}
        />
      ))}
    </div>
  );
}

function DeviationItem({
  deviation,
  showDebugLevel,
}: {
  deviation: Deviation;
  showDebugLevel?: boolean;
}) {
  return (
    <div className="border-3 line-clamp-2 min-w-80 flex-1 grow overflow-hidden text-ellipsis border-yellow-400/30 bg-yellow-400/10 px-2 py-1 tracking-wide text-yellow-500">
      <span
        className="mr-1 rounded px-1 text-black"
        style={{
          backgroundColor: deviationColor(deviation.priority).hex(),
          display: showDebugLevel ? 'inline' : 'none',
        }}
      >
        {deviation.priority} {JSON.stringify(showDebugLevel)}
      </span>
      <span className="pr-3 font-bold">{deviation.header}</span>
      <span className="text-yellow-500/70">{deviation.details}</span>
    </div>
  );
}
