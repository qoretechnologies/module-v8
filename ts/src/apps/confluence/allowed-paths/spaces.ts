import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import confluence from '../../../schemas/confluence.swagger.json';
import { CONFLUENCE_APP_NAME } from '../constants';
import { getConfluenceLabelIdAllowedValues } from '../helpers/get-label-id-allowed-values';
import { getConfluenceSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';
import { confluencePaginationResponseConverter } from '../helpers/constants';

export const CONFLUENCE_SPACES_ALLOWED_PATHS = {
  '/spaces': {
    GET: {
      response_data_converter: confluencePaginationResponseConverter,
    },
  },
  '/spaces/{id}': {
    GET: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
        labels: {
          type: {
            type: 'list',
            element_type: 'softstring',
          },
          get_element_allowed_values: getConfluenceLabelIdAllowedValues,
        },
      },
    },
  },
} satisfies TAllowedPaths;

export const CONFLUENCE_SPACES_ACTIONS = buildActionsFromSwaggerSchema({
  schema: confluence as unknown as OpenAPIV2.Document,
  allowedPaths: CONFLUENCE_SPACES_ALLOWED_PATHS,
  app: CONFLUENCE_APP_NAME,
});
