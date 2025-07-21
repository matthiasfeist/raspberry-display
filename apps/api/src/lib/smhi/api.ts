import TTLCache from "@isaacs/ttlcache";
import { z } from "zod/v4";

export const smhiSchema = z.object({
    approvedTime: z.string(),
    referenceTime: z.string(),
    geometry: z.object({
        type: z.string(),
        coordinates: z.array(z.array(z.number()))
    }),
    timeSeries: z.array(
        z.object({
            validTime: z.string(),
            parameters: z.array(
                z.object({
                    name: z.string(),
                    levelType: z.string(),
                    level: z.number(),
                    unit: z.string(),
                    values: z.array(z.number())
                })
            )
        })
    )
})

export type SmhiResponseType = z.infer<typeof smhiSchema>;

const smhiCache = new TTLCache({ ttl: 1000 * 60 * 60 }); // 1 hour

export async function getSmhiData(latitude: number, longitude: number): Promise<SmhiResponseType | null> {
    const cacheKey = `${latitude},${longitude}`;
    const cachedResponse = smhiCache.get(cacheKey) as z.infer<typeof smhiSchema> | undefined;
    if (cachedResponse) return cachedResponse;

    // Cache miss, so we fetch from the API
    const fetchRes = await fetch(`https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${longitude}/lat/${latitude}/data.json`);
    if (!fetchRes.ok) return null;

    const parsedData = smhiSchema.safeParse(await fetchRes.json());
    if (parsedData.error || !parsedData.data) return null;

    smhiCache.set(cacheKey, parsedData.data);
    return parsedData.data;
}

