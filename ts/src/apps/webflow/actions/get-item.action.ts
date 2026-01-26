import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowItemAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getWebflowCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getWebflowCmsLocaleIdAllowedValues } from '../helpers/get-locale-id-allowed-values';
import { getWebflowItemFieldsResponseType } from '../helpers/get-item-response-type';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'get_item';
const options = {
  item: {
    type: 'string',
    required: true,
    get_allowed_values: getWebflowItemAllowedValues,
    depends_on: ['collection'],
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
  cmsLocaleId: {
    get_allowed_values: getWebflowCmsLocaleIdAllowedValues,
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const getItem = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const cmsLocaleId = obj?.cmsLocaleId || undefined;

    try {
      const client = createWebflowClient(token);

      const response = await client.collections.items.getItem(collection, item, {
        ...(cmsLocaleId && { cmsLocaleId }),
      });

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
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
      isArchived: { type: 'bool' },
      isDraft: { type: 'bool' },
    },
  },
  get_dynamic_response_type: getWebflowItemFieldsResponseType,
});

export default getItem;
