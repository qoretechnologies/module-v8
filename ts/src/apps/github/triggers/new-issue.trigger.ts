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
          name: 'web',
          active: true,
          events: ['issues'],
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
        path: `repos/${owner}/${repo}/hooks/${webhook.id}`,
      },
      { url: `https://api.github.com`, endpointId: 'Github' }
    );
  },
  event_info: {
    desc: 'GitHub Issue event data',
    type: {
      type: 'hash',
      fields: {
        action: {
          type: 'softstring',
        },
        issue: {
          type: {
            type: 'hash',
            fields: {
              url: {
                type: 'softstring',
              },
              number: {
                type: 'int',
              },
              title: {
                type: 'softstring',
              },
              user: {
                type: {
                  type: 'hash',
                  fields: {
                    login: {
                      type: 'softstring',
                    },
                    id: {
                      type: 'int',
                    },
                    avatar_url: {
                      type: 'softstring',
                    },
                    html_url: {
                      type: 'softstring',
                    },
                  },
                },
              },
              labels: {
                type: 'list',
                example_value: [
                  {
                    id: 7590030010,
                    name: 'documentation',
                    color: '0075ca',
                  },
                ],
              },
              state: {
                type: 'softstring',
              },
              locked: {
                type: 'boolean',
              },
              assignee: {
                type: {
                  type: 'hash',
                  fields: {
                    login: {
                      type: 'softstring',
                    },
                    id: {
                      type: 'int',
                    },
                    avatar_url: {
                      type: 'softstring',
                    },
                    html_url: {
                      type: 'softstring',
                    },
                  },
                },
              },
              milestone: {
                type: {
                  type: 'hash',
                  fields: {
                    url: {
                      type: 'softstring',
                    },
                    html_url: {
                      type: 'softstring',
                    },
                    labels_url: {
                      type: 'softstring',
                    },
                    id: {
                      type: 'int',
                    },
                    number: {
                      type: 'int',
                    },
                    title: {
                      type: 'softstring',
                    },
                    description: {
                      type: 'softstring',
                    },
                    creator: {
                      type: {
                        type: 'hash',
                        fields: {
                          login: {
                            type: 'softstring',
                          },
                          id: {
                            type: 'int',
                          },
                          avatar_url: {
                            type: 'softstring',
                          },
                          html_url: {
                            type: 'softstring',
                          },
                        },
                      },
                    },
                    open_issues: {
                      type: 'int',
                    },
                    closed_issues: {
                      type: 'int',
                    },
                    state: {
                      type: 'softstring',
                    },
                    created_at: {
                      type: 'softdate',
                    },
                    updated_at: {
                      type: 'softdate',
                    },
                    due_on: {
                      type: 'softdate',
                    },
                    closed_at: {
                      type: 'softdate',
                    },
                  },
                },
              },
              comments: {
                type: 'int',
              },
              created_at: {
                type: 'softdate',
              },
              updated_at: {
                type: 'softdate',
              },
              closed_at: {
                type: 'softdate',
              },
              body: {
                type: 'softstring',
              },
            },
          },
        },
        repository: {
          type: {
            type: 'hash',
            fields: {
              id: {
                type: 'int',
              },
              name: {
                type: 'softstring',
              },
              full_name: {
                type: 'softstring',
              },
              owner: {
                type: {
                  type: 'hash',
                  fields: {
                    login: {
                      type: 'softstring',
                    },
                    id: {
                      type: 'int',
                    },
                    avatar_url: {
                      type: 'softstring',
                    },
                    html_url: {
                      type: 'softstring',
                    },
                  },
                },
              },
              private: {
                type: 'boolean',
              },
              html_url: {
                type: 'softstring',
              },
              description: {
                type: 'softstring',
              },
              fork: {
                type: 'boolean',
              },
              created_at: {
                type: 'softdate',
              },
              updated_at: {
                type: 'softdate',
              },
              pushed_at: {
                type: 'softdate',
              },
              size: {
                type: 'int',
              },
              stargazers_count: {
                type: 'int',
              },
              watchers_count: {
                type: 'int',
              },
              language: {
                type: 'softstring',
              },
              has_issues: {
                type: 'boolean',
              },
              has_downloads: {
                type: 'boolean',
              },
              has_wiki: {
                type: 'boolean',
              },
              has_pages: {
                type: 'boolean',
              },
              forks_count: {
                type: 'int',
              },
              mirror_url: {
                type: 'softstring',
              },
              archived: {
                type: 'boolean',
              },
              disabled: {
                type: 'boolean',
              },
              open_issues_count: {
                type: 'int',
              },
              license: {
                type: 'softstring',
              },
              forks: {
                type: 'int',
              },
              open_issues: {
                type: 'int',
              },
              watchers: {
                type: 'int',
              },
              default_branch: {
                type: 'softstring',
              },
            },
          },
        },
        sender: {
          type: {
            type: 'hash',
            fields: {
              login: {
                type: 'softstring',
              },
              id: {
                type: 'int',
              },
              avatar_url: {
                type: 'softstring',
              },
              html_url: {
                type: 'softstring',
              },
            },
          },
        },
      },
    },
  },
} satisfies TQorePartialEventAction;
