import { TAllowedPaths } from '@qoretechnologies/ts-toolkit';
import { OpenAPIV2 } from 'openapi-types';
import { buildActionsFromSwaggerSchema } from '../../../global/helpers';
import confluence from '../../../schemas/confluence.swagger.json';
import { CONFLUENCE_APP_NAME } from '../constants';
import { confluencePaginationResponseConverter } from '../helpers/constants';
import { getConfluenceBlogpostIdAllowedValues } from '../helpers/get-blogpost-id-allowed-values';
import { getConfluenceLabelIdAllowedValues } from '../helpers/get-label-id-allowed-values';
import { getConfluenceSpaceIdAllowedValues } from '../helpers/get-space-id-allowed-values';

export const CONFLUENCE_BLOG_POSTS_ALLOWED_PATHS = {
  '/blogposts': {
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
        title: {
          required: true,
        },
      },
    },
  },
  '/blogposts/{id}': {
    GET: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceBlogpostIdAllowedValues,
        },
      },
    },
    PUT: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceBlogpostIdAllowedValues,
        },
        spaceId: {
          type: 'softstring',
          get_allowed_values: getConfluenceSpaceIdAllowedValues,
        },
      },
      request_data_converter: (req) => {
        const id = req?.query?.id;

        return {
          ...req,
          body: {
            ...req.body,
            id,
          },
        };
      },
    },
    DELETE: {
      override_options: {
        id: {
          type: 'softstring',
          get_allowed_values: getConfluenceBlogpostIdAllowedValues,
        },
      },
    },
  },
  '/spaces/{id}/blogposts': {
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
  '/labels/{id}/blogposts': {
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

export const CONFLUENCE_BLOG_POSTS_ACTIONS = buildActionsFromSwaggerSchema({
  schema: confluence as unknown as OpenAPIV2.Document,
  allowedPaths: CONFLUENCE_BLOG_POSTS_ALLOWED_PATHS,
  app: CONFLUENCE_APP_NAME,
});
