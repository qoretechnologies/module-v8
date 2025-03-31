import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { getNetsuiteCurrencyIdAllowedValues } from '../helpers/get-currency-id-allowed-values';
import { getNetsuiteSubsidiaryIdAllowedValues } from '../helpers/get-subsidiary-id-allowed-values';
import { getNetsuiteCustomerStatusIdAllowedValues } from '../helpers/get-customer-status-allowed-values';
import { getNetsuiteContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { NetsuiteBaseObjectCreationResponseType } from '../constants';
import { netsuiteObjectCreationResponseDataConverter } from '../helpers/object-creation-response-data-converter';

export const NETSUITE_SIMPLIFIED_CUSTOMER_ALLOWED_PATHS = {
  '/customer': {
    POST: {
      response_type: NetsuiteBaseObjectCreationResponseType,
      request_data_converter: (request) => {
        const { entityStatus, subsidiary, currency, currencyList, ...rest } = request;

        return {
          ...rest,
          ...(entityStatus && { entityStatus: { id: entityStatus } }),
          ...(subsidiary && { subsidiary: { id: subsidiary } }),
          ...(currency && { currency: { id: currency } }),
          ...(currencyList && {
            currencyList: {
              items: currencyList.map((c: { id: string }) => ({ currency: { id: c.id } })),
            },
          }),
        };
      },
      response_data_converter: netsuiteObjectCreationResponseDataConverter,
      override_options: {
        companyName: {
          type: 'string',
          preselected: true,
        },
        subsidiary: {
          type: 'softstring',
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
        },
        currency: {
          type: 'softstring',
          preselected: true,
          get_allowed_values: getNetsuiteCurrencyIdAllowedValues,
        },
        contact: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteContactIdAllowedValues,
        },
        contactList: {
          element_allowed_values_creatable: true,
          get_element_allowed_values: getNetsuiteContactIdAllowedValues,
        },
        entityStatus: {
          type: 'softstring',
          preselected: true,
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteCustomerStatusIdAllowedValues,
        },
        currencyList: {
          get_element_allowed_values: getNetsuiteCurrencyIdAllowedValues,
          type: {
            type: 'list',
            element_type: 'softstring',
          },
        },
      },
    },
  },
} satisfies TAllowedPaths;
