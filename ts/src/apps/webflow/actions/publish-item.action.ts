import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getWebflowItemAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'publish_item';
const options = {
  items: {
    depends_on: ['collection'],
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
    get_element_allowed_values: getWebflowItemAllowedValues,
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
    on_change: ['refetch'],
    get_allowed_values: getWebflowCollectionAllowedValues,
  },
} satisfies TQoreOptions;

const publishItem = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const itemIds = obj?.items || [];

    try {
      const client = createWebflowClient(token);

      const response = await client.collections.items.publishItem(collection, {
        itemIds,
      });

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      publishedItemIds: { type: { type: 'list', element_type: 'string' } },
      errors: { type: { type: 'list', element_type: 'string' } },
    },
  },
});

export default publishItem;
