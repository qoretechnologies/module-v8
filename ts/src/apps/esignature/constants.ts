import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema, createAllowedPaths } from '../../global/helpers';
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

export const ESIGNATURE_PATHS = createAllowedPaths([
  { path: '/v2.1/accounts/{accountId}/envelopes:GET', display_name: 'Get Envelopes' },
  { path: '/v2.1/accounts/{accountId}/envelopes:POST', display_name: 'Create Envelopes' },
  { path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}:GET', display_name: 'Get Envelope' },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}:PUT',
    display_name: 'Update Envelope',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients:DELETE',
    display_name: 'Delete Recipients',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients:POST',
    display_name: 'Add Recipients',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients:PUT',
    display_name: 'Update Recipients',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/recipients:GET',
    display_name: 'Get Recipients',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents:DELETE',
    display_name: 'Delete Documents',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents:PUT',
    display_name: 'Update Documents',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents:GET',
    display_name: 'Get Documents',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}:PUT',
    display_name: 'Update Document',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/documents/{documentId}:GET',
    display_name: 'Get Document',
  },
  {
    path: '/v2.1/accounts/{accountId}/envelopes/{envelopeId}/views/recipient:POST',
    display_name: 'Create Recipient View',
  },
  { path: '/v2.1/accounts/{accountId}/brands:DELETE', display_name: 'Delete Brand' },
  { path: '/v2.1/accounts/{accountId}/brands:POST', display_name: 'Create Brand' },
  { path: '/v2.1/accounts/{accountId}/brands:GET', display_name: 'Get Brands' },
  /**
   * Template actions temporary removed
   */
  // '/v2.1/accounts/{accountId}/templates',
  // '/v2.1/accounts/{accountId}/templates/{templateId}',
]);

export const ESIGNATURE_ACTIONS = buildActionsFromSwaggerSchema(
  eSignature as OpenAPIV2.Document,
  ESIGNATURE_PATHS
);
