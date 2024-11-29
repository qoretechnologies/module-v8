import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { TAllowedPaths, TQoreAppActionOverrideOption } from '../../global/models/qore';
import eSignature from '../../schemas/esignature.swagger.json';
import { IQoreConnectionOptions } from '../zendesk';

export const ESIGNATURE_APP_NAME = 'DocusignESignature';

export const ESIGNATURE_CONN_OPTIONS = {
  accounts: {
    display_name: 'Account Info',
    short_desc: 'Account info set when the connection is authorized',
    desc: 'Account info set when the connection is authorized',
    type: 'list',
  },
  account_id: {
    display_name: 'Default Account ID',
    short_desc: 'The default account ID set when the connection is authorized',
    desc: 'The default account ID set when the connection is authorized',
    type: 'string',
  },
  base_uri: {
    display_name: 'Default Base URI',
    short_desc: 'The default base URI set when the connection is authorized',
    desc: 'The default base URI set when the connection is authorized',
    type: 'string',
  },
} satisfies IQoreConnectionOptions;

const GetAccountIdConfig = {
  get_allowed_values: function (ctx) {
    return ctx.conn_opts.accounts.map((info: any) => {
      return {
        display_name: info.account_name,
        value: info.account_id,
      };
    });
  },
  get_default_value: function (ctx) {
    if (ctx.conn_opts.account_id) {
      return ctx.conn_opts.account_id;
    }
  },
} satisfies TQoreAppActionOverrideOption<typeof ESIGNATURE_CONN_OPTIONS>;

const GetEnvelopeIdAllowedValues = {
  rest_get_allowed_values: {
    method: 'GET',
    path: 'envelopes?from_date=2010-01-01',
    values: 'body.envelopes.envelopeId',
    display_names: 'body.envelopes.emailSubject',
  },
} satisfies TQoreAppActionOverrideOption<typeof ESIGNATURE_CONN_OPTIONS>;

export const ESIGNATURE_PATHS = {
  '/v2.1/accounts/{accountId}/envelopes': {
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
      },
    },
    POST: {
      override_options: {
        accountId: GetAccountIdConfig,
        status: {
          required: true,
          allowed_values: [
            {
              display_name: 'sent',
              short_desc: 'Send the envelope to recipients',
              desc: 'Send the envelope to recipients',
              value: 'sent',
            },
            {
              display_name: 'created',
              short_desc: 'Save the envelope as a draft',
              desc: 'Save the envelope as a draft',
              value: 'created',
            },
          ],
          default_value: 'sent',
        },
        emailSubject: {
          required: true,
        },
        documents: {
          required: true,
        },
        recipients: {
          required: true,
        },
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}': {
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients': {
    DELETE: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
        signers: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                name: {
                  type: 'string',
                  required: false,
                },
                email: {
                  type: 'string',
                  required: false,
                },
                recipientId: {
                  type: 'string',
                  required: true,
                },
              },
            },
          },
        },
      },
    },
    POST: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
        signers: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                name: {
                  type: 'string',
                  required: false,
                },
                email: {
                  type: 'string',
                  required: false,
                },
                recipientId: {
                  type: 'string',
                  required: true,
                },
              },
            },
          },
        },
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents': {
    DELETE: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
        documents: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                documentId: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    PUT: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}': {
    PUT: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/views/recipient': {
    POST: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/brands': {
    DELETE: {
      override_options: {
        accountId: GetAccountIdConfig,
      },
    },
    POST: {
      override_options: {
        accountId: GetAccountIdConfig,
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
      },
    },
  },
} satisfies TAllowedPaths<typeof ESIGNATURE_CONN_OPTIONS>;

export const ESIGNATURE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: eSignature as OpenAPIV2.Document,
  allowedPaths: ESIGNATURE_PATHS,
  app: ESIGNATURE_APP_NAME,
});
