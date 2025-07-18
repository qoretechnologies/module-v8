import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowCollectionAllowedValues } from '../helpers/get-collection-allowed-values';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'get_collection';
const options = {
  site: {
    preselected: true,
    required: false,
    type: 'string',
    get_allowed_values: getWebflowSiteIdAllowedValues,
    on_change: ['refetch'],
  },
  collection: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getWebflowCollectionAllowedValues,
  },
} satisfies TQoreOptions;

const getCollection = QoreAppCreator.createLocalizedAction<typeof options>({
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

    try {
      const client = createWebflowClient(token);

      const response = await client.collections.get(collection);

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      displayName: { type: 'string' },
      singularName: { type: 'string' },
      fields: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              isRequired: { type: 'boolean' },
              type: { type: 'string' },
              displayName: { type: 'string' },
              isEditable: { type: 'boolean' },
              slug: { type: 'string' },
              helpText: { type: 'string' },
              validations: { type: 'hash' },
            },
          },
        },
      },
      slug: { type: 'string' },
      createdOn: { type: 'string' },
      lastUpdated: { type: 'string' },
    },
  },
});

export default getCollection;
