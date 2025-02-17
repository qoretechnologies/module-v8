import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { GITHUB_APP_NAME, repoOwnerCommonOptions } from '../constants';
import { commonEventFieldsType } from './constants';

const githubNewCommitCommentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: GITHUB_APP_NAME,
  action: 'new_commit_comment',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: repoOwnerCommonOptions,
  webhook_register: async (context, url) => {
    const token = context?.conn_opts?.token;
    const owner = context?.opts?.owner;
    const repo = context?.opts?.repo;

    if (!token || !owner || !repo) {
      throw new Error(
        'The following options are required to register new commit comment event: token, owner, repo'
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
    const token = context?.conn_opts?.token;
    const owner = context?.opts?.owner;
    const repo = context?.opts?.repo;

    if (!token || !owner || !repo) {
      throw new Error(
        'The following options are required to deregister new commit comment event: token, owner, repo'
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
});

export default githubNewCommitCommentTrigger;
