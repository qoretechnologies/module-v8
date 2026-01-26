import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import xeroProjects from '../../../schemas/xero/projects.swagger.json';
import { OpenAPIV2 } from 'openapi-types';
import { XERO_APP_NAME } from '../constants';
import { getXeroTenantIdAllowedValues } from '../helpers/get-tenant-id-allowed-values';
import { getXeroContactIdAllowedValues } from '../helpers/get-contact-id-allowed-values';
import { getXeroProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';

export const XERO_PROJECTS_ALLOWED_PATHS = {
  '/ProjectsUsers': {
    GET: {},
  },
  '/Projects': {
    GET: {
      override_options: {
        ContactID: {
          get_allowed_values: getXeroContactIdAllowedValues,
        },
        ProjectIds: {
          type: {
            type: 'list',
            element_type: 'string',
          },
          get_element_allowed_values: getXeroProjectIdAllowedValues,
        },
      },
      request_data_converter: (req) => {
        const { query, ...rest } = req;
        const { ProjectIds, ...restQuery } = query;

        return {
          ...rest,
          query: {
            ...restQuery,
            ...(ProjectIds?.length && {
              ProjectIds: ProjectIds.join(','),
            }),
          },
        };
      },
    },
    POST: {
      override_options: {
        contactId: {
          required: true,
          get_allowed_values: getXeroContactIdAllowedValues,
        },
      },
    },
  },
  '/Projects/{projectId}/Tasks': {
    GET: {
      override_options: {
        projectId: {
          get_allowed_values: getXeroProjectIdAllowedValues,
        },
      },
    },
    POST: {
      override_options: {
        projectId: {
          get_allowed_values: getXeroProjectIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const XERO_PROJECTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: xeroProjects as unknown as OpenAPIV2.Document,
  schemaPath: 'projects',
  allowedPaths: XERO_PROJECTS_ALLOWED_PATHS,
  app: XERO_APP_NAME,
  globalOptionsOverride: {
    'Xero-Tenant-Id': {
      type: 'string',
      get_allowed_values: getXeroTenantIdAllowedValues,
    },
  },
});
