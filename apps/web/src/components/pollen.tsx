import type { PollenResponse } from '@raspberry-display/api/types';
import chroma from 'chroma-js';
import { LuArrowRight, LuArrowUpRight, LuArrowUp } from 'react-icons/lu';

type PollenForecastItem = NonNullable<PollenResponse['forecasts']>[number];

// Yellow (moderate) → orange → red (very high), matching level range 3–7
const levelColor = chroma
  .scale(['#facc15', '#f97316', '#f87171'])
  .domain([3, 7]);

function dateLabel(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const d = new Date(dateStr + 'T00:00:00');
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString('en-SE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function groupByDate(
  forecasts: PollenForecastItem[],
): Map<string, PollenForecastItem[]> {
  const grouped = new Map<string, PollenForecastItem[]>();
  for (const item of forecasts) {
    const existing = grouped.get(item.date) ?? [];
    existing.push(item);
    grouped.set(item.date, existing);
  }
  return grouped;
}

function LevelIcon({ level, size }: { level: number; size: number }) {
  if (level <= 4) return <LuArrowRight className="ml-1 inline" size={size} />;
  if (level <= 6) return <LuArrowUpRight className="ml-1 inline" size={size} />;
  return <LuArrowUp className="ml-1 inline" size={size} />;
}

export function PollenWidget({ result }: { result: PollenResponse }) {
  if (!result.forecasts || result.forecasts.length === 0) return null;

  const grouped = groupByDate(result.forecasts);

  return (
    <div className="flex flex-row gap-10 pt-2">
      {Array.from(grouped.entries()).map(([date, items]) => (
        <div key={date}>
          <div className="mb-1 text-sm uppercase tracking-wide text-gray-300">
            {dateLabel(date)}
          </div>
          <div className="flex flex-row flex-wrap gap-2">
            {items.map((item) => {
              const color = levelColor(item.level);
              return (
                <div
                  key={item.pollenName}
                  className="border-3 px-2 py-1"
                  style={{
                    borderColor: color.alpha(0.4).css(),
                    backgroundColor: color.alpha(0.1).css(),
                    color: color.css(),
                  }}
                >
                  <span className="text-sm font-medium uppercase tracking-wide">
                    {item.pollenName}
                  </span>
                  <LevelIcon level={item.level} size={20} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
