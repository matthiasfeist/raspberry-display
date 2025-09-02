import type { Departure } from '@raspberry-display/api/types';
import { cn } from '../lib/cn';

export function DeparturesList({ departures }: { departures: Departure[] }) {
  if (departures.length === 0) return <div>No departures</div>;

  return (
    <div className="mask-r-from-80% mask-r-to-100% flex flex-row gap-2 overflow-hidden pt-2">
      {departures.map((dep) => {
        let statusText = 'on time';
        if (dep.status === 'DELAYED') statusText = 'delayed';
        if (dep.status === 'CANCELLED') statusText = 'cancelled';

        return (
          <div
            key={dep.journeyId}
            className={cn(
              'w-27 h-27 border-3 flex shrink-0 flex-col border-gray-500 text-center',
              dep.dim && 'opacity-40',
              dep.status === 'DELAYED' && 'border-amber-600',
              dep.status === 'CANCELLED' && 'border-red-600',
            )}
          >
            <div className="flex flex-row gap-1.5 text-nowrap p-1 text-xs font-medium uppercase tracking-wide text-gray-300">
              <span>{dep.designation}</span>
              <span className="overflow-hidden text-ellipsis">
                {dep.destination}
              </span>
            </div>
            <div className="grow content-center text-center font-mono text-4xl font-medium tracking-wider">
              {dep.mins}
            </div>
            <div
              className={cn(
                'p-1 text-xs font-medium uppercase tracking-wide',
                dep.status === 'ON_TIME' && 'text-gray-300',
                dep.status === 'DELAYED' && 'text-amber-500',
                dep.status === 'CANCELLED' && 'text-red-500',
              )}
            >
              {statusText}
            </div>
          </div>
        );
      })}
    </div>
  );
}
