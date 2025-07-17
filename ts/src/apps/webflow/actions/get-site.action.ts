import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';
import { getWebflowSiteIdAllowedValues } from '../helpers/get-site-id-allowed-values';

const action = 'get_site';
const options = {
  site: {
    type: 'string',
    required: true,
    get_allowed_values: getWebflowSiteIdAllowedValues,
  },
} satisfies TQoreOptions;

const getSite = QoreAppCreator.createLocalizedAction<typeof options>({
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

      const response = await client.sites.get(site);

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      workspaceId: { type: 'string' },
      createdOn: { type: 'string' },
      displayName: { type: 'string' },
      shortName: { type: 'string' },
      lastPublished: { type: 'string' },
      lastUpdated: { type: 'string' },
      previewUrl: { type: 'string' },
      timeZone: { type: 'string' },
      parentFolderId: { type: 'string' },
      customDomains: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
      locales: {
        type: {
          type: 'hash',
          fields: {
            primary: {
              type: {
                type: 'hash',
                fields: {
                  id: { type: 'string' },
                  cmsLocaleId: { type: 'string' },
                  enabled: { type: 'boolean' },
                  displayName: { type: 'string' },
                  displayImageId: { type: 'string' },
                  redirect: { type: 'boolean' },
                  subdirectory: { type: 'string' },
                  tag: { type: 'string' },
                },
              },
            },
            secondary: {
              type: {
                type: 'list',
                element_type: {
                  type: 'hash',
                  fields: {
                    id: { type: 'string' },
                    cmsLocaleId: { type: 'string' },
                    enabled: { type: 'boolean' },
                    displayName: { type: 'string' },
                    displayImageId: { type: 'string' },
                    subdirectory: { type: 'string' },
                    tag: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      dataCollectionEnabled: { type: 'boolean' },
      dataCollectionType: { type: 'string' },
    },
  },
});

export default getSite;
