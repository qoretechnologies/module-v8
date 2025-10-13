import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import {
  extractCollectionPath,
  extractDocumentId,
  firestoreApiClient,
  firestoreDocumentToJs,
} from '../helpers/constants';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getFirestoreCollectionPathAllowedValues } from '../helpers/get-collection-path-allowed-values';
import { getFirestoreCollectionFieldAllowedValues } from '../helpers/get-collection-fields';

const action = 'new_document';

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
    depends_on: ['project_id'],
    on_change: ['refetch'],
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
              { value: 'LESS_THAN', display_name: 'Less than (<)' },
              { value: 'LESS_THAN_OR_EQUAL', display_name: 'Less than or equal (<=)' },
              { value: 'GREATER_THAN', display_name: 'Greater than (>)' },
              { value: 'GREATER_THAN_OR_EQUAL', display_name: 'Greater than or equal (>=)' },
              { value: 'EQUAL', display_name: 'Equal (==)' },
              { value: 'NOT_EQUAL', display_name: 'Not equal (!=)' },
              { value: 'ARRAY_CONTAINS', display_name: 'Array contains' },
              { value: 'IN', display_name: 'In' },
              { value: 'ARRAY_CONTAINS_ANY', display_name: 'Array contains any' },
              { value: 'NOT_IN', display_name: 'Not in' },
            ],
          },
          value: {
            type: 'string',
            required: true,
          },
        },
      },
    },
  },
  order_by: {
    required: false,
    type: {
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
          default_value: 'DESCENDING',
          allowed_values: [
            { value: 'ASCENDING', display_name: 'Ascending' },
            { value: 'DESCENDING', display_name: 'Descending' },
          ],
        },
      },
    },
  },
} satisfies TQoreOptions;

const FirestoreNewDocumentTrigger = QoreAppCreator.createLocalizedTrigger({
  app: FIRESTORE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { token, project_id, collection_path } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['project_id', 'collection_path'],
      ErrorClass: FirestoreError,
    });

    const { filters, order_by } = context.opts || {};

    const getItems = () => {
      return fetchLatestDocuments({
        token,
        project_id,
        collection_path,
        filters,
        order_by,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: `firestore_${action}`,
      uniqueField: 'document_id',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { token, project_id, collection_path } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token'],
      optionFields: ['project_id', 'collection_path'],
      ErrorClass: FirestoreError,
    });

    const { filters, order_by } = context.opts || {};

    const documents = await fetchLatestDocuments({
      token,
      project_id,
      collection_path,
      filters,
      order_by,
    });

    return documents?.length > 0 ? documents[0] : null;
  },
  event_info: {
    desc: 'Firestore New Document Trigger Event Info',
    type: {
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
});

export default FirestoreNewDocumentTrigger;

const fetchLatestDocuments = async (options: {
  token: string;
  project_id: string;
  collection_path: string;
  filters?: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  order_by?: {
    field: string;
    direction: string;
  };
}): Promise<
  Array<{
    document_id: string;
    path: string;
    create_time: string;
    update_time: string;
    data: Record<string, any>;
  }>
> => {
  const { token, project_id, collection_path, filters, order_by } = options;
  const limit = DEFAULT_TRIGGER_POLL_ITEM_LIMIT;

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

    if (filters && filters.length > 0) {
      const fieldFilters = filters.map((filter) => ({
        fieldFilter: {
          field: {
            fieldPath: filter.field,
          },
          op: filter.operator,
          value: convertValueToFirestoreValue(filter.value),
        },
      }));

      if (fieldFilters.length === 1) {
        structuredQuery.where = fieldFilters[0];
      } else {
        structuredQuery.where = {
          compositeFilter: {
            op: 'AND',
            filters: fieldFilters,
          },
        };
      }
    }

    if (order_by && order_by.field) {
      structuredQuery.orderBy = [
        {
          field: {
            fieldPath: order_by.field,
          },
          direction: order_by.direction || 'DESCENDING',
        },
      ];
    } else {
      structuredQuery.orderBy = [
        {
          field: {
            fieldPath: '__name__',
          },
          direction: 'DESCENDING',
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

    return documents;
  } catch (error) {
    throw new FirestoreError(
      `Failed to fetch latest documents: ${getFirestoreErrorMessage(error)}`
    );
  }
};

const convertValueToFirestoreValue = (value: string): any => {
  if (!isNaN(Number(value))) {
    if (value.includes('.')) {
      return { doubleValue: parseFloat(value) };
    }
    return { integerValue: value };
  }

  if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
    return { booleanValue: value.toLowerCase() === 'true' };
  }

  if (value.toLowerCase() === 'null') {
    return { nullValue: null };
  }

  return { stringValue: value };
};
