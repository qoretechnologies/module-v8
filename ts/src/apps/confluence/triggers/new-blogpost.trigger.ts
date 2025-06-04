import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { CONFLUENCE_APP_NAME, ConfluenceError } from '../constants';
import { getConfluenceSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

type ConfluenceBlogpost = {
  id: string;
  status: string;
  title: string;
  spaceId: string;
  authorId: string;
  createdAt: string;
  version: {
    number: number;
    authorId: string;
    message: string;
    createdAt: string;
  };
  body?: {
    storage?: {
      value: string;
      representation: string;
    };
    atlas_doc_format?: {
      value: string;
      representation: string;
    };
    view?: {
      value: string;
      representation: string;
    };
  };
  _links: {
    editui: string;
    webui: string;
  };
};

const ConfluenceNewBlogpostTrigger = QoreAppCreator.createLocalizedTrigger({
  app: CONFLUENCE_APP_NAME,
  action: 'new_blogpost',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    space_id: {
      type: 'string',
      required: false,
      allowed_values_creatable: true,
      get_allowed_values: getConfluenceSpaceIdAllowedValues,
    },
    status: {
      type: {
        type: 'list',
        element_type: 'string',
      },
      required: false,
      element_allowed_values: [
        {
          value: 'current',
          display_name: 'Current',
          desc: 'Blogposts that are currently active and published',
        },
        {
          value: 'deleted',
          display_name: 'Deleted',
          desc: 'Blogposts that have been deleted',
        },
        {
          value: 'trashed',
          display_name: 'Trashed',
          desc: 'Blogposts that have been moved to trash',
        },
      ],
    },
    body_format: {
      type: 'string',
      required: false,
      allowed_values: [
        {
          value: 'storage',
          display_name: 'Storage Format',
          desc: 'Confluence storage format (XML-based)',
        },
        {
          value: 'atlas_doc_format',
          display_name: 'Atlas Document Format',
          desc: 'Atlassian Document Format (ADF)',
        },
      ],
    },
  },
  event_function: async (context, update, should_stop) => {
    const { token, cloud_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'cloud_id'],
      ErrorClass: ConfluenceError,
    });

    const space_id = context.opts?.space_id;
    const status = context.opts?.status as string[] | undefined;
    const body_format = context.opts?.body_format;

    const getItems = () => {
      return fetchLatestBlogposts({
        token,
        cloud_id,
        space_id,
        status,
        body_format,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'confluence_new_blogpost',
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, cloud_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'cloud_id'],
      ErrorClass: ConfluenceError,
    });

    const blogposts = await fetchLatestBlogposts({
      token,
      cloud_id,
    });

    return blogposts?.length > 0 ? blogposts[0] : null;
  },
  event_info: {
    desc: 'Confluence New Blogpost Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
        },
        status: {
          type: 'string',
        },
        title: {
          type: 'string',
        },
        spaceId: {
          type: 'string',
        },
        authorId: {
          type: 'string',
        },
        createdAt: {
          type: 'string',
        },
        version: {
          type: {
            type: 'hash',
            fields: {
              number: {
                type: 'number',
              },
              authorId: {
                type: 'string',
              },
              message: {
                type: 'string',
              },
              createdAt: {
                type: 'string',
              },
            },
          },
        },
        body: {
          type: {
            type: 'hash',
            fields: {
              storage: {
                type: {
                  type: 'hash',
                  fields: {
                    value: {
                      type: 'string',
                    },
                    representation: {
                      type: 'string',
                    },
                  },
                },
              },
              atlas_doc_format: {
                type: {
                  type: 'hash',
                  fields: {
                    value: {
                      type: 'string',
                    },
                    representation: {
                      type: 'string',
                    },
                  },
                },
              },
              view: {
                type: {
                  type: 'hash',
                  fields: {
                    value: {
                      type: 'string',
                    },
                    representation: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
        _links: {
          type: {
            type: 'hash',
            fields: {
              editui: {
                type: 'string',
              },
              webui: {
                type: 'string',
              },
            },
          },
        },
      },
    },
  },
});

export default ConfluenceNewBlogpostTrigger;

const fetchLatestBlogposts = async (options: {
  token: string;
  cloud_id: string;
  space_id?: string;
  status?: string[];
  body_format?: string;
}) => {
  const { token, cloud_id, space_id, status, body_format } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const params: Record<string, string> = {
      limit: limit.toString(),
      sort: '-created-date',
    };

    if (space_id) {
      params['space-id'] = space_id;
    }

    if (status && status.length > 0) {
      params.status = status.join(',');
    }

    if (body_format) {
      params['body-format'] = body_format;
    }

    const response = await QorusRequest.get<{ data: { results: ConfluenceBlogpost[] } }>(
      {
        path: `/blogposts`,
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
      {
        url: `https://api.atlassian.com/ex/confluence/${cloud_id}/wiki/api/v2`,
        endpointId: CONFLUENCE_APP_NAME,
      }
    );

    const blogposts = response?.data?.results || [];

    if (blogposts.length === 0) {
      return [];
    }

    return blogposts;
  } catch (error) {
    throw new ConfluenceError(`Failed to fetch latest blogposts: ${error.message || error}`);
  }
};
