/**
 * TypeScript entry point for the weather dashboard.
 *
 * Migration in progress: this module currently owns icon initialization,
 * the header clock/date, theme toggling, UI state, weather fetching, and
 * search/autocomplete.
 */

import { initSearch } from './search';
import { setUIState } from './ui';

lucide.createIcons();

const DAYS = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

const currentTimeEl = document.getElementById('current-time');
const locDateEl = document.getElementById('loc-date');

function updateTime(): void {
  const now = new Date();
  const timeStr = now
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    .replace(':', ' : ');

  if (currentTimeEl) {
    currentTimeEl.textContent = timeStr;
  }

  if (locDateEl) {
    // Data is internal constants and Date numbers only (no user/API input).
    locDateEl.innerHTML = `${DAYS[now.getDay()]}<br>${now.getDate()} ${MONTHS[now.getMonth()]}, ${now.getFullYear()}`;
  }
}

setInterval(updateTime, 1000);
updateTime();

const themeBtn = document.getElementById('theme-toggle');

themeBtn?.addEventListener('click', () => {
  const isLightMode = document.body.classList.toggle('light-mode');

  // Re-query the icon on each click: lucide.createIcons() renders by calling
  // replaceChild, so any node captured once at load becomes a detached orphan
  // after the next render (e.g. setUIState during a search). The id is carried
  // onto the replacement svg, so getElementById always returns the live node.
  const themeIcon = document.getElementById('theme-icon');
  themeIcon?.setAttribute('data-lucide', isLightMode ? 'moon' : 'sun');
  lucide.createIcons({ nameAttr: 'data-lucide' });
});

initSearch();
setUIState({ status: 'empty' });
