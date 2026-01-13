
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

/**
 * Priority levels for standard notifications (-2 to 1)
 * Priority 2 (emergency) is handled by a separate action
 */
export const PUSHOVER_PRIORITIES = [
  { value: -2, display_name: 'Lowest (No notification/alert)' },
  { value: -1, display_name: 'Low (Quiet, no sound/vibration)' },
  { value: 0, display_name: 'Normal' },
  { value: 1, display_name: 'High (Bypass quiet hours)' },
] satisfies IQoreAllowedValue<number>[];
