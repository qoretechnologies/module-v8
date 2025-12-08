import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIREBASE_APP_NAME, FirebaseError, getFirebaseErrorMessage } from '../constants';
import { firebaseApiClient, FIREBASE_IDENTITY_TOOLKIT_URL } from '../helpers/constants';
import { getFirebaseProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseProjectIdAllowedValues,
  },
  max_results: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  next_page_token: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listUsers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'list_users',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    const { max_results = 100, next_page_token } = obj || {};

    try {
      const response = await firebaseApiClient<{
        users: any[];
        nextPageToken?: string;
      }>({
        token,
        path: `/v1/projects/${project_id}/accounts:batchGet`,
        method: 'GET',
        params: {
          maxResults: max_results.toString(),
          ...(next_page_token && { pageToken: next_page_token }),
        },
        baseUrl: FIREBASE_IDENTITY_TOOLKIT_URL,
      });

      const users = response.users || [];

      return {
        users,
        user_count: users.length,
        next_page_token: response.nextPageToken,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to list users: ${getFirebaseErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      users: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              localId: { type: 'string' },
              email: { type: 'string' },
              emailVerified: { type: 'bool' },
              displayName: { type: 'string' },
              photoUrl: { type: 'string' },
              disabled: { type: 'bool' },
              createdAt: { type: 'string' },
              lastLoginAt: { type: 'string' },
              customAttributes: { type: 'string' },
            },
          },
        },
      },
      user_count: { type: 'integer' },
      next_page_token: { type: 'string' },
    },
  },
});

export default listUsers;
