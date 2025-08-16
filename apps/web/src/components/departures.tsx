import type { Departure } from '@raspberry-display/api/types';
import { cn } from '../lib/cn';

export function DeparturesList({ departures }: { departures: Departure[] }) {
  if (departures.length === 0) return <div>No departures</div>;

  return (
    <div className="flex flex-row gap-2 pt-2 mask-r-from-80% mask-r-to-100% overflow-hidden">
      {departures.map((dep) => {
        let statusText = 'on time';
        if (dep.status === 'DELAYED') statusText = 'delayed';
        if (dep.status === 'CANCELLED') statusText = 'cancelled';

        return (
          <div
            key={dep.journeyId}
            className={cn(
              'w-27 h-27 border-3 border-gray-500 flex flex-col text-center shrink-0',
              dep.dim && 'opacity-40',
              dep.status === 'DELAYED' && 'border-amber-600',
              dep.status === 'CANCELLED' && 'border-red-600',
            )}
          >
            <div className="uppercase text-xs p-1 font-medium text-gray-300 flex flex-row gap-1.5 text-nowrap tracking-wide">
              <span>{dep.designation}</span>
              <span className="text-ellipsis overflow-hidden">
                {dep.destination}
              </span>
            </div>
            <div className="grow text-center content-center text-4xl font-medium font-mono tracking-wider">
              {dep.mins}
            </div>
            <div
              className={cn(
                'uppercase text-xs p-1 font-medium tracking-wide',
                dep.status === 'ON_TIME' && ' text-gray-300 ',
                dep.status === 'DELAYED' && 'text-amber-500 ',
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
