import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../global/helpers';
import intercom from '../../schemas/intercom.swagger.json';
import { intercomQueryOperatorAllowedValues } from './helpers/constants';
import { getIntercomAdminIdAllowedValues } from './helpers/get-admin-id-allowed-values';
import { getIntercomCollectionIdAllowedValues } from './helpers/get-collection-id-allowed-values';
import { getIntercomCompanyIdAllowedValues } from './helpers/get-company-id-allowed-values';
import { getIntercomContactIdAllowedValues } from './helpers/get-contact-id-allowed-values';
import {
  intercomContactQueryFieldAllowedValues,
  intercomContactQueryFieldValues,
} from './helpers/get-contact-query-allowed-values';
import { getIntercomContactTagsAllowedValues } from './helpers/get-contact-tag-id-allowed-values';
import { getIntercomConversationIdAllowedValues } from './helpers/get-conversation-id-allowed-values';
import { intercomConversationQueryFieldAllowedValues } from './helpers/get-conversation-query-allowed-values';
import {
  getIntercomLeadIdAllowedValues,
  getIntercomUserEmailAllowedValues,
  getIntercomUserExternalIdAllowedValues,
  getIntercomUserIdAllowedValues,
} from './helpers/get-lead-id-allowed-values';
import { getIntercomSectionIdAllowedValues } from './helpers/get-secion-id-allowed-values';
import { getIntercomTagIdAllowedValues } from './helpers/get-tag-id-allowed-values';

export const INTERCOM_APP_NAME = 'Intercom';

export const INTERCOM_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKYXJpYS1sYWJlbD0iSW50ZXJjb20iIHJvbGU9ImltZyIKdmlld0JveD0iMCAwIDUxMiA1MTIiPjxyZWN0CndpZHRoPSI1MTIiIGhlaWdodD0iNTEyIgpyeD0iMTUlIgpmaWxsPSIjMEUyNEQxIi8+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0iTTM2NSAyNzJhMTAgMTAgMCAwMS0xMSAxMCAxMCAxMCAwIDAxLTEwLTEwdi05MWExMCAxMCAwIDAxMTAtMTBjMyAwIDYgMSA4IDNzMyA0IDMgN3Y5MXptLTQgNjNjLTEgMi0zOSAzMy0xMDggMzNzLTEwNi0zMS0xMDgtMzNhMTAgMTAgMCAxMTEzLTE1YzEgMSAzNCAyOCA5NSAyOHM5NS0yOCA5NS0yOGExMCAxMCAwIDAxMTQgMSAxMCAxMCAwIDAxLTEgMTR6TTE0MiAxODFhMTAgMTAgMCAwMTEwLTEwIDEwIDEwIDAgMDExMCAxMHY5MWExMCAxMCAwIDAxLTEwIDEwIDEwIDEwIDAgMDEtMTAtMTB2LTkxem01MC0yMGExMCAxMCAwIDAxMTEtMTAgMTAgMTAgMCAwMTEwIDEwdjEzNWExMCAxMCAwIDAxLTExIDEwIDEwIDEwIDAgMDEtMTAtMTBWMTYxem01MS01YTEwIDEwIDAgMDExMC0xMCAxMCAxMCAwIDAxMTEgMTB2MTQ2YTEwIDEwIDAgMDEtMTEgMTEgMTAgMTAgMCAwMS0xMC0xMVYxNTZ6bTUxIDVhMTAgMTAgMCAwMTEwLTEwIDEwIDEwIDAgMDExMCAxMHYxMzVhMTAgMTAgMCAwMS0xMCAxMCAxMCAxMCAwIDAxLTEwLTEwVjE2MXptNzMtNTZIMTM5YTM4IDM4IDAgMDAtMzUgMjRjLTIgNC0zIDktMyAxNHYyMjhhMzggMzggMCAwMDI0IDM1YzQgMiA5IDMgMTQgM2gyMjhhMzggMzggMCAwMDM1LTI0YzItNCAzLTkgMy0xNFYxNDNhMzggMzggMCAwMC0yMy0zNWwtMTUtMyIvPjwvc3ZnPg==';

export class IntercomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntercomError';
  }
}

export const INTERCOM_ALLOWED_PATHS = {
  '/events': {
    GET: {
      request_data_converter: (req) => {
        const { query, ...rest } = req;
        const { filter, value, ...restQuery } = query;

        return {
          ...rest,
          query: {
            ...restQuery,
            [filter]: value,
          },
        };
      },
      override_options: {
        type: {
          required: true,
          default_value: 'user',
          allowed_values: [
            {
              display_name: 'User',
              value: 'user',
            },
          ],
        },
        filter: {
          type: 'string',
          preselected: true,
          default_value: 'user_id',
          on_change: ['refetch'],
          allowed_values: [
            {
              display_name: 'User ID',
              value: 'user_id',
            },
            {
              display_name: 'Email',
              value: 'email',
            },
            {
              display_name: 'Intercom User ID',
              value: 'intercom_user_id',
            },
          ],
        },
        value: {
          type: 'string',
          required: true,
          depends_on: ['filter'],
          get_allowed_values: (context) => {
            const filter = context?.opts?.filter;
            if (filter === 'user_id') {
              return getIntercomUserExternalIdAllowedValues(context);
            } else if (filter === 'email') {
              return getIntercomUserEmailAllowedValues(context);
            } else if (filter === 'intercom_user_id') {
              return getIntercomUserIdAllowedValues(context);
            }

            return getIntercomUserExternalIdAllowedValues(context);
          },
        },
      },
    },
    POST: {
      override_options: {
        event_name: {
          required: true,
        },
        id: {
          get_allowed_values: getIntercomContactIdAllowedValues,
          required_groups: ['create-event'],
        },
        user_id: {
          get_allowed_values: getIntercomUserExternalIdAllowedValues,
          required_groups: ['create-event'],
        },
        email: {
          get_allowed_values: getIntercomUserEmailAllowedValues,
          required_groups: ['create-event'],
        },
      },
      request_data_converter: (req) => {
        const { body, ...rest } = req;

        if (!body?.created_at) {
          body.created_at = Math.floor(Date.now() / 1000);
        }

        return {
          ...rest,
          body,
        };
      },
    },
  },
  '/companies': {
    POST: {
      override_options: {
        company_id: {
          required: true,
          allowed_values_creatable: true,
          get_allowed_values: getIntercomCompanyIdAllowedValues,
        },
        name: {
          preselected: true,
        },
      },
    },
  },
  '/companies/list': {
    POST: {},
  },
  '/conversations': {
    POST: {
      override_options: {
        'from.type': {
          on_change: ['refetch'],
        },
        'from.id': {
          depends_on: ['from.type'],
          get_allowed_values: (context) => {
            const fromType = context?.opts?.from?.type;
            if (fromType === 'contact') {
              return getIntercomContactIdAllowedValues(context);
            } else if (fromType === 'user') {
              return getIntercomUserIdAllowedValues(context);
            } else if (fromType === 'lead') {
              return getIntercomLeadIdAllowedValues(context);
            }

            return [];
          },
        },
      },
    },
  },
  '/conversations/{id}/reply': {
    POST: {
      request_data_converter: (req) => {
        const { body, ...rest } = req;

        return {
          ...rest,
          body: {
            id: body.from,
            body: body.message,
            message_type: 'comment',
            type: 'admin',
          },
        };
      },
      override_options: {
        id: {
          get_allowed_values: getIntercomConversationIdAllowedValues,
        },
        from: {
          required: true,
          type: 'string',
          get_allowed_values: getIntercomAdminIdAllowedValues,
        },
        message: {
          required: true,
          type: 'string',
        },
      },
    },
  },
  '/conversations/search': {
    POST: {
      request_data_converter: (req) => {
        if (!req || !req?.body?.query) {
          return {
            ...req,
            body: {
              query: {
                field: 'email',
                operator: '~',
                value: '',
              },
            },
          };
        }

        const { body, ...rest } = req;
        const { query, ...restBody } = body;
        let field = query.field;

        if (!intercomContactQueryFieldValues.includes(field)) {
          field = `custom_attributes.${field}`;
        }

        return {
          ...rest,
          body: {
            ...restBody,
            query: {
              ...query,
              field,
            },
          },
        };
      },
      override_options: {
        query: {
          required: false,
          type: {
            type: 'hash',
            fields: {
              field: {
                type: 'string',
                required: true,
                allowed_values_creatable: true,
                allowed_values: intercomConversationQueryFieldAllowedValues,
              },
              operator: {
                type: 'string',
                required: true,
                allowed_values: intercomQueryOperatorAllowedValues,
              },
              value: {
                type: 'any',
                required: true,
              },
            },
          },
        },
      },
    },
  },
  '/contacts/search': {
    POST: {
      request_data_converter: (req) => {
        if (!req || !req?.body?.query) {
          return {
            ...req,
            body: {
              query: {
                field: 'email',
                operator: '~',
                value: '',
              },
            },
          };
        }

        const { body, ...rest } = req;

        const { query, ...restBody } = body;
        let field = query.field;

        if (!intercomContactQueryFieldValues.includes(field)) {
          field = `custom_attributes.${field}`;
        }

        return {
          ...rest,
          body: {
            ...restBody,
            query: {
              ...query,
              field,
            },
          },
        };
      },
      override_options: {
        query: {
          required: false,
          type: {
            type: 'hash',
            fields: {
              field: {
                type: 'string',
                required: true,
                allowed_values_creatable: true,
                allowed_values: intercomContactQueryFieldAllowedValues,
              },
              operator: {
                type: 'string',
                required: true,
                allowed_values: intercomQueryOperatorAllowedValues,
              },
              value: {
                type: 'any',
                required: true,
              },
            },
          },
        },
      },
    },
  },
  '/contacts/{id}/notes': {
    POST: {
      override_options: {
        id: {
          get_allowed_values: getIntercomContactIdAllowedValues,
        },
        admin_id: {
          get_allowed_values: getIntercomAdminIdAllowedValues,
        },
        contact_id: {
          get_allowed_values: getIntercomContactIdAllowedValues,
        },
      },
    },
  },
  '/contacts/{contact_id}/tags': {
    POST: {
      override_options: {
        contact_id: {
          get_allowed_values: getIntercomContactIdAllowedValues,
        },
        id: {
          get_allowed_values: getIntercomTagIdAllowedValues,
        },
      },
    },
  },
  '/contacts/{contact_id}/tags/{id}': {
    DELETE: {
      override_options: {
        contact_id: {
          on_change: ['refetch'],
          get_allowed_values: getIntercomContactIdAllowedValues,
        },
        id: {
          depends_on: ['contact_id'],
          get_allowed_values: getIntercomContactTagsAllowedValues,
        },
      },
    },
  },
  '/articles': {
    GET: {},
    POST: {
      override_options: {
        author_id: {
          get_allowed_values: getIntercomAdminIdAllowedValues,
          type: 'string',
        },
        body: {
          required: true,
        },
        parent_type: {
          on_change: ['refetch'],
          allowed_values: [
            {
              display_name: 'Collection',
              value: 'collection',
            },
            {
              display_name: 'Section',
              value: 'section',
            },
          ],
        },
        parent_id: {
          type: 'string',
          depends_on: ['parent_type'],
          get_allowed_values: (context) => {
            const parentType = context?.opts?.parent_type;

            if (parentType === 'collection') {
              return getIntercomCollectionIdAllowedValues(context);
            } else if (parentType === 'section') {
              return getIntercomSectionIdAllowedValues(context);
            }

            return [];
          },
        },
      },
    },
  },
  '/messages': {
    POST: {
      request_data_converter: (req) => {
        const { body, ...rest } = req;
        const { from, ...restBody } = body;

        return {
          ...rest,
          body: {
            ...restBody,
            from: {
              type: 'admin',
              id: from,
            },
          },
        };
      },
      override_options: {
        to: {
          required: true,
        },
        from: {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: getIntercomAdminIdAllowedValues,
          required: true,
        },
        'to.type': {
          on_change: ['refetch'],
          default_value: 'user',
        },
        'to.id': {
          type: 'string',
          allowed_values_creatable: true,
          get_allowed_values: (context) => {
            const toType = context?.opts?.to?.type;
            if (toType === 'user') {
              return getIntercomUserIdAllowedValues(context);
            } else if (toType === 'lead') {
              return getIntercomLeadIdAllowedValues(context);
            }

            return getIntercomUserIdAllowedValues(context);
          },
        },
        message_type: {
          required: true,
        },
        body: {
          required: true,
        },
      },
    },
  },
  '/tags': {
    GET: {},
  },
} satisfies TAllowedPaths;

export const INTERCOM_ACTIONS = buildActionsFromSwaggerSchema({
  schema: intercom as unknown as OpenAPIV2.Document,
  allowedPaths: INTERCOM_ALLOWED_PATHS,
  app: INTERCOM_APP_NAME,
});
