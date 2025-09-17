import { DataSourceObjectResponse } from '@notionhq/client';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient, getNotionRickTextFieldPlainText } from '../helpers/constants';
import { getNotionDataSourceAllowedValues } from '../helpers/get-datasource-allowed-values';

const action = 'get_data_source';

const options = {
  data_source_id: {
    type: 'string',
    get_allowed_values: getNotionDataSourceAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const getDataSource = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, data_source_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['data_source_id'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);
      const response = (await client.dataSources.retrieve({
        data_source_id,
      })) as DataSourceObjectResponse;

      return {
        ...omit(response, ['object']),
        title: getNotionRickTextFieldPlainText(response.title),
        description: getNotionRickTextFieldPlainText(response.description),
      };
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      title: { type: 'string' },
      description: { type: 'string' },
      is_inline: { type: 'boolean' },
      is_trash: { type: 'boolean' },
      is_locked: { type: 'boolean' },
      created_time: { type: 'string' },
      last_edited_time: { type: 'string' },
      url: { type: 'string' },
      public_url: { type: 'string' },
      properties: { type: 'hash' },
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
            database_id: { type: 'string' },
          },
        },
      },
      database_parent: {
        type: {
          type: 'hash',
          fields: {
            type: { type: 'string' },
            workspace: { type: 'string' },
          },
        },
      },
    },
  },
});

export default getDataSource;
