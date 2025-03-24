import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getPipedriveLeadFilterIdAllowedValues } from '../helpers/get-filter-id-allowed-values';
import { getPipedriveLeadIdAllowedValues } from '../helpers/get-lead-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../helpers/get-person-id-allowed-values';
import { getPipedriveLeadSourceIdAllowedValues } from '../helpers/get-lead-source-allowed-values';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';
import { getPipedriveLeadLabelIdAllowedValues } from '../helpers/get-lead-label-allowed-values';

const leadsOptions = {
  channel_id: {
    get_allowed_values: getPipedriveLeadSourceIdAllowedValues,
  },
  label_ids: {
    get_element_allowed_values: getPipedriveLeadLabelIdAllowedValues,
  },
  owner_id: {
    get_allowed_values: getPipedriveUserIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const PIPEDRIVE_LEADS_ALLOWED_PATHS = {
  '/leads': {
    GET: {
      override_options: {
        owner_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
        person_id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
        },
        organization_id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
        },
        filter_id: {
          get_allowed_values: getPipedriveLeadFilterIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        ...leadsOptions,
        organization_id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
          required_groups: ['create_lead'],
        },
        person_id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
          required_groups: ['create_lead'],
        },
      },
    },
  },
  '/leads/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveLeadIdAllowedValues,
        },
      },
    },
    PATCH: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveLeadIdAllowedValues,
        },
        ...leadsOptions,
        organization_id: {
          get_allowed_values: getPipedriveOrganizationIdAllowedValues,
        },
        person_id: {
          get_allowed_values: getPipedrivePersonIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveLeadIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
