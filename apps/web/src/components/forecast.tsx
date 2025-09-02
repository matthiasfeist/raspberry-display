import type { SMHIResponse, WeatherIcon } from '@raspberry-display/api/types';
import { cn } from '../lib/cn';
import {
  WiDaySunny,
  WiDayCloudy,
  WiDayFog,
  WiNightFog,
  WiDayShowers,
  WiNightShowers,
  WiThunderstorm,
  WiNa,
  WiNightClear,
  WiNightAltCloudy,
  WiSnow,
  WiCloudy,
  WiRain,
} from 'react-icons/wi';
import chroma from 'chroma-js';

const tempColor = chroma
  .scale(['00a6f4', 'white', 'white', '#e7000b'])
  .domain([-10, 0, 15, 25]);

export function Forecast({
  forecastList,
}: {
  forecastList: SMHIResponse['forecast'];
}) {
  if (!forecastList || forecastList.length === 0) return <div>No forecast</div>;

  return (
    <div className="flex flex-row gap-2 overflow-hidden pt-2">
      {forecastList.slice(0, 8).map((forecast) => {
        const temp = Math.round(forecast.temperature ?? -100);
        return (
          <div
            key={forecast.validTime}
            className={cn('min-w-15 flex flex-col gap-2 text-center')}
          >
            <div className="p-1 font-mono text-sm uppercase tracking-wide text-gray-300">
              {new Date(forecast.validTime).getHours()}:00
            </div>
            <div className="flex content-center justify-center">
              <ForecastIcon
                symbol={forecast.symbol}
                size={40}
                isNight={forecast.night}
              />
            </div>
            <div
              className="p-1 font-mono text-lg tabular-nums"
              style={{ color: tempColor(temp).hex() }}
            >
              {temp}°
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
        <WiNightClear size={size} />
      ) : (
        <WiDaySunny size={size} className="text-yellow-400" />
      );
    case 'VARIABLE_CLOUDINESS':
      return isNight ? (
        <WiNightAltCloudy size={size} />
      ) : (
        <WiDayCloudy size={size} />
      );
    case 'CLOUDY':
      return <WiCloudy size={size} />;
    case 'FOG':
      return isNight ? <WiNightFog size={size} /> : <WiDayFog size={size} />;
    case 'LIGHT_RAIN':
      return isNight ? (
        <WiNightShowers size={size} className="text-sky-500" />
      ) : (
        <WiDayShowers size={size} className="text-sky-500" />
      );
    case 'HEAVY_RAIN':
      return <WiRain size={size} className="text-sky-500" />;
    case 'THUNDER':
      return <WiThunderstorm size={size} className="text-sky-500" />;
    case 'SNOW':
      return <WiSnow size={size} className="text-sky-500" />;
    default:
      return <WiNa size={size} />;
  }
}
