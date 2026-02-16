import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import freshDeskSchema from '../../../schemas/freshdesk.swagger.json';
import { FRESHDESK_APP_NAME } from '../constants';
import { FreshdeskAgentTicketScopeAllowedValues } from '../helpers/agent-ticket-scope-allowed-values';
import { getFreshdeskAgentIdAllowedValues } from '../helpers/get-agent-id-allowed-values';

export const FRESHDESK_AGENTS_ALLOWED_PATHS = {
  '/api/v2/agents': {
    GET: {},
    POST: {
      override_options: {
        email: {
          required: true,
        },
        ticket_scope: {
          allowed_values: FreshdeskAgentTicketScopeAllowedValues,
        },
      },
    },
  },
  '/api/v2/agents/me': {
    GET: {},
  },
  '/api/v2/agents/{id}': {
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskAgentIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskAgentIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/agents/bulk': {
    POST: {
      override_options: {
        'agents.email': {
          required: true,
        },
        'agents.ticket_scope': {
          allowed_values: FreshdeskAgentTicketScopeAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const FRESHDESK_AGENTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: freshDeskSchema,
  allowedPaths: FRESHDESK_AGENTS_ALLOWED_PATHS,
  app: FRESHDESK_APP_NAME,
});
