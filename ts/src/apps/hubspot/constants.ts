import { TQoreAppActionOption, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';

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

export const HubspotAssociationsType: TQoreAppActionOption = {
  required: false,
  type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        to: {
          required: true,
          type: {
            type: 'hash',
            fields: {
              id: {
                type: 'softstring',
              },
            },
          },
        },
        types: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                associationCategory: {
                  type: 'string',
                  required: true,
                },
                associationTypeId: {
                  type: 'string',
                  required: true,
                },
              },
            },
          },
        },
      },
    },
  },
};
