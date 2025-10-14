import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIREBASE_APP_NAME, FirebaseError, getFirebaseErrorMessage } from '../constants';
import { firebaseApiClient, FIREBASE_IDENTITY_TOOLKIT_URL } from '../helpers/constants';
import { getFirebaseProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getFirebaseUserAllowedValues } from '../helpers/get-user-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseProjectIdAllowedValues,
    on_change: ['refetch'],
  },
  user_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseUserAllowedValues,
    depends_on: ['project_id'],
  },
} satisfies TQoreOptions;

const getUser = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'get_user',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, user_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'user_id'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    try {
      const response = await firebaseApiClient<{ users: any[] }>({
        token,
        path: `/v1/projects/${project_id}/accounts:lookup`,
        method: 'POST',
        body: {
          localId: [user_id],
        },
        baseUrl: FIREBASE_IDENTITY_TOOLKIT_URL,
      });

      const user = response.users?.[0];

      if (!user) {
        throw new FirebaseError(`User with ID ${user_id} not found`);
      }

      return {
        user_id: user.localId,
        email: user.email,
        email_verified: user.emailVerified,
        display_name: user.displayName,
        photo_url: user.photoUrl,
        disabled: user.disabled,
        created_at: user.createdAt,
        last_login_at: user.lastLoginAt,
        custom_attributes: user.customAttributes,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to get user: ${getFirebaseErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      user_id: { type: 'string' },
      email: { type: 'string' },
      email_verified: { type: 'boolean' },
      display_name: { type: 'string' },
      photo_url: { type: 'string' },
      disabled: { type: 'boolean' },
      created_at: { type: 'string' },
      last_login_at: { type: 'string' },
      custom_attributes: { type: 'string' },
    },
  },
});

export default getUser;
