import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowItemCreationOptions } from '../helpers/get-item-dependent-options';
import { getWebflowItemFieldsResponseType } from '../helpers/get-item-response-type';
import { omit } from 'lodash';
import { getWebflowCmsLocaleIdAllowedValues } from '../helpers/get-locale-id-allowed-values';
import { getWebflowCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'create_item';
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
    on_change: ['refetch'],
    get_allowed_values: getWebflowCollectionAllowedValues,
    get_dependent_options: getWebflowItemCreationOptions,
  },
  isArchived: {
    type: 'boolean',
    required: false,
  },
  isDraft: {
    type: 'boolean',
    required: false,
  },
  cmsLocaleId: {
    type: 'string',
    required: false,
    depends_on: ['collection'],
    get_allowed_values: getWebflowCmsLocaleIdAllowedValues,
  },
} satisfies TQoreOptions;

const createItem = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const isArchived = obj?.isArchived || false;
    const isDraft = obj?.isDraft || true;
    const cmsLocaleId = obj?.cmsLocaleId;
    const data = omit(obj, ['collection', 'isArchived', 'isDraft', 'cmsLocaleId']) as Record<
      string,
      any
    > & {
      name: string;
      slug: string;
    };

    try {
      const client = createWebflowClient(token);

      const response = await client.collections.items.createItem(collection, {
        fieldData: data,
        isArchived,
        isDraft,
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
      isArchived: { type: 'boolean' },
      isDraft: { type: 'boolean' },
    },
  },
  get_dynamic_response_type: getWebflowItemFieldsResponseType,
});

export default createItem;
