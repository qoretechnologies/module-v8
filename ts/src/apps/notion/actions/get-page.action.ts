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
import { getNotionPageAllowedValues } from '../helpers/get-page-allowed-values';
import { PageObjectResponse } from '@notionhq/client';

const action = 'get_page';

const options = {
  page_id: {
    type: 'string',
    get_allowed_values: getNotionPageAllowedValues,
    required: true,
  },
} satisfies TQoreOptions;

const getPage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['page_id'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);
      const response = (await client.pages.retrieve({
        page_id,
      })) as PageObjectResponse;

      const pageProperties = response.properties;

      const titleProperty = Object.values(pageProperties).find((prop) => prop.type === 'title');
      const title =
        titleProperty && titleProperty.type === 'title'
          ? titleProperty.title.map((t) => t.plain_text).join(' ')
          : '';

      return {
        ...omit(response, ['object']),
        title,
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
      archived: { type: 'boolean' },
      is_trash: { type: 'boolean' },
      is_locked: { type: 'boolean' },
      created_time: { type: 'string' },
      last_edited_time: { type: 'string' },
      url: { type: 'string' },
      public_url: { type: 'string' },
      properties: { type: 'hash' },
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
    },
  } satisfies TQoreResponseType,
});

export default getPage;
