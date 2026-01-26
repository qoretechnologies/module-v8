import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreAppActionOption,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import {
  fetchFirestorePaginatedDocuments,
  buildDocumentPath,
  firestoreDocumentToJs,
  extractDocumentId,
  extractCollectionPath,
  jsValueToFirestore,
  TFirestoreDocument,
} from '../helpers/constants';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import {
  getFirestoreCollectionFieldAllowedValues,
  getFirestoreCollectionFieldsResponseType,
} from '../helpers/get-collection-fields';
import { getFirestoreCollectionPathAllowedValues } from '../helpers/get-collection-path-allowed-values';

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
    get_allowed_values: getFirestoreCollectionPathAllowedValues,
    allowed_values_creatable: true,
    on_change: ['refetch'],
    depends_on: ['project_id'],
  },
  filters: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          field: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            get_allowed_values: getFirestoreCollectionFieldAllowedValues,
          },
          operator: {
            type: 'string',
            required: true,
            allowed_values: [
              { value: 'EQUAL', display_name: 'Equal to' },
              { value: 'NOT_EQUAL', display_name: 'Not equal to' },
              { value: 'LESS_THAN', display_name: 'Less than' },
              { value: 'LESS_THAN_OR_EQUAL', display_name: 'Less than or equal to' },
              { value: 'GREATER_THAN', display_name: 'Greater than' },
              { value: 'GREATER_THAN_OR_EQUAL', display_name: 'Greater than or equal to' },
              { value: 'ARRAY_CONTAINS', display_name: 'Array contains' },
              { value: 'ARRAY_CONTAINS_ANY', display_name: 'Array contains any' },
              { value: 'IN', display_name: 'In' },
              { value: 'NOT_IN', display_name: 'Not in' },
            ],
          },
          value: {
            type: 'auto',
            required: true,
          },
        },
      },
    },
  },
  order_by: {
    required: false,
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          field: {
            type: 'string',
            required: true,
            allowed_values_creatable: true,
            get_allowed_values: getFirestoreCollectionFieldAllowedValues,
          },
          direction: {
            type: 'string',
            required: true,
            default_value: 'ASCENDING',
            allowed_values: [
              { value: 'ASCENDING', display_name: 'Ascending' },
              { value: 'DESCENDING', display_name: 'Descending' },
            ],
          },
        },
      },
    },
  },
  limit: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
} satisfies TQoreOptions;

const queryDocuments = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'query_documents',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, collection_path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'collection_path'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const filters = (obj?.filters || []) as Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    const order_by = (obj?.order_by || []) as Array<{
      field: string;
      direction: string;
    }>;
    const limit = obj?.limit || 100;

    try {
      const basePath = buildDocumentPath(project_id, collection_path);
      const collectionId = collection_path.split('/').pop();

      const structuredQuery: any = {
        from: [
          {
            collectionId,
          },
        ],
        limit,
      };

      if (filters.length > 0) {
        structuredQuery.where = {
          compositeFilter: {
            op: 'AND',
            filters: filters.map((filter) => ({
              fieldFilter: {
                field: {
                  fieldPath: filter.field,
                },
                op: filter.operator,
                value: jsValueToFirestore(filter.value),
              },
            })),
          },
        };
      }

      if (order_by.length > 0) {
        structuredQuery.orderBy = order_by.map((order) => ({
          field: {
            fieldPath: order.field,
          },
          direction: order.direction,
        }));
      }

      const body = {
        structuredQuery,
      };

      const documents = await fetchFirestorePaginatedDocuments<{ document: TFirestoreDocument }>({
        token,
        path: `${basePath.split('/documents/')[0]}/documents:runQuery`,
        method: 'POST',
        body,
        maxResults: limit,
      });

      const processedDocuments = documents
        .filter((doc) => doc && doc.document)
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
        count: processedDocuments.length,
        filters_applied: filters.length,
        limit,
        documents: processedDocuments,
      };
    } catch (error) {
      throw new FirestoreError(`Failed to query documents: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      collection_path: { type: 'string' },
      project_id: { type: 'string' },
      count: { type: 'integer' },
      filters_applied: { type: 'integer' },
      limit: { type: 'integer' },
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
        filters_applied: { type: 'integer' },
        limit: { type: 'integer' },
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

export default queryDocuments;
