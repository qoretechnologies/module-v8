import { buildAppSchemaActions } from '../../../schema-cache/app-actions';
import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_APP_NAME } from '../constants';
import {
  getFreshdeskTicketIdAllowedValues,
  getFreshdeskTicketPriorityAllowedValues,
  getFreshdeskTicketSourceAllowedValues,
  getFreshdeskTicketStatusAllowedValues,
} from '../helpers/get-ticket-allowed-values';

export const FRESHDESK_TICKETS_ALLOWED_PATHS = {
  '/api/v2/tickets': {
    GET: {},
    POST: {
      override_options: {
        priority: {
          required: true,
          get_allowed_values: getFreshdeskTicketPriorityAllowedValues,
          allowed_values_creatable: true,
        },
        status: {
          required: true,
          get_allowed_values: getFreshdeskTicketStatusAllowedValues,
          allowed_values_creatable: true,
        },
        source: {
          required: false,
          get_allowed_values: getFreshdeskTicketSourceAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/tickets/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskTicketIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskTicketIdAllowedValues,
          allowed_values_creatable: true,
        },
        priority: {
          required: false,
          get_allowed_values: getFreshdeskTicketPriorityAllowedValues,
          allowed_values_creatable: true,
        },
        status: {
          required: false,
          get_allowed_values: getFreshdeskTicketStatusAllowedValues,
          allowed_values_creatable: true,
        },
        source: {
          required: false,
          get_allowed_values: getFreshdeskTicketSourceAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskTicketIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/tickets/{id}/notes': {
    POST: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskTicketIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/tickets/{id}/summary': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskTicketIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskTicketIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskTicketIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const FRESHDESK_TICKETS_ACTIONS = buildAppSchemaActions('freshdesk', {
  allowedPaths: FRESHDESK_TICKETS_ALLOWED_PATHS,
  app: FRESHDESK_APP_NAME,
});
