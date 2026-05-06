import TTLCache from '@isaacs/ttlcache';
import wildcardMatch from 'wildcard-match';
import { z } from 'zod/v4';
import { TransportMode } from '../configType';

const departuresSchema = z.object({
  departures: z.array(
    z.object({
      destination: z.string(),
      direction_code: z.number(),
      direction: z.string(),
      state: z.string(),
      display: z.string(),
      scheduled: z.iso.datetime({ local: true }),
      expected: z.iso.datetime({ local: true }),
      journey: z.object({
        id: z.number(),
        state: z.string(),
        prediction_state: z.string().optional(),
      }),
      line: z.object({
        id: z.number(),
        designation: z.string(),
        transport_mode: z.string(),
        group_of_lines: z.string().optional(),
      }),
      stop_area: z.object({
        id: z.number(),
        name: z.string(),
        type: z.string(),
      }),
      deviations: z.array(
        z.object({
          importance_level: z.number(),
          consequence: z.string(),
          message: z.string(),
        }),
      ),
    }),
  ),
  stop_deviations: z.array(
    z.union([
      z.object({
        id: z.number(),
        importance_level: z.number(),
        message: z.string(),
        scope: z.object({
          lines: z.array(
            z.object({
              id: z.number(),
              designation: z.string(),
              transport_mode: z.string(),
              group_of_lines: z.string().optional(),
            }),
          ),
        }),
      }),
    ]),
  ),
});

const deviationsSchema = z.array(
  z.object({
    deviation_case_id: z.number(),
    publish: z.object({ from: z.coerce.date(), upto: z.coerce.date() }),
    priority: z.object({
      importance_level: z.number(),
      influence_level: z.number(),
      urgency_level: z.number(),
    }),
    message_variants: z.array(
      z.object({
        header: z.string(),
        details: z.string(),
        language: z.string(),
      }),
    ),
    scope: z.object({
      stop_areas: z
        .array(
          z.object({
            id: z.number(),
          }),
        )
        .optional(),
      lines: z.array(
        z.object({
          designation: z.string(),
          transport_mode: z.string(),
        }),
      ),
    }),
    categories: z
      .array(z.object({ group: z.string(), type: z.string() }))
      .optional(),
  }),
);

const slCache = new TTLCache({ ttl: 1000 * 60 * 5 }); // 5 minutes

export type SlDepartureResult = z.infer<typeof departuresSchema> | null;
export async function getSlDepartures(
  siteId: string,
): Promise<SlDepartureResult> {
  const cachedResponse = slCache.get(siteId) as
    | z.infer<typeof departuresSchema>
    | undefined;
  if (cachedResponse) return cachedResponse;

  // Cache miss, so we fetch from the API
  const fetchRes = await fetch(
    `https://transport.integration.sl.se/v1/sites/${siteId}/departures?forecast=60`,
  );
  if (!fetchRes.ok) return null;

  const parsedData = departuresSchema.safeParse(await fetchRes.json());
  if (parsedData.error || !parsedData.data) return null;

  slCache.set(siteId, parsedData.data);
  return parsedData.data;
}

export function invalidateSlDepartureCache() {
  slCache.clear();
}
export type ApiDeviationResult = z.infer<typeof deviationsSchema>;
export async function getSlDeviations(): Promise<ApiDeviationResult | null> {
  const cacheKey = 'deviations';
  const cachedResponse = slCache.get(cacheKey) as
    | z.infer<typeof deviationsSchema>
    | undefined;
  if (cachedResponse) return cachedResponse;

  // Cache miss, so we fetch from the API
  const fetchRes = await fetch(
    `https://deviations.integration.sl.se/v1/messages?future=false`,
  );
  if (!fetchRes.ok) return null;

  const parsedData = deviationsSchema.safeParse(await fetchRes.json());
  if (parsedData.error || !parsedData.data) return null;

  slCache.set(cacheKey, parsedData.data); // 10 minutes
  return parsedData.data;
}

/**
 * Returns deviations filtered by line designation and optionally stop area ID.
 * @param lineDesignation The line designation to filter by (e.g., "14").
 * @param stopAreaId Optional stop area ID to further filter deviations.
 * @returns Array of deviations matching the criteria, or null if none found or fetch failed.
 */
export async function getFilteredSlDeviations(
  minLevel: number,
  lineDesignation: string,
  transportMode: TransportMode,
  stopAreaId?: number,
): Promise<z.infer<typeof deviationsSchema>> {
  const deviations = await getSlDeviations();
  if (!deviations) return [];

  const matchDesignationFn = wildcardMatch(lineDesignation, false);

  return deviations.filter((deviation) => {
    const priority =
      deviation.priority.importance_level *
      deviation.priority.urgency_level *
      deviation.priority.influence_level;
    // only include deviations where the current time is between publish.from and publish.upto
    const now = new Date();
    const from = new Date(deviation.publish.from);
    const upto = new Date(deviation.publish.upto);

    // remove deviations in the past or scheduled in the future
    if (!(now >= from && now <= upto)) return false;

    // filter prio
    if (priority <= minLevel) return false;

    // check if the deviation applies to the given line designation
    const lineMatch = deviation.scope.lines.some(
      (line) =>
        line.transport_mode === transportMode &&
        (line.designation === lineDesignation ||
          matchDesignationFn(line.designation)),
    );
    if (!lineMatch) return false;

    // remove messages about elevators not working
    const hasElevatorCategory = deviation.categories?.find(
      (cat) => cat.type === 'LIFT',
    );
    if (hasElevatorCategory) return false;

    // remove messages that are "Försenad avgång" or similar as they are generally not interesting
    if (
      deviation.message_variants[0].header.startsWith('Försenad avgång') ||
      deviation.message_variants[0].header.startsWith('Inställd avgång') ||
      deviation.message_variants[0].header.startsWith('Inställd delsträcka')
    )
      return false;

    // if stopAreaId is provided, check if the deviation applies to the stop area
    if (stopAreaId && deviation.scope?.stop_areas) {
      return deviation.scope.stop_areas.some(
        (stopArea) => stopArea.id === stopAreaId,
      );
    }

    return true;
  });
}
