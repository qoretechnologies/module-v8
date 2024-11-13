import { TAllowedPaths } from '../../global/models/qore';
import { getAgentIdAllowedValues } from './helpers/get-agent-id-allowed-values';
import { getGroupIdAllowedValues } from './helpers/get-group-id-allowed-values';
import { getTicketIdAllowedValues } from './helpers/get-ticket-id-allowed-values';
import { getTicketMetricIdAllowedValues } from './helpers/get-ticket-metric-id-allowed-values';
import { getUserIdAllowedValues } from './helpers/get-user-id-allowed-values';

export const ZENDESK_SWAGGER_API_PATH = '/api/v2/';

const UserRoleAllowedValues = [{ value: 'end-user' }, { value: 'agent' }, { value: 'admin' }];

export const ZENDESK_ALLOWED_PATHS: TAllowedPaths = {
  [`${ZENDESK_SWAGGER_API_PATH}tickets/{ticket_id}`]: {
    GET: {
      override_options: {
        ticket_id: {
          get_allowed_values: getTicketIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        ticket_id: {
          get_allowed_values: getTicketIdAllowedValues,
        },
        comment: {
          required: false,
          type: {
            body: {
              name: 'body',
              type: 'string',
              required: true,
            },
            html_body: {
              name: 'html_body',
              type: 'string',
              required: false,
            },
            public: {
              name: 'public',
              type: 'boolean',
              required: false,
            },
          },
        },
        group_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
        organization_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
        assignee_id: {
          get_allowed_values: getAgentIdAllowedValues,
        },
        requester_id: {
          get_allowed_values: getUserIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        ticket_id: {
          get_allowed_values: getTicketIdAllowedValues,
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}tickets`]: {
    GET: {},
    POST: {
      override_options: {
        comment: {
          required: true,
          type: {
            body: {
              name: 'body',
              type: 'string',
              required: true,
            },
            html_body: {
              name: 'html_body',
              type: 'string',
              required: false,
            },
            public: {
              name: 'public',
              type: 'boolean',
              required: false,
            },
          },
        },
        subject: {
          required: true,
        },
        group_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
        organization_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
        assignee_id: {
          get_allowed_values: getAgentIdAllowedValues,
        },
        requester_id: {
          get_allowed_values: getUserIdAllowedValues,
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}tickets/count`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}groups/{group_id}`]: {
    DELETE: {
      override_options: {
        group_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        group_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        group_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
        group: {
          required: true,
          type: {
            name: {
              name: 'name',
              type: 'string',
              required: true,
            },
            description: {
              name: 'description',
              type: 'string',
              required: false,
            },
            default: {
              name: 'default',
              type: 'boolean',
              required: false,
            },
            is_public: {
              name: 'is_public',
              type: 'boolean',
              required: false,
            },
            user_ids: {
              name: 'user_ids',
              type: 'list',
              required: false,
            },
          },
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}groups`]: {
    GET: {},
    POST: {
      override_options: {
        group: {
          required: true,
          type: {
            name: {
              name: 'name',
              type: 'string',
              required: true,
            },
            description: {
              name: 'description',
              type: 'string',
              required: false,
            },
            default: {
              name: 'default',
              type: 'boolean',
              required: false,
            },
            is_public: {
              name: 'is_public',
              type: 'boolean',
              required: false,
            },
            user_ids: {
              name: 'user_ids',
              type: 'list',
              required: false,
            },
          },
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}attachments/{attachment_id}`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}uploads/{token}`]: {
    DELETE: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}users/{user_id}`]: {
    DELETE: {
      override_options: {
        user_id: {
          get_allowed_values: getUserIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        user_id: {
          get_allowed_values: getUserIdAllowedValues,
        },
        user: {
          required: true,
          type: {
            name: {
              name: 'name',
              type: 'string',
              required: true,
            },
            email: {
              name: 'email',
              type: 'string',
              required: false,
            },
            phone: {
              name: 'phone',
              type: 'string',
              required: false,
            },
            notes: {
              name: 'notes',
              type: 'string',
              required: false,
            },
            details: {
              name: 'details',
              type: 'string',
              required: false,
            },
            role: {
              name: 'role',
              type: 'string',
              required: false,
              allowed_values: UserRoleAllowedValues,
            },
            organization_ids: {
              name: 'organization_ids',
              type: 'list',
              required: false,
            },
          },
        },
      },
    },
    GET: {
      override_options: {
        user_id: {
          get_allowed_values: getUserIdAllowedValues,
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}users`]: {
    POST: {
      override_options: {
        user: {
          required: true,
          type: {
            name: {
              name: 'name',
              type: 'string',
              required: true,
            },
            email: {
              name: 'email',
              type: 'string',
              required: false,
            },
            phone: {
              name: 'phone',
              type: 'string',
              required: false,
            },
            notes: {
              name: 'notes',
              type: 'string',
              required: false,
            },
            details: {
              name: 'details',
              type: 'string',
              required: false,
            },
            role: {
              name: 'role',
              type: 'string',
              required: false,
              allowed_values: UserRoleAllowedValues,
            },
            organization_ids: {
              name: 'organization_ids',
              type: 'list',
              required: false,
            },
          },
        },
      },
    },
    GET: {
      override_options: {
        role: {
          allowed_values: UserRoleAllowedValues,
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}organizations/{organization_id}`]: {
    DELETE: {
      override_options: {
        organization_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
      },
    },
    GET: {
      override_options: {
        organization_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        organization_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
        name: {
          type: 'string',
          required: false,
        },
        group_id: {
          type: 'string',
          get_allowed_values: getGroupIdAllowedValues,
        },
        notes: {
          type: 'string',
          required: false,
        },
        details: {
          type: 'string',
          required: false,
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}organizations`]: {
    POST: {
      override_options: {
        name: {
          required: true,
        },
        group_id: {
          get_allowed_values: getGroupIdAllowedValues,
        },
      },
    },
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}account/settings`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}search`]: {
    GET: {
      override_options: {
        query: {
          required: true,
        },
        sort_order: {
          allowed_values: [{ value: 'asc' }, { value: 'desc' }],
        },
        sort_by: {
          allowed_values: [
            { value: 'ticket_type' },
            { value: 'created_at' },
            { value: 'updated_at' },
            { value: 'priority' },
            { value: 'status' },
            { value: 'relevance' },
          ],
        },
      },
    },
  },
  [`${ZENDESK_SWAGGER_API_PATH}ticket_metrics`]: {
    GET: {},
  },
  [`${ZENDESK_SWAGGER_API_PATH}ticket_metrics/{ticket_metric_id}`]: {
    GET: {
      override_options: {
        ticket_metric_id: {
          get_allowed_values: getTicketMetricIdAllowedValues,
        },
      },
    },
  },
};
