import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { IQoreConnectionOptions } from '../zendesk';
import eSignature from '../../schemas/esignature.swagger.json';

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

export const ESIGNATURE_PATHS = [
  '/v2.1/accounts/{accountId}/envelopes',
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}',
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients',
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents',
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}',
  '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/views/recipient',
  /**
   * Template actions temporary removed
   */
  // '/v2.1/accounts/{accountId}/templates',
  // '/v2.1/accounts/{accountId}/templates/{templateId}',
  '/v2.1/accounts/{accountId}/brands',
];

export const ESIGNATURE_ACTIONS = buildActionsFromSwaggerSchema(
  eSignature as OpenAPIV2.Document,
  ESIGNATURE_PATHS
);
