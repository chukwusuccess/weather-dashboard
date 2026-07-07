/**
 * Assert-based self-check for the pure weather-format helpers. No framework:
 * run with `npm test` (node --import tsx). Exits non-zero on first failure.
 */
import assert from 'node:assert/strict';

import { FALLBACK_WEATHER, WMO_MAP, formatTime, uvLevel, wmoInfo } from './weather-format';

// uvLevel: boundaries of every WHO bucket (behaviour ported from script.js).
assert.deepEqual(uvLevel(0), { label: 'Low', position: 10 });
assert.deepEqual(uvLevel(2), { label: 'Low', position: 10 });
assert.deepEqual(uvLevel(3), { label: 'Moderate', position: 30 });
assert.deepEqual(uvLevel(5), { label: 'Moderate', position: 30 });
assert.deepEqual(uvLevel(6), { label: 'High', position: 50 });
assert.deepEqual(uvLevel(7), { label: 'High', position: 50 });
assert.deepEqual(uvLevel(8), { label: 'Very High', position: 70 });
assert.deepEqual(uvLevel(10), { label: 'Very High', position: 70 });
assert.deepEqual(uvLevel(11), { label: 'Extreme', position: 90 });
assert.deepEqual(uvLevel(15), { label: 'Extreme', position: 90 });

// wmoInfo: known code, and fallback for an unmapped code.
assert.deepEqual(wmoInfo(0), { label: 'Clear', icon: 'sun' });
assert.deepEqual(wmoInfo(95), { label: 'Storm', icon: 'cloud-lightning' });
assert.equal(wmoInfo(0), WMO_MAP[0]);
assert.equal(wmoInfo(7), FALLBACK_WEATHER, 'unmapped code should fall back');
assert.equal(wmoInfo(-1), FALLBACK_WEATHER, 'negative code should fall back');

// formatTime: missing value placeholder, and the " : " separator swap.
assert.equal(formatTime(undefined), '-- : --');
assert.equal(formatTime(''), '-- : --');
assert.match(formatTime('2026-07-07T09:05'), /^\d{1,2} : \d{2} (AM|PM)$/);
assert.ok(formatTime('2026-07-07T09:05').includes(' : '));

console.log('weather-format self-check passed');
