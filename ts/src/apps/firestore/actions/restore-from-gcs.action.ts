import {
  EQoreAppActionCode,
  QoreAppCreator,
  QorusRequest,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIRESTORE_APP_NAME, FirestoreError, getFirestoreErrorMessage } from '../constants';
import { getFirestoreProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getFirestoreCollectionIdAllowedValues } from '../helpers/get-collection-id-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirestoreProjectIdAllowedValues,
    on_change: ['refetch'],
  },
  input_uri_prefix: {
    required: true,
    type: 'string',
  },
  collection_ids: {
    required: false,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getFirestoreCollectionIdAllowedValues,
  },
} satisfies TQoreOptions;

const restoreFromGCS = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIRESTORE_APP_NAME,
  action: 'restore_from_google_cloud_storage',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id, input_uri_prefix } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'input_uri_prefix'],
      connectionFields: ['token'],
      ErrorClass: FirestoreError,
    });

    const collection_ids = obj?.collection_ids;

    try {
      const requestBody: any = {
        inputUriPrefix: input_uri_prefix,
      };

      if (collection_ids && collection_ids.length > 0) {
        requestBody.collectionIds = collection_ids;
      }

      const response = await QorusRequest.post<{
        data: {
          name: string;
          metadata?: any;
        };
      }>(
        {
          path: `/v1/projects/${project_id}/databases/(default):importDocuments`,
          data: requestBody,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
        {
          url: 'https://firestore.googleapis.com',
          endpointId: FIRESTORE_APP_NAME,
        }
      );

      return {
        project_id,
        input_uri_prefix,
        operation_name: response?.data?.name,
        collection_ids: collection_ids || [],
        started_at: new Date().toISOString(),
        message: 'Restore operation initiated successfully',
      };
    } catch (error) {
      throw new FirestoreError(`Failed to restore from GCS: ${getFirestoreErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      project_id: { type: 'string' },
      input_uri_prefix: { type: 'string' },
      operation_name: { type: 'string' },
      collection_ids: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      started_at: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default restoreFromGCS;
