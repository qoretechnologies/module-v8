import {
  EQoreAppActionCode,
  IQoreTypeObjectNonList,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient, extractCraftBlockContent } from '../helpers/constants';
import { getCraftCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getCraftCollectionPropertiesDynamicResponseType } from '../helpers/get-collection-fields';
import { CraftBlockResponseType } from '../response-types/block';

const action = 'list_collection_items';

const options = {
  collectionId: {
    type: 'string',
    required: true,
    get_allowed_values: getCraftCollectionAllowedValues,
    on_change: ['refetch'],
  },
  maxDepth: {
    type: 'number',
    required: false,
    preselected: true,
    default_value: -1,
  },
} satisfies TQoreOptions;

type TListCollectionItemsResponse = {
  items: Array<{
    id: string;
    title: string;
    properties?: Record<string, any>;
    content: Array<any>;
  }>;
};

const ListCollectionItems = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, collectionId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['collectionId'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { maxDepth = -1 } = obj || {};

    try {
      const response = await craftApiClient<TListCollectionItemsResponse>({
        url,
        token,
        method: 'GET',
        params: { maxDepth: maxDepth.toString() },
        path: `collections/${collectionId}/items`,
      });

      return response.items.map((item) => {
        const itemProperties = item?.properties || {};

        return {
          id: item.id,
          item_title: item.title,
          item_content: item.content,
          item_content_string: extractCraftBlockContent({ ...item, type: 'collectionItem' }),
          ...itemProperties,
        };
      });
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        item_title: { type: 'string' },
        item_content_string: { type: 'string' },
        item_content: {
          type: {
            type: 'list',
            element_type: CraftBlockResponseType,
          },
        },
      },
    },
  },
  get_dynamic_response_type: async (context) => {
    const propertiesResponseType = (await getCraftCollectionPropertiesDynamicResponseType(
      context
    )) as IQoreTypeObjectNonList;

    return {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          id: { type: 'string' },
          item_title: { type: 'string' },
          item_content_string: { type: 'string' },
          ...propertiesResponseType.fields,
          item_content: {
            type: {
              type: 'list',
              element_type: CraftBlockResponseType,
            },
          },
        },
      },
    };
  },
});

export default ListCollectionItems;
