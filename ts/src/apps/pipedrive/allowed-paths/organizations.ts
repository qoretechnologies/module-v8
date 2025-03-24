import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';
import { getPipedriveOrganizationFilterIdAllowedValues } from '../helpers/get-filter-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getPipedriveOrganizationLabelAllowedValues } from '../helpers/get-organization-properties-allowed-values';

const organizationsOptions = {
  owner_id: {
    get_allowed_values: getPipedriveUserIdAllowedValues,
  },
  label_ids: {
    get_element_allowed_values: getPipedriveOrganizationLabelAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const PIPEDRIVE_ORGANIZATIONS_ALLOWED_PATHS = {
  '/organizations': {
    GET: {
      override_options: {
        user_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
        filter_id: {
          get_allowed_values: getPipedriveOrganizationFilterIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: organizationsOptions,
    },
  },
  '/organizations/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
        },
        ...organizationsOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
