import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreOptions,
  TQoreTypeObject,
} from '@qoretechnologies/ts-toolkit';
import {
  ItemsListItemsRequestSortBy,
  ItemsListItemsRequestSortOrder,
} from 'webflow-api/api/resources/collections';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getWebflowCmsLocaleIdAllowedValues } from '../helpers/get-locale-id-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';
import { getWebflowItemFieldsResponseType } from '../helpers/get-item-response-type';

const action = 'list_items';
const options = {
  site: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getWebflowSiteIdAllowedValues,
    on_change: ['refetch'],
  },
  collection: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getWebflowCollectionAllowedValues,
  },
  cmsLocaleId: {
    type: 'string',
    required: false,
    depends_on: ['site'],
    get_allowed_values: getWebflowCmsLocaleIdAllowedValues,
  },
  offset: {
    type: 'integer',
    required: false,
    default_value: 0,
  },
  limit: {
    type: 'integer',
    required: false,
    default_value: 20,
  },
  name: {
    type: 'string',
    required: false,
  },
  slug: {
    type: 'string',
    required: false,
  },
  lastPublished: {
    type: {
      type: 'hash',
      fields: {
        lte: {
          type: 'date',
        },
        gte: {
          type: 'date',
        },
      },
    },
  },
  sortBy: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'lastPublished', display_name: 'Last Published' },
      { value: 'name', display_name: 'Name' },
      { value: 'slug', display_name: 'Slug' },
    ],
  },
  sortOrder: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'asc', display_name: 'Ascending' },
      { value: 'desc', display_name: 'Descending' },
    ],
  },
} satisfies TQoreOptions;

const listItems = QoreAppCreator.createLocalizedAction<typeof options>({
  app: WEBFLOW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, collection } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['collection'],
      ErrorClass: WebflowError,
    });

    const { cmsLocaleId, slug, name, lastPublished, offset = 0, limit = 20 } = obj || {};

    const sortBy = (obj?.sortBy || 'lastPublished') as ItemsListItemsRequestSortBy;
    const sortOrder = (obj?.sortOrder || 'desc') as ItemsListItemsRequestSortOrder;

    try {
      const client = createWebflowClient(token);

      const response = await client.collections.items.listItems(collection, {
        limit,
        offset,
        ...(cmsLocaleId && { cmsLocaleId }),
        ...(slug && { slug }),
        ...(name && { name }),
        ...(lastPublished && { lastPublished }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      });

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              lastPublished: { type: 'string' },
              lastUpdated: { type: 'string' },
              createdOn: { type: 'string' },
              fieldData: {
                type: {
                  type: 'hash',
                  fields: {
                    name: { type: 'string' },
                    slug: { type: 'string' },
                  },
                },
              },
              cmsLocaleId: { type: 'string' },
              isArchived: { type: 'boolean' },
              isDraft: { type: 'boolean' },
            },
          },
        },
      },
      pagination: {
        type: {
          type: 'hash',
          fields: {
            limit: { type: 'number' },
            offset: { type: 'number' },
            total: { type: 'number' },
          },
        },
      },
    },
  },
  get_dynamic_response_type: async (context) => {
    const itemFieldsResponseType = await getWebflowItemFieldsResponseType(context);

    return {
      type: 'hash',
      fields: {
        items: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                id: { type: 'string' },
                lastPublished: { type: 'string' },
                lastUpdated: { type: 'string' },
                createdOn: { type: 'string' },
                fieldData: {
                  type: itemFieldsResponseType as TQoreTypeObject,
                },
                cmsLocaleId: { type: 'string' },
                isArchived: { type: 'boolean' },
                isDraft: { type: 'boolean' },
              },
            },
          },
        },
        pagination: {
          type: {
            type: 'hash',
            fields: {
              limit: { type: 'number' },
              offset: { type: 'number' },
              total: { type: 'number' },
            },
          },
        },
      },
    };
  },
});

export default listItems;
