import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getWebflowItemAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'delete_item';
const options = {
  item: {
    type: 'string',
    required: true,
    depends_on: ['collection'],
    get_allowed_values: getWebflowItemAllowedValues,
  },
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
    get_allowed_values: getWebflowCollectionAllowedValues,
    on_change: ['refetch'],
  },
} satisfies TQoreOptions;

const deleteItem = QoreAppCreator.createLocalizedAction<typeof options>({
  app: WEBFLOW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, item, collection } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['item', 'collection'],
      ErrorClass: WebflowError,
    });

    try {
      const client = createWebflowClient(token);

      const response = await client.collections.items.deleteItem(collection, item);

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
});

export default deleteItem;
