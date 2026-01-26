import { EQoreAppActionCode, QoreAppCreator } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { LINKED_IN_APP_NAME, LinkedInError } from '../constants';
import { linkedInApiClient } from '../helpers/constants';

const action = 'get_current_user';

const getCurrentUser = QoreAppCreator.createLocalizedAction({
  app: LINKED_IN_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  api_function: async (obj, _opts, context) => {
    const { token } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      ErrorClass: LinkedInError,
    });

    try {
      const response = await linkedInApiClient({
        token,
        path: `userinfo`,
        method: 'GET',
      });

      return response;
    } catch (error) {
      throw new LinkedInError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },

  response_type: {
    type: 'hash',
    fields: {
      sub: { type: 'string' },
      email_verified: { type: 'bool' },
      name: { type: 'string' },
      given_name: { type: 'string' },
      family_name: { type: 'string' },
      email: { type: 'string' },
      picture: { type: 'string' },
      locale: {
        type: {
          type: 'hash',
          fields: {
            country: { type: 'string' },
            language: { type: 'string' },
          },
        },
      },
    },
  },
});

export default getCurrentUser;
