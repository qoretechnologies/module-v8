import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { commonEventFieldsType } from './constants';
import { getGitHubRepositoryIdAllowedValues } from '../helpers/get-repository-id-allowed-values';

export default {
  action: 'new_commit_comment',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    repo: {
      type: 'string',
      get_allowed_values: getGitHubRepositoryIdAllowedValues,
      allowed_values_creatable: true,
      required: true,
    },
    owner: {
      type: 'string',
      required: true,
    },
  },
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
          events: ['commit_comment'],
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
    desc: 'New commit comment event data',
    type: {
      type: 'hash',
      fields: {
        comment: {
          type: {
            type: 'hash',
            fields: {
              id: {
                type: 'integer',
                example_value: 110755663,
              },
              body: {
                type: 'string',
                example_value: 'Nice change!',
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
                  },
                },
              },
              commit_id: {
                type: 'string',
                example_value: '6dcb09b...',
              },
            },
          },
        },
        ...commonEventFieldsType,
      },
    },
  },
} satisfies TQorePartialEventAction;
