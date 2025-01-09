import { IQoreAppActionOption } from '../../../global/models/qore';

export const jiraDocumentFormatOption = {
  required: true,
  type: {
    type: 'hash',
    fields: {
      version: {
        required: true,
        type: 'number',
        default_value: 1,
      },
      type: {
        required: true,
        type: 'string',
        default_value: 'doc',
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
