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

const action = 'add_comment_to_page';

export const response_type = {
  type: 'hash',
  fields: {
    id: {
      type: 'string',
      example_value: '12345678-1234-1234-1234-123456789012',
    },
    parent: {
      required: false,
      type: {
        type: 'hash',
        fields: {
          type: {
            type: 'string',
            example_value: 'discussion',
          },
          page_id: {
            required: false,
            type: 'string',
            example_value: '12345678-1234-1234-1234-123456789012',
          },
        },
      },
    },
    discussion_id: {
      type: 'string',
      example_value: '12345678-1234-1234-1234-123456789012',
    },
    created_time: {
      type: 'string',
      example_value: '2022-02-22T00:00:00.000Z',
    },
    last_edited_time: {
      type: 'string',
      example_value: '2022-02-22T00:00:00.000Z',
    },
    created_by: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            example_value: '12345678-1234-1234-1234-123456789012',
          },
          object: {
            type: 'string',
            example_value: 'user',
          },
        },
      },
    },
    display_name: { type: 'string' },
    rich_text: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            type: {
              type: 'string',
            },
            text: {
              type: {
                type: 'hash',
                fields: {
                  content: {
                    type: 'string',
                  },
                  link: {
                    type: 'string',
                  },
                },
              },
            },
            annotations: {
              type: {
                type: 'hash',
                fields: {
                  bold: {
                    type: 'boolean',
                  },
                  italic: {
                    type: 'boolean',
                  },
                  strikethrough: {
                    type: 'boolean',
                  },
                  underline: {
                    type: 'boolean',
                  },
                  code: {
                    type: 'boolean',
                  },
                  color: {
                    type: 'string',
                  },
                },
              },
            },
            plain_text: {
              type: 'string',
            },
          },
        },
      },
      example_value: [
        {
          type: 'text',
          text: {
            content: 'This is a test comment',
            link: 'https://example.com',
          },
          annotations: {
            bold: false,
            italic: false,
            strikethrough: false,
            underline: false,
            code: false,
            color: 'default',
          },
          plain_text: 'This is a test comment',
        },
      ],
    },
  },
} satisfies TQoreResponseType;

const options = {
  page_id: {
    type: 'string',
    get_allowed_values: getNotionPageAllowedValues,
    required: true,
  },
  text: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const addCommentToPage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id, text } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['page_id', 'text'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);
      const response = await client.comments.create({
        parent: { type: 'page_id', page_id },
        rich_text: [{ text: { content: text } }],
      });

      return omit(response, ['object']);
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type,
});

export default addCommentToPage;
