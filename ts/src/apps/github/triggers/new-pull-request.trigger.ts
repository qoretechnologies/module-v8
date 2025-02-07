import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { GITHUB_APP_NAME, repoOwnerCommonOptions } from '../constants';
import { commonEventFieldsType } from './constants';

const githubNewPullRequestTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GITHUB_APP_NAME,
  action: 'new_pull_request',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: repoOwnerCommonOptions,
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const owner = context?.opts?.owner;
    const repo = context?.opts?.repo;

    if (!token || !owner || !repo) {
      throw new Error(
        'The following options are required to register new pull request event: token, owner, repo'
      );
    }

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: 'web',
          active: true,
          events: ['pull_request'],
          config: {
            url,
            content_type: 'json',
          },
        },
        path: `/repos/${owner}/${repo}/hooks`,
      },
      { url: ` https://api.github.com`, endpointId: 'Github' }
    );

    return { webhook: data };
  },
  webhook_deregister: async (context, _url, regInfo) => {
    const token = context?.conn_opts?.token;
    const owner = context?.opts?.owner;
    const repo = context?.opts?.repo;

    if (!token || !owner || !repo) {
      throw new Error(
        'The following options are required to deregister new pull request event: token, owner, repo'
      );
    }

    const { webhook } = regInfo;

    await QorusRequest.deleteReq<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/repos/${owner}/${repo}/hooks/${webhook.id}`,
      },
      { url: `https://api.github.com`, endpointId: 'Github' }
    );
  },
  event_info: {
    desc: 'New commit event data',
    type: {
      type: 'hash',
      fields: {
        number: {
          type: 'integer',
          example_value: 42,
        },
        pull_request: {
          type: {
            type: 'hash',
            fields: {
              url: {
                type: 'string',
                example_value: 'https://api.github.com/repos/octocat/Hello-World/pulls/42',
              },
              id: {
                type: 'integer',
                example_value: 279147437,
              },
              node_id: {
                type: 'string',
                example_value: 'MDExOlB1bGxSZXF1ZXN0Mjc5MTQ3NDM3',
              },
              html_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/pull/42',
              },
              diff_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/pull/42.diff',
              },
              patch_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/pull/42.patch',
              },
              issue_url: {
                type: 'string',
                example_value: 'https://api.github.com/repos/octocat/Hello-World/issues/42',
              },
              number: {
                type: 'integer',
                example_value: 42,
              },
              state: {
                type: 'string',
                example_value: 'open',
              },
              locked: {
                type: 'boolean',
                example_value: false,
              },
              title: {
                type: 'string',
                example_value: 'Amazing new feature',
              },
              user: {
                type: {
                  type: 'hash',
                  fields: {
                    login: {
                      type: 'string',
                      example_value: 'octocat',
                    },
                    id: {
                      type: 'integer',
                      example_value: 1,
                    },
                    node_id: {
                      type: 'string',
                      example_value: 'MDQ6VXNlcjE=',
                    },
                    avatar_url: {
                      type: 'string',
                      example_value: 'https://github.com/images/error/octocat_happy.gif',
                    },
                  },
                },
              },
              body: {
                type: 'string',
                example_value: 'Please pull these awesome changes.',
              },
              created_at: {
                type: 'string',
                example_value: '2024-01-01T00:00:00Z',
              },
              updated_at: {
                type: 'string',
                example_value: '2024-01-01T00:00:00Z',
              },
              closed_at: {
                type: 'string',
                example_value: null,
              },
              merged_at: {
                type: 'string',
                example_value: null,
              },
              merge_commit_sha: {
                type: 'string',
                example_value: 'e5bd3914e2e596debea16f433f57875b5b90bcd6',
              },
              head: {
                type: {
                  type: 'hash',
                  fields: {
                    ref: {
                      type: 'string',
                      example_value: 'new-feature',
                    },
                    sha: {
                      type: 'string',
                      example_value: 'e5bd3914e2e596debea16f433f57875b5b90bcd6',
                    },
                    repo: {
                      type: {
                        type: 'hash',
                        fields: {
                          id: {
                            type: 'integer',
                            example_value: 1296269,
                          },
                          name: {
                            type: 'string',
                            example_value: 'Hello-World',
                          },
                          full_name: {
                            type: 'string',
                            example_value: 'octocat/Hello-World',
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
        ...commonEventFieldsType,
      },
    },
  },
});

export default githubNewPullRequestTrigger;
