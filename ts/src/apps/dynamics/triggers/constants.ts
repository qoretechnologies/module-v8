import { TQoreOptions } from '@qoretechnologies/ts-toolkit';

export const dynamicsTriggerOptionsWithCondition = {
  condition: {
    type: 'string',
    required: true,
    default_value: 'created',
    allowed_values: [
      {
        display_name: 'Created',
        value: 'created',
      },
      {
        display_name: 'Updated',
        value: 'updated',
      },
    ],
  },
} satisfies TQoreOptions;
