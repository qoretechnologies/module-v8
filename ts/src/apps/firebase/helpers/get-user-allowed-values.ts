import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FirebaseError, getFirebaseErrorMessage } from '../constants';
import { firebaseApiClient, FIREBASE_IDENTITY_TOOLKIT_URL } from './constants';

type TFirebaseUser = {
  localId: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
};

const mapFirebaseUserToAllowedValue = (user: TFirebaseUser): IQoreAllowedValue<string> => {
  return {
    value: user.localId,
    display_name: user.displayName || user.email || user.localId,
    ...(user.photoUrl && { image: user.photoUrl }),
    desc:
      `Email: ${user.email || 'N/A'}\n` +
      `Verified: ${user.emailVerified ? 'Yes' : 'No'}\n` +
      `Disabled: ${user.disabled ? 'Yes' : 'No'}\n` +
      `Created: ${user.createdAt ? new Date(parseInt(user.createdAt)).toISOString() : 'N/A'}`,
  };
};

export const getFirebaseUserAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, project_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['project_id'],
    ErrorClass: FirebaseError,
  });

  try {
    const response = await firebaseApiClient<{ users: TFirebaseUser[] }>({
      token,
      path: `/v1/projects/${project_id}/accounts:batchGet`,
      method: 'GET',
      params: {
        maxResults: '100',
      },
      baseUrl: FIREBASE_IDENTITY_TOOLKIT_URL,
    });

    const users = response.users || [];
    return users.map(mapFirebaseUserToAllowedValue);
  } catch (error) {
    throw new FirebaseError(
      `Failed to fetch user allowed values: ${getFirebaseErrorMessage(error)}`
    );
  }
};
