import {
  TAllowedPaths,
  TCustomConnOptions,
  TQoreAppActionOverrideOption,
  TQoreFile,
} from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import eSignature from '../../schemas/esignature.swagger.json';
import { getEsignatureDocumentIdAllowedValues } from './helpers/get-document-id-allowed-values';
import { getEsignatureEnvelopeIdAllowedValues } from './helpers/get-envelope-id-allowed-values';
import { getEsignatureFolderIdAllowedValues } from './helpers/get-folder-id-allowed-values';
import { getEsignatureRecipientIdAllowedValues } from './helpers/get-recipient-id-allowed-values';
import * as mime from 'mime-types';

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
} satisfies TCustomConnOptions;

export const GetAccountIdConfig = {
  get_allowed_values: function (ctx) {
    if (!ctx?.conn_opts?.accounts) {
      throw new Error('No accounts found in the connection options for eSignature');
    }

    return ctx.conn_opts.accounts.map((info: any) => {
      return {
        display_name: info.account_name,
        short_desc: info.account_id,
        value: info.account_id,
      };
    });
  },
  get_default_value: function (ctx) {
    const accountId = ctx?.conn_opts?.account_id;
    if (!accountId) {
      throw new Error('No account ID found in the connection options for eSignature');
    }

    return accountId;
  },
} satisfies TQoreAppActionOverrideOption<typeof ESIGNATURE_CONN_OPTIONS>;

const GetEnvelopeIdAllowedValues = {
  required: true,
  allowed_values_creatable: true,
  rest_get_allowed_values: getEsignatureEnvelopeIdAllowedValues,
} satisfies TQoreAppActionOverrideOption<typeof ESIGNATURE_CONN_OPTIONS>;

export const ESIGNATURE_PATHS = {
  '/v2.1/accounts/{accountId}/envelopes': {
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
        from_date: {
          required_groups: ['get_envelopes'],
        },
        transaction_ids: {
          required_groups: ['get_envelopes'],
        },
        folder_ids: {
          allowed_values_creatable: true,
          required_groups: ['get_envelopes'],
          rest_get_allowed_values: getEsignatureFolderIdAllowedValues,
        },
        envelope_ids: {
          allowed_values_creatable: true,
          required_groups: ['get_envelopes'],
          rest_get_allowed_values: getEsignatureEnvelopeIdAllowedValues,
        },
      },
    },
    POST: {
      request_data_converter: (request) => {
        const { body, ...rest } = request;
        const { documents, ...restBody } = body;

        const convertedDocuments = documents.map((document: TQoreFile, index: number) => {
          const fileExtension = mime.extension(document.mime_type);

          return {
            documentBase64: document.content,
            documentId: ++index,
            fileExtension,
            name: document.name,
          };
        });

        return {
          ...rest,
          body: {
            ...restBody,
            documents: convertedDocuments,
          },
        };
      },
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
          type: {
            type: 'list',
            element_type: 'file',
          },
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
        'signers.name': {
          type: 'string',
          required: false,
        },
        'signers.email': {
          type: 'string',
          required: false,
        },
        'signers.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
        },
        'agents.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
        },
        'editors.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
        },
        'notaries.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
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
        'signers.name': {
          type: 'string',
          required: false,
        },
        'signers.email': {
          type: 'string',
          required: false,
        },
        'signers.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
        },
        'agents.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
        },
        'editors.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
        },
        'notaries.recipientId': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureRecipientIdAllowedValues,
          depends_on: ['envelopeId'],
          required: true,
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
          required: true,
        },
        'documents.documentId': {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureDocumentIdAllowedValues,
        },
        'documents.documentBase64': {
          type: 'string',
          required: false,
        },
        'documents.name': {
          type: 'string',
          required: false,
        },
        'documents.fileExtension': {
          type: 'string',
          required: false,
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
        documentId: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureDocumentIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        accountId: GetAccountIdConfig,
        envelopeId: GetEnvelopeIdAllowedValues,
        documentId: {
          type: 'string',
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getEsignatureDocumentIdAllowedValues,
        },
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
