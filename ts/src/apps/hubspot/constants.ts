import {
  EQoreRecordBasedAppErrorCodes,
  TQoreAppActionOption,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';

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

export class HubspotError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'HubspotError';
    this.errorCode = errorCode;
  }
}

export const HUBSPOT_DUPLICATE_ERROR_CODE = '23505';

export const HubspotErrorCodeToQoreErrorCodeMap: Record<string, string> = {
  [HUBSPOT_DUPLICATE_ERROR_CODE]: EQoreRecordBasedAppErrorCodes.DUPLICATE_RECORD,
};
