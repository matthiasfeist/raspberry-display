import TTLCache from '@isaacs/ttlcache';
import { z } from 'zod/v4';

export const smhiSchema = z.object({
  createdTime: z.string(),
  referenceTime: z.string(),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.number()),
  }),
  timeSeries: z.array(
    z.object({
      time: z.string(),
      intervalParametersStartTime: z.string(),
      data: z.looseObject({
        air_temperature: z.number(),
        wind_speed: z.number(),
        symbol_code: z.number(),
      }),
    }),
  ),
});

export type SmhiResponseType = z.infer<typeof smhiSchema>;

const smhiCache = new TTLCache({ ttl: 1000 * 60 * 15 }); // 15 mins

export async function getSmhiData(
  latitude: number,
  longitude: number,
): Promise<SmhiResponseType | null> {
  const cacheKey = `${latitude},${longitude}`;
  const cachedResponse = smhiCache.get(cacheKey) as
    | z.infer<typeof smhiSchema>
    | undefined;
  if (cachedResponse) return cachedResponse;

  // Cache miss, so we fetch from the API
  const fetchRes = await fetch(
    `https://opendata-download-metfcst.smhi.se/api/category/snow1g/version/1/geotype/point/lon/${longitude}/lat/${latitude}/data.json`,
  );
  if (!fetchRes.ok) return null;

  const parsedData = smhiSchema.safeParse(await fetchRes.json());
  if (parsedData.error || !parsedData.data) return null;

  smhiCache.set(cacheKey, parsedData.data);
  return parsedData.data;
}
