import {
  EQoreAppActionCode,
  IQoreTypeObjectNonList,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { getCraftCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import {
  getCraftCollectionPropertiesDynamicResponseType,
  getCraftCollectionPropertiesDynamicType,
} from '../helpers/get-collection-fields';
import { getCraftCollectionItemAllowedValues } from '../helpers/get-collection-item-allowed-values';

const action = 'update_collection_item';

const options = {
  collectionId: {
    type: 'string',
    required: true,
    get_allowed_values: getCraftCollectionAllowedValues,
    on_change: ['refetch'],
  },
  itemId: {
    type: 'string',
    required: true,
    get_allowed_values: getCraftCollectionItemAllowedValues,
    depends_on: ['collectionId'],
  },
  title: {
    type: 'string',
    required: false,
    preselected: true,
  },
  properties: {
    type: 'hash',
    required: false,
    preselected: true,
    get_dynamic_type: getCraftCollectionPropertiesDynamicType,
    depends_on: ['collectionId'],
  },
} satisfies TQoreOptions;

type TUpdateCollectionItemRequest = {
  itemsToUpdate: Array<{
    id: string;
    title?: string;
    properties?: Record<string, any>;
  }>;
};

type TUpdateCollectionItemsResponse = {
  items: Array<{
    id: string;
    title?: string;
    properties?: Record<string, any>;
  }>;
};

const UpdateCollectionItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, collectionId, itemId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['collectionId', 'itemId'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { properties = {}, title } = obj || {};

    const requestBody: TUpdateCollectionItemRequest = {
      itemsToUpdate: [
        {
          id: itemId,
          ...(title && { title }),
          ...(Object.keys(properties).length && { properties }),
        },
      ],
    };

    try {
      const response = await craftApiClient<TUpdateCollectionItemsResponse>({
        url,
        token,
        method: 'PUT',
        body: requestBody,
        path: `collections/${collectionId}/items`,
      });

      const item = response.items[0];
      const itemProperties = item?.properties || {};

      return {
        id: item.id,
        item_title: item.title,
        ...itemProperties,
      };
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      item_title: { type: 'string' },
    },
  },
  get_dynamic_response_type: async (context) => {
    const propertiesResponseType = (await getCraftCollectionPropertiesDynamicResponseType(
      context
    )) as IQoreTypeObjectNonList;

    return {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        item_title: { type: 'string' },
        ...propertiesResponseType.fields,
      },
    };
  },
});

export default UpdateCollectionItem;
