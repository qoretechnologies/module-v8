import { TQoreAppActionOption, TQoreResponseType } from '@qoretechnologies/ts-toolkit';

const transactionFields = {
  id: {
    type: 'string',
    required: true,
    desc: 'The ID of the created transaction',
  },
  name: {
    type: 'string',
    required: false,
    desc: 'The name of the transaction',
  },
  status: {
    type: 'string',
    required: false,
    desc: 'The status of the transaction',
  },
  test: {
    type: 'bool',
    required: false,
    desc: 'Whether this is a test transaction',
  },
  amount: {
    type: {
      type: 'hash',
      fields: {
        amount: {
          type: 'string',
          required: false,
          desc: 'The amount of the transaction',
        },
        currencyCode: {
          type: 'string',
          required: false,
          desc: 'The currency code of the transaction',
        },
      },
    },
    required: false,
    desc: 'The amount of the transaction',
  },
  gateway: {
    type: 'string',
    required: false,
    desc: 'The payment gateway used for the transaction',
  },
  kind: {
    type: 'string',
    required: false,
    desc: 'The kind of the transaction',
  },
  errorCode: {
    type: 'string',
    required: false,
    desc: 'The error code for the transaction',
  },
  createdAt: {
    type: 'date',
    required: false,
    desc: 'The date and time when the transaction was created',
  },
  processedAt: {
    type: 'date',
    required: false,
    desc: 'The date and time when the transaction was processed',
  },
  parentTransaction: {
    type: {
      type: 'hash',
      fields: {
        id: {
          type: 'string',
          required: true,
          desc: 'The ID of the parent transaction',
        },
      },
    },
    required: false,
    desc: 'The parent transaction of this transaction',
  },
} satisfies Record<string, TQoreAppActionOption>;

export const ShopifyCreateTransactionResponseType = {
  type: 'hash',
  fields: {
    transaction: {
      type: {
        type: 'hash',
        fields: transactionFields,
      },
      required: false,
      desc: 'The created transaction',
    },
    transactions: {
      type: {
        type: 'list',
        element_type: {
          type: 'hash',
          fields: transactionFields,
        },
      },
      required: false,
      desc: 'List of created transactions (for refunds)',
    },
    refund: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            required: true,
            desc: 'The ID of the created refund',
          },
          transactions: {
            type: {
              type: 'list',
              element_type: {
                type: 'hash',
                fields: transactionFields,
              },
            },
            required: false,
            desc: 'Transactions associated with the refund',
          },
        },
      },
      required: false,
      desc: 'The created refund',
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
          },
        },
      },
      required: false,
      desc: 'Errors that occurred during the operation',
    },
    order: {
      type: {
        type: 'hash',
        fields: {
          id: {
            type: 'string',
            required: true,
            desc: 'The ID of the order',
          },
        },
      },
      required: false,
      desc: 'The order associated with the transaction',
    },
  },
} as const satisfies TQoreResponseType;
