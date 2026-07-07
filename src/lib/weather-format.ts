import type { UvLevel } from '../types/ui';
import type { WmoWeatherCode, WmoWeatherCodeMap, WmoWeatherInfo } from '../types/open-meteo';

/** WMO weather interpretation codes -> label + Lucide icon name. */
export const WMO_MAP: WmoWeatherCodeMap = {
  0: { label: 'Clear', icon: 'sun' },
  1: { label: 'Mostly Clear', icon: 'cloud-sun' },
  2: { label: 'Partly Cloudy', icon: 'cloud-sun' },
  3: { label: 'Cloudy', icon: 'cloud' },
  45: { label: 'Fog', icon: 'cloud-fog' },
  48: { label: 'Fog', icon: 'cloud-fog' },
  51: { label: 'Drizzle', icon: 'cloud-drizzle' },
  53: { label: 'Drizzle', icon: 'cloud-drizzle' },
  55: { label: 'Drizzle', icon: 'cloud-drizzle' },
  61: { label: 'Rain', icon: 'cloud-rain' },
  63: { label: 'Rain', icon: 'cloud-rain' },
  65: { label: 'Heavy Rain', icon: 'cloud-rain' },
  71: { label: 'Snow', icon: 'snowflake' },
  73: { label: 'Snow', icon: 'snowflake' },
  75: { label: 'Heavy Snow', icon: 'snowflake' },
  80: { label: 'Showers', icon: 'cloud-rain' },
  81: { label: 'Showers', icon: 'cloud-rain' },
  82: { label: 'Heavy Showers', icon: 'cloud-rain' },
  95: { label: 'Storm', icon: 'cloud-lightning' },
  96: { label: 'Storm', icon: 'cloud-lightning' },
  99: { label: 'Heavy Storm', icon: 'cloud-lightning' },
};

export const FALLBACK_WEATHER: WmoWeatherInfo = { label: 'Cloudy', icon: 'cloud' };

/** Look up a WMO code, falling back to Cloudy for codes we don't render. */
export function wmoInfo(code: number): WmoWeatherInfo {
  return WMO_MAP[code as WmoWeatherCode] ?? FALLBACK_WEATHER;
}

/**
 * Map a rounded UV index to its severity label and the indicator dot position
 * (percent along the UV bar). Buckets follow the WHO UV index scale.
 */
export function uvLevel(uv: number): UvLevel {
  if (uv >= 11) return { label: 'Extreme', position: 90 };
  if (uv >= 8) return { label: 'Very High', position: 70 };
  if (uv >= 6) return { label: 'High', position: 50 };
  if (uv >= 3) return { label: 'Moderate', position: 30 };
  return { label: 'Low', position: 10 };
}

/**
 * Format an ISO timestamp as "h : mm AM/PM". Returns a placeholder for missing
 * values so the UI never shows "Invalid Date".
 */
export function formatTime(iso: string | undefined): string {
  if (!iso) return '-- : --';
  return new Date(iso)
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .replace(':', ' : ');
}
