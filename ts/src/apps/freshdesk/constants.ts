import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import { TCustomConnOptions, TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import freshDeskSchema from '../../schemas/freshdesk.swagger.json';
import { FreshdeskAgentTicketScopeAllowedValues } from './helpers/agent-ticket-scope-allowed-values';
import { getFreshdeskAgentIdAllowedValues } from './helpers/get-agent-id-allowed-values';
import { getFreshdeskCompanyIdAllowedValues } from './helpers/get-company-id-allowed-values';
import { getFreshdeskContactIdAllowedValues } from './helpers/get-contact-id-allowed-values';
import {
  getFreshdeskRecordCurrentValue,
  getFreshdeskRecordIdAllowedValues,
  getFreshdeskRecordVersion,
  getFreshdeskSchemaRecordValue,
} from './helpers/get-record-allowed-values';
import { getFreshdeskSchemaIdAllowedValues } from './helpers/get-schema-id-allowed-values';
import {
  FreshdeskTicketPriorityAllowedValues,
  FreshdeskTicketSourceAllowedValues,
  FreshdeskTicketStatusAllowedValues,
  getFreshdeskTicketIdAllowedValues,
} from './helpers/get-ticket-allowed-values';

export const FRESHDESK_APP_NAME = 'Freshdesk';

export const FRESHDESK_CONN_OPTIONS = {
  subdomain: {
    display_name: 'Subdomain',
    short_desc: 'Your Freshdesk account subdomain',
    desc:
      `To get your Freshdesk subdomain (\`<your_subdomain>.freshdesk.com\`):\n\n` +
      `- Go to your Freshdesk account\n\n` +
      `- Copy the subdomain from the URL`,
    type: 'string',
  },
  apiKey: {
    display_name: 'API Key',
    short_desc: 'Your Freshdesk account API key',
    desc:
      `To get your API key:\n\n` +
      `- Go to your Freshdesk account\n\n` +
      `- On top right corder press on your profile icon\n\n` +
      `- Go to Profile settings\n\n` +
      `- Press View Api Key\n\n` +
      `- Copy your API key`,
    type: 'string',
  },
  url: {
    type: 'string',
  },
  token: {
    type: 'string',
  },
} satisfies TCustomConnOptions;

export const FRESHDESK_ALLOWED_PATHS = {
  '/api/v2/tickets': {
    GET: {},
    POST: {
      override_options: {
        priority: {
          required: true,
          allowed_values: FreshdeskTicketPriorityAllowedValues,
          allowed_values_creatable: true,
        },
        status: {
          required: true,
          allowed_values: FreshdeskTicketStatusAllowedValues,
          allowed_values_creatable: true,
        },
        source: {
          required: false,
          allowed_values: FreshdeskTicketSourceAllowedValues,
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
          allowed_values_creatable: true,
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
  '/api/v2/agents': {
    GET: {},
    POST: {
      override_options: {
        email: {
          required: true,
        },
        ticket_scope: {
          allowed_values: FreshdeskAgentTicketScopeAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/companies/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskCompanyIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskCompanyIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskCompanyIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/companies': {
    GET: {},
    POST: {
      override_options: {
        name: {
          required: true,
        },
      },
    },
  },
  '/api/v2/contacts/{id}/hard_delete': {
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
        force: {
          default_value: true,
        },
      },
    },
  },
  '/api/v2/contacts/{id}': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskContactIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/contacts': {
    GET: {},
    POST: {
      override_options: {
        unique_external_id: {
          required_groups: ['create_contact'],
        },
        twitter_id: {
          required_groups: ['create_contact'],
        },
        email: {
          required_groups: ['create_contact'],
        },
        mobile: {
          required_groups: ['create_contact'],
        },
        phone: {
          required_groups: ['create_contact'],
        },
      },
    },
  },
  '/api/v2/custom_objects/schemas/{id}/fields': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
  },
  '/api/v2/custom_objects/schemas/{schemaId}/records/{id}': {
    GET: {
      override_options: {
        schemaId: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        id: {
          get_allowed_values: getFreshdeskRecordIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['schemaId'],
        },
      },
    },
    PUT: {
      override_options: {
        schemaId: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        id: {
          get_allowed_values: getFreshdeskRecordIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['schemaId'],
        },
        'body.data': {
          get_default_value: getFreshdeskRecordCurrentValue,
          depends_on: ['schemaId', 'id'],
          required: true,
        },
        'body.version': {
          get_default_value: getFreshdeskRecordVersion,
          depends_on: ['schemaId', 'id'],
          required: true,
        },
      },
    },
    DELETE: {
      override_options: {
        schemaId: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        id: {
          get_allowed_values: getFreshdeskRecordIdAllowedValues,
          allowed_values_creatable: true,
          depends_on: ['schemaId'],
        },
      },
    },
  },
  '/api/v2/custom_objects/schemas/{id}/records': {
    GET: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
      },
    },
    POST: {
      override_options: {
        id: {
          get_allowed_values: getFreshdeskSchemaIdAllowedValues,
          allowed_values_creatable: true,
        },
        data: {
          required: true,
          get_default_value: getFreshdeskSchemaRecordValue,
        },
      },
    },
  },
  '/api/v2/custom_objects/schemas': {
    GET: {},
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
          allowed_values: FreshdeskTicketPriorityAllowedValues,
          allowed_values_creatable: true,
        },
        status: {
          required: false,
          allowed_values: FreshdeskTicketStatusAllowedValues,
          allowed_values_creatable: true,
        },
        source: {
          required: false,
          allowed_values: FreshdeskTicketSourceAllowedValues,
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

export const FRESHDESK_ACTIONS = buildActionsFromSwaggerSchema({
  schema: freshDeskSchema,
  allowedPaths: FRESHDESK_ALLOWED_PATHS,
  app: FRESHDESK_APP_NAME,
});
