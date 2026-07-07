import type { UIState } from './types/ui';

const statusContainer = document.getElementById('status-container');
const statusText = document.getElementById('status-text');
const weatherTop = document.getElementById('weather-top');
const weatherBottom = document.getElementById('weather-bottom');
const sidebarWrapper = document.getElementById('sidebar-wrapper');

export function showError(message: string): void {
  const toast = document.getElementById('error-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

export function setUIState(state: UIState): void {
  if (!statusContainer || !statusText || !weatherTop || !weatherBottom || !sidebarWrapper) {
    return;
  }

  if (state.status === 'empty') {
    weatherTop.style.display = 'none';
    weatherBottom.style.display = 'none';
    sidebarWrapper.style.display = 'none';
    statusContainer.style.display = 'flex';

    const statusIcon = document.getElementById('status-icon');
    statusIcon?.setAttribute('data-lucide', 'search');
    statusIcon?.classList.remove('spin');
    if (statusIcon instanceof HTMLElement) {
      statusIcon.style.color = 'var(--accent)';
    }
    statusText.textContent = 'Search for a city to see live weather data.';
  } else if (state.status === 'loading') {
    weatherTop.style.display = 'none';
    weatherBottom.style.display = 'none';
    sidebarWrapper.style.display = 'none';
    statusContainer.style.display = 'flex';

    const statusIcon = document.getElementById('status-icon');
    statusIcon?.setAttribute('data-lucide', 'loader-2');
    statusIcon?.classList.add('spin');
    if (statusIcon instanceof HTMLElement) {
      statusIcon.style.color = 'var(--accent)';
    }
    statusText.textContent = 'Loading weather data...';
  } else if (state.status === 'error') {
    weatherTop.style.display = 'none';
    weatherBottom.style.display = 'none';
    sidebarWrapper.style.display = 'none';
    statusContainer.style.display = 'flex';

    const statusIcon = document.getElementById('status-icon');
    statusIcon?.setAttribute('data-lucide', 'cloud-off');
    statusIcon?.classList.remove('spin');
    if (statusIcon instanceof HTMLElement) {
      statusIcon.style.color = '#ff4d4d';
    }
    statusText.textContent = state.message || 'City not found. Try another city.';
  } else if (state.status === 'success') {
    statusContainer.style.display = 'none';
    weatherTop.style.display = 'grid';
    weatherBottom.style.display = 'grid';
    sidebarWrapper.style.display = 'flex';
  }

  lucide.createIcons();
}

/** ponytail: bridge for script.js until search/API handlers move to TypeScript. */
export function setUIStateLegacy(state: string, message = ''): void {
  switch (state) {
    case 'empty':
      setUIState({ status: 'empty' });
      break;
    case 'loading':
      setUIState({ status: 'loading' });
      break;
    case 'error':
      setUIState({ status: 'error', message });
      break;
    case 'success':
      setUIState({ status: 'success' });
      break;
  }
}
