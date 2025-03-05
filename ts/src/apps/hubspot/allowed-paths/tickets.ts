import { TAllowedPaths, TQoreAppActionOverrideOption } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotTickets from '../../../schemas/hubspot/tickets.swagger.json';
import { HUBSPOT_APP_NAME, HubspotAssociationsType, hubspotSearchSortsOption } from '../constants';
import { getHubspotTicketAllowedValues } from '../helpers/get-ticket-allowed-value';
import { getHubspotTicketPropertiesAllowedValues } from '../helpers/object-properties-allowed-values';
import { getHubspotTicketIdPropertyAllowedValues } from '../helpers/get-id-property-allowed-values';
import {
  getHubspotTicketPropertiesType,
  getHubspotTicketPropertiesTypeOptional,
} from '../helpers/get-object-properties';

const ticketId = {
  type: 'softstring',
  allowed_values_creatable: true,
  get_allowed_values: getHubspotTicketAllowedValues,
} satisfies TQoreAppActionOverrideOption;

const propertiesQuery = {
  allowed_values_creatable: true,
  get_allowed_values: getHubspotTicketPropertiesAllowedValues,
} satisfies TQoreAppActionOverrideOption;

export const HUBSPOT_TICKETS_ALLOWED_PATHS = {
  '/crm/v3/objects/tickets': {
    GET: {
      override_options: {
        properties: propertiesQuery,
      },
    },
    POST: {
      override_options: {
        associations: HubspotAssociationsType,
        properties: {
          required: true,
          get_dynamic_type: getHubspotTicketPropertiesType,
        },
      },
    },
  },
  '/crm/v3/objects/tickets/batch/upsert': {
    POST: {
      override_options: {
        'inputs.idProperty': {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getHubspotTicketIdPropertyAllowedValues,
        },
        'inputs.properties': {
          required: true,
          get_dynamic_type: getHubspotTicketPropertiesTypeOptional,
        },
      },
    },
  },
  '/crm/v3/objects/tickets/search': {
    POST: {
      override_options: {
        sorts: hubspotSearchSortsOption,
        limit: {
          required: true,
          default_value: 10,
        },
        properties: {
          type: {
            type: 'list',
            element_type: 'string',
            required: false,
          },
          get_allowed_values: getHubspotTicketPropertiesAllowedValues,
        },
      },
    },
  },
  '/crm/v3/objects/tickets/{ticketId}': {
    GET: {
      override_options: {
        ticketId,
        properties: propertiesQuery,
      },
    },
    PATCH: {
      override_options: {
        ticketId,
        properties: {
          required: true,
          get_dynamic_type: getHubspotTicketPropertiesTypeOptional,
        },
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
  schemaPath: 'tickets',
  allowedPaths: HUBSPOT_TICKETS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
