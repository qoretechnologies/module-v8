import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';

const action = 'publish_site';
const options = {
  site: {
    type: 'string',
    required: true,
  },
  customDomains: {
    preselected: true,
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'string',
      },
    },
  },
  publishToWebflowSubdomain: {
    type: 'boolean',
    required: false,
    preselected: true,
  },
} satisfies TQoreOptions;

const publishSite = QoreAppCreator.createLocalizedAction<typeof options>({
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

    const { customDomains, publishToWebflowSubdomain } = obj || {};

    try {
      const client = createWebflowClient(token);

      const response = await client.sites.publish(site, {
        ...(customDomains?.length && { customDomains }),
        publishToWebflowSubdomain: publishToWebflowSubdomain || false,
      });

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      customDomains: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              url: { type: 'string' },
              lastPublished: { type: 'string' },
            },
          },
        },
      },
      publishToWebflowSubdomain: {
        type: 'boolean',
      },
    },
  },
});

export default publishSite;
