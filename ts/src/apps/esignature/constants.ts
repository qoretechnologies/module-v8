import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { TAllowedPaths } from '../../global/models/qore';
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

export const ESIGNATURE_PATHS: TAllowedPaths = {
  '/v2.1/accounts/{accountId}/envelopes': {
    GET: {},
    POST: {},
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}': {
    GET: {},
    PUT: {},
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients': {
    DELETE: {},
    POST: {},
    PUT: {},
    GET: {},
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents': {
    DELETE: {},
    PUT: {},
    GET: {},
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}': {
    PUT: {},
    GET: {},
  },
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/views/recipient': {
    POST: { display_name: 'Create Recipient View' },
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
