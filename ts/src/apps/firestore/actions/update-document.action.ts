import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import {
  buildDocumentPath,
  firestoreApiClient,
  firestoreDocumentToJs,
  jsObjectToFirestoreFields,
  TFirestoreDocument,
} from '../helpers/constants';
import {
  getFirestoreCollectionFieldOptions,
  getFirestoreCollectionFieldsResponseType,
} from '../helpers/get-collection-fields';
import { getFirestoreCollectionPathAllowedValues } from '../helpers/get-collection-path-allowed-values';
import { getFirestoreDocumentIdAllowedValues } from '../helpers/get-document-id-allowed-values';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirestoreProjectIdAllowedValues,
    on_change: ['refetch'],
  },
  collection_path: {
    required: true,
    type: 'string',
    on_change: ['refetch'],
    depends_on: ['project_id'],
    get_allowed_values: getFirestoreCollectionPathAllowedValues,
  },
  document_id: {
    required: true,
    type: 'string',
    get_allowed_values: getFirestoreDocumentIdAllowedValues,
    depends_on: ['project_id', 'collection_path'],
  },
  data: {
    required: true,
    type: 'hash',
    get_dynamic_type: getFirestoreCollectionFieldOptions,
    depends_on: ['project_id', 'collection_path'],
  },
  additional_data: {
    required: false,
    type: 'hash',
  },
  merge: {
    required: false,
    type: 'bool',
    default_value: true,
  },
} satisfies TQoreOptions;

const updateDocument = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'update_document',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, collection_path, document_id, data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'collection_path', 'document_id', 'data'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const merge = obj?.merge !== undefined ? obj.merge : true;
    const additional_data = obj?.additional_data || {};

    try {
      const documentPath = buildDocumentPath(project_id, collection_path, document_id);

      try {
        await firestoreApiClient({
          token,
          path: documentPath,
          method: 'GET',
        });
      } catch (error) {
        throw new FirestoreError(`Document not found: ${collection_path}/${document_id}`);
      }

      const combinedData = {
        ...data,
        ...(Object.keys(additional_data).length && additional_data),
      };

      const fields = jsObjectToFirestoreFields(combinedData);

      let response: TFirestoreDocument;

      if (merge) {
        const fieldPaths = Object.keys(combinedData);
        const updateMaskParams = fieldPaths
          .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
          .join('&');

        const pathWithMask = `${documentPath}?${updateMaskParams}`;

        response = await firestoreApiClient<TFirestoreDocument>({
          token,
          path: pathWithMask,
          method: 'PATCH',
          body: {
            fields,
          },
        });
      } else {
        response = await firestoreApiClient<TFirestoreDocument>({
          token,
          path: documentPath,
          method: 'PATCH',
          body: {
            fields,
          },
        });
      }

      const responseData = firestoreDocumentToJs(response);

      return {
        document_id,
        collection_path,
        project_id,
        path: `${collection_path}/${document_id}`,
        merge,
        update_time: response.updateTime,
        data: responseData,
      };
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw error;
      }
      throw new FirestoreError(`Failed to update document: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      document_id: { type: 'string' },
      collection_path: { type: 'string' },
      project_id: { type: 'string' },
      path: { type: 'string' },
      merge: { type: 'bool' },
      update_time: { type: 'string' },
      data: { type: 'hash' },
    },
  },

  get_dynamic_response_type: async (context) => {
    const dataFields = await getFirestoreCollectionFieldsResponseType(context);

    return {
      type: 'hash',
      fields: {
        document_id: { type: 'string' },
        collection_path: { type: 'string' },
        project_id: { type: 'string' },
        path: { type: 'string' },
        merge: { type: 'bool' },
        update_time: { type: 'string' },
        data: dataFields as TQoreAppActionOption,
      },
    };
  },
});

export default updateDocument;
