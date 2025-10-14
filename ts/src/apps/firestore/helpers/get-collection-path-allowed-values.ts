import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FirestoreError, getFirestoreErrorMessage } from '../constants';
import { firestoreApiClient } from './constants';

export const getFirestoreCollectionPathAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, project_id } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['project_id'],
    ErrorClass: FirestoreError,
  });

  const parent_document_path = context?.opts?.parent_document_path;

  try {
    let basePath;
    if (parent_document_path) {
      basePath = `projects/${project_id}/databases/(default)/documents/${parent_document_path}`;
    } else {
      basePath = `projects/${project_id}/databases/(default)/documents`;
    }

    const response = await firestoreApiClient<{ collectionIds: string[]; nextPageToken?: string }>({
      token,
      path: `${basePath}:listCollectionIds`,
      method: 'POST',
      body: {
        pageSize: 1000,
      },
    });

    const collectionIds = response.collectionIds || [];

    const allowedValues: IQoreAllowedValue<string>[] = collectionIds.map((collectionId) => {
      const fullPath = parent_document_path
        ? `${parent_document_path}/${collectionId}`
        : collectionId;

      return {
        value: fullPath,
        display_name: fullPath,
        desc: `Collection: ${collectionId}\nFull Path: ${fullPath}\nLevel: ${fullPath.split('/').length}`,
      };
    });

    return allowedValues;
  } catch (error) {
    throw new FirestoreError(`Failed to fetch collection paths: ${getFirestoreErrorMessage(error)}`);
  }
};
