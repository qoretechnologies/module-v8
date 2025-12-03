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

const action = 'create_collection_item';

const options = {
  collectionId: {
    type: 'string',
    required: true,
    get_allowed_values: getCraftCollectionAllowedValues,
    on_change: ['refetch'],
  },
  title: {
    type: 'string',
    required: true,
  },
  properties: {
    type: 'hash',
    required: false,
    preselected: true,
    get_dynamic_type: getCraftCollectionPropertiesDynamicType,
  },
} satisfies TQoreOptions;

type TCreateCollectionItemRequest = {
  items: Array<{
    title: string;
    properties?: Record<string, any>;
  }>;
};

type TCreateCollectionItemsResponse = {
  items: Array<{
    id: string;
    title: string;
    properties?: Record<string, any>;
  }>;
};

const CreateCollectionItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, title, collectionId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['title', 'collectionId'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { properties = {} } = obj || {};

    const requestBody: TCreateCollectionItemRequest = { items: [{ title, properties }] };

    try {
      const response = await craftApiClient<TCreateCollectionItemsResponse>({
        url,
        token,
        method: 'POST',
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

export default CreateCollectionItem;
