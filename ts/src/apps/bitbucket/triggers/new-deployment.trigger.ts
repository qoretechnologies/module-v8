import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { BITBUCKET_APP_NAME, BitbucketError } from '../constants';
import { getBitbucketWorkspaceIdAllowedValues } from '../helpers/get-workspace-allowed-values';
import { getBitbucketRepositoryAllowedValues } from '../helpers/get-repository-allowed-values';

const BitbucketNewDeploymentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: BITBUCKET_APP_NAME,
  action: 'new_deployment',
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
      return fetchLatestDeployments({
        token,
        workspace,
        repo_slug,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'bitbucket_new_deployment',
      uniqueField: 'uuid',
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

    const deployments = await fetchLatestDeployments({
      token,
      workspace,
      repo_slug,
    });

    return deployments?.length > 0 ? deployments[0] : null;
  },
  event_info: {
    desc: 'Bitbucket New Deployment Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        type: { type: 'string' },
        uuid: { type: 'string' },
        key: { type: 'string' },
        version: { type: 'number' },
        environment: {
          type: {
            type: 'hash',
            fields: {
              uuid: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
        state: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              name: { type: 'string' },
              url: { type: 'string' },
              start_date: { type: 'string' },
              completion_date: { type: 'string' },
              status: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
        commit: {
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
                          account_id: { type: 'string' },
                          nickname: { type: 'string' },
                          type: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              message: { type: 'string' },
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
                  },
                },
              },
            },
          },
        },
        release: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              uuid: { type: 'string' },
              name: { type: 'string' },
              url: { type: 'string' },
              commit: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    hash: { type: 'string' },
                  },
                },
              },
              created_on: { type: 'string' },
            },
          },
        },
        deployable: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              uuid: { type: 'string' },
              key: { type: 'string' },
              name: { type: 'string' },
              url: { type: 'string' },
              commit: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    hash: { type: 'string' },
                  },
                },
              },
              created_on: { type: 'string' },
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
                  },
                },
              },
            },
          },
        },
        step: {
          type: {
            type: 'hash',
            fields: {
              type: { type: 'string' },
              uuid: { type: 'string' },
              name: { type: 'string' },
              trigger: { type: 'string' },
              state: {
                type: {
                  type: 'hash',
                  fields: {
                    type: { type: 'string' },
                    name: { type: 'string' },
                    status: {
                      type: {
                        type: 'hash',
                        fields: {
                          type: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                    },
                  },
                },
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
            },
          },
        },
      },
    },
  },
});

export default BitbucketNewDeploymentTrigger;

const fetchLatestDeployments = async (options: {
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
        path: `/2.0/repositories/${workspace}/${repo_slug}/deployments`,
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

    const deployments = response?.data?.values || [];

    if (deployments.length === 0) {
      return [];
    }

    return deployments;
  } catch (error) {
    throw new BitbucketError(`Failed to fetch latest deployments: ${error.message || error}`);
  }
};
