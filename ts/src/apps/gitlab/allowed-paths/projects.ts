import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabTopicAllowedValues } from '../helpers/get-topic-allowed-values';

const commonOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabProjectAllowedValues,
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_PROJECTS_ALLOWED_PATHS = {
  '/api/v4/projects': {
    GET: {
      override_options: {
        topic_id: {
          get_allowed_values: getGitlabTopicAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {},
  },
  '/api/v4/projects/{id}': {
    GET: {
      override_options: {
        ...commonOptions,
      },
    },
    PUT: {
      override_options: {
        ...commonOptions,
      },
    },
    DELETE: {
      override_options: {
        ...commonOptions,
      },
    },
  },
  '/api/v4/projects/{id}/users': {
    GET: {
      override_options: {
        ...commonOptions,
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
