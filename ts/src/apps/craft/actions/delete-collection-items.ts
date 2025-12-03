import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { CRAFT_APP_NAME, CraftError } from '../constants';
import { craftApiClient } from '../helpers/constants';
import { getCraftCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getCraftCollectionItemAllowedValues } from '../helpers/get-collection-item-allowed-values';

const action = 'delete_collection_items';

const options = {
  collectionId: {
    type: 'string',
    required: true,
    get_allowed_values: getCraftCollectionAllowedValues,
    on_change: ['refetch'],
  },
  itemIds: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getCraftCollectionItemAllowedValues,
    required: true,
    depends_on: ['collectionId'],
  },
} satisfies TQoreOptions;

type TDeleteCollectionItemsRequest = {
  idsToDelete: Array<string>;
};

type TDeleteCollectionItemsResponse = {
  items: Array<{
    id: string;
  }>;
};

const DeleteCollectionItems = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CRAFT_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { url, itemIds, collectionId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['url'],
      optionFields: ['itemIds', 'collectionId'],
      ErrorClass: CraftError,
    });

    const token = context?.conn_opts?.token;

    const requestBody: TDeleteCollectionItemsRequest = { idsToDelete: itemIds };

    try {
      const response = await craftApiClient<TDeleteCollectionItemsResponse>({
        url,
        token,
        method: 'DELETE',
        body: requestBody,
        path: `collections/${collectionId}/items`,
      });

      return response.items.map((item) => item.id);
    } catch (error) {
      if (error instanceof CraftError) {
        throw error;
      }

      throw new CraftError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'list',
    element_type: 'string',
  },
});

export default DeleteCollectionItems;
