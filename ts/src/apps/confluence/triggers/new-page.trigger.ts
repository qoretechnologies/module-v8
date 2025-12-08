import { EQoreAppActionCode, QoreAppCreator, QorusRequest } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { CONFLUENCE_APP_NAME, ConfluenceError } from '../constants';
import { getConfluenceSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

type ConfluencePage = {
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
  };
  _links: {
    editui: string;
    webui: string;
  };
};

const ConfluenceNewPageTrigger = QoreAppCreator.createLocalizedTrigger({
  app: CONFLUENCE_APP_NAME,
  action: 'new_page',
  action_code: EQoreAppActionCode.EVENT,
  options: {
    space_id: {
      type: 'string',
      required: false,
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
          desc: 'Pages that are currently active and published',
        },
        {
          value: 'archived',
          display_name: 'Archived',
          desc: 'Pages that have been archived',
        },
        {
          value: 'deleted',
          display_name: 'Deleted',
          desc: 'Pages that have been deleted',
        },
        {
          value: 'trashed',
          display_name: 'Trashed',
          desc: 'Pages that have been moved to trash',
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
    subtype: {
      type: 'string',
      required: false,
      allowed_values: [
        {
          value: 'live',
          display_name: 'Live Pages',
          desc: 'Live pages in Confluence',
        },
        {
          value: 'page',
          display_name: 'Regular Pages',
          desc: 'Regular Confluence pages',
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
    const subtype = context.opts?.subtype;

    const getItems = () => {
      return fetchLatestPages({
        token,
        cloud_id,
        space_id,
        status,
        body_format,
        subtype,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'confluence_new_page',
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

    const pages = await fetchLatestPages({
      token,
      cloud_id,
    });

    return pages?.length > 0 ? pages[0] : null;
  },
  event_info: {
    desc: 'Confluence New Page Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        title: { type: 'string' },
        lastOwnerId: { type: 'string' },
        status: { type: 'string' },
        parentId: { type: 'string' },
        createdAt: { type: 'string' },
        spaceId: { type: 'string' },
        ownerId: { type: 'string' },
        authorId: { type: 'string' },
        position: { type: 'number' },
        parentType: { type: 'string' },
        version: {
          type: {
            type: 'hash',
            fields: {
              number: { type: 'number' },
              message: { type: 'string' },
              minorEdit: { type: 'bool' },
              authorId: { type: 'string' },
              createdAt: { type: 'string' },
              nscStepVersion: { type: 'number' },
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
            },
          },
        },
        _links: {
          type: {
            type: 'hash',
            fields: {
              editui: { type: 'string' },
              webui: { type: 'string' },
              edituiv2: { type: 'string' },
              tinyui: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default ConfluenceNewPageTrigger;

const fetchLatestPages = async (options: {
  token: string;
  cloud_id: string;
  space_id?: string;
  status?: string[];
  body_format?: string;
  subtype?: string;
}) => {
  const { token, cloud_id, space_id, status, body_format, subtype } = options;
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

    if (subtype) {
      params.subtype = subtype;
    }

    const response = await QorusRequest.get<{ data: { results: ConfluencePage[] } }>(
      {
        path: `/pages`,
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

    const pages = response?.data?.results || [];

    if (pages.length === 0) {
      return [];
    }

    return pages;
  } catch (error) {
    throw new ConfluenceError(`Failed to fetch latest pages: ${error.message || error}`);
  }
};
