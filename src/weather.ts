import type {
  ForecastResponse,
  GeocodingResult,
  GeocodingSearchResponse,
} from './types/open-meteo';
import { formatTime, uvLevel, wmoInfo } from './lib/weather-format';
import { setUIState, showError } from './ui';

const GEOCODING_TIMEOUT_MS = 5000;
const FORECAST_TIMEOUT_MS = 8000;

function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

export async function getCoordinates(city: string): Promise<GeocodingResult> {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), GEOCODING_TIMEOUT_MS);

  try {
    const res = await fetch(geoUrl, { signal: controller.signal });
    if (!res.ok) {
      if (res.status === 429) throw new Error('API limit reached. Please try again later.');
      throw new Error('Failed to reach geocoding service.');
    }

    // External API boundary: shape validated immediately below.
    const data = (await res.json()) as GeocodingSearchResponse;
    clearTimeout(timeoutId);

    const first = data.results?.[0];
    if (!first) {
      throw new Error(`City "${city}" not found. Try another city.`);
    }

    return first;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request took too long. Check your internet connection.');
    }
    throw error;
  }
}

export async function fetchWeather(
  lat: number,
  lon: number,
  locationName: string,
): Promise<void> {
  if (!navigator.onLine) {
    showError('Internet is offline.');
    setUIState({ status: 'error', message: 'Internet is offline. Cannot fetch data.' });
    return;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_min,temperature_2m_max,sunset,sunrise,rain_sum,showers_sum,snowfall_sum,uv_index_max,weather_code&hourly=temperature_2m,relative_humidity_2m,rain,wind_speed_10m&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FORECAST_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('API key is wrong or unauthorized.');
      }
      if (response.status === 429) throw new Error('API limit is reached.');
      throw new Error('Failed to fetch weather data.');
    }

    // External API boundary: presence of current/daily/hourly checked below.
    const data = (await response.json()) as ForecastResponse;
    clearTimeout(timeoutId);

    if (!data.current || !data.daily || !data.hourly) {
      throw new Error('Weather data is missing from the response.');
    }

    renderWeather(data, locationName);
    setUIState({ status: 'success' });
  } catch (error) {
    console.error('Fetch Error:', error);
    let errorMsg = error instanceof Error ? error.message : 'Failed to fetch weather data.';
    if (error instanceof Error && error.name === 'AbortError') {
      errorMsg = 'Request took too long. Check your internet connection.';
    }

    showError(errorMsg);
    setUIState({ status: 'error', message: errorMsg });
  }
}

function renderWeather(data: ForecastResponse, locationName: string): void {
  const locName = document.getElementById('loc-name');
  if (locName) {
    // ponytail: locationName comes from the geocoding API and is injected as
    // HTML for the <br> line break. Trusted source; revisit if the render step
    // switches to element-building.
    locName.innerHTML = locationName.replace(' ', '<br>').toUpperCase();
  }

  const current = data.current;
  const outdoorTemp = document.getElementById('outdoor-temp');
  if (outdoorTemp) {
    outdoorTemp.innerHTML = `${Math.round(current.temperature_2m)}<span>°C</span>`;
  }
  setText('outdoor-humidity', `${Math.round(current.relative_humidity_2m)}%`);
  setText('wind-val', current.wind_speed_10m.toFixed(1));

  const daily = data.daily;
  const todayRain = (daily.rain_sum[0] || 0) + (daily.showers_sum[0] || 0);
  setText('rainfall-val', `${todayRain.toFixed(1)}mm`);

  const uv = Math.round(daily.uv_index_max[0] || 0);
  const { label: uvText, position: uvPos } = uvLevel(uv);

  setText('uv-val', String(uv));
  setText('uv-sub', uvText);
  const uvDot = document.getElementById('uv-dot');
  if (uvDot) uvDot.style.left = `${uvPos}%`;

  setText('sunrise-val', formatTime(daily.sunrise[0]));
  setText('sunset-val', `SUNSET ${formatTime(daily.sunset[0])}`);

  renderForecast(daily);
  lucide.createIcons();
}

function renderForecast(daily: ForecastResponse['daily']): void {
  const list = document.getElementById('forecast-list');
  if (!list) return;

  list.innerHTML = '';

  for (let i = 0; i < 7; i++) {
    if (i >= daily.time.length) break;

    const dayStr = daily.time[i];
    const dayDate = new Date(dayStr + 'T00:00:00');
    const isToday = i === 0;
    const dayName = isToday
      ? 'Today'
      : dayDate.toLocaleDateString('en-US', { weekday: 'short' });

    const temp = Math.round(daily.temperature_2m_max[i]);
    const weatherInfo = wmoInfo(daily.weather_code[i]);

    // All interpolated values are internal constants or Math-rounded numbers.
    list.innerHTML += `
      <div class="forecast-item">
        <div class="f-time">${dayName}</div>
        <div class="f-line"></div>
        <div class="f-icon-col">
          <i data-lucide="${weatherInfo.icon}" class="icon-sm" style="color: var(--accent);"></i>
          <span class="f-speed" style="font-size: 12px; margin-top: 4px;">${weatherInfo.label}</span>
        </div>
        <div class="f-line"></div>
        <div class="f-temp">${temp}°C</div>
      </div>
    `;
  }
}
