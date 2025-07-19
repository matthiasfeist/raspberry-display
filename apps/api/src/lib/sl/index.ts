

import type { Config } from "../configType";
import type { Departure, Deviation, SlResultObj, DepartureStatus } from "../types";
import wildcardMatch from "wildcard-match";
import { getFilteredSlDeviations, getSlDepartures, invalidateSlDepartureCache } from "./api";

export async function sl(config: Config) {
  const result: SlResultObj[] = [];

  for (const slConfigEntry of config.sl) {
    const slResponse = await getSlDepartures(slConfigEntry.siteId);
    if (!slResponse) {
      result.push({ displayName: slConfigEntry.displayName, error: true });
      continue;
    }

    const departures: Departure[] = [];
    const deviations = new Map<number, Deviation>();

    for (const depFilter of slConfigEntry.filterDepartures) {
      const matchDesignationFn = wildcardMatch(depFilter.designation, false);
      const filteredDepartures = slResponse.departures.filter(dep =>
        dep.direction_code === depFilter.direction && matchDesignationFn(dep.line.designation)
      );

      for (const dep of filteredDepartures) {
        const scheduled = new Date(dep.scheduled);
        const expected = new Date(dep.expected);
        const now = new Date();
        const mins = Math.floor((expected.getTime() - now.getTime()) / 60000);
        if (mins < -3) // If the departure is more than 2 minutes in the past, invalidate the cache and force a new fetch
          invalidateSlDepartureCache();

        if (mins < 0)  // If the departure is in the past, we don't want to show it
          continue;

        const delayed = (expected.getTime() - scheduled.getTime()) > 2 * 60 * 1000; // 2 minutes

        let status: DepartureStatus = delayed ? 'DELAYED' : 'ON_TIME';
        if (dep.state === 'CANCELLED' || dep.journey.state === 'CANCELLED' || dep.state === 'ABORTED' || dep.state === 'NOT RUN')
          status = 'CANCELLED'

        const dim = typeof slConfigEntry.walkingTime === 'number' && mins <= slConfigEntry.walkingTime;
        departures.push({
          mins, status, journeyId: dep.journey.id, dim,
          designation: dep.line.designation, destination: dep.destination
        });

        // Deviations
        const filteredDeviations = await getFilteredSlDeviations(dep.line.designation, dep.stop_area.id);
        for (const foundDeviation of filteredDeviations) {
          deviations.set(foundDeviation.deviation_case_id, {
            text: foundDeviation.message_variants[0].header,
            lineDesignation: dep.line.designation,
            level: foundDeviation.priority.importance_level
          });
        }
      }
    }

    result.push({
      displayName: slConfigEntry.displayName,
      departures: departures.sort((a, b) => a.mins - b.mins),
      deviations: Array.from(deviations.values()),
    });
  }

  return result;
}
