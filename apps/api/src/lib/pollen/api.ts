import TTLCache from '@isaacs/ttlcache';
import { z } from 'zod/v4';

const paginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    _meta: z.object({
      totalRecords: z.number(),
      offset: z.number(),
      limit: z.number(),
      count: z.number(),
    }),
  });

export const pollenTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const pollenLevelSchema = z.object({
  pollenId: z.string(),
  level: z.number().int().min(0).max(7),
  time: z.string(),
});

export const forecastSchema = z.object({
  id: z.string(),
  regionId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  levelSeries: z.array(pollenLevelSchema),
});

export type PollenTypeType = z.infer<typeof pollenTypeSchema>;
export type ForecastType = z.infer<typeof forecastSchema>;

const BASE_URL = 'https://api.pollenrapporten.se';

const pollenTypesCache = new TTLCache<string, PollenTypeType[]>({ ttl: 1000 * 60 * 60 * 24 * 7 }); // 1 week (essentially static)
const forecastsCache = new TTLCache<string, ForecastType[]>({ ttl: 1000 * 60 * 60 * 12 }); // 12 hrs (updates once a day)

export async function getPollenTypes(): Promise<PollenTypeType[] | null> {
  const cached = pollenTypesCache.get('pollenTypes');
  if (cached) return cached;

  const res = await fetch(`${BASE_URL}/v1/pollen-types?limit=100`);
  if (!res.ok) {
    console.error(`[pollen/api] pollen-types request failed: ${res.status} ${res.statusText}`);
    return null;
  }

  const json = await res.json();
  const parsed = paginatedSchema(pollenTypeSchema).safeParse(json);
  if (parsed.error) {
    console.error('[pollen/api] pollen-types validation failed:', parsed.error.message);
    return null;
  }

  pollenTypesCache.set('pollenTypes', parsed.data.items);
  return parsed.data.items;
}

export async function getForecasts(regionId: string): Promise<ForecastType[] | null> {
  const cached = forecastsCache.get(regionId);
  if (cached) return cached;

  const url = `${BASE_URL}/v1/forecasts?region_id=${regionId}&current=true&limit=100`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`[pollen/api] forecasts request failed: ${res.status} ${res.statusText}`);
    return null;
  }

  const json = await res.json();
  const parsed = paginatedSchema(forecastSchema).safeParse(json);
  if (parsed.error) {
    console.error('[pollen/api] forecasts validation failed:', parsed.error.message);
    console.error('[pollen/api] raw response:', JSON.stringify(json).slice(0, 500));
    return null;
  }

  forecastsCache.set(regionId, parsed.data.items);
  return parsed.data.items;
}
