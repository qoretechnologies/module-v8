import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { EQoreAppActionCode, TQorePartialEventAction } from '../../../global/models/qore';
import { commonEventFieldsType } from './constants';
import { getGitHubRepositoryIdAllowedValues } from '../helpers/get-repository-id-allowed-values';

export default {
  action: 'new_release',
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
          events: ['release'],
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
        release: {
          type: {
            type: 'hash',
            fields: {
              url: {
                type: 'string',
                example_value: 'https://api.github.com/repos/octocat/Hello-World/releases/1',
              },
              html_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/releases/v1.0.0',
              },
              assets_url: {
                type: 'string',
                example_value: 'https://api.github.com/repos/octocat/Hello-World/releases/1/assets',
              },
              upload_url: {
                type: 'string',
                example_value:
                  'https://uploads.github.com/repos/octocat/Hello-World/releases/1/assets{?name,label}',
              },
              tarball_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/tarball/v1.0.0',
              },
              zipball_url: {
                type: 'string',
                example_value: 'https://github.com/octocat/Hello-World/zipball/v1.0.0',
              },
              id: {
                type: 'integer',
                example_value: 1,
              },
              tag_name: {
                type: 'string',
                example_value: 'v1.0.0',
              },
              target_commitish: {
                type: 'string',
                example_value: 'main',
              },
              name: {
                type: 'string',
                example_value: 'Initial Release',
              },
              body: {
                type: 'string',
                example_value: 'Description of the release.',
              },
              draft: {
                type: 'boolean',
                example_value: false,
              },
              prerelease: {
                type: 'boolean',
                example_value: false,
              },
              created_at: {
                type: 'string',
                example_value: '2024-01-01T12:34:56Z',
              },
              published_at: {
                type: 'string',
                example_value: '2024-01-01T12:34:56Z',
              },
              author: {
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
              assets: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      url: {
                        type: 'string',
                        example_value:
                          'https://api.github.com/repos/octocat/Hello-World/releases/assets/1',
                      },
                      id: {
                        type: 'integer',
                        example_value: 1,
                      },
                      name: {
                        type: 'string',
                        example_value: 'example.zip',
                      },
                      label: {
                        type: 'string',
                        example_value: 'Short description',
                      },
                      content_type: {
                        type: 'string',
                        example_value: 'application/zip',
                      },
                      state: {
                        type: 'string',
                        example_value: 'uploaded',
                      },
                      size: {
                        type: 'integer',
                        example_value: 1024,
                      },
                      download_count: {
                        type: 'integer',
                        example_value: 42,
                      },
                      created_at: {
                        type: 'string',
                        example_value: '2024-01-01T12:34:56Z',
                      },
                      updated_at: {
                        type: 'string',
                        example_value: '2024-01-01T12:34:56Z',
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
