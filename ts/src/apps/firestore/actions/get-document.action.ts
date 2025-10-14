import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import {
  firestoreApiClient,
  buildDocumentPath,
  firestoreDocumentToJs,
  TFirestoreDocument,
} from '../helpers/constants';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getFirestoreCollectionPathAllowedValues } from '../helpers/get-collection-path-allowed-values';
import { getFirestoreDocumentIdAllowedValues } from '../helpers/get-document-id-allowed-values';
import { getFirestoreCollectionFieldsResponseType } from '../helpers/get-collection-fields';

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
  },
} satisfies TQoreOptions;

const getDocument = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'get_document',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, collection_path, document_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'collection_path', 'document_id'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    try {
      const documentPath = buildDocumentPath(project_id, collection_path, document_id);

      const response = await firestoreApiClient<TFirestoreDocument>({
        token,
        path: documentPath,
        method: 'GET',
      });

      if (!response || !response.name) {
        throw new FirestoreError(`Document not found: ${collection_path}/${document_id}`);
      }

      const data = firestoreDocumentToJs(response);

      return {
        document_id,
        collection_path,
        project_id,
        path: `${collection_path}/${document_id}`,
        exists: true,
        create_time: response.createTime,
        update_time: response.updateTime,
        read_time: new Date().toISOString(),
        data,
      };
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw error;
      }
      throw new FirestoreError(`Failed to get document: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      document_id: { type: 'string' },
      collection_path: { type: 'string' },
      project_id: { type: 'string' },
      path: { type: 'string' },
      exists: { type: 'boolean' },
      create_time: { type: 'string' },
      update_time: { type: 'string' },
      read_time: { type: 'string' },
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
        exists: { type: 'boolean' },
        create_time: { type: 'string' },
        update_time: { type: 'string' },
        read_time: { type: 'string' },
        data: dataFields as TQoreAppActionOption,
      },
    };
  },
});

export default getDocument;
