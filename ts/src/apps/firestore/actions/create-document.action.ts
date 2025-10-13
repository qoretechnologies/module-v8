import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import {
  firestoreApiClient,
  buildDocumentPath,
  jsObjectToFirestoreFields,
  firestoreDocumentToJs,
  extractDocumentId,
  TFirestoreDocument,
} from '../helpers/constants';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import {
  getFirestoreCollectionFieldOptions,
  getFirestoreCollectionFieldsResponseType,
} from '../helpers/get-collection-fields';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirestoreProjectIdAllowedValues,
  },
  collection_path: {
    required: true,
    type: 'string',
  },
  document_id: {
    required: false,
    type: 'string',
  },
  data: {
    required: true,
    type: 'hash',
    get_dynamic_type: getFirestoreCollectionFieldOptions,
  },
  additional_data: {
    required: false,
    type: 'hash',
  },
} satisfies TQoreOptions;

const createDocument = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'create_document',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, collection_path, data } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'collection_path', 'data'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const document_id = obj?.document_id;
    const additional_data = obj?.additional_data || {};

    try {
      const fields = jsObjectToFirestoreFields({
        ...data,
        ...(Object.keys(additional_data).length && additional_data),
      });
      const documentPath = buildDocumentPath(project_id, collection_path, document_id);

      const requestBody = {
        fields,
      };

      let response;
      let createdDocId;

      if (document_id) {
        response = await firestoreApiClient<TFirestoreDocument>({
          token,
          path: documentPath,
          method: 'PATCH',
          body: requestBody,
        });
        createdDocId = document_id;
      } else {
        response = await firestoreApiClient<TFirestoreDocument>({
          token,
          path: documentPath,
          method: 'POST',
          body: requestBody,
        });
        createdDocId = extractDocumentId(response.name);
      }

      const responseData = firestoreDocumentToJs(response as any);

      return {
        document_id: createdDocId,
        collection_path,
        project_id,
        path: `${collection_path}/${createdDocId}`,
        created_at: response.createTime || new Date().toISOString(),
        data: responseData,
      };
    } catch (error) {
      throw new FirestoreError(`Failed to create document: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      document_id: { type: 'string' },
      collection_path: { type: 'string' },
      project_id: { type: 'string' },
      path: { type: 'string' },
      created_at: { type: 'string' },
      data: { type: 'hash' },
    },
  },
  get_dynamic_response_type: async (context) => {
    const dataFields = getFirestoreCollectionFieldsResponseType(context);

    return {
      type: 'hash',
      fields: {
        document_id: { type: 'string' },
        collection_path: { type: 'string' },
        project_id: { type: 'string' },
        path: { type: 'string' },
        created_at: { type: 'string' },
        data: { type: 'hash', fields: dataFields },
      },
    };
  },
});

export default createDocument;
