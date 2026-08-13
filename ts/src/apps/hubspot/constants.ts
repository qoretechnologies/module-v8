import {
  EQoreRecordBasedAppErrorCodes,
  TQoreAppActionOption,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';

export const HUBSPOT_APP_NAME = 'Hubspot';

/**
 * The date-based version of HubSpot's OAuth API this application authenticates against.
 *
 * HubSpot sunsets the v1 OAuth API on 2027-02-16, and `POST /oauth/v1/token` served both the
 * authorization-code exchange **and every refresh** — so connections do not degrade as the date
 * passes, they stop at the next refresh, all at once. New listings, certification submissions and
 * recertifications are already required to be on the versioned endpoints.
 *
 * The replacement keeps the same host and the same `application/x-www-form-urlencoded` request
 * encoding and returns an identical response body, so this is a path change only.
 */
export const HUBSPOT_OAUTH_API_VERSION = '2026-03';

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
