import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { repoOwnerCommonOptions } from '../constants';
import { commonEventFieldsType } from './constants';

export default {
  action: 'new_commit',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: repoOwnerCommonOptions,
  webhook_register: async (context, url) => {
    const {
      conn_opts: { token },
      opts: { owner, repo },
    } = context;

    const { data } = await QorusRequest.post<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          name: 'web',
          active: true,
          events: ['push'],
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
    const {
      conn_opts: { token },
      opts: { owner, repo },
    } = context;
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
        before: {
          type: 'string',
          example_value: '9049f1265b7d61be...',
        },
        after: {
          type: 'string',
          example_value: '02b66dd40cd9b3f...',
        },
        compare: {
          type: 'string',
        },
        commits: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: {
                  type: 'string',
                  example_value: '02b66dd40cd9b3f...',
                },
                message: {
                  type: 'string',
                  example_value: 'Updated README.md',
                },
                timestamp: {
                  type: 'string',
                  example_value: '2024-01-01T00:00:00Z',
                },
                url: {
                  type: 'string',
                },
                committer: {
                  type: {
                    type: 'hash',
                    fields: {
                      name: {
                        type: 'string',
                      },
                      email: {
                        type: 'string',
                      },
                      username: {
                        type: 'string',
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
} satisfies TQorePartialEventAction;
