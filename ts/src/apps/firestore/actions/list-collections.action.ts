import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import { firestoreApiClient } from '../helpers/constants';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirestoreProjectIdAllowedValues,
  },
  parent_document_path: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listCollections = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'list_collections',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const parent_document_path = obj?.parent_document_path;

    try {
      let basePath;

      if (parent_document_path) {
        basePath = `projects/${project_id}/databases/(default)/documents/${parent_document_path}`;
      } else {
        basePath = `projects/${project_id}/databases/(default)/documents`;
      }

      const response = await firestoreApiClient<{ collectionIds: string[] }>({
        token,
        path: `${basePath}:listCollectionIds`,
        method: 'POST',
        body: {
          pageSize: 1000,
        },
      });

      const collectionIds = response.collectionIds || [];

      const collectionDetails = collectionIds.map((collectionId) => {
        const fullPath = parent_document_path
          ? `${parent_document_path}/${collectionId}`
          : collectionId;

        return {
          collection_id: collectionId,
          path: fullPath,
          parent: parent_document_path || null,
        };
      });

      return {
        project_id,
        parent_document_path: parent_document_path || 'root',
        count: collectionDetails.length,
        collections: collectionDetails,
      };
    } catch (error) {
      throw new FirestoreError(`Failed to list collections: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      project_id: { type: 'string' },
      parent_document_path: { type: 'string' },
      count: { type: 'integer' },
      collections: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              collection_id: { type: 'string' },
              path: { type: 'string' },
              parent: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

export default listCollections;
