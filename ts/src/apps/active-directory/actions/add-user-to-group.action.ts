import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';
import { getActiveDirectoryGroupAllowedValues } from '../helpers/get-group-allowed-values';
import { getActiveDirectoryUserAllowedValues } from '../helpers/get-user-allowed-values';

const action = 'add_user_to_group';

const options = {
  user_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryUserAllowedValues,
  },
  group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryGroupAllowedValues,
  },
} satisfies TQoreOptions;

const addUserToGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, user_id, group_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['user_id', 'group_id'],
      ErrorClass: ActiveDirectoryError,
    });

    const client = createActiveDirectoryClient(token);

    try {
      await client.api(`/groups/${group_id}/members/$ref`).post({
        '@odata.id': `https://graph.microsoft.com/v1.0/users/${user_id}`,
      });
    } catch (error) {
      throw new ActiveDirectoryError(`Failed to ${humanizeNameTitle(action)}: ${error.message}`);
    }
  },
});

export default addUserToGroup;
