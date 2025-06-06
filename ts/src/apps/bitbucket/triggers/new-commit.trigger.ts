import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BITBUCKET_APP_NAME, BitbucketError } from '../constants';
import { getBitbucketWorkspaceIdAllowedValues } from '../helpers/get-workspace-allowed-values';
import { getBitbucketRepositoryAllowedValues } from '../helpers/get-repository-allowed-values';

const BitbucketNewCommitTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BITBUCKET_APP_NAME,
  action: 'new_commit',
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
  },
  event_function: async (context, update, should_stop) => {
    const { token, repo_slug, workspace } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['workspace', 'repo_slug'],
      ErrorClass: BitbucketError,
    });

    const getItems = () => {
      return fetchLatestCommits({
        token,
        workspace,
        repo_slug,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'bitbucket_new_commit',
      uniqueField: 'hash',
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

    const commits = await fetchLatestCommits({
      token,
      workspace,
      repo_slug,
    });

    return commits?.length > 0 ? commits[0] : null;
  },
  event_info: {
    desc: 'Bitbucket New Commit Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        type: { type: 'string' },
        hash: { type: 'string' },
        date: { type: 'string' },
        author: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              raw: { type: 'string' },
              user: {
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
                                href: {
                                  type: 'string',
                                },
                              },
                            },
                          },
                          avatar: {
                            type: {
                              type: 'hash',
                              fields: {
                                href: {
                                  type: 'string',
                                },
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
            },
          },
        },
        message: { type: 'string' },
        summary: {
          type: {
            type: 'hash',
            fields: {
              type: {
                type: 'string',
              },
              raw: { type: 'string' },
              markup: { type: 'string' },
              html: { type: 'string' },
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
                    href: {
                      type: 'string',
                    },
                  },
                },
              },
              html: {
                type: {
                  type: 'hash',
                  fields: {
                    href: {
                      type: 'string',
                    },
                  },
                },
              },
              diff: {
                type: {
                  type: 'hash',
                  fields: {
                    href: {
                      type: 'string',
                    },
                  },
                },
              },
              approve: {
                type: {
                  type: 'hash',
                  fields: {
                    href: {
                      type: 'string',
                    },
                  },
                },
              },
              comments: {
                type: {
                  type: 'hash',
                  fields: {
                    href: {
                      type: 'string',
                    },
                  },
                },
              },
              statuses: {
                type: {
                  type: 'hash',
                  fields: {
                    href: {
                      type: 'string',
                    },
                  },
                },
              },
              patch: {
                type: {
                  type: 'hash',
                  fields: {
                    href: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        parents: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                type: {
                  type: 'string',
                },
                hash: {
                  type: 'string',
                },
                links: {
                  type: {
                    type: 'hash',
                    fields: {
                      self: {
                        type: {
                          type: 'hash',
                          fields: {
                            href: {
                              type: 'string',
                            },
                          },
                        },
                      },
                      html: {
                        type: {
                          type: 'hash',
                          fields: {
                            href: {
                              type: 'string',
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
        repository: {
          type: {
            type: 'hash',
            fields: {
              type: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
              full_name: {
                type: 'string',
              },
              uuid: {
                type: 'string',
              },
              links: {
                type: {
                  type: 'hash',
                  fields: {
                    self: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: {
                            type: 'string',
                          },
                        },
                      },
                    },
                    html: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: {
                            type: 'string',
                          },
                        },
                      },
                    },
                    avatar: {
                      type: {
                        type: 'hash',
                        fields: {
                          href: {
                            type: 'string',
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
  },
});

export default BitbucketNewCommitTrigger;

const fetchLatestCommits = async (options: {
  token: string;
  workspace: string;
  repo_slug: string;
}) => {
  const { token, workspace, repo_slug } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const params: Record<string, string> = {
      pagelen: limit.toString(),
    };

    const response = await QorusRequest.get<{ data: { values: Record<string, any>[] } }>(
      {
        path: `/2.0/repositories/${workspace}/${repo_slug}/commits`,
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

    const commits = response?.data?.values || [];

    if (commits.length === 0) {
      return [];
    }

    return commits;
  } catch (error) {
    throw new BitbucketError(`Failed to fetch latest commits: ${error.message || error}`);
  }
};
