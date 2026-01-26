import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { ACTIVE_DIRECTORY_APP_NAME, ActiveDirectoryError } from '../constants';
import { createActiveDirectoryClient } from '../helpers/constants';

const disableUserOptions = {
  user_id: {
    type: 'string',
    required: true,
  },
} satisfies TQoreOptions;

const disableUserAction = QoreAppCreator.createLocalizedAction<typeof disableUserOptions>({
  app: ACTIVE_DIRECTORY_APP_NAME,
  action: 'disable_user',
  action_code: EQoreAppActionCode.ACTION,
  options: disableUserOptions,
  api_function: async (obj, _opts, context) => {
    const { token, user_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token'],
      optionFields: ['user_id'],
      ErrorClass: ActiveDirectoryError,
    });

    try {
      const client = createActiveDirectoryClient(token);

      const currentUser = await client
        .api(`/users/${user_id}`)
        .select('id,displayName,userPrincipalName,accountEnabled')
        .get();

      if (!currentUser.accountEnabled) {
        return {
          success: true,
          message: `User ${currentUser.displayName} (${currentUser.userPrincipalName}) is already disabled`,
          user: {
            id: currentUser.id,
            displayName: currentUser.displayName,
            userPrincipalName: currentUser.userPrincipalName,
            accountEnabled: false,
          },
        };
      }

      await client.api(`/users/${user_id}`).patch({
        accountEnabled: false,
      });

      return {
        success: true,
        message: `User ${currentUser.displayName} (${currentUser.userPrincipalName}) has been disabled`,
        user: {
          id: currentUser.id,
          displayName: currentUser.displayName,
          userPrincipalName: currentUser.userPrincipalName,
          accountEnabled: false,
        },
      };
    } catch (error) {
      throw new ActiveDirectoryError(`Failed to disable user: ${error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      message: { type: 'string' },
      user: {
        type: {
          type: 'hash',
          fields: {
            id: { type: 'string' },
            displayName: { type: 'string' },
            userPrincipalName: { type: 'string' },
            accountEnabled: { type: 'bool' },
          },
        },
      },
    },
  },
});

export default disableUserAction;
