import { TAllowedPaths } from '../../global/models/qore';

export const ZENDESK_SWAGGER_API_PATH = '/api/v2/';

export const ZENDESK_ALLOWED_PATHS: TAllowedPaths = {
  [`${ZENDESK_SWAGGER_API_PATH}tickets/{ticket_id}`]: {
    GET: {},
    PUT: {},
    DELETE: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}tickets`]: {
    GET: {},
    POST: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}tickets/count`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}groups/{group_id}`]: {
    DELETE: {},
    GET: {},
    PUT: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}groups`]: {
    GET: {},
    POST: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}attachments/{attachment_id}`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}uploads/{token}`]: {
    DELETE: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}users/{user_id}`]: {
    DELETE: {},
    PUT: {},
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}users`]: {
    POST: {},
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}organizations/{organization_id}`]: {
    DELETE: {},
    GET: {},
    PUT: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}organizations`]: {
    POST: {},
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}account/settings`]: {
    GET: {},
    PUT: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}search`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}ticket_metrics`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}ticket_metrics/{ticket_metric_id}`]: {
    GET: {},
  },
};
