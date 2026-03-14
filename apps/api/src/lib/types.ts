// Shared types between backend and frontend
export type DepartureStatus = 'DELAYED' | 'ON_TIME' | 'CANCELLED';

export type Departure = {
  journeyId: number;
  mins: number;
  status: DepartureStatus;
  dim: boolean;
  designation: string;
  destination: string;
};

export type Deviation = {
  header: string;
  details: string;
  priority: number;
};

export type SlResultObj = {
  displayName: string;
  error?: boolean;
  onlyDeviations?: boolean;
  departures?: Departure[];
  deviations?: Deviation[];
};

export type WeatherIcon =
  | 'CLEAR'
  | 'CLOUDY'
  | 'VARIABLE_CLOUDINESS'
  | 'FOG'
  | 'LIGHT_RAIN'
  | 'HEAVY_RAIN'
  | 'THUNDER'
  | 'SNOW'
  | 'UNKNOWN';

export type SMHIResponse = {
  error?: boolean;
  displayName: string;
  forecast?: {
    validTime: string;
    night: boolean;
    temperature: number | null;
    symbol: WeatherIcon;
    windChill: number | null;
  }[];
};

export type PollenResponse = {
  displayName: string;
  error?: boolean;
  forecasts?: {
    pollenName: string;
    level: number;
    levelName: string;
    date: string; // YYYY-MM-DD
  }[];
};

// Re-export config types that might be useful for frontend
export type { Config } from './configType';
