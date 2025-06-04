import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import confluence from '../../../schemas/confluence.swagger.json';
import { CONFLUENCE_APP_NAME } from '../constants';
import { getConfluenceBlogpostIdAllowedValues } from '../helpers/get-blogpost-id-allowed-values';
import { getConfluencePageIdAllowedValues } from '../helpers/get-page-id-allowed-values';
import { getConfluenceSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { getConfluenceTaskIdAllowedValues } from '../helpers/get-task-id-allowed-values';
import { confluencePaginationResponseConverter } from '../helpers/constants';

export const CONFLUENCE_TASKS_ALLOWED_PATHS = {
  '/tasks': {
    GET: {
      override_options: {
        'task-id': {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getConfluenceTaskIdAllowedValues,
        },
        'space-id': {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
        'page-id': {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getConfluencePageIdAllowedValues,
        },
        'blogpost-id': {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getConfluenceBlogpostIdAllowedValues,
        },
      },
      response_data_converter: confluencePaginationResponseConverter,
    },
  },
  '/tasks/{id}': {
    GET: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceTaskIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceTaskIdAllowedValues,
        },
        spaceId: {
          type: 'softstring',
          get_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
        pageId: {
          type: 'softstring',
          get_allowed_values: getConfluencePageIdAllowedValues,
        },
        blogpostId: {
          type: 'softstring',
          get_allowed_values: getConfluenceBlogpostIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const CONFLUENCE_TASKS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: confluence as unknown as OpenAPIV2.Document,
  allowedPaths: CONFLUENCE_TASKS_ALLOWED_PATHS,
  app: CONFLUENCE_APP_NAME,
});
