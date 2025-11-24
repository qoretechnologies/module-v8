import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import {
  getGitlabIssueIdAllowedValues,
  getGitlabIssueIidAllowedValues,
} from '../helpers/get-issue-allowed-values';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabUserAllowedValues } from '../helpers/get-user-allowed-values';

const commonOptions = {
  id: {
    type: 'integer',
    allowed_values_creatable: true,
    get_allowed_values: getGitlabProjectAllowedValues,
    on_change: ['refetch'],
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

const commonIssueOptions = {
  closed_by_id: {
    type: 'integer',
    get_allowed_values: getGitlabUserAllowedValues,
    allowed_values_creatable: true,
  },
  'not[assignee_id]': {
    type: 'integer',
    get_allowed_values: getGitlabUserAllowedValues,
    allowed_values_creatable: true,
  },
  'not[author_id]': {
    type: 'integer',
    get_allowed_values: getGitlabUserAllowedValues,
    allowed_values_creatable: true,
  },
  assignee_id: {
    type: 'integer',
    get_allowed_values: getGitlabUserAllowedValues,
    allowed_values_creatable: true,
  },
  author_id: {
    type: 'integer',
    get_allowed_values: getGitlabUserAllowedValues,
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_ISSUES_ALLOWED_PATHS = {
  '/api/v4/issues': {
    GET: {
      override_options: {
        ...commonIssueOptions,
        iids: {
          get_element_allowed_values: getGitlabIssueIidAllowedValues,
          element_allowed_values_creatable: true,
        },
        'not[iids]': {
          get_element_allowed_values: getGitlabIssueIidAllowedValues,
          element_allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v4/projects/{id}/issues/{issue_iid}/time_stats': {
    GET: {
      override_options: {
        ...commonOptions,
        issue_iid: {
          type: 'integer',
          get_allowed_values: getGitlabIssueIidAllowedValues,
        },
      },
    },
  },
  '/api/v4/projects/{id}/issues': {
    GET: {
      override_options: {
        ...commonOptions,
        ...commonIssueOptions,
        iids: {
          get_element_allowed_values: getGitlabIssueIdAllowedValues,
          element_allowed_values_creatable: true,
        },
        'not[iids]': {
          get_element_allowed_values: getGitlabIssueIdAllowedValues,
          element_allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        ...commonOptions,
      },
    },
  },
  '/api/v4/projects/{id}/issues/{issue_iid}': {
    GET: {
      override_options: {
        ...commonOptions,
        issue_iid: {
          type: 'integer',
          get_allowed_values: getGitlabIssueIidAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ...commonOptions,
        issue_iid: {
          type: 'integer',
          get_allowed_values: getGitlabIssueIidAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...commonOptions,
        issue_iid: {
          type: 'integer',
          get_allowed_values: getGitlabIssueIidAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
