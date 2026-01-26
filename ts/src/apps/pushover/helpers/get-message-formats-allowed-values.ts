
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

/**
 * Message format options for Pushover notifications
 */
export const PUSHOVER_MESSAGE_FORMATS = [
  { value: 'plain', display_name: 'Plain Text' },
  { value: 'html', display_name: 'HTML' },
  { value: 'monospace', display_name: 'Monospace' },
] satisfies IQoreAllowedValue<string>[];
