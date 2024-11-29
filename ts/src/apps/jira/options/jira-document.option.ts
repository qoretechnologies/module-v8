import { IQoreAppActionOption } from '../../../global/models/qore';

export const jiraDocumentFormatOption = {
  required: true,
  type: {
    type: 'hash',
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
