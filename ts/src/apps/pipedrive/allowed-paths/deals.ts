import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
} from '@qoretechnologies/ts-toolkit';
import { getPipedriveDealIdAllowedValues } from '../helpers/get-deal-id-allowed-values';
import {
  getPipedriveDealChannelAllowedValues,
  getPipedriveDealOriginAllowedValues,
} from '../helpers/get-deal-properties-allowed-values';
import { getPipedriveDealFilterIdAllowedValues } from '../helpers/get-filter-id-allowed-values';
import { getPipedriveOrganizationIdAllowedValues } from '../helpers/get-organization-id-allowed-values';
import { getPipedrivePersonIdAllowedValues } from '../helpers/get-person-id-allowed-values';
import { getPipedriveUserIdAllowedValues } from '../helpers/get-user-id-allowed-values';
import { getPipedrivePipelineIdAllowedValues } from '../helpers/get-pipeline-allowed-values';
import { getPipedriveStageIdAllowedValues } from '../helpers/get-stage-id-allowed-values';
import { omit } from 'lodash';

const dealsOptions = {
  org_id: {
    get_allowed_values: getPipedriveOrganizationIdAllowedValues,
  },
  person_id: {
    get_allowed_values: getPipedrivePersonIdAllowedValues,
  },
  user_id: {
    get_allowed_values: getPipedriveUserIdAllowedValues,
  },
  channel_id: {
    get_allowed_values: getPipedriveDealChannelAllowedValues,
  },
  origin_id: {
    get_allowed_values: getPipedriveDealOriginAllowedValues,
  },
  pipeline_id: {
    get_allowed_values: getPipedrivePipelineIdAllowedValues,
  },
  stage_id: {
    get_allowed_values: getPipedriveStageIdAllowedValues,
  },
} satisfies Record<string, TQoreAppActionOverrideOption<TCustomConnOptions>>;

export const PIPEDRIVE_DEALS_ALLOWED_PATHS = {
  '/deals': {
    GET: {
      override_options: {
        user_id: {
          get_allowed_values: getPipedriveUserIdAllowedValues,
        },
        filter_id: {
          get_allowed_values: getPipedriveDealFilterIdAllowedValues,
        },
        stage_id: {
          get_allowed_values: getPipedriveStageIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: dealsOptions,
    },
  },
  '/deals/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveDealIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveDealIdAllowedValues,
        },
        ...omit(dealsOptions, ['origin_id']),
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getPipedriveDealIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;
