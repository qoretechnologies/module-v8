import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { NOTION_APP_NAME, NotionError } from '../constants';
import { createNotionClient } from '../helpers/constants';
import { getNotionPageAllowedValues } from '../helpers/get-page-allowed-values';

const action = 'list_comments';

const options = {
  page_size: {
    type: 'number',
    required: false,
    default_value: 20,
  },
  next_cursor: {
    type: 'string',
    required: false,
  },
  block_id: {
    type: 'string',
    required: true,
    get_allowed_values: getNotionPageAllowedValues,
    allowed_values_creatable: true,
  },
} satisfies TQoreOptions;

const listComments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: NOTION_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, block_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['block_id'],
      ErrorClass: NotionError,
    });

    try {
      const client = createNotionClient(token);
      const { page_size, next_cursor } = obj || {};

      const response = await client.comments.list({
        page_size: page_size || 20,
        start_cursor: next_cursor || undefined,
        block_id: block_id || '',
      });

      return omit(
        {
          ...response,
          results: response.results.map((result) => ({
            ...result,
            plain: result.rich_text.map((text) => text.plain_text).join(' '),
          })),
        },
        ['type', 'comment']
      );
    } catch (error) {
      throw new NotionError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      results: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              plain: {
                type: 'string',
                example_value: 'This is a test comment',
              },
              object: {
                type: 'string',
                example_value: 'block',
              },
              id: {
                type: 'string',
                example_value: '107ba26f-2e25-81f1-8d47-ded9ec80be99',
              },
              parent: {
                type: {
                  type: 'hash',
                  fields: {
                    type: {
                      type: 'string',
                      example_value: 'page_id',
                    },
                    page_id: {
                      type: 'string',
                      example_value: '107ba26f-2e25-8150-ab99-fc7d61b8f011',
                    },
                  },
                },
              },
              created_time: {
                type: 'string',
                example_value: '2024-09-20T14:51:00.000Z',
              },
              last_edited_time: {
                type: 'string',
                example_value: '2024-09-20T14:51:00.000Z',
              },
              created_by: {
                type: {
                  type: 'hash',
                  fields: {
                    object: {
                      type: 'string',
                      example_value: 'user',
                    },
                    id: {
                      type: 'string',
                      example_value: '105d872b-594c-811f-93c6-0027f7d2d6d3',
                    },
                  },
                },
              },
              last_edited_by: {
                type: {
                  type: 'hash',
                  fields: {
                    object: {
                      type: 'string',
                      example_value: 'user',
                    },
                    id: {
                      type: 'string',
                      example_value: '105d872b-594c-811f-93c6-0027f7d2d6d3',
                    },
                  },
                },
              },
              has_children: {
                type: 'bool',
                example_value: false,
              },
              archived: {
                type: 'bool',
                example_value: false,
              },
              in_trash: {
                type: 'bool',
                example_value: false,
              },
              type: {
                type: 'string',
                example_value: 'paragraph',
              },
              paragraph: {
                type: {
                  type: 'hash',
                  fields: {
                    rich_text: {
                      type: {
                        type: 'list',
                        element_type: {
                          type: 'hash',
                          fields: {
                            type: {
                              type: 'string',
                              example_value: 'text',
                            },
                            text: {
                              type: {
                                type: 'hash',
                                fields: {
                                  content: {
                                    type: 'string',
                                    example_value: 'This is a test comment',
                                  },
                                  link: {
                                    type: 'string',
                                    example_value: 'https://example.com',
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
                                    example_value: false,
                                  },
                                  italic: {
                                    type: 'bool',
                                    example_value: false,
                                  },
                                  strikethrough: {
                                    type: 'bool',
                                    example_value: false,
                                  },
                                  underline: {
                                    type: 'bool',
                                    example_value: false,
                                  },
                                  code: {
                                    type: 'bool',
                                    example_value: false,
                                  },
                                  color: {
                                    type: 'string',
                                    example_value: 'default',
                                  },
                                },
                              },
                            },
                            plain_text: {
                              type: 'string',
                              example_value: 'This is a test comment',
                            },
                          },
                        },
                      },
                    },
                    color: {
                      type: 'string',
                      example_value: 'default',
                    },
                  },
                },
              },
            },
          },
        },
        display_name: 'Results',
        short_desc: 'The results of the get comments',
        desc: 'The results of the get comments',
        example_value: [
          {
            object: 'block',
            id: '107ba26f-2e25-81f1-8d47-ded9ec80be99',
            parent: {
              type: 'page_id',
              page_id: '107ba26f-2e25-8150-ab99-fc7d61b8f011',
            },
            created_time: '2024-09-20T14:51:00.000Z',
            last_edited_time: '2024-09-20T14:51:00.000Z',
            created_by: { object: 'user', id: '105d872b-594c-811f-93c6-0027f7d2d6d3' },
            last_edited_by: { object: 'user', id: '105d872b-594c-811f-93c6-0027f7d2d6d3' },
            has_children: false,
            archived: false,
            in_trash: false,
            type: 'paragraph',
            paragraph: {
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
              color: 'default',
            },
          },
        ],
      },
      next_cursor: {
        type: 'string',
        example_value: 'd8f3f8c2-1dd2-4e9f-9a4d-3c8e4e5f6b7a',
      },
      has_more: {
        type: 'bool',
        example_value: false,
      },
    },
  },
});

export default listComments;
