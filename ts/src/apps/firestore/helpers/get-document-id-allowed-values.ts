import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FirestoreError, getFirestoreErrorMessage } from '../constants';
import {
  firestoreApiClient,
  extractDocumentId,
  firestoreDocumentToJs,
  TFirestoreDocument,
} from './constants';

export const getFirestoreDocumentIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, project_id, collection_path } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    optionFields: ['project_id', 'collection_path'],
    ErrorClass: FirestoreError,
  });

  try {
    const basePath = `projects/${project_id}/databases/(default)/documents`;
    const collectionId = collection_path.split('/').pop();

    const response = await firestoreApiClient<any[]>({
      token,
      path: `${basePath}:runQuery`,
      method: 'POST',
      body: {
        structuredQuery: {
          from: [{ collectionId }],
          limit: 500,
        },
      },
    });

    const documents = response.filter((item) => item && item.document);

    if (documents.length === 0) {
      return [];
    }

    const allowedValues: IQoreAllowedValue<string>[] = documents.map((item: any) => {
      const doc: TFirestoreDocument = item.document;
      const documentId = extractDocumentId(doc.name);
      const data = firestoreDocumentToJs(doc);

      let displayName = documentId;

      const descParts: string[] = [`ID: ${documentId}`];

      if (doc.createTime) {
        descParts.push(`Created: ${new Date(doc.createTime).toLocaleString()}`);
      }

      if (doc.updateTime) {
        descParts.push(`Updated: ${new Date(doc.updateTime).toLocaleString()}`);
      }

      const keyFields = Object.keys(data).slice(0, 3);
      keyFields.forEach((key) => {
        const value = data[key];
        if (value !== null && value !== undefined && typeof value !== 'object') {
          descParts.push(`${key}: ${value}`);
        }
      });

      return {
        value: documentId,
        display_name: displayName,
        desc: descParts.join('\n'),
      };
    });

    return allowedValues;
  } catch (error) {
    throw new FirestoreError(`Failed to fetch document IDs: ${getFirestoreErrorMessage(error)}`);
  }
};
