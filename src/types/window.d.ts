/** Globals exposed for script.js during the incremental TypeScript migration. */
interface Window {
  setUIState(state: string, message?: string): void;
  showError(message: string): void;
  getCoordinates(city: string): Promise<import('./open-meteo').GeocodingResult>;
  fetchWeather(lat: number, lon: number, locationName: string): Promise<void>;
}
