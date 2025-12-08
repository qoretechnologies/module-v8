import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const OutlookSearchEmailResponseType = {
  type: 'list',
  element_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      createdDateTime: { type: 'string' },
      lastModifiedDateTime: { type: 'string' },
      receivedDateTime: { type: 'string' },
      sentDateTime: { type: 'string' },
      subject: { type: 'string' },
      bodyPreview: { type: 'string' },
      importance: { type: 'string' },
      hasAttachments: { type: 'bool' },
      isRead: { type: 'bool' },
      isDraft: { type: 'bool' },
      body: {
        type: {
          type: 'hash',
          fields: {
            contentType: { type: 'string' },
            content: { type: 'string' },
          },
        },
      },
      from: {
        type: {
          type: 'hash',
          fields: {
            emailAddress: {
              type: {
                type: 'hash',
                fields: {
                  name: { type: 'string' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
      },
      toRecipients: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              emailAddress: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      ccRecipients: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              emailAddress: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      bccRecipients: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              emailAddress: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    address: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      attachments: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              contentType: { type: 'string' },
              size: { type: 'number' },
              isInline: { type: 'bool' },
              contentBytes: { type: 'string' },
            },
          },
        },
      },
      webLink: { type: 'string' },
    },
  },
} satisfies TQoreResponseType;
