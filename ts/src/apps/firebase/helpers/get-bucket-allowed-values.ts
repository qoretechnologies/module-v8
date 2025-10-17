import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FirebaseError, getFirebaseErrorMessage } from '../constants';
import { firebaseApiClient, FIREBASE_STORAGE_URL } from './constants';

type TFirebaseBucket = {
  name: string;
  timeCreated?: string;
  updated?: string;
  storageClass?: string;
  location?: string;
};

const mapFirebaseBucketToAllowedValue = (bucket: TFirebaseBucket): IQoreAllowedValue<string> => {
  return {
    value: bucket.name,
    display_name: bucket.name,
    desc:
      `Location: ${bucket.location || 'N/A'}\n` +
      `Storage Class: ${bucket.storageClass || 'N/A'}\n` +
      `Created: ${bucket.timeCreated || 'N/A'}`,
  };
};

export const getFirebaseBucketAllowedValues: TQoreGetAllowedValuesFunction<
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
    const response = await firebaseApiClient<{ items: TFirebaseBucket[] }>({
      token,
      path: `/storage/v1/b`,
      method: 'GET',
      params: {
        project: project_id,
      },
      baseUrl: FIREBASE_STORAGE_URL,
    });

    const buckets = response.items || [];
    return buckets.map(mapFirebaseBucketToAllowedValue);
  } catch (error) {
    throw new FirebaseError(`Failed to fetch bucket allowed values: ${getFirebaseErrorMessage(error)}`);
  }
};
