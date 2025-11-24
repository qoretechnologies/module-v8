import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';
import { getGitlabGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { GITLAB_APP_NAME, GitLabError } from '../constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { MergeRequestSchema } from '@gitbeaker/rest';
import { createGitlabClient } from '../helpers/constants';

const options = {
  project: {
    type: 'number',
    required: false,
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGitlabProjectAllowedValues,
  },
  group: {
    type: 'number',
    required: false,
    preselected: true,
    allowed_values_creatable: true,
    get_allowed_values: getGitlabGroupAllowedValues,
  },
  onlyAssignedToMe: {
    type: 'boolean',
    required: true,
    default_value: false,
  },
  search: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const action = 'new_merge_request';

const NewMergeRequest = QoreAppCreator.createLocalizedTrigger({
  app: GITLAB_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: GitLabError,
    });

    const { group, project, onlyAssignedToMe, search } = context.opts || {};

    let reviewerId: number | undefined;

    if (onlyAssignedToMe) {
      const client = createGitlabClient({ token, url });
      const user = await client.Users.showCurrentUser();
      reviewerId = user.id;
    }

    const getItems = () => {
      return fetchLatestMergeRequests({
        token,
        url,
        project,
        group,
        reviewerId,
        search,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `gitlab_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, url } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      ErrorClass: GitLabError,
    });

    const { group, project, onlyAssignedToMe, search } = context.opts || {};
    let reviewerId: number | undefined;

    if (onlyAssignedToMe) {
      const client = createGitlabClient({ token, url });
      const user = await client.Users.showCurrentUser();
      reviewerId = user.id;
    }

    const rows = await fetchLatestMergeRequests({
      token,
      url,
      project,
      group,
      reviewerId,
      search,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'Gitlab new merge request event',
    type: {
      type: 'hash',
      fields: {
        allow_collaboration: { type: 'string' },
        allow_maintainer_to_push: { type: 'string' },
        approvals_before_merge: { type: 'string' },
        assignee: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        assignees: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        author: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        blocking_discussions_resolved: { type: 'string' },
        closed_at: { type: 'string' },
        closed_by: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        created_at: { type: 'string' },
        description: { type: 'string' },
        description_html: { type: 'string' },
        detailed_merge_status: { type: 'string' },
        discussion_locked: { type: 'string' },
        downvotes: { type: 'string' },
        draft: { type: 'string' },
        force_remove_source_branch: { type: 'string' },
        has_conflicts: { type: 'string' },
        id: { type: 'integer' },
        iid: { type: 'integer' },
        imported: { type: 'string' },
        imported_from: { type: 'string' },
        labels: { type: 'string' },
        merge_after: { type: 'string' },
        merge_commit_sha: { type: 'string' },
        merge_status: { type: 'string' },
        merge_user: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        merge_when_pipeline_succeeds: { type: 'string' },
        merged_at: { type: 'string' },
        merged_by: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        milestone: {
          type: {
            type: 'hash',
            fields: {
              created_at: { type: 'string' },
              description: { type: 'string' },
              due_date: { type: 'string' },
              expired: { type: 'string' },
              group_id: { type: 'string' },
              id: { type: 'string' },
              iid: { type: 'string' },
              project_id: { type: 'string' },
              start_date: { type: 'string' },
              state: { type: 'string' },
              title: { type: 'string' },
              updated_at: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        prepared_at: { type: 'string' },
        project_id: { type: 'integer' },
        reference: { type: 'string' },
        references: {
          type: {
            type: 'hash',
            fields: {
              full: { type: 'string' },
              relative: { type: 'string' },
              short: { type: 'string' },
            },
          },
        },
        reviewers: {
          type: {
            type: 'hash',
            fields: {
              avatar_path: { type: 'string' },
              avatar_url: { type: 'string' },
              custom_attributes: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      key: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              id: { type: 'integer' },
              locked: { type: 'boolean' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        sha: { type: 'string' },
        should_remove_source_branch: { type: 'string' },
        source_branch: { type: 'string' },
        source_project_id: { type: 'string' },
        squash: { type: 'string' },
        squash_commit_sha: { type: 'string' },
        squash_on_merge: { type: 'string' },
        state: { type: 'string' },
        target_branch: { type: 'string' },
        target_project_id: { type: 'string' },
        task_completion_status: { type: 'string' },
        time_stats: {
          type: {
            type: 'hash',
            fields: {
              human_time_estimate: { type: 'string' },
              human_total_time_spent: { type: 'string' },
              time_estimate: { type: 'integer' },
              total_time_spent: { type: 'integer' },
            },
          },
        },
        title: { type: 'string' },
        title_html: { type: 'string' },
        updated_at: { type: 'string' },
        upvotes: { type: 'string' },
        user_notes_count: { type: 'string' },
        web_url: { type: 'string' },
        work_in_progress: { type: 'string' },
      },
    },
  },
});

type TFetchMergeRequestsOptions = {
  token: string;
  url: string;
  project?: number;
  group?: number;
  reviewerId?: number;
  search?: string;
};

const fetchLatestMergeRequests = async (
  options: TFetchMergeRequestsOptions
): Promise<MergeRequestSchema[]> => {
  const { token, project, group, reviewerId, search, url } = options;
  const limit = 20;

  const client = createGitlabClient({ token, url });

  let filters: { reviewerId?: number; search?: string } & (
    | { projectId: number }
    | { groupId: number }
    | {}
  ) = {
    ...(search && { search }),
    ...(reviewerId && { reviewerId }),
  };

  if (project) {
    filters = { ...filters, projectId: project };
  }

  if (group) {
    filters = { ...filters, groupId: group };
  }

  try {
    const mergeRequests = await client.MergeRequests.all({
      orderBy: 'created_at',
      sort: 'desc',
      perPage: limit,
      maxPages: 1,
      ...filters,
    });

    return mergeRequests;
  } catch (error) {
    throw new GitLabError(`Failed to fetch latest merge requests: ${error?.message || error}`);
  }
};

export default NewMergeRequest;
