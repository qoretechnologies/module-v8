import { TQoreResponseType } from '@qoretechnologies/ts-toolkit';

export const ShopifyCreateGiftCardResponseType = {
  type: 'hash',
  fields: {
    giftCard: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            required: true,
            desc: 'The ID of the created gift card',
          },
          createdAt: {
            type: 'date',
            required: false,
            desc: 'The date and time when the gift card was created',
          },
          expiresOn: {
            type: 'date',
            required: false,
            desc: 'The date when the gift card expires',
          },
          balance: {
            type: {
              type: 'hash',
              fields: {
                amount: {
                  type: 'string',
                  required: false,
                  desc: 'The amount of the balance',
                },
                currencyCode: {
                  type: 'string',
                  required: false,
                  desc: 'The currency code of the balance',
                },
              },
            },
            required: false,
            desc: 'The current balance of the gift card',
          },
          initialValue: {
            type: {
              type: 'hash',
              fields: {
                amount: {
                  type: 'string',
                  required: false,
                  desc: 'The amount of the initial value',
                },
                currencyCode: {
                  type: 'string',
                  required: false,
                  desc: 'The currency code of the initial value',
                },
              },
            },
            required: false,
            desc: 'The initial value of the gift card',
          },
          enabled: {
            type: 'bool',
            required: false,
            desc: 'Whether the gift card is enabled',
          },
          maskedCode: {
            type: 'string',
            required: false,
            desc: 'The masked code of the gift card',
          },
          lastCharacters: {
            type: 'string',
            required: false,
            desc: 'The last characters of the gift card code',
          },
          note: {
            type: 'string',
            required: false,
            desc: 'The note associated with the gift card',
          },
          templateSuffix: {
            type: 'string',
            required: false,
            desc: 'The template suffix of the gift card',
          },
          customer: {
            type: {
              type: 'hash',
              fields: {
                id: {
                  type: 'string',
                  required: true,
                  desc: 'The ID of the customer',
                },
                firstName: {
                  type: 'string',
                  required: false,
                  desc: 'The first name of the customer',
                },
                lastName: {
                  type: 'string',
                  required: false,
                  desc: 'The last name of the customer',
                },
                email: {
                  type: 'string',
                  required: false,
                  desc: 'The email of the customer',
                },
              },
            },
            required: false,
            desc: 'The customer who will receive the gift card',
          },
          recipientAttributes: {
            type: {
              type: 'hash',
              fields: {
                recipient: {
                  type: {
                    type: 'hash',
                    fields: {
                      id: {
                        type: 'string',
                        required: true,
                        desc: 'The ID of the recipient',
                      },
                      firstName: {
                        type: 'string',
                        required: false,
                        desc: 'The first name of the recipient',
                      },
                      lastName: {
                        type: 'string',
                        required: false,
                        desc: 'The last name of the recipient',
                      },
                      email: {
                        type: 'string',
                        required: false,
                        desc: 'The email of the recipient',
                      },
                    },
                  },
                  required: false,
                  desc: 'The recipient of the gift card notification',
                },
                message: {
                  type: 'string',
                  required: false,
                  desc: 'The message to include in the gift card notification',
                },
                preferredName: {
                  type: 'string',
                  required: false,
                  desc: 'The preferred name of the recipient for the gift card notification',
                },
                sendNotificationAt: {
                  type: 'date',
                  required: false,
                  desc: 'When the gift card notification will be sent',
                },
              },
            },
            required: false,
            desc: 'The attributes for the gift card recipient',
          },
        },
      },
      required: true,
      desc: 'The created gift card',
    },
    userErrors: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: {
            field: {
              type: 'string',
              required: false,
              desc: 'The field that caused the error',
            },
            message: {
              type: 'string',
              required: true,
              desc: 'The error message',
            },
            code: {
              type: 'string',
              required: false,
              desc: 'The error code',
            },
          },
        },
      },
      required: false,
      desc: 'Errors that occurred during the operation',
    },
  },
} as const satisfies TQoreResponseType;
