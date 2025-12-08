import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';
import { getActiveDirectoryUserAllowedValues } from '../helpers/get-user-allowed-values';

const action = 'delete_user';

const options = {
  user_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryUserAllowedValues,
  },
} satisfies TQoreOptions;

const deleteUser = QoreAppCreator.createLocalizedAction<typeof options>({
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

      await client.api(`/users/${user_id}`).delete();

      return {
        id: user_id,
        success: true,
      };
    } catch (error) {
      throw new ActiveDirectoryError(`Failed to ${humanizeNameTitle(action)}: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string' },
      success: { type: 'bool' },
    },
  },
});

export default deleteUser;
