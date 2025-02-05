import { IQoreAppActionOption } from '@qoretechnologies/ts-toolkit';

export const jiraDocumentFormatOption = {
  required: true,
  type: {
    type: 'hash',
    default_value: {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Hello ',
            },
            {
              type: 'text',
              text: 'world',
              marks: [
                {
                  type: 'strong',
                },
              ],
            },
          ],
        },
      ],
    },
    fields: {
      version: {
        required: true,
        type: 'number',
      },
      type: {
        required: true,
        type: 'string',
      },
      content: {
        required: true,
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              type: {
                required: true,
                type: 'string',
                default_value: 'paragraph',
              },
              content: {
                required: true,
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      type: {
                        type: 'string',
                        default_value: 'text',
                      },
                      text: {
                        type: 'string',
                      },
                      marks: {
                        type: {
                          type: 'list',
                          element_type: {
                            type: 'hash',
                            fields: {
                              type: {
                                required: true,
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
        example_value: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Hello ',
              },
              {
                type: 'text',
                text: 'world',
                marks: [
                  {
                    type: 'strong',
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
} satisfies IQoreAppActionOption;
