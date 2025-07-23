import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { BROWSE_AI_APP_NAME, BrowseAiError } from '../constants';
import { browseAiApiClient } from '../helpers/constants';

const action = 'list_robots';

const listRobots = QoreAppCreator.createLocalizedAction({
  app: BROWSE_AI_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: BrowseAiError,
    });

    try {
      const response = await browseAiApiClient({
        token,
        method: 'GET',
        path: `robots`,
        object: 'robots',
      });

      return response;
    } catch (error) {
      throw new BrowseAiError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      totalCount: { type: 'integer' },
      items: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              createdAt: { type: 'number' },
              inputParameters: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      label: { type: 'string' },
                      required: { type: 'boolean' },
                      encrypted: { type: 'boolean' },
                      defaultValue: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});

export default listRobots;
