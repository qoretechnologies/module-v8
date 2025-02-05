import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { repoOwnerCommonOptions } from '../constants';
import { commonEventFieldsType } from './constants';

export default {
  action: 'new_review_request',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: repoOwnerCommonOptions,
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const owner = context?.opts?.owner;
    const repo = context?.opts?.repo;

    if (!token || !owner || !repo) {
      throw new Error(
        'The following options are required to register new review request event: token, owner, repo'
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
          events: ['pull_request_review'],
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
        'The following options are required to deregister new review request event: token, owner, repo'
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
        review: {
          type: {
            type: 'hash',
            fields: {
              id: {
                type: 'integer',
                example_value: 80,
              },
              node_id: {
                type: 'string',
                example_value: 'MDE3OlB1bGxSZXF1ZXN0UmV2aWV3ODA=',
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
                    html_url: {
                      type: 'string',
                      example_value: 'https://github.com/octocat',
                    },
                  },
                },
              },
              body: {
                type: 'string',
                example_value: 'Here is the body for the review.',
              },
              commit_id: {
                type: 'string',
                example_value: 'ecdd80bb57125d7ba9641ffaa4d7d2c19d3f3091',
              },
              submitted_at: {
                type: 'string',
                example_value: '2024-01-01T12:34:56Z',
              },
              state: {
                type: 'string',
                example_value: 'approved',
              },
              html_url: {
                type: 'string',
                example_value:
                  'https://github.com/octocat/Hello-World/pull/12#pullrequestreview-80',
              },
              pull_request_url: {
                type: 'string',
                example_value: 'https://api.github.com/repos/octocat/Hello-World/pulls/12',
              },
              author_association: {
                type: 'string',
                example_value: 'OWNER',
              },
            },
          },
        },
        pull_request: {
          type: {
            type: 'hash',
            fields: {
              url: {
                type: 'string',
                example_value: 'https://api.github.com/repos/octocat/Hello-World/pulls/12',
              },
              id: {
                type: 'integer',
                example_value: 1,
              },
              node_id: {
                type: 'string',
                example_value: 'MDExOlB1bGxSZXF1ZXN0MQ==',
              },
              html_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/pull/12',
              },
              diff_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/pull/12.diff',
              },
              patch_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/pull/12.patch',
              },
              issue_url: {
                type: 'string',
                example_value: 'https://api.github.com/repos/octocat/Hello-World/issues/12',
              },
              number: {
                type: 'integer',
                example_value: 12,
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
                    html_url: {
                      type: 'string',
                      example_value: 'https://github.com/octocat',
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
                example_value: '2024-01-01T12:34:56Z',
              },
              updated_at: {
                type: 'string',
                example_value: '2024-01-01T12:34:56Z',
              },
              closed_at: {
                type: 'string',
                example_value: null,
              },
              merged_at: {
                type: 'string',
                example_value: null,
              },
            },
          },
        },
        ...commonEventFieldsType,
      },
    },
  },
} satisfies TQorePartialEventAction;
