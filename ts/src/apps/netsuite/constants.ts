import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { TAllowedPaths } from '../../global/models/qore';
import netsuite from '../../schemas/netsuite.swagger.json';
import { IQoreConnectionOptions } from '../zendesk';

export const NETSUITE_APP_NAME = 'NetSuite';

export const NETSUITE_CONN_OPTIONS = {
  account_id: {
    display_name: 'Account ID',
    short_desc: 'The account ID',
    desc: 'The account ID',
    type: 'string',
  },
} satisfies IQoreConnectionOptions;

export const NETSUITE_ALLOWED_PATHS = {
  '/account': {
    GET: {},
    POST: {},
  },
  '/account/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/customer': {
    GET: {},
    POST: {},
  },
  '/customer/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/item': {
    GET: {},
    POST: {},
  },
  '/item/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/salesOrder': {
    GET: {},
    POST: {},
  },
  '/salesOrder/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/invoice': {
    GET: {},
    POST: {},
  },
  '/invoice/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/vendor': {
    GET: {},
    POST: {},
  },
  '/vendor/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/purchaseOrder': {
    GET: {},
    POST: {},
  },
  '/purchaseOrder/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
  '/journalEntry': {
    GET: {},
    POST: {},
  },
  '/journalEntry/{id}': {
    GET: {},
    PATCH: {},
    DELETE: {},
  },
} satisfies TAllowedPaths;

export const NETSUITE_ACTIONS = buildActionsFromSwaggerSchema({
  schema: netsuite as any,
  allowedPaths: NETSUITE_ALLOWED_PATHS,
  app: NETSUITE_APP_NAME,
});
