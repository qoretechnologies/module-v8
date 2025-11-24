import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabDeployKeyAllowedValues } from '../helpers/get-deploy-key-allowed-values';

const commonOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabProjectAllowedValues,
    allowed_values_creatable: true,
    on_change: ['refetch'],
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_DEPLOY_KEYS_ALLOWED_PATHS = {
  '/api/v4/projects/{id}/deploy_keys': {
    GET: {
      override_options: {
        ...commonOptions,
      },
    },
    POST: {
      override_options: {
        ...commonOptions,
      },
    },
  },
  '/api/v4/projects/{id}/deploy_keys/{key_id}': {
    GET: {
      override_options: {
        ...commonOptions,
        key_id: {
          depends_on: ['id'],
          get_allowed_values: getGitlabDeployKeyAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...commonOptions,
        key_id: {
          depends_on: ['id'],
          get_allowed_values: getGitlabDeployKeyAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...commonOptions,
        key_id: {
          depends_on: ['id'],
          get_allowed_values: getGitlabDeployKeyAllowedValues,
        },
      },
    },
  },
  '/api/v4/projects/{id}/deploy_keys/{key_id}/enable': {
    POST: {
      override_options: {
        ...commonOptions,
        key_id: {
          depends_on: ['id'],
          get_allowed_values: getGitlabDeployKeyAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
