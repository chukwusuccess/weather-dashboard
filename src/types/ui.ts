/**
 * UI state for the weather view. Modelled as a discriminated union so an
 * error state always carries its message and success/loading/empty cannot
 * silently carry stale error text.
 */
export type UIState =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success' };

export type UIStatus = UIState['status'];

/** UV index severity buckets shown under the UV card. */
export interface UvLevel {
  label: string;
  /** Horizontal position of the indicator dot on the UV bar, as a percentage. */
  position: number;
}
