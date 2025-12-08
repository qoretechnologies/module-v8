import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { omit } from 'lodash';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowItemUpdateOptions } from '../helpers/get-item-dependent-options';
import { getWebflowItemAllowedValues } from '../helpers/get-item-id-allowed-values';
import { getWebflowItemFieldsResponseType } from '../helpers/get-item-response-type';
import { getWebflowCmsLocaleIdAllowedValues } from '../helpers/get-locale-id-allowed-values';
import { getWebflowCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'update_item';
const options = {
  site: {
    type: 'string',
    required: false,
    preselected: true,
    get_allowed_values: getWebflowSiteIdAllowedValues,
    on_change: ['refetch'],
  },
  item: {
    type: 'string',
    required: true,
    depends_on: ['collection'],
    get_allowed_values: getWebflowItemAllowedValues,
  },
  collection: {
    type: 'string',
    required: true,
    on_change: ['refetch'],
    get_dependent_options: getWebflowItemUpdateOptions,
    get_allowed_values: getWebflowCollectionAllowedValues,
  },
  isArchived: {
    type: 'bool',
    required: false,
  },
  isDraft: {
    type: 'bool',
    required: false,
  },
  cmsLocaleId: {
    type: 'string',
    required: false,
    depends_on: ['collection'],
    get_allowed_values: getWebflowCmsLocaleIdAllowedValues,
  },
} satisfies TQoreOptions;

const updateItem = QoreAppCreator.createLocalizedAction<typeof options>({
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

      const isArchived = obj?.isArchived;
      const isDraft = obj?.isDraft;
      const cmsLocaleId = obj?.cmsLocaleId;

      const data = omit(obj, ['collection', 'isArchived', 'isDraft', 'cmsLocaleId']) as Record<
        string,
        any
      > & {
        name: string;
        slug: string;
      };

      const response = await client.collections.items.updateItem(collection, item, {
        ...(data && { fieldData: data }),
        ...(isArchived !== undefined && { isArchived }),
        ...(isDraft !== undefined && { isDraft }),
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

export default updateItem;
