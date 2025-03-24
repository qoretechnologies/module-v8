import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getPipedriveProjectFilterIdAllowedValues } from '../helpers/get-filter-id-allowed-values';
import { getPipedriveProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';
import { getPipedriveProjectBoardIdAllowedValues } from '../helpers/get-project-board-allowed-values';
import { getPipedriveProjectPhaseIdAllowedValues } from '../helpers/get-project-phase-id-allowed-values';
import { getPipedriveDealIdAllowedValues } from '../helpers/get-deal-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../helpers/get-person-id-allowed-values';
import { getPipedriveProjectTemplateIdAllowedValues } from '../helpers/get-project-template-allowed-values';

const projectsOptions = {
  board_id: {
    get_allowed_values: getPipedriveProjectBoardIdAllowedValues,
  },
  phase_id: {
    depends_on: ['board_id'],
    get_allowed_values: getPipedriveProjectPhaseIdAllowedValues,
  },
  deal_ids: {
    get_element_allowed_values: getPipedriveDealIdAllowedValues,
  },
  org_id: {
    get_allowed_values: getPipedriveOrganizationIdAllowedValues,
  },
  owner_id: {
    get_allowed_values: getPipedriveUserIdAllowedValues,
  },
  person_id: {
    get_allowed_values: getPipedrivePersonIdAllowedValues,
  },
  template_id: {
    get_allowed_values: getPipedriveProjectTemplateIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const PIPEDRIVE_PROJECTS_ALLOWED_PATHS = {
  '/projects': {
    GET: {
      override_options: {
        filter_id: {
          get_allowed_values: getPipedriveProjectFilterIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: projectsOptions,
    },
  },
  '/projects/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveProjectIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveProjectIdAllowedValues,
        },
        ...projectsOptions,
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveProjectIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
