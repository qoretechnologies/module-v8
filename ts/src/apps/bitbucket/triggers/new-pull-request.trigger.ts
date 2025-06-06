import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BITBUCKET_APP_NAME, BitbucketError } from '../constants';
import { getBitbucketWorkspaceIdAllowedValues } from '../helpers/get-workspace-allowed-values';
import { getBitbucketRepositoryAllowedValues } from '../helpers/get-repository-allowed-values';

const BitbucketNewPullRequestTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BITBUCKET_APP_NAME,
  action: 'new_pull_request',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    workspace: {
      type: 'string',
      required: true,
      allowed_values_creatable: true,
      get_allowed_values: getBitbucketWorkspaceIdAllowedValues,
      on_change: ['refetch'],
    },
    repo_slug: {
      type: 'string',
      required: true,
      allowed_values_creatable: true,
      get_allowed_values: getBitbucketRepositoryAllowedValues,
      depends_on: ['workspace'],
    },
    state: {
      type: 'string',
      required: false,
      preselected: true,
      allowed_values: [
        {
          display_name: 'Open',
          value: 'OPEN',
          desc: 'Pull requests that are currently open and awaiting review',
        },
        {
          display_name: 'Merged',
          value: 'MERGED',
          desc: 'Pull requests that have been successfully merged',
        },
        {
          display_name: 'Declined',
          value: 'DECLINED',
          desc: 'Pull requests that have been declined or rejected',
        },
        {
          display_name: 'Superseded',
          value: 'SUPERSEDED',
          desc: 'Pull requests that have been superseded by another pull request',
        },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, repo_slug, workspace } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['workspace', 'repo_slug'],
      ErrorClass: BitbucketError,
    });

    const state = context?.opts?.state;

    const getItems = () => {
      return fetchLatestPullRequests({
        token,
        workspace,
        repo_slug,
        state,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'bitbucket_new_pull_request',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, repo_slug, workspace } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['workspace', 'repo_slug'],
      ErrorClass: BitbucketError,
    });

    const state = context?.opts?.state || 'OPEN';

    const pullRequests = await fetchLatestPullRequests({
      token,
      workspace,
      repo_slug,
      state,
    });

    return pullRequests?.length > 0 ? pullRequests[0] : null;
  },
  event_info: {
    desc: 'Bitbucket New Pull Request Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        type: { type: 'string' },
        id: { type: 'number' },
        title: { type: 'string' },
        description: { type: 'string' },
        state: { type: 'string' },
        created_on: { type: 'string' },
        updated_on: { type: 'string' },
        merge_commit: {
          type: {
            type: 'hash',
            fields: {
              hash: { type: 'string' },
            },
          },
        },
        close_source_branch: { type: 'boolean' },
        closed_by: {
          type: {
            type: 'hash',
            fields: {
              display_name: { type: 'string' },
              uuid: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    self: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    html: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    avatar: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              type: { type: 'string' },
              nickname: { type: 'string' },
              account_id: { type: 'string' },
            },
          },
        },
        author: {
          type: {
            type: 'hash',
            fields: {
              display_name: { type: 'string' },
              uuid: { type: 'string' },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    self: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    html: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                    avatar: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              type: { type: 'string' },
              nickname: { type: 'string' },
              account_id: { type: 'string' },
            },
          },
        },
        reason: { type: 'string' },
        source: {
          type: {
            type: 'hash',
            fields: {
              branch: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                  },
                },
              },
              commit: {
                type: {
                  type: 'hash',
                  fields: {
                    hash: { type: 'string' },
                  },
                },
              },
              repository: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    name: { type: 'string' },
                    full_name: { type: 'string' },
                    uuid: { type: 'string' },
                    links: {
                      type: {
                        type: 'hash',
                        fields: {
                          self: {
                            type: {
                              type: 'hash',
                              fields: {
                                href: { type: 'string' },
                              },
                            },
                          },
                          html: {
                            type: {
                              type: 'hash',
                              fields: {
                                href: { type: 'string' },
                              },
                            },
                          },
                          avatar: {
                            type: {
                              type: 'hash',
                              fields: {
                                href: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        destination: {
          type: {
            type: 'hash',
            fields: {
              branch: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                  },
                },
              },
              commit: {
                type: {
                  type: 'hash',
                  fields: {
                    hash: { type: 'string' },
                  },
                },
              },
              repository: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    name: { type: 'string' },
                    full_name: { type: 'string' },
                    uuid: { type: 'string' },
                    links: {
                      type: {
                        type: 'hash',
                        fields: {
                          self: {
                            type: {
                              type: 'hash',
                              fields: {
                                href: { type: 'string' },
                              },
                            },
                          },
                          html: {
                            type: {
                              type: 'hash',
                              fields: {
                                href: { type: 'string' },
                              },
                            },
                          },
                          avatar: {
                            type: {
                              type: 'hash',
                              fields: {
                                href: { type: 'string' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        comment_count: { type: 'number' },
        task_count: { type: 'number' },
        reviewers: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                user: {
                  type: {
                    type: 'hash',
                    fields: {
                      display_name: { type: 'string' },
                      uuid: { type: 'string' },
                      account_id: { type: 'string' },
                      nickname: { type: 'string' },
                      type: { type: 'string' },
                    },
                  },
                },
                role: { type: 'string' },
                approved: { type: 'boolean' },
                state: { type: 'string' },
                participated_on: { type: 'string' },
              },
            },
          },
        },
        participants: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                user: {
                  type: {
                    type: 'hash',
                    fields: {
                      display_name: { type: 'string' },
                      uuid: { type: 'string' },
                      account_id: { type: 'string' },
                      nickname: { type: 'string' },
                      type: { type: 'string' },
                    },
                  },
                },
                role: { type: 'string' },
                approved: { type: 'boolean' },
                state: { type: 'string' },
                participated_on: { type: 'string' },
              },
            },
          },
        },
        links: {
          type: {
            type: 'hash',
            fields: {
              self: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              html: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              commits: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              approve: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              merge: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              decline: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              diff: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              diffstat: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              comments: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              activity: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
              statuses: {
                type: {
                  type: 'hash',
                  fields: {
                    href: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        summary: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              raw: { type: 'string' },
              markup: { type: 'string' },
              html: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default BitbucketNewPullRequestTrigger;

const fetchLatestPullRequests = async (options: {
  token: string;
  workspace: string;
  repo_slug: string;
  state?: string;
}) => {
  const { token, workspace, repo_slug, state } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const params: Record<string, string> = {
      pagelen: limit.toString(),
      ...(state && { state }),
    };

    const response = await QorusRequest.get<{ data: { values: Record<string, any>[] } }>(
      {
        path: `/2.0/repositories/${workspace}/${repo_slug}/pullrequests`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      {
        url: 'https://api.bitbucket.org',
        endpointId: BITBUCKET_APP_NAME,
      }
    );

    const pullRequests = response?.data?.values || [];

    if (pullRequests.length === 0) {
      return [];
    }

    return pullRequests;
  } catch (error) {
    throw new BitbucketError(`Failed to fetch latest pull requests: ${error.toString()}`);
  }
};
