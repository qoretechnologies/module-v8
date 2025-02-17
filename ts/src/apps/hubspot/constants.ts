import { TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';

export const HUBSPOT_APP_NAME = 'Hubspot';

export const hubspotSearchSortsOption = {
  required: false,
  type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        propertyName: {
          required: true,
          type: 'string',
        },
        direction: {
          type: 'string',
          required: true,
          allowed_values: [
            {
              display_name: 'Ascending',
              value: 'ASCENDING',
            },
            {
              display_name: 'Descending',
              value: 'DESCENDING',
            },
          ],
        },
      },
    },
  },
} satisfies TQoreAppActionOverrideOption;
