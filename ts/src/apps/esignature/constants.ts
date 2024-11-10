import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { TAllowedPaths, IQoreSharedObject, TQoreType } from '../../global/models/qore';
import eSignature from '../../schemas/esignature.swagger.json';
import { IQoreConnectionOptions } from '../zendesk';

export const ESIGNATURE_APP_NAME = 'DocusignESignature';

export const ESIGNATURE_CONN_OPTIONS = {
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
} satisfies IQoreConnectionOptions;

const GetEnvelopeIdAllowedValues: Partial<IQoreSharedObject<TQoreType, unknown>> = {
  rest_get_allowed_values: {
    method: 'GET',
    path: 'envelopes?from_date=2010-01-01',
    values: 'body.envelopes.envelopeId',
  },
};

export const ESIGNATURE_PATHS: TAllowedPaths = {
  '/v2.1/accounts/{accountId}/envelopes': {
    GET: {},
    POST: {
      override_options: {
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
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients': {
    DELETE: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    POST: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents': {
    DELETE: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    PUT: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}': {
    PUT: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
    GET: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/views/recipient': {
    POST: {
      override_options: {
        envelopeId: GetEnvelopeIdAllowedValues,
      },
    },
  },
  '/v2.1/accounts/{accountId}/brands': {
    DELETE: {},
    POST: {},
    GET: {},
  },
};

export const ESIGNATURE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: eSignature as OpenAPIV2.Document,
  allowedPaths: ESIGNATURE_PATHS,
  app: ESIGNATURE_APP_NAME,
});
