import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { commonEventFieldsType } from './constants';
import { getGitHubRepositoryIdAllowedValues } from '../helpers/get-repository-id-allowed-values';
import { getGitHubOwnerAllowedValues } from '../helpers/get-owner-allowed-values';

export default {
  action: 'new_repository_branch',
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
      get_allowed_values: getGitHubOwnerAllowedValues,
      allowed_values_creatable: true,
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
          events: ['create'],
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
    desc: 'New branch event data',
    type: {
      type: 'hash',
      fields: {
        ref: {
          type: 'string',
          example_value: 'new-feature-branch',
        },
        ref_type: {
          type: 'string',
          example_value: 'branch',
        },
        master_branch: {
          type: 'string',
          example_value: 'main',
        },
        description: {
          type: 'string',
          example_value: 'Repository description',
        },
        pusher_type: {
          type: 'string',
          example_value: 'user',
        },
        ...commonEventFieldsType,
      },
    },
  },
} satisfies TQorePartialEventAction;
