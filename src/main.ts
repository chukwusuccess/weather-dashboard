/**
 * TypeScript entry point for the weather dashboard.
 *
 * Migration in progress: this module currently owns icon initialization and
 * the header clock/date. The rest of the app still lives in script.js and is
 * ported step by step.
 */

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
