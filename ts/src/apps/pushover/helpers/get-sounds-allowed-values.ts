
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

/**
 * Predefined Pushover notification sounds
 */
export const PUSHOVER_SOUNDS = [
  { value: 'pushover', display_name: 'Pushover (Default)' },
  { value: 'bike', display_name: 'Bike' },
  { value: 'bugle', display_name: 'Bugle' },
  { value: 'cashregister', display_name: 'Cash Register' },
  { value: 'classical', display_name: 'Classical' },
  { value: 'cosmic', display_name: 'Cosmic' },
  { value: 'falling', display_name: 'Falling' },
  { value: 'gamelan', display_name: 'Gamelan' },
  { value: 'incoming', display_name: 'Incoming' },
  { value: 'intermission', display_name: 'Intermission' },
  { value: 'magic', display_name: 'Magic' },
  { value: 'mechanical', display_name: 'Mechanical' },
  { value: 'pianobar', display_name: 'Piano Bar' },
  { value: 'siren', display_name: 'Siren' },
  { value: 'spacealarm', display_name: 'Space Alarm' },
  { value: 'tugboat', display_name: 'Tugboat' },
  { value: 'alien', display_name: 'Alien Alarm (Long)' },
  { value: 'climb', display_name: 'Climb (Long)' },
  { value: 'persistent', display_name: 'Persistent (Long)' },
  { value: 'echo', display_name: 'Pushover Echo (Long)' },
  { value: 'updown', display_name: 'Up Down (Long)' },
  { value: 'vibrate', display_name: 'Vibrate Only' },
  { value: 'none', display_name: 'None (Silent)' },
] satisfies IQoreAllowedValue<string>[];
