/* eslint-disable max-len */
import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

export const PaddleReportStatusAllowedValues = [
  {
    value: 'pending',
    display_name: 'Pending',
    desc: 'Return reports where the status is `pending`. Returned reports are created, but Paddle is processing them.',
  },
  {
    value: 'ready',
    display_name: 'Ready',
    desc: 'Return reports where the status is `ready`. Returned reports are fully processed and are ready for download.',
  },
  {
    value: 'failed',
    display_name: 'Failed',
    desc: 'Return reports where the status is `failed`. Returned reports encountered problems in processing.',
  },
  {
    value: 'expired',
    display_name: 'Expired',
    desc: 'Return reports where the status is `expired`. Returned reports are no longer accessible.',
  },
] satisfies IQoreAllowedValue<string>[];
