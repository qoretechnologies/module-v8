import { BlockObjectRequest } from '@notionhq/client';
import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreResponseType,
} from '@qoretechnologies/ts-toolkit';
import { markdownToBlocks } from '@tryfabric/martian';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';
import { getNotionPageAllowedValues } from '../helpers/get-page-allowed-values';

const action = 'append_to_page';

export const response_type = {
  type: 'hash',
  fields: {
    object: {
      type: 'string',
      display_name: 'Object',
      short_desc: 'The type of object returned',
      desc: 'The type of object returned in this case it will always be block',
      example_value: 'block',
    },
    results: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            object: {
              type: 'string',
            },
            id: {
              type: 'string',
            },
            type: {
              type: 'string',
            },
            paragraph: {
              type: {
                type: 'hash',
                fields: {
                  color: {
                    type: 'string',
                  },
                  rich_text: {
                    type: {
                      type: 'list',
                      element_type: {
                        type: 'hash',
                        fields: {
                          plain_text: {
                            type: 'string',
                          },
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
                                  type: 'bool',
                                },
                                italic: {
                                  type: 'bool',
                                },
                                strikethrough: {
                                  type: 'bool',
                                },
                                underline: {
                                  type: 'bool',
                                },
                                code: {
                                  type: 'bool',
                                },
                                color: {
                                  type: 'string',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      display_name: 'Results',
      short_desc: 'The results of the append',
      desc: 'The results of the append',
      example_value: [
        {
          object: 'block',
          id: '12345678-1234-1234-1234-123456789012',
          type: 'paragraph',
          paragraph: {
            color: 'default',
            rich_text: [
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
  content: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const appendToPage = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, page_id, content } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['page_id', 'content'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);
      const response = await client.blocks.children.append({
        block_id: page_id,
        children: markdownToBlocks(content) as BlockObjectRequest[],
      });

      return omit(response, ['object']);
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type,
});

export default appendToPage;
