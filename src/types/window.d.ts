/** Globals exposed for script.js during the incremental TypeScript migration. */
interface Window {
  setUIState(state: string, message?: string): void;
  showError(message: string): void;
}
