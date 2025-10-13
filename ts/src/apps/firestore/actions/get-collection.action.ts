import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import { extractDocumentId, firestoreApiClient, firestoreDocumentToJs } from '../helpers/constants';
import { getFirestoreCollectionIdAllowedValues } from '../helpers/get-collection-id-allowed-values';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';

const action = 'get_collection';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirestoreProjectIdAllowedValues,
    on_change: ['refetch'],
  },
  collection_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    depends_on: ['project_id'],
    get_allowed_values: getFirestoreCollectionIdAllowedValues,
  },
  parent_document_path: {
    required: false,
    type: 'string',
  },
  include_sample_documents: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  sample_limit: {
    required: false,
    type: 'integer',
    default_value: 5,
  },
} satisfies TQoreOptions;

const getCollection = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, collection_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'collection_id'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const parent_document_path = obj?.parent_document_path;
    const include_sample_documents = obj?.include_sample_documents || false;
    const sample_limit = obj?.sample_limit || 5;

    try {
      const fullPath = parent_document_path
        ? `${parent_document_path}/${collection_id}`
        : collection_id;

      const collectionInfo: any = {
        collection_id,
        path: fullPath,
        parent: parent_document_path || null,
        project_id,
        sample_documents: null,
      };

      try {
        const basePath = parent_document_path
          ? `projects/${project_id}/databases/(default)/documents/${parent_document_path}`
          : `projects/${project_id}/databases/(default)/documents`;

        const queryResponse = await firestoreApiClient<any[]>({
          token,
          path: `${basePath}:runQuery`,
          method: 'POST',
          body: {
            structuredQuery: {
              from: [{ collectionId: collection_id }],
              limit: include_sample_documents ? sample_limit : 1,
            },
          },
        });

        const documentsWithData = queryResponse.filter((item) => item && item.document);

        if (documentsWithData.length > 0) {
          if (include_sample_documents) {
            collectionInfo.sample_documents = documentsWithData.map((item) => {
              const doc = item.document;
              return {
                document_id: extractDocumentId(doc.name),
                create_time: doc.createTime,
                update_time: doc.updateTime,
                data: firestoreDocumentToJs(doc),
              };
            });
          }

          collectionInfo.has_documents = true;
        } else {
          collectionInfo.has_documents = false;
        }
      } catch (queryError) {
        throw new FirestoreError(`Failed to ${humanizeNameTitle(action)}`);
      }

      return collectionInfo;
    } catch (error) {
      if (error instanceof FirestoreError) {
        throw error;
      }
      throw new FirestoreError(`Failed to get collection: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      collection_id: {
        type: 'string',
      },
      path: {
        type: 'string',
      },
      parent: {
        type: 'string',
      },
      project_id: {
        type: 'string',
      },
      has_documents: {
        type: 'boolean',
      },
      sample_documents: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              document_id: { type: 'string' },
              create_time: { type: 'string' },
              update_time: { type: 'string' },
              data: { type: 'hash' },
            },
          },
        },
      },
    },
  },
});

export default getCollection;
