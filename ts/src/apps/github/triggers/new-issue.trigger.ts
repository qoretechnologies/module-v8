import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';

export default {
  action: 'new_repository_issue',
  action_code: EQoreAppActionCode.EVENT,
  webhook_method: 'POST',
  options: {
    repo: {
      type: 'string',
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
          webhook: {
            name: 'New Issue Webhook',
            active: true,
            events: ['issues'],
            config: {
              url,
              content_type: 'json',
            },
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
        path: `repos/${owner}/${repo}/hooks/${webhook.id}`,
      },
      { url: `https://api.github.com`, endpointId: 'Github' }
    );
  },
  event_info: {
    desc: 'GitHub Issue event data',
    type: {
      action: {
        name: 'action',
        type: 'softstring',
      },
      issue: {
        name: 'issue',
        type: {
          url: {
            name: 'url',
            type: 'softstring',
          },
          number: {
            name: 'number',
            type: 'int',
          },
          title: {
            name: 'title',
            type: 'softstring',
          },
          user: {
            name: 'user',
            type: {
              login: {
                name: 'login',
                type: 'softstring',
              },
              id: {
                name: 'id',
                type: 'int',
              },
              avatar_url: {
                name: 'avatar_url',
                type: 'softstring',
              },
              html_url: {
                name: 'html_url',
                type: 'softstring',
              },
            },
          },
          labels: {
            name: 'labels',
            type: 'list',
            example_value: [
              {
                id: 208045946,
                name: 'bug',
                color: 'f29513',
              },
            ],
          },
          state: {
            name: 'state',
            type: 'softstring',
          },
          locked: {
            name: 'locked',
            type: 'boolean',
          },
          assignee: {
            name: 'assignee',
            type: {
              login: {
                name: 'login',
                type: 'softstring',
              },
              id: {
                name: 'id',
                type: 'int',
              },
              avatar_url: {
                name: 'avatar_url',
                type: 'softstring',
              },
              html_url: {
                name: 'html_url',
                type: 'softstring',
              },
            },
          },
          milestone: {
            name: 'milestone',
            type: {
              url: {
                name: 'url',
                type: 'softstring',
              },
              html_url: {
                name: 'html_url',
                type: 'softstring',
              },
              labels_url: {
                name: 'labels_url',
                type: 'softstring',
              },
              id: {
                name: 'id',
                type: 'int',
              },
              number: {
                name: 'number',
                type: 'int',
              },
              title: {
                name: 'title',
                type: 'softstring',
              },
              description: {
                name: 'description',
                type: 'softstring',
              },
              creator: {
                name: 'creator',
                type: {
                  login: {
                    name: 'login',
                    type: 'softstring',
                  },
                  id: {
                    name: 'id',
                    type: 'int',
                  },
                  avatar_url: {
                    name: 'avatar_url',
                    type: 'softstring',
                  },
                  html_url: {
                    name: 'html_url',
                    type: 'softstring',
                  },
                },
              },
              open_issues: {
                name: 'open_issues',
                type: 'int',
              },
              closed_issues: {
                name: 'closed_issues',
                type: 'int',
              },
              state: {
                name: 'state',
                type: 'softstring',
              },
              created_at: {
                name: 'created_at',
                type: 'softdate',
              },
              updated_at: {
                name: 'updated_at',
                type: 'softdate',
              },
              due_on: {
                name: 'due_on',
                type: 'softdate',
              },
              closed_at: {
                name: 'closed_at',
                type: 'softdate',
              },
            },
          },
          comments: {
            name: 'comments',
            type: 'int',
          },
          created_at: {
            name: 'created_at',
            type: 'softdate',
          },
          updated_at: {
            name: 'updated_at',
            type: 'softdate',
          },
          closed_at: {
            name: 'closed_at',
            type: 'softdate',
          },
          body: {
            name: 'body',
            type: 'softstring',
          },
        },
      },
      repository: {
        name: 'repository',
        type: {
          id: {
            name: 'id',
            type: 'int',
          },
          name: {
            name: 'name',
            type: 'softstring',
          },
          full_name: {
            name: 'full_name',
            type: 'softstring',
          },
          owner: {
            name: 'owner',
            type: {
              login: {
                name: 'login',
                type: 'softstring',
              },
              id: {
                name: 'id',
                type: 'int',
              },
              avatar_url: {
                name: 'avatar_url',
                type: 'softstring',
              },
              html_url: {
                name: 'html_url',
                type: 'softstring',
              },
            },
          },
          private: {
            name: 'private',
            type: 'boolean',
          },
          html_url: {
            name: 'html_url',
            type: 'softstring',
          },
          description: {
            name: 'description',
            type: 'softstring',
          },
          fork: {
            name: 'fork',
            type: 'boolean',
          },
          created_at: {
            name: 'created_at',
            type: 'softdate',
          },
          updated_at: {
            name: 'updated_at',
            type: 'softdate',
          },
          pushed_at: {
            name: 'pushed_at',
            type: 'softdate',
          },
          size: {
            name: 'size',
            type: 'int',
          },
          stargazers_count: {
            name: 'stargazers_count',
            type: 'int',
          },
          watchers_count: {
            name: 'watchers_count',
            type: 'int',
          },
          language: {
            name: 'language',
            type: 'softstring',
          },
          has_issues: {
            name: 'has_issues',
            type: 'boolean',
          },
          has_downloads: {
            name: 'has_downloads',
            type: 'boolean',
          },
          has_wiki: {
            name: 'has_wiki',
            type: 'boolean',
          },
          has_pages: {
            name: 'has_pages',
            type: 'boolean',
          },
          forks_count: {
            name: 'forks_count',
            type: 'int',
          },
          mirror_url: {
            name: 'mirror_url',
            type: 'softstring',
          },
          archived: {
            name: 'archived',
            type: 'boolean',
          },
          disabled: {
            name: 'disabled',
            type: 'boolean',
          },
          open_issues_count: {
            name: 'open_issues_count',
            type: 'int',
          },
          license: {
            name: 'license',
            type: 'softstring',
          },
          forks: {
            name: 'forks',
            type: 'int',
          },
          open_issues: {
            name: 'open_issues',
            type: 'int',
          },
          watchers: {
            name: 'watchers',
            type: 'int',
          },
          default_branch: {
            name: 'default_branch',
            type: 'softstring',
          },
        },
      },
      sender: {
        name: 'sender',
        type: {
          login: {
            name: 'login',
            type: 'softstring',
          },
          id: {
            name: 'id',
            type: 'int',
          },
          avatar_url: {
            name: 'avatar_url',
            type: 'softstring',
          },
          html_url: {
            name: 'html_url',
            type: 'softstring',
          },
        },
      },
    },
  },
} satisfies TQorePartialEventAction;
