import {
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
  TAllowedPaths,
} from '@qoretechnologies/ts-toolkit';
import { getNetsuiteCustomerEntityIdAllowedValues } from '../helpers/get-customer-id-allowed-values';
import { getNetsuiteCustomerStatusIdAllowedValues } from '../helpers/get-customer-status-allowed-values';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { getNetsuiteOpportunityIdAllowedValues } from '../helpers/get-opportunity-id-allowed-values';

const opportunityOptions = {
  title: {
    preselected: true,
  },
  entity: {
    get_allowed_values: getNetsuiteCustomerEntityIdAllowedValues,
    allowed_values_creatable: true,
    preselected: true,
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
      },
    },
  },
  status: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCustomerStatusIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_OPPORTUNITY_ALLOWED_PATHS = {
  '/opportunity': {
    POST: {
      override_options: opportunityOptions,
    },
  },
  '/opportunity/{id}': {
    GET: {
      override_options: {
        id: {
          get_element_allowed_values: getNetsuiteOpportunityIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_element_allowed_values: getNetsuiteOpportunityIdAllowedValues,
          allowed_values_creatable: true,
        },
        ...opportunityOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_element_allowed_values: getNetsuiteOpportunityIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
