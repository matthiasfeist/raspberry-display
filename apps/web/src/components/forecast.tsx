import type { SMHIResponse, WeatherIcon } from '@raspberry-display/api/types';
import { cn } from '../lib/cn';
import {
  RiHeavyShowersLine,
  RiMistLine,
  RiMoonCloudyLine,
  RiMoonLine,
  RiQuestionLine,
  RiRainyLine,
  RiSnowyLine,
  RiSunCloudyLine,
  RiSunLine,
  RiThunderstormsLine,
} from '@remixicon/react';

export function Forecast({
  forecastList,
}: {
  forecastList: SMHIResponse['forecast'];
}) {
  if (!forecastList || forecastList.length === 0) return <div>No forecast</div>;

  return (
    <div className="flex flex-row gap-2 pt-2 mask-r-from-80% mask-r-to-100% overflow-hidden">
      {forecastList.map((forecast) => {
        return (
          <div
            key={forecast.validTime}
            className={cn('flex flex-col text-center min-w-15 gap-2')}
          >
            <div className="uppercase text-sm p-1 tracking-wide font-mono text-gray-300">
              {new Date(forecast.validTime).getHours()}:00
            </div>
            <div className="flex content-center justify-center">
              <ForecastIcon
                symbol={forecast.symbol}
                size={40}
                isNight={forecast.night}
              />
            </div>
            <div className="p-1 font-mono text-lg tabular-nums">
              {Math.round(forecast.temperature ?? -100)}°
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ForecastIcon({
  symbol,
  size,
  isNight,
}: {
  symbol: WeatherIcon;
  size: number;
  isNight: boolean;
}) {
  switch (symbol) {
    case 'CLEAR':
      return isNight ? (
        <RiMoonLine size={size} />
      ) : (
        <RiSunLine size={size} className="text-yellow-300" />
      );
    case 'CLOUDY':
      return isNight ? (
        <RiMoonCloudyLine size={size} className="text-blue-100" />
      ) : (
        <RiSunCloudyLine size={size} className="text-blue-100" />
      );
    case 'FOG':
      return <RiMistLine size={size} />;
    case 'LIGHT_RAIN':
      return <RiRainyLine size={size} className="text-blue-200" />;
    case 'HEAVY_RAIN':
      return <RiHeavyShowersLine size={size} className="text-blue-400" />;
    case 'THUNDER':
      return <RiThunderstormsLine size={size} />;
    case 'SNOW':
      return <RiSnowyLine size={size} className="text-blue-400" />;
    default:
      return <RiQuestionLine size={size} />;
  }
}
