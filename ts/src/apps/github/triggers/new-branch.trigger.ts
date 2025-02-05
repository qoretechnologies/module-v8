import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '@qoretechnologies/ts-toolkit';
import { repoOwnerCommonOptions } from '../constants';
import { commonEventFieldsType } from './constants';

export default {
  action: 'new_repository_branch',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: repoOwnerCommonOptions,
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const owner = context?.opts?.owner;
    const repo = context?.opts?.repo;

    if (!token || !owner || !repo) {
      throw new Error(
        'The following options are required to register new repository branch event: token, owner, repo'
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
    const token = context?.conn_opts?.token;
    const owner = context?.opts?.owner;
    const repo = context?.opts?.repo;

    if (!token || !owner || !repo) {
      throw new Error(
        'The following options are required to deregister new repository branch event: token, owner, repo'
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
