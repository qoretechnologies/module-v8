import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { TAllowedPaths, IQoreSharedObject, TQoreType } from '../../global/models/qore';
import eSignature from '../../schemas/esignature.swagger.json';
import { IQoreConnectionOptions } from '../zendesk';

export const ESIGNATURE_APP_NAME = 'DocusignESignature';

export const ESIGNATURE_CONN_OPTIONS = {
  accounts: {
    display_name: 'Account Info',
    short_desc: 'Account info to be filled automatically at login',
    desc: 'Account info to be filled automatically at login',
    type: 'list',
  },
  /*
  account_id: {
    display_name: 'Account ID',
    short_desc: 'The account ID',
    desc: 'The account ID',
    type: 'string',
  },
  base_uri: {
    display_name: 'Base URI',
    short_desc: 'The base URI',
    desc: 'The base URI',
    type: 'string',
  },
  */
} satisfies IQoreConnectionOptions;

const GetAccountIdAllowedValues: Partial<IQoreSharedObject<TQoreType, unknown>> = {
  get_allowed_values: function (ctx) {
    return ctx.conn_opts.accounts.map((info: any) => {
      return {
        display_name: info.account_name,
        value: info.account_id,
      };
    });
  },
};

const GetEnvelopeIdAllowedValues: Partial<IQoreSharedObject<TQoreType, unknown>> = {
  rest_get_allowed_values: {
    method: 'GET',
    path: 'envelopes?from_date=2010-01-01',
    values: 'body.envelopes.envelopeId',
  },
};

export const ESIGNATURE_PATHS: TAllowedPaths = {
  '/v2.1/accounts/{accountId}/envelopes': {
    GET: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
      },
    },
    POST: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
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
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients': {
    DELETE: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    POST: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents': {
    DELETE: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}': {
    PUT: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/views/recipient': {
    POST: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/brands': {
    DELETE: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
      },
    },
    POST: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdAllowedValues,
      },
    },
  },
};

export const ESIGNATURE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: eSignature as OpenAPIV2.Document,
  allowedPaths: ESIGNATURE_PATHS,
  app: ESIGNATURE_APP_NAME,
});
