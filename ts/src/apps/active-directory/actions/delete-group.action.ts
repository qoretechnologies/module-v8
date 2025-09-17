import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';
import { getActiveDirectoryGroupAllowedValues } from '../helpers/get-group-allowed-values';

const action = 'delete_group';

const options = {
  group_id: {
    type: 'string',
    required: true,
    get_allowed_values: getActiveDirectoryGroupAllowedValues,
  },
} satisfies TQoreOptions;

const deleteGroup = QoreAppCreator.createLocalizedAction<typeof options>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, group_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['group_id'],
      ErrorClass: ActiveDirectoryError,
    });

    try {
      const client = createActiveDirectoryClient(token);

      await client.api(`/groups/${group_id}`).delete();

      return {
        id: group_id,
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
      success: { type: 'boolean' },
    },
  },
});

export default deleteGroup;
