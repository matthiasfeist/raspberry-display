import type { Config } from '../configType';
import type {
  Departure,
  Deviation,
  SlResultObj,
  DepartureStatus,
} from '../types';
import wildcardMatch from 'wildcard-match';
import {
  getFilteredSlDeviations,
  getSlDepartures,
  invalidateSlDepartureCache,
} from './api';

export async function sl(config: Config) {
  const result: SlResultObj[] = [];

  for (const slConfigEntry of config.sl) {
    result.push(await processSlConfigEntry(slConfigEntry));
  }

  return result;
}

async function processSlConfigEntry(
  slConfigEntry: Config['sl'][number],
): Promise<SlResultObj> {
  const departures: Departure[] = [];
  const deviations = new Map<number, Deviation>();

  // Special case for onlyDeviations:
  if (slConfigEntry.onlyDeviations === true) {
    for (const depFilter of slConfigEntry.filterDepartures) {
      const filteredDeviations = await getFilteredSlDeviations(
        depFilter.designation,
        depFilter.transportMode,
      );
      for (const foundDeviation of filteredDeviations) {
        deviations.set(foundDeviation.deviation_case_id, {
          header: foundDeviation.message_variants[0].header,
          details: foundDeviation.message_variants[0].details,
        });
      }
    }

    return {
      displayName: slConfigEntry.displayName,
      onlyDeviations: true,
      departures,
      deviations: Array.from(deviations.values()),
    };
  }

  // for all other configs: now start loading the departures:
  const slResponse = await getSlDepartures(slConfigEntry.siteId);
  if (!slResponse) {
    return { displayName: slConfigEntry.displayName, error: true };
  }

  for (const depFilter of slConfigEntry.filterDepartures) {
    const matchDesignationFn = wildcardMatch(depFilter.designation, false);
    const filteredDepartures = slResponse.departures.filter(
      (dep) =>
        dep.direction_code === depFilter.direction &&
        matchDesignationFn(dep.line.designation),
    );

    for (const dep of filteredDepartures) {
      const scheduled = new Date(dep.scheduled);
      const expected = new Date(dep.expected);
      const now = new Date();
      const mins = Math.floor((expected.getTime() - now.getTime()) / 60000);
      if (mins < -3)
        // If the departure is more than 2 minutes in the past, invalidate the cache and force a new fetch
        invalidateSlDepartureCache();

      if (mins < 0)
        // If the departure is in the past, we don't want to show it
        continue;

      const delayed = expected.getTime() - scheduled.getTime() > 2 * 60 * 1000; // 2 minutes

      let status: DepartureStatus = delayed ? 'DELAYED' : 'ON_TIME';
      if (
        dep.state === 'CANCELLED' ||
        dep.journey.state === 'CANCELLED' ||
        dep.state === 'ABORTED' ||
        dep.state === 'NOT RUN'
      )
        status = 'CANCELLED';

      const dim =
        typeof slConfigEntry.walkingTime === 'number' &&
        mins <= slConfigEntry.walkingTime;

      departures.push({
        mins,
        status,
        journeyId: dep.journey.id,
        dim,
        designation: dep.line.designation,
        destination: dep.destination,
      });

      // Deviations by stop-area
      const filteredDeviations = await getFilteredSlDeviations(
        dep.line.designation,
        depFilter.transportMode,
        dep.stop_area.id,
      );
      for (const foundDeviation of filteredDeviations) {
        deviations.set(foundDeviation.deviation_case_id, {
          header: foundDeviation.message_variants[0].header,
          details: foundDeviation.message_variants[0].details,
        });
      }
    }

    // in case there aren't any departures, check the deviations but then for the whole line:
    // (skipping the stoparea parameter)
    if (filteredDepartures.length === 0) {
      const filteredDeviations = await getFilteredSlDeviations(
        depFilter.designation,
        depFilter.transportMode,
      );
      for (const foundDeviation of filteredDeviations) {
        deviations.set(foundDeviation.deviation_case_id, {
          header: foundDeviation.message_variants[0].header,
          details: foundDeviation.message_variants[0].details,
        });
      }
    }
  }

  return {
    displayName: slConfigEntry.displayName,
    onlyDeviations: slConfigEntry.onlyDeviations,
    departures: departures.sort((a, b) => a.mins - b.mins),
    deviations: Array.from(deviations.values()),
  };
}
