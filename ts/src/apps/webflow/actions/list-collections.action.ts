import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'list_collections';
const options = {
  site: {
    type: 'string',
    required: true,
    get_allowed_values: getWebflowSiteIdAllowedValues,
  },
} satisfies TQoreOptions;

const listCollections = QoreAppCreator.createLocalizedAction<typeof options>({
  app: WEBFLOW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, site } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['site'],
      ErrorClass: WebflowError,
    });

    try {
      const client = createWebflowClient(token);

      const response = await client.collections.list(site);

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      collections: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              displayName: { type: 'string' },
              singularName: { type: 'string' },
              slug: { type: 'string' },
              createdOn: { type: 'string' },
              lastUpdated: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default listCollections;
