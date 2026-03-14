import type { Config } from '../configType';
import type { PollenResponse } from '../types';
import { getForecasts, getPollenTypes } from './api';

export async function pollen(config: Config): Promise<PollenResponse[]> {
  const result: PollenResponse[] = [];

  for (const entry of config.pollen) {
    const [pollenTypes, forecasts] = await Promise.all([
      getPollenTypes(),
      getForecasts(entry.regionId),
    ]);

    if (!pollenTypes) {
      console.error('[pollen] Failed to fetch pollen types');
      result.push({ displayName: entry.displayName, error: true });
      continue;
    }

    if (!forecasts) {
      console.error(`[pollen] Failed to fetch forecasts for regionId: ${entry.regionId}`);
      result.push({ displayName: entry.displayName, error: true });
      continue;
    }

    const pollenNameById = new Map(pollenTypes.map((pt) => [pt.id, pt.name]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cutoff = new Date(today);
    cutoff.setDate(today.getDate() + 2); // today and tomorrow only

    const forecastItems: PollenResponse['forecasts'] = [];

    for (const forecast of forecasts) {
      for (const levelEntry of forecast.levelSeries) {
        if (levelEntry.level < 3) continue; // only moderate (3-4), high (5-6), very high (7)

        const date = new Date(levelEntry.time);
        date.setHours(0, 0, 0, 0);
        if (date < today || date >= cutoff) continue;

        const pollenName = pollenNameById.get(levelEntry.pollenId);
        if (!pollenName) {
          console.warn(`[pollen] Unknown pollenId: ${levelEntry.pollenId}`);
          continue;
        }

        const dateStr = levelEntry.time.slice(0, 10); // YYYY-MM-DD
        forecastItems.push({
          pollenName,
          level: levelEntry.level,
          levelName: levelToName(levelEntry.level),
          date: dateStr,
        });
      }
    }

    // Deduplicate: if the same pollen+date appears across multiple forecasts,
    // keep the highest level entry (most recent forecast may overlap)
    const deduped = new Map<string, NonNullable<PollenResponse['forecasts']>[number]>();
    for (const item of forecastItems) {
      const key = `${item.date}:${item.pollenName}`;
      const existing = deduped.get(key);
      if (!existing || item.level > existing.level) {
        deduped.set(key, item);
      }
    }

    const sorted = Array.from(deduped.values()).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return b.level - a.level; // highest level first within same day
    });

    result.push({ displayName: entry.displayName, forecasts: sorted });
  }

  return result;
}

function levelToName(level: number): string {
  switch (level) {
    case 1:
      return 'Very Low';
    case 2:
      return 'Low';
    case 3:
      return 'Moderate';
    case 4:
      return 'Moderate';
    case 5:
      return 'High';
    case 6:
      return 'High';
    case 7:
      return 'Very High';
    default:
      return 'None';
  }
}
