import { DataSourceObjectResponse } from '@notionhq/client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { delay, getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import {
  createNotionClient,
  getNotionRickTextFieldPlainText,
  NOTION_FETCH_DELAY,
} from '../helpers/constants';

const action = 'list_datasources';

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
} satisfies TQoreOptions;

const listDataSources = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const dataSources: DataSourceObjectResponse[] = [];
    let cursor = undefined;

    const query = obj?.query;
    const last_edited = obj?.last_edited as 'ascending' | 'descending' | undefined;

    try {
      const client = createNotionClient(token);
      do {
        const response = await client.search({
          filter: {
            property: 'object',
            value: 'data_source',
          },
          ...(query && { query: query.trim() }),
          ...(last_edited && { sort: { direction: last_edited, timestamp: 'last_edited_time' } }),
          start_cursor: cursor,
          page_size: 100,
        });

        dataSources.push(...(response.results as DataSourceObjectResponse[]));

        cursor = response.next_cursor ? response.next_cursor : undefined;

        if (cursor) {
          await delay(NOTION_FETCH_DELAY);
        }
      } while (cursor);

      return dataSources.map((ds) => {
        return {
          ...omit(ds, ['object']),
          title: getNotionRickTextFieldPlainText(ds.title),
          description: getNotionRickTextFieldPlainText(ds.description),
        };
      });
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
      title: { type: 'string' },
      description: { type: 'string' },
      is_inline: { type: 'bool' },
      properties: { type: 'hash' },
      parent: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            database_id: { type: 'string' },
            page_id: { type: 'string' },
          },
        },
      },
      database_parent: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            database_id: { type: 'string' },
          },
        },
      },
      url: { type: 'string' },
      public_url: { type: 'string' },
      archived: { type: 'bool' },
      in_trash: { type: 'bool' },
    },
  } satisfies TQoreResponseType,
});

export default listDataSources;
