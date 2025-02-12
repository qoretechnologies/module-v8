import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotTickets from '../../../schemas/hubspot/tickets.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotTicketAllowedValues } from '../helpers/get-ticket-allowed-value';

const ticketId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotTicketAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_TICKETS_ALLOWED_PATHS = {
  '/crm/v3/objects/tickets': {
    GET: {},
    POST: {},
  },
  '/crm/v3/objects/tickets/batch/upsert': {
    POST: {},
  },
  '/crm/v3/objects/tickets/search': {
    POST: {},
  },
  '/crm/v3/objects/tickets/{ticketId}': {
    GET: {
      override_options: {
        ticketId,
      },
    },
    PATCH: {
      override_options: {
        ticketId,
      },
    },
    DELETE: {
      override_options: {
        ticketId,
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_TICKETS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotTickets as unknown as OpenAPIV2.Document,
  allowedPaths: HUBSPOT_TICKETS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
