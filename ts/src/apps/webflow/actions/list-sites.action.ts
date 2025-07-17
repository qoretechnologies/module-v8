import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { WEBFLOW_APP_NAME, WebflowError } from '../constants';
import { createWebflowClient } from '../helpers/constants';

const action = 'list_sites';

const listSites = QoreAppCreator.createLocalizedAction({
  app: WEBFLOW_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: WebflowError,
    });

    try {
      const client = createWebflowClient(token);

      const response = await client.sites.list();

      return response;
    } catch (error) {
      throw new WebflowError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      sites: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              workspaceId: { type: 'string' },
              createdOn: { type: 'string' },
              displayName: { type: 'string' },
              shortName: { type: 'string' },
              lastPublished: { type: 'string' },
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
                      lastPublished: { type: 'string' },
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
                            redirect: { type: 'boolean' },
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
        },
      },
    },
  },
});

export default listSites;
