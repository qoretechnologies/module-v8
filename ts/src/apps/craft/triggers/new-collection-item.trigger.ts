import {
  EQoreAppActionCode,
  IQoreTypeObjectNonList,
  QoreAppCreator,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { getCraftCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getCraftCollectionPropertiesDynamicResponseType } from '../helpers/get-collection-fields';
import { CraftBlockResponseType } from '../response-types/block';

const action = 'new_collection_item';

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

const NewCollectionItem = QoreAppCreator.createLocalizedTrigger({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { url, collectionId } = getQoreContextRequiredValues({
      context: { ...context },
      connectionFields: ['url'],
      optionFields: ['collectionId'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { maxDepth = -1 } = context?.opts || {};

    const getItems = () => {
      return fetchLatestItems({
        token,
        collectionId,
        url,
        maxDepth,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `craft_${action}`,
      uniqueField: 'id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { url, collectionId } = getQoreContextRequiredValues({
      context: { ...context },
      connectionFields: ['url'],
      optionFields: ['collectionId'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;
    const { maxDepth = -1 } = context?.opts || {};

    const records = await fetchLatestItems({
      token,
      collectionId,
      url,
      maxDepth,
    });

    return records?.length > 0 ? records[0] : null;
  },
  event_info: {
    desc: 'Craft New Collection Item Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        item_title: { type: 'string' },
        item_content: {
          type: {
            type: 'list',
            element_type: CraftBlockResponseType,
          },
        },
      },
    },
  },
  get_dynamic_type: async (context) => {
    const propertiesResponseType = (await getCraftCollectionPropertiesDynamicResponseType(
      context
    )) as IQoreTypeObjectNonList;

    return {
      type: 'hash',
      fields: {
        id: { type: 'string' },
        item_title: { type: 'string' },
        ...propertiesResponseType.fields,
        item_content: {
          type: {
            type: 'list',
            element_type: CraftBlockResponseType,
          },
        },
      },
    };
  },
});

export default NewCollectionItem;

type TFetchItemsOptions = {
  token?: string;
  url: string;
  collectionId: string;
  maxDepth: number;
};

type TListCollectionItemsResponse = {
  items: Array<{
    id: string;
    title: string;
    properties?: Record<string, any>;
    content: Array<any>;
  }>;
};

const fetchLatestItems = async (options: TFetchItemsOptions): Promise<Record<string, any>[]> => {
  const { token, url, collectionId, maxDepth } = options;

  try {
    const response = await craftApiClient<TListCollectionItemsResponse>({
      path: `collections/${collectionId}/items`,
      method: 'GET',
      token,
      url,
      params: {
        maxDepth: String(maxDepth),
      },
    });

    return response.items.map((item) => {
      const itemProperties = item?.properties || {};

      return {
        id: item.id,
        item_title: item.title,
        item_content: item.content,
        ...itemProperties,
      };
    });
  } catch (error) {
    throw new CraftError(`Failed to fetch latest items: ${error.message || error}`);
  }
};
