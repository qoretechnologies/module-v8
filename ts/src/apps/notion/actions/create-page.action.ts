import { BlockObjectRequest } from '@notionhq/client';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';
import { getNotionPageAllowedValues } from '../helpers/get-page-allowed-values';

const action = 'create_page';

const options = {
  page: {
    type: 'string',
    required: true,
    get_allowed_values: getNotionPageAllowedValues,
  },
  title: {
    type: 'string',
    required: true,
  },
  content: {
    required: true,
    type: 'string',
    preselected: true,
  },
} satisfies TQoreOptions;

const createPage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, content, title, page } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['content', 'title', 'page'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);

      const pageProperties: Record<
        string,
        {
          title: Array<{ text: { content: string } }>;
          type?: 'title';
        }
      > = {
        title: {
          title: [
            {
              text: {
                content: title ?? '',
              },
            },
          ],
        },
      };

      const children: BlockObjectRequest[] = [];

      if (content)
        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content,
                },
              },
            ],
          },
        });

      const response = await client.pages.create({
        parent: {
          page_id: page,
        },
        properties: pageProperties,
        children: children,
      });

      return omit(response, ['object', 'request_id']);
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      object: {
        type: 'string',
        example_value: 'page',
      },
      id: {
        type: 'string',
        example_value: '12345678-1234-1234-1234-123456789012',
      },
      created_time: {
        type: 'string',
        example_value: '2022-02-22T22:22:22.222Z',
      },
      last_edited_time: {
        type: 'string',
        example_value: '2022-02-22T22:22:22.222Z',
      },
      parent: {
        type: 'hash',
        example_value: {
          type: 'database_id',
          database_id: '12345678-1234-1234-1234-123456789012',
        },
      },
      archived: {
        type: 'boolean',
        example_value: false,
      },
      url: {
        type: 'string',
        example_value: 'https://www.notion.so/12345678-1234-1234-1234-123456789012',
      },
      properties: {
        type: 'hash',
      },
    },
  },
});

export default createPage;
