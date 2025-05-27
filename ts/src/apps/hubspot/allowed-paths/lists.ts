import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import hubspotLists from '../../../schemas/hubspot/lists.swagger.json';
import { HUBSPOT_APP_NAME } from '../constants';
import { getHubspotFolderAllowedValues } from '../helpers/get-list-folder-allowed-values';
import { getHubspotListAllowedValues } from '../helpers/get-list-id-allowed-values';
import { getHubspotListObjectIdAllowedValues } from '../helpers/get-list-object-id-allowed-values';
import { getHubspotObjectTypeAllowedValues } from '../helpers/get-object-type-allowed-values';
import { hubspotListTypeAllowedValues } from '../helpers/list-processing-type-allowed-values';
import { hubspotListSortAllowedValues } from '../helpers/list-search-sort-allowed-values';

export const HUBSPOT_LISTS_ALLOWED_PATHS = {
  '/crm/v3/lists/': {
    POST: {
      override_options: {
        objectTypeId: {
          get_allowed_values: getHubspotObjectTypeAllowedValues,
        },
        processingType: {
          allowed_values: hubspotListTypeAllowedValues,
        },
        listFolderId: {
          get_allowed_values: getHubspotFolderAllowedValues,
        },
      },
    },
  },
  '/crm/v3/lists/search': {
    POST: {
      override_options: {
        listIds: {
          get_element_allowed_values: getHubspotListAllowedValues,
        },
        processingTypes: {
          element_allowed_values: hubspotListTypeAllowedValues,
        },
        sort: {
          allowed_values: hubspotListSortAllowedValues,
        },
      },
    },
  },
  '/crm/v3/lists/{listId}': {
    GET: {
      override_options: {
        listId: {
          get_allowed_values: getHubspotListAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        listId: {
          get_allowed_values: getHubspotListAllowedValues,
        },
      },
    },
  },
  '/crm/v3/lists/{listId}/memberships/add': {
    PUT: {
      override_options: {
        listId: {
          get_allowed_values: getHubspotListAllowedValues,
        },
        body: {
          get_element_allowed_values: getHubspotListObjectIdAllowedValues,
        },
      },
    },
  },
  '/crm/v3/lists/{listId}/memberships/add-from/{sourceListId}': {
    PUT: {
      override_options: {
        listId: {
          get_allowed_values: getHubspotListAllowedValues,
        },
        sourceListId: {
          get_allowed_values: getHubspotListAllowedValues,
        },
      },
    },
  },
  '/crm/v3/lists/{listId}/memberships/remove': {
    PUT: {
      override_options: {
        listId: {
          get_allowed_values: getHubspotListAllowedValues,
        },
        body: {
          get_element_allowed_values: getHubspotListObjectIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const HUBSPOT_LISTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: hubspotLists as unknown as OpenAPIV2.Document,
  schemaPath: 'lists',
  allowedPaths: HUBSPOT_LISTS_ALLOWED_PATHS,
  app: HUBSPOT_APP_NAME,
});
