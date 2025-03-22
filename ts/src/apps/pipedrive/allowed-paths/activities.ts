import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getPipedriveActivityIdAllowedValues } from '../helpers/get-activity-id-allowed-values';
import { getPipedriveActivityTypeAllowedValues } from '../helpers/get-activity-type-allowed-values';
import { getPipedriveAttendeeAllowedValues } from '../helpers/get-attendee-allowed-values';
import { getPipedriveDealIdAllowedValues } from '../helpers/get-deal-id-allowed-values';
import { getPipedriveActivityFilterIdAllowedValues } from '../helpers/get-filter-id-allowed-values';
import { getPipedriveLeadIdAllowedValues } from '../helpers/get-lead-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../helpers/get-person-id-allowed-values';
import { getPipedriveProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';

const activitiesOptions = {
  deal_id: {
    get_allowed_values: getPipedriveDealIdAllowedValues,
  },
  lead_id: {
    get_allowed_values: getPipedriveLeadIdAllowedValues,
  },
  org_id: {
    get_allowed_values: getPipedriveOrganizationIdAllowedValues,
  },
  person_id: {
    get_allowed_values: getPipedrivePersonIdAllowedValues,
  },
  project_id: {
    get_allowed_values: getPipedriveProjectIdAllowedValues,
  },
  user_id: {
    get_allowed_values: getPipedriveUserIdAllowedValues,
  },
  type: {
    get_allowed_values: getPipedriveActivityTypeAllowedValues,
  },
  attendees: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          email_address: {
            type: 'string',
            required: true,
          },
          person_id: {
            type: 'string',
            required: false,
            get_allowed_values: getPipedrivePersonIdAllowedValues,
          },
        },
      },
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getPipedriveAttendeeAllowedValues,
  },
  participants: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          person_id: {
            type: 'string',
            required: true,
            get_allowed_values: getPipedrivePersonIdAllowedValues,
          },
          primary_flag: {
            type: 'boolean',
            required: true,
            default_value: false,
          },
        },
      },
    },
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const PIPEDRIVE_ACTIVITIES_ALLOWED_PATHS = {
  '/activities': {
    GET: {
      override_options: {
        user_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
        type: {
          get_allowed_values: getPipedriveActivityTypeAllowedValues,
        },
        filter_id: {
          get_allowed_values: getPipedriveActivityFilterIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: activitiesOptions,
    },
  },
  '/activities/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveActivityIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...activitiesOptions,
        id: {
          get_allowed_values: getPipedriveActivityIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveActivityIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
