import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import confluence from '../../../schemas/confluence.swagger.json';
import { CONFLUENCE_APP_NAME } from '../constants';
import { getConfluencePageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { getConfluenceSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getConfluenceLabelIdAllowedValues } from '../helpers/get-label-id-allowed-values';
import { confluencePaginationResponseConverter } from '../helpers/constants';

export const CONFLUENCE_PAGES_ALLOWED_PATHS = {
  '/pages': {
    GET: {
      override_options: {
        'space-id': {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
      },
      response_data_converter: confluencePaginationResponseConverter,
    },
    POST: {
      override_options: {
        spaceId: {
          type: 'softstring',
          get_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
        parentId: {
          type: 'softstring',
          get_allowed_values: getConfluencePageIdAllowedValues,
        },
        title: {
          required: true,
        },
      },
    },
  },
  '/pages/{id}': {
    GET: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluencePageIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluencePageIdAllowedValues,
        },
        spaceId: {
          type: 'softstring',
          get_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
        parentId: {
          type: 'softstring',
          get_allowed_values: getConfluencePageIdAllowedValues,
        },
      },
    },
    DELETE: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluencePageIdAllowedValues,
        },
      },
    },
  },
  '/pages/{id}/title': {
    PUT: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluencePageIdAllowedValues,
        },
      },
    },
  },
  '/spaces/{id}/pages': {
    GET: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
      },
      response_data_converter: confluencePaginationResponseConverter,
    },
  },
  '/labels/{id}/pages': {
    GET: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceLabelIdAllowedValues,
        },
        'space-id': {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
      },
      response_data_converter: confluencePaginationResponseConverter,
    },
  },
} satisfies TAllowedPaths;

export const CONFLUENCE_PAGES_ACTIONS = buildActionsFromSwaggerSchema({
  schema: confluence as unknown as OpenAPIV2.Document,
  allowedPaths: CONFLUENCE_PAGES_ALLOWED_PATHS,
  app: CONFLUENCE_APP_NAME,
});
