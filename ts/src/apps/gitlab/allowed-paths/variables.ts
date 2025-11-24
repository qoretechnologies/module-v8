import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import {
  getGitlabGroupVariableKeyAllowedValues,
  getGitlabProjectVariableKeyAllowedValues,
} from '../helpers/get-variable-key-allowed-values';

const commonProjectOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabProjectAllowedValues,
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

const commonGroupOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabGroupAllowedValues,
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_VARIABLES_ALLOWED_PATHS = {
  '/api/v4/projects/{id}/variables': {
    GET: {
      override_options: {
        ...commonProjectOptions,
      },
    },
    POST: {
      override_options: {
        ...commonProjectOptions,
      },
    },
  },
  '/api/v4/projects/{id}/variables/{key}': {
    GET: {
      override_options: {
        ...commonProjectOptions,
        key: {
          depends_on: ['id'],
          get_allowed_values: getGitlabProjectVariableKeyAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...commonProjectOptions,
        key: {
          depends_on: ['id'],
          get_allowed_values: getGitlabProjectVariableKeyAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...commonProjectOptions,
        key: {
          depends_on: ['id'],
          get_allowed_values: getGitlabProjectVariableKeyAllowedValues,
        },
      },
    },
  },
  '/api/v4/groups/{id}/variables/{key}': {
    GET: {
      override_options: {
        ...commonGroupOptions,
        key: {
          depends_on: ['id'],
          get_allowed_values: getGitlabGroupVariableKeyAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...commonGroupOptions,
        key: {
          depends_on: ['id'],
          get_allowed_values: getGitlabGroupVariableKeyAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...commonGroupOptions,
        key: {
          depends_on: ['id'],
          get_allowed_values: getGitlabGroupVariableKeyAllowedValues,
        },
      },
    },
  },
  '/api/v4/groups/{id}/variables': {
    GET: {
      override_options: {
        ...commonGroupOptions,
      },
    },
    POST: {
      override_options: {
        ...commonGroupOptions,
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
