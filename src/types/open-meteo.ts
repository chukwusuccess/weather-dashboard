/** Open-Meteo Geocoding API — https://open-meteo.com/en/docs/geocoding-api */

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  country_code?: string;
  elevation?: number;
  feature_code?: string;
  population?: number;
  timezone?: string;
}

export interface GeocodingSearchResponse {
  results?: GeocodingResult[];
  generationtime_ms?: number;
}

/** Open-Meteo Forecast API — fields requested by this app */

export interface ForecastCurrent {
  time: string;
  interval?: number;
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
}

export interface ForecastDaily {
  time: string[];
  temperature_2m_min?: number[];
  temperature_2m_max: number[];
  sunrise: string[];
  sunset: string[];
  rain_sum: number[];
  showers_sum: number[];
  snowfall_sum?: number[];
  uv_index_max: number[];
  weather_code: number[];
}

export interface ForecastHourly {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  rain: number[];
  wind_speed_10m: number[];
}

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current: ForecastCurrent;
  daily: ForecastDaily;
  hourly: ForecastHourly;
}

/** WMO weather interpretation codes used by Open-Meteo */

export interface WmoWeatherInfo {
  label: string;
  icon: string;
}

export type WmoWeatherCode =
  | 0
  | 1
  | 2
  | 3
  | 45
  | 48
  | 51
  | 53
  | 55
  | 61
  | 63
  | 65
  | 71
  | 73
  | 75
  | 80
  | 81
  | 82
  | 95
  | 96
  | 99;

export type WmoWeatherCodeMap = Record<WmoWeatherCode, WmoWeatherInfo>;
