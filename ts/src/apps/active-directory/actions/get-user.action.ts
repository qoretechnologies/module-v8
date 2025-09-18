import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';
import { getActiveDirectoryUserAllowedValues } from '../helpers/get-user-allowed-values';
import { omit } from 'lodash';

const action = 'get_user';

const options = {
  user_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryUserAllowedValues,
  },
} satisfies TQoreOptions;

const getUser = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, user_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['user_id'],
      ErrorClass: ActiveDirectoryError,
    });

    try {
      const client = createActiveDirectoryClient(token);

      const response = await client.api(`/users/${user_id}`).select('*').get();

      return omit(response, ['@odata.context']);
    } catch (error) {
      throw new ActiveDirectoryError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      businessPhones: {
        type: {
          type: 'list',
          element_type: { type: 'string' },
        },
      },
      displayName: { type: 'string' },
      givenName: { type: 'string' },
      jobTitle: { type: 'string' },
      mail: { type: 'string' },
      mobilePhone: { type: 'string' },
      officeLocation: { type: 'string' },
      preferredLanguage: { type: 'string' },
      userPrincipalName: { type: 'string' },
      id: { type: 'string' },
    },
  },
});

export default getUser;
