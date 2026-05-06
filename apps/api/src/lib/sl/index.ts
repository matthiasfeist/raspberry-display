import type { Config } from '../configType';
import type {
  Departure,
  Deviation,
  SlResultObj,
  DepartureStatus,
} from '../types';
import wildcardMatch from 'wildcard-match';
import {
  type ApiDeviationResult,
  getFilteredSlDeviations,
  getSlDepartures,
  invalidateSlDepartureCache,
} from './api';

export async function sl(config: Config) {
  const result: SlResultObj[] = [];

  for (const departureConfigEntry of config.sl.departures) {
    result.push(
      await processSlDepartureConfigEntry(
        departureConfigEntry,
        config.sl.deviations,
      ),
    );
  }

  return result;
}

async function processSlDepartureConfigEntry(
  departureConfigEntry: Config['sl']['departures'][number],
  deviationConfig: Config['sl']['deviations'],
): Promise<SlResultObj> {
  const departures: Departure[] = [];
  const deviations = new Map<number, Deviation>();

  // Special case for onlyDeviations:
  if (departureConfigEntry.onlyDeviations === true) {
    for (const depFilter of departureConfigEntry.filterDepartures) {
      const filteredDeviations = await getFilteredSlDeviations(
        deviationConfig.minLevel,
        depFilter.designation,
        depFilter.transportMode,
      );
      for (const foundDeviation of filteredDeviations) {
        deviations.set(
          foundDeviation.deviation_case_id,
          transformDeviation(foundDeviation),
        );
      }
    }

    return {
      displayName: departureConfigEntry.displayName,
      onlyDeviations: true,
      departures,
      deviations: Array.from(deviations.values()),
      showDebugLevel: deviationConfig.showDebugLevel,
    };
  }

  // for all other configs: now start loading the departures:
  const slResponse = await getSlDepartures(departureConfigEntry.siteId);
  if (!slResponse) {
    return { displayName: departureConfigEntry.displayName, error: true };
  }

  for (const depFilter of departureConfigEntry.filterDepartures) {
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
        typeof departureConfigEntry.walkingTime === 'number' &&
        mins <= departureConfigEntry.walkingTime;

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
        deviationConfig.minLevel,
        dep.line.designation,
        depFilter.transportMode,
        dep.stop_area.id,
      );
      for (const foundDeviation of filteredDeviations) {
        deviations.set(
          foundDeviation.deviation_case_id,
          transformDeviation(foundDeviation),
        );
      }
    }

    // in case there aren't any departures, check the deviations but then for the whole line:
    // (skipping the stoparea parameter)
    if (filteredDepartures.length === 0) {
      const filteredDeviations = await getFilteredSlDeviations(
        deviationConfig.minLevel,
        depFilter.designation,
        depFilter.transportMode,
      );
      for (const foundDeviation of filteredDeviations) {
        deviations.set(
          foundDeviation.deviation_case_id,
          transformDeviation(foundDeviation),
        );
      }
    }
  }

  return {
    displayName: departureConfigEntry.displayName,
    onlyDeviations: departureConfigEntry.onlyDeviations,
    departures: departures.sort((a, b) => a.mins - b.mins),
    deviations: Array.from(deviations.values()),
    showDebugLevel: deviationConfig.showDebugLevel,
  };
}

function transformDeviation(deviation: ApiDeviationResult[0]): Deviation {
  return {
    header: deviation.message_variants[0].header,
    details: deviation.message_variants[0].details,
    priority:
      deviation.priority.importance_level *
      deviation.priority.urgency_level *
      deviation.priority.influence_level,
  };
}
