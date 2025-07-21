import type { Config } from "../configType";
import { SMHIResponse, WeatherIcon } from "../types";
import { getSmhiData } from "./api";
import { getSunrise, getSunset } from 'sunrise-sunset-js';


export async function smhi(config: Config) {
  const result: SMHIResponse[] = [];

  for (const smhiConfigEntry of config.smhi) {
    const smhiResponse = await getSmhiData(smhiConfigEntry.latitude, smhiConfigEntry.longitude);
    if (!smhiResponse) {
      result.push({ displayName: smhiConfigEntry.displayName, error: true });
      continue;
    }


    const forecast = smhiResponse.timeSeries.map((timeSeries) => {
      const validTime = timeSeries.validTime;
      const temperature = timeSeries.parameters.find((param) => param.name === 't')?.values[0] ?? null;
      const symbol = smhiSymbolToIcon(timeSeries.parameters.find((param) => param.name === 'Wsymb2')?.values[0] ?? -1);
      const precipitation = timeSeries.parameters.find((param) => param.name === 'pmean')?.values[0] ?? null;
      const night = isNight(validTime, smhiConfigEntry.latitude, smhiConfigEntry.longitude);

      return {
        validTime,
        temperature,
        symbol,
        precipitation,
        night,
      }
    }).slice(1, 24); // Remove first item from the array, because it's the current time

    result.push({ displayName: smhiConfigEntry.displayName, forecast });
  }
  return result;
}

function smhiSymbolToIcon(symbol: number): WeatherIcon {
  switch (symbol) {
    case 1: // Clear sky
    case 2: // Nearly clear sky
      return "CLEAR";
    case 3: // Variable cloudiness
    case 4: // Halfclear sky
    case 5: // Cloudy sky
    case 6: // Overcast
      return "CLOUDY";
    case 7: // Fog
      return "FOG";
    case 8: // Light rain showers
    case 18: // Light rain
      return "LIGHT_RAIN";
    case 9: // Moderate rain showers
    case 19: // Moderate rain
      return "HEAVY_RAIN";
    case 10: // Heavy rain showers
    case 20: // Heavy rain
      return "HEAVY_RAIN";
    case 11: // Thunderstorm
    case 21: // Thunder
      return "THUNDER";
    case 12: // Light sleet showers
    case 13: // Moderate sleet showers
    case 14: // Heavy sleet showers
    case 22: // Light sleet
    case 23: // Moderate sleet
    case 24: // Heavy sleet
      return "SNOW";
    case 15: // Light snow showers
    case 16: // Moderate snow showers
    case 17: // Heavy snow showers
    case 25: // Light snowfall
    case 26: // Moderate snowfall
    case 27: // Heavy snowfall
      return "SNOW";
    default:
      return "UNKNOWN";
  }
}

function isNight(validTime: string, latitude: number, longitude: number) {
  const date = new Date(validTime);
  const sunrise = getSunrise(latitude, longitude, date);
  const sunset = getSunset(latitude, longitude, date);
  return date.getTime() < sunrise.getTime() || date.getTime() > sunset.getTime();
}