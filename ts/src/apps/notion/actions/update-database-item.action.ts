import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient, NotionFieldMapping } from '../helpers/constants';
import { getNotionDataSourceProperties } from '../helpers/get-data-source-properties';
import { getNotionDataSourceAllowedValues } from '../helpers/get-datasource-allowed-values';
import { getNotionDataSourceItemAllowedValues } from '../helpers/get-data-source-item-allowed-values';

const action = 'update_database_item';

const options = {
  data_source_id: {
    type: 'string',
    required: true,
    get_allowed_values: getNotionDataSourceAllowedValues,
    on_change: ['refetch'],
  },
  item_id: {
    type: 'string',
    get_allowed_values: getNotionDataSourceItemAllowedValues,
    required: true,
  },
  properties: {
    type: 'hash',
    required: true,
    get_dynamic_type: getNotionDataSourceProperties,
  },
} satisfies TQoreOptions;

const updateDatabaseItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, data_source_id, properties, item_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['data_source_id', 'properties', 'item_id'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);
      const propertiesFormatted: Record<string, any> = {};

      const { properties: dataSourceProps } = await client.dataSources.retrieve({
        data_source_id,
      });

      Object.keys(properties).forEach((key) => {
        if (properties[key]) {
          const fieldType: string = dataSourceProps[key].type;
          propertiesFormatted[key] = NotionFieldMapping[fieldType].buildNotionType(properties[key]);
        }
      });

      const response = await client.pages.update({
        page_id: item_id,
        properties: propertiesFormatted,
      });

      return omit(response, ['object', 'request_id']);
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      created_time: { type: 'string' },
      last_edited_time: { type: 'string' },
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
      parent: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            data_source_id: { type: 'string' },
            database_id: { type: 'string' },
          },
        },
      },
      archived: { type: 'boolean' },
      is_trash: { type: 'boolean' },
      is_locked: { type: 'boolean' },
      properties: { type: 'hash' },
      url: { type: 'string' },
      public_url: { type: 'string' },
    },
  } satisfies TQoreResponseType,
});

export default updateDatabaseItem;
