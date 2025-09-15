import { DataSourceObjectResponse } from '@notionhq/client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';

const action = 'list_pages';

const options = {
  query: {
    type: 'string',
    required: false,
    preselected: true,
  },
  last_edited: {
    type: 'string',
    required: false,
    preselected: true,
    allowed_values: [
      { value: 'descending', display_name: 'Last edited (newest first)' },
      { value: 'ascending', display_name: 'Last edited (oldest first)' },
    ],
  },
  page_size: {
    type: 'integer',
    required: false,
    preselected: true,
    default_value: 20,
  },
  next_cursor: {
    type: 'string',
    required: false,
  },
} satisfies TQoreOptions;

const listPages = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: NotionError,
    });

    const { query, page_size, next_cursor } = obj || {};
    const last_edited = obj?.last_edited as 'ascending' | 'descending' | undefined;

    try {
      const client = createNotionClient(token);
      const response = await client.search({
        filter: {
          property: 'object',
          value: 'page',
        },
        ...(query && { query: query.trim() }),
        ...(last_edited && { sort: { direction: last_edited, timestamp: 'last_edited_time' } }),
        ...(next_cursor && { start_cursor: next_cursor }),
        page_size: page_size || 20,
      });

      const pages = response.results as DataSourceObjectResponse[];

      return {
        next_cursor: response.next_cursor || null,
        pages: pages.map((page) => {
          return omit(page, ['object']);
        }),
      };
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      icon: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            emoji: { type: 'string' },
            file: {
              type: {
                type: 'hash',
                fields: {
                  url: { type: 'string' },
                  expiry_time: { type: 'string' },
                },
              },
            },
            custom_emoji: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  url: { type: 'string' },
                },
              },
            },
            external: {
              type: {
                type: 'hash',
                fields: {
                  url: { type: 'string' },
                },
              },
            },
          },
        },
      },
      cover: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            external: {
              type: {
                type: 'hash',
                fields: {
                  url: { type: 'string' },
                },
              },
            },
            file: {
              type: {
                type: 'hash',
                fields: {
                  url: { type: 'string' },
                  expiry_time: { type: 'string' },
                },
              },
            },
          },
        },
      },
      created_time: { type: 'string' },
      created_by: {
        type: {
          type: 'hash',
          fields: {
            object: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
      last_edited_by: {
        type: {
          type: 'hash',
          fields: {
            object: { type: 'string' },
            id: { type: 'string' },
          },
        },
      },
      last_edited_time: { type: 'string' },
      properties: { type: 'hash' },
      parent: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            database_id: { type: 'string' },
            data_source_id: { type: 'string' },
          },
        },
      },
      url: { type: 'string' },
      public_url: { type: 'string' },
      archived: { type: 'boolean' },
      in_trash: { type: 'boolean' },
      is_locked: { type: 'boolean' },
    },
  } satisfies TQoreResponseType,
});

export default listPages;
