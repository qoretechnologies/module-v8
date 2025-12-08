import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
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
} satisfies TQoreOptions;

const FirebaseNewUserTrigger = QoreAppCreator.createLocalizedTrigger({
  app: FIREBASE_APP_NAME,
  action: 'new_user',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, project_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['project_id'],
      ErrorClass: FirebaseError,
    });

    const getItems = () => {
      return fetchLatestUsers({
        token,
        project_id,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'firebase_new_user',
      uniqueField: 'localId',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, project_id } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['project_id'],
      ErrorClass: FirebaseError,
    });

    const users = await fetchLatestUsers({
      token,
      project_id,
    });

    return users?.length > 0 ? users[0] : null;
  },
  event_info: {
    desc: 'Firebase New User Trigger Event Info',
    type: {
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
        providerUserInfo: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                providerId: { type: 'string' },
                rawId: { type: 'string' },
                email: { type: 'string' },
                displayName: { type: 'string' },
                photoUrl: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
});

export default FirebaseNewUserTrigger;

const fetchLatestUsers = async (options: { token: string; project_id: string }) => {
  const { token, project_id } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

  try {
    const response = await firebaseApiClient<{
      users: any[];
    }>({
      token,
      path: `/v1/projects/${project_id}/accounts:batchGet`,
      method: 'GET',
      params: {
        maxResults: limit.toString(),
      },
      baseUrl: FIREBASE_IDENTITY_TOOLKIT_URL,
    });

    const users = response.users || [];

    return users.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    throw new FirebaseError(`Failed to fetch latest users: ${getFirebaseErrorMessage(error)}`);
  }
};
