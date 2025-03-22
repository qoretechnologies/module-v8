import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';
import { getPipedrivePersonFilterIdAllowedValues } from '../helpers/get-filter-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../helpers/get-person-id-allowed-values';
import { getPipedrivePersonLabelAllowedValues } from '../helpers/get-person-properties-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';

const personsOptions = {
  label_ids: {
    get_element_allowed_values: getPipedrivePersonLabelAllowedValues,
  },
  org_id: {
    get_allowed_values: getPipedriveOrganizationIdAllowedValues,
  },
  owner_id: {
    get_allowed_values: getPipedriveUserIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const PIPEDRIVE_PERSONS_ALLOWED_PATHS = {
  '/persons': {
    GET: {
      override_options: {
        user_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
        filter_id: {
          get_allowed_values: getPipedrivePersonFilterIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: personsOptions,
    },
  },
  '/persons/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
        },
        ...personsOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
