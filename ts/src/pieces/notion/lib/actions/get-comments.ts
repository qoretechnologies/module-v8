import { Client, collectPaginatedAPI } from '@notionhq/client';
import { notionAuth } from '../..';
import { createAction, Property } from '../../../../core/framework';
import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const getCommentsResponseType = {
  type: 'hash',
  fields: {
    results: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
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
              type: 'boolean',
              example_value: false,
            },
            archived: {
              type: 'boolean',
              example_value: false,
            },
            in_trash: {
              type: 'boolean',
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
                                  type: 'boolean',
                                  example_value: false,
                                },
                                italic: {
                                  type: 'boolean',
                                  example_value: false,
                                },
                                strikethrough: {
                                  type: 'boolean',
                                  example_value: false,
                                },
                                underline: {
                                  type: 'boolean',
                                  example_value: false,
                                },
                                code: {
                                  type: 'boolean',
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
  },
} satisfies TQoreResponseType;

export const getComments = createAction({
  auth: notionAuth,
  name: 'get_comments',
  displayName: 'Get Comments',
  description: 'Retrieve a list of comments for a block',
  responseType: getCommentsResponseType,
  props: {
    blockId: Property.ShortText({
      displayName: 'Block ID',
      description: 'The ID of the block you want to retrieve comments for',
      required: true,
    }),
  },
  async run(context) {
    const { blockId } = context.propsValue;

    const notion = new Client({
      auth: context.auth.access_token,
      notionVersion: '2022-02-22',
    });

    const comments = await collectPaginatedAPI(notion.blocks.children.list, { block_id: blockId });

    return { results: comments };
  },
});
