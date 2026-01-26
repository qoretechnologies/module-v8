import { IssueSchema } from '@gitbeaker/rest';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { GITLAB_APP_NAME, GitLabError } from '../constants';
import { createGitlabClient } from '../helpers/constants';
import { getGitlabGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { getGitlabProjectAllowedValues } from '../helpers/get-project-allowed-values';

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
    type: 'bool',
    required: true,
    default_value: false,
  },
  search: {
    type: 'string',
    required: false,
  },
  milestone: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const action = 'new_issue';

const NewIssue = QoreAppCreator.createLocalizedTrigger({
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

    const { group, project, onlyAssignedToMe, search, milestone } = context.opts || {};

    let assigneeId: number | undefined;

    if (onlyAssignedToMe) {
      const client = createGitlabClient({ token, url });
      const user = await client.Users.showCurrentUser();
      assigneeId = user.id;
    }

    const getItems = () => {
      return fetchLatestIssues({
        token,
        url,
        project,
        group,
        assigneeId,
        search,
        milestone,
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

    const { group, project, onlyAssignedToMe, search, milestone } = context.opts || {};
    let assigneeId: number | undefined;

    if (onlyAssignedToMe) {
      const client = createGitlabClient({ token, url });
      const user = await client.Users.showCurrentUser();
      assigneeId = user.id;
    }

    const rows = await fetchLatestIssues({
      token,
      url,
      project,
      group,
      assigneeId,
      search,
      milestone,
    });

    return rows?.length > 0 ? rows[0] : null;
  },
  event_info: {
    desc: 'Gitlab new issue event',
    type: {
      type: 'hash',
      fields: {
        _links: {
          type: {
            type: 'hash',
            fields: {
              award_emoji: { type: 'string' },
              closed_as_duplicate_of: { type: 'string' },
              notes: { type: 'string' },
              project: { type: 'string' },
              self: { type: 'string' },
            },
          },
        },
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
              locked: { type: 'bool' },
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
              locked: { type: 'bool' },
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
              locked: { type: 'bool' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        blocking_issues_count: { type: 'string' },
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
              locked: { type: 'bool' },
              name: { type: 'string' },
              public_email: { type: 'string' },
              state: { type: 'string' },
              username: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        confidential: { type: 'bool' },
        created_at: { type: 'string' },
        description: { type: 'string' },
        discussion_locked: { type: 'bool' },
        downvotes: { type: 'string' },
        due_date: { type: 'string' },
        epic: {
          type: {
            type: 'hash',
            fields: {
              group_id: { type: 'string' },
              human_readable_end_date: { type: 'string' },
              human_readable_timestamp: { type: 'string' },
              id: { type: 'string' },
              iid: { type: 'string' },
              title: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
        epic_iid: { type: 'string' },
        has_tasks: { type: 'string' },
        health_status: { type: 'string' },
        id: { type: 'integer' },
        iid: { type: 'integer' },
        imported: { type: 'string' },
        imported_from: { type: 'string' },
        issue_type: { type: 'string' },
        iteration: {
          type: {
            type: 'hash',
            fields: {
              created_at: { type: 'string' },
              description: { type: 'string' },
              due_date: { type: 'string' },
              group_id: { type: 'string' },
              id: { type: 'string' },
              iid: { type: 'string' },
              sequence: { type: 'string' },
              start_date: { type: 'string' },
              state: { type: 'string' },
              title: { type: 'string' },
              updated_at: { type: 'string' },
              web_url: { type: 'string' },
            },
          },
        },
        labels: { type: 'string' },
        merge_requests_count: { type: 'string' },
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
        moved_to_id: { type: 'string' },
        project_id: { type: 'integer' },
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
        service_desk_reply_to: { type: 'string' },
        severity: { type: 'string' },
        state: { type: 'string' },
        subscribed: { type: 'string' },
        task_completion_status: { type: 'string' },
        task_status: { type: 'string' },
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
        type: { type: 'string' },
        updated_at: { type: 'string' },
        upvotes: { type: 'string' },
        user_notes_count: { type: 'string' },
        web_url: { type: 'string' },
        weight: { type: 'string' },
      },
    },
  },
});

type TFetchIssuesOptions = {
  token: string;
  url: string;
  project?: number;
  group?: number;
  assigneeId?: number;
  milestone?: string;
  search?: string;
};

const fetchLatestIssues = async (options: TFetchIssuesOptions): Promise<IssueSchema[]> => {
  const { token, project, group, assigneeId, search, milestone, url } = options;
  const limit = 20;

  const client = createGitlabClient({ token, url });

  let filters: { assigneeId?: number; search?: string; milestone?: string } & (
    | { projectId: number }
    | { groupId: number }
    | {}
  ) = {
    ...(search && { search }),
    ...(assigneeId && { assigneeId }),
    ...(milestone && { milestone }),
  };

  if (project) {
    filters = { ...filters, projectId: project };
  }

  if (group) {
    filters = { ...filters, groupId: group };
  }

  try {
    const issues = await client.Issues.all({
      orderBy: 'created_at',
      sort: 'desc',
      perPage: limit,
      maxPages: 1,
      ...filters,
    });

    return issues;
  } catch (error) {
    throw new GitLabError(`Failed to fetch latest issues: ${error?.message || error}`);
  }
};

export default NewIssue;
