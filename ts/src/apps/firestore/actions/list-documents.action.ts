import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import {
  extractCollectionPath,
  extractDocumentId,
  firestoreApiClient,
  firestoreDocumentToJs,
} from '../helpers/constants';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getFirestoreCollectionPathAllowedValues } from '../helpers/get-collection-path-allowed-values';
import {
  getFirestoreCollectionFieldAllowedValues,
  getFirestoreCollectionFieldsResponseType,
} from '../helpers/get-collection-fields';

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
    allowed_values_creatable: true,
    get_allowed_values: getFirestoreCollectionPathAllowedValues,
    on_change: ['refetch'],
  },
  limit: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  order_by: {
    required: false,
    allowed_values_creatable: true,
    get_allowed_values: getFirestoreCollectionFieldAllowedValues,
    type: 'string',
  },
  order_direction: {
    required: false,
    type: 'string',
    default_value: 'ASCENDING',
    allowed_values: [
      { value: 'ASCENDING', display_name: 'Ascending' },
      { value: 'DESCENDING', display_name: 'Descending' },
    ],
  },
} satisfies TQoreOptions;

const listDocuments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'list_documents',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, collection_path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'collection_path'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const limit = obj?.limit || 100;
    const order_by = obj?.order_by;
    const order_direction = obj?.order_direction || 'ASCENDING';

    try {
      const basePath = `projects/${project_id}/databases/(default)/documents`;
      const collectionId = collection_path.split('/').pop();

      const structuredQuery: any = {
        from: [
          {
            collectionId,
          },
        ],
        limit,
      };

      if (order_by) {
        structuredQuery.orderBy = [
          {
            field: {
              fieldPath: order_by,
            },
            direction: order_direction,
          },
        ];
      }

      const body = {
        structuredQuery,
      };

      const response = await firestoreApiClient<any[]>({
        token,
        path: `${basePath}:runQuery`,
        method: 'POST',
        body,
      });

      const documents = response
        .filter((item) => item && item.document)
        .map((item: any) => {
          const doc = item.document;
          return {
            document_id: extractDocumentId(doc.name),
            path: extractCollectionPath(doc.name) + '/' + extractDocumentId(doc.name),
            create_time: doc.createTime,
            update_time: doc.updateTime,
            data: firestoreDocumentToJs(doc),
          };
        });

      return {
        collection_path,
        project_id,
        count: documents.length,
        limit,
        ...(order_by && { order_by, order_direction }),
        documents,
      };
    } catch (error) {
      throw new FirestoreError(`Failed to list documents: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      collection_path: { type: 'string' },
      project_id: { type: 'string' },
      count: { type: 'integer' },
      limit: { type: 'integer' },
      order_by: { type: 'string' },
      order_direction: { type: 'string' },
      documents: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              document_id: { type: 'string' },
              path: { type: 'string' },
              create_time: { type: 'string' },
              update_time: { type: 'string' },
              data: { type: 'hash' },
            },
          },
        },
      },
    },
  },
  get_dynamic_response_type: async (context) => {
    const dataFields = await getFirestoreCollectionFieldsResponseType(context);

    return {
      type: 'hash',
      fields: {
        collection_path: { type: 'string' },
        project_id: { type: 'string' },
        count: { type: 'integer' },
        limit: { type: 'integer' },
        order_by: { type: 'string' },
        order_direction: { type: 'string' },
        documents: {
          type: {
            type: 'list',
            element_type: {
              type: 'hash',
              fields: {
                document_id: { type: 'string' },
                path: { type: 'string' },
                create_time: { type: 'string' },
                update_time: { type: 'string' },
                data: dataFields as TQoreAppActionOption,
              },
            },
          },
        },
      },
    };
  },
});

export default listDocuments;
