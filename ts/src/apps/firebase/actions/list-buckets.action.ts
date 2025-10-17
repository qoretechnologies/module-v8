import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIREBASE_APP_NAME, FirebaseError, getFirebaseErrorMessage } from '../constants';
import { firebaseApiClient, FIREBASE_STORAGE_URL } from '../helpers/constants';
import { getFirebaseProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseProjectIdAllowedValues,
  },
} satisfies TQoreOptions;

const listBuckets = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'list_buckets',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, project_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    try {
      const response = await firebaseApiClient<{
        items: Array<{
          name: string;
          timeCreated: string;
          updated: string;
          storageClass: string;
          location: string;
        }>;
      }>({
        token,
        path: `/storage/v1/b`,
        method: 'GET',
        params: {
          project: project_id,
        },
        baseUrl: FIREBASE_STORAGE_URL,
      });

      const buckets = (response.items || []).map((bucket) => ({
        name: bucket.name,
        location: bucket.location,
        storage_class: bucket.storageClass,
        created_at: bucket.timeCreated,
        updated_at: bucket.updated,
      }));

      return {
        project_id,
        buckets,
        bucket_count: buckets.length,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to list buckets: ${getFirebaseErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      project_id: { type: 'string' },
      buckets: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              name: { type: 'string' },
              location: { type: 'string' },
              storage_class: { type: 'string' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
            },
          },
        },
      },
      bucket_count: { type: 'integer' },
    },
  },
});

export default listBuckets;
