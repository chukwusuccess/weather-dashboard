import type { GeocodingResult, GeocodingSearchResponse } from './types/open-meteo';
import { setUIState, showError } from './ui';
import { fetchWeather, getCoordinates } from './weather';

const SUGGESTION_DEBOUNCE_MS = 300;
const MIN_SUGGESTION_QUERY_LENGTH = 2;

const cityInput = document.getElementById('city-input') as HTMLInputElement | null;
const suggestionsDropdown = document.getElementById('search-suggestions');

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let suggestionAbort: AbortController | undefined;

async function handleSearch(): Promise<void> {
  if (!cityInput) return;

  const city = cityInput.value.trim();

  if (!city) {
    showError('Please enter a city name.');
    return;
  }

  if (!navigator.onLine) {
    showError('Internet is offline.');
    setUIState({ status: 'error', message: 'Internet is offline. Cannot fetch data.' });
    return;
  }

  setUIState({ status: 'loading' });

  try {
    const geoData = await getCoordinates(city);
    await fetchWeather(geoData.latitude, geoData.longitude, geoData.name);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search failed.';
    showError(message);
    setUIState({ status: 'error', message });
  }
}

function hideSuggestions(): void {
  if (suggestionsDropdown) {
    suggestionsDropdown.style.display = 'none';
  }
}

async function fetchSuggestions(query: string): Promise<void> {
  if (!navigator.onLine || !suggestionsDropdown) return;

  suggestionAbort?.abort();
  const controller = new AbortController();
  suggestionAbort = controller;

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`,
      { signal: controller.signal },
    );
    if (!res.ok) return;

    const data = (await res.json()) as GeocodingSearchResponse;
    if (controller.signal.aborted) return;

    const results = data.results;
    if (results && results.length > 0) {
      showSuggestions(results);
    } else {
      hideSuggestions();
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return;
    console.error('Suggestion fetch failed', error);
  }
}

function showSuggestions(results: GeocodingResult[]): void {
  if (!suggestionsDropdown || !cityInput) return;

  suggestionsDropdown.replaceChildren();

  for (const res of results) {
    const div = document.createElement('div');
    div.className = 'suggestion-item';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = res.name;

    const countrySpan = document.createElement('span');
    countrySpan.className = 'suggestion-country';
    const region = res.admin1 ? `${res.admin1}, ` : '';
    countrySpan.textContent = `${region}${res.country}`;

    div.append(nameSpan, countrySpan);
    div.addEventListener('click', () => {
      cityInput.value = res.name;
      hideSuggestions();
      void handleSearch();
    });
    suggestionsDropdown.appendChild(div);
  }

  suggestionsDropdown.style.display = 'flex';
}

export function initSearch(): void {
  const searchBtn = document.getElementById('search-btn');
  const searchContainer = document.querySelector('.search-container');

  searchBtn?.addEventListener('click', () => void handleSearch());

  searchContainer?.addEventListener('click', () => cityInput?.focus());

  cityInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') void handleSearch();
  });

  cityInput?.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    const query = (e.target as HTMLInputElement).value.trim();
    if (query.length < MIN_SUGGESTION_QUERY_LENGTH) {
      hideSuggestions();
      return;
    }
    debounceTimer = setTimeout(() => void fetchSuggestions(query), SUGGESTION_DEBOUNCE_MS);
  });

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('.search-container')) {
      hideSuggestions();
    }
  });
}
