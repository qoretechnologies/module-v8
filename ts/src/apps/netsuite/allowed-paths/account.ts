import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../constants';
import { getNetsuiteAccountIdAllowedValues } from '../helpers/get-account-id-allowed-values';
import { getNetsuiteAccountTypeAllowedValues } from '../helpers/get-account-type-allowed-values';
import { getNetsuiteCurrencyIdAllowedValues } from '../helpers/get-currency-id-allowed-values';
import {
  getNetsuiteSubsidiaryIdAllowedValues,
  getNetsuiteSubsidiaryIdArrayAllowedValues,
} from '../helpers/get-subsidiary-id-allowed-values';

const accountOptions = {
  currency: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteCurrencyIdAllowedValues,
  },
  subsidiary: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteSubsidiaryIdArrayAllowedValues,
  },
  'subsidiary.items': {
    preselected: true,
    element_allowed_values_creatable: true,
    get_element_allowed_values: getNetsuiteSubsidiaryIdAllowedValues,
  },
  acctType: {
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getNetsuiteAccountTypeAllowedValues,
  },
  acctName: {
    preselected: true,
  },
  acctNumber: {
    preselected: true,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const NETSUITE_ACCOUNT_ALLOWED_PATHS = {
  '/account': {
    POST: {
      override_options: accountOptions,
    },
  },
  '/account/{id}': {
    GET: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
        ...accountOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          allowed_values_creatable: true,
          get_allowed_values: getNetsuiteAccountIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof NETSUITE_CONN_OPTIONS>;
