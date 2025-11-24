import { TAllowedPaths, TQoreAppActionOption } from '@qoretechnologies/ts-toolkit';
import { GITLAB_CONN_OPTIONS } from '../constants';
import { getGitlabBranchAllowedValues } from '../helpers/get-branch-allowed-values';
import { getGitlabMergeRequestIidAllowedValues } from '../helpers/get-merge-request-allowed-values';
import { getGitlabMilestoneIdAllowedValues } from '../helpers/get-milestone-allowed-values';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabProjectMemberAllowedValues } from '../helpers/get-user-allowed-values';

const commonOptions = {
  id: {
    type: 'integer',
    get_allowed_values: getGitlabProjectAllowedValues,
    on_change: ['refetch'],
    allowed_values_creatable: true,
  },
} satisfies Record<string, TQoreAppActionOption<typeof GITLAB_CONN_OPTIONS>>;

export const GITLAB_MERGE_REQUESTS_ALLOWED_PATHS = {
  '/api/v4/projects/{id}/merge_requests': {
    GET: {
      override_options: {
        ...commonOptions,
        author_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        assignee_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        reviewer_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        source_project_id: {
          get_allowed_values: getGitlabProjectAllowedValues,
          allowed_values_creatable: true,
        },
        'not[reviewer_id]': {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        'not[assignee_id]': {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        'not[author_id]': {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
      },
    },
    POST: {
      override_options: {
        ...commonOptions,
        assignee_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        assignee_ids: {
          get_element_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        reviewer_ids: {
          get_element_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        target_branch: {
          depends_on: ['id'],
          get_allowed_values: getGitlabBranchAllowedValues,
        },
        source_branch: {
          depends_on: ['id'],
          get_allowed_values: getGitlabBranchAllowedValues,
        },
        milestone_id: {
          get_allowed_values: getGitlabMilestoneIdAllowedValues,
          depends_on: ['id'],
        },
        target_project_id: {
          get_allowed_values: getGitlabProjectAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v4/projects/{id}/merge_requests/{merge_request_iid}': {
    GET: {
      override_options: {
        ...commonOptions,
        merge_request_iid: {
          depends_on: ['id'],
          get_allowed_values: getGitlabMergeRequestIidAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ...commonOptions,
        merge_request_iid: {
          depends_on: ['id'],
          get_allowed_values: getGitlabMergeRequestIidAllowedValues,
        },
        assignee_id: {
          get_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        assignee_ids: {
          get_element_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        reviewer_ids: {
          get_element_allowed_values: getGitlabProjectMemberAllowedValues,
          depends_on: ['id'],
        },
        target_branch: {
          depends_on: ['id'],
          get_allowed_values: getGitlabBranchAllowedValues,
        },
        milestone_id: {
          get_allowed_values: getGitlabMilestoneIdAllowedValues,
          depends_on: ['id'],
        },
      },
    },
    DELETE: {
      override_options: {
        ...commonOptions,
        merge_request_iid: {
          depends_on: ['id'],
          get_allowed_values: getGitlabMergeRequestIidAllowedValues,
        },
      },
    },
  },
  '/api/v4/projects/{id}/merge_requests/{merge_request_iid}/approve': {
    POST: {
      override_options: {
        ...commonOptions,
        merge_request_iid: {
          depends_on: ['id'],
          get_allowed_values: getGitlabMergeRequestIidAllowedValues,
        },
      },
    },
  },
  '/api/v4/projects/{id}/merge_requests/{merge_request_iid}/unapprove': {
    POST: {
      override_options: {
        ...commonOptions,
        merge_request_iid: {
          depends_on: ['id'],
          get_allowed_values: getGitlabMergeRequestIidAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths<typeof GITLAB_CONN_OPTIONS>;
