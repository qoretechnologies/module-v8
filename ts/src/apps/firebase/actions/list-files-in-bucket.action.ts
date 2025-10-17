import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { FIREBASE_APP_NAME, FirebaseError, getFirebaseErrorMessage } from '../constants';
import { firebaseApiClient, FIREBASE_STORAGE_URL } from '../helpers/constants';
import { getFirebaseProjectIdAllowedValues } from '../helpers/get-project-id-allowed-values';
import { getFirebaseBucketAllowedValues } from '../helpers/get-bucket-allowed-values';

const options = {
  project_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseProjectIdAllowedValues,
    on_change: ['refetch'],
  },
  bucket: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseBucketAllowedValues,
    depends_on: ['project_id'],
  },
  prefix: {
    required: false,
    type: 'string',
  },
  max_results: {
    required: false,
    type: 'integer',
    default_value: 100,
  },
  page_token: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listFilesInBucket = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'list_files_in_bucket',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, bucket } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'bucket'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    const { prefix, max_results = 100, page_token } = obj || {};

    try {
      const response = await firebaseApiClient<{
        items: Array<{
          name: string;
          bucket: string;
          contentType: string;
          size: string;
          timeCreated: string;
          updated: string;
        }>;
        nextPageToken?: string;
      }>({
        token,
        path: `/storage/v1/b/${bucket}/o`,
        method: 'GET',
        params: {
          maxResults: max_results.toString(),
          ...(prefix && { prefix }),
          ...(page_token && { pageToken: page_token }),
        },
        baseUrl: FIREBASE_STORAGE_URL,
      });

      const files = (response.items || []).map((file) => ({
        file_path: file.name,
        bucket: file.bucket,
        content_type: file.contentType,
        size: parseInt(file.size),
        created_at: file.timeCreated,
        updated_at: file.updated,
      }));

      return {
        bucket,
        prefix: prefix || '',
        files,
        file_count: files.length,
        next_page_token: response.nextPageToken,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to list files in bucket: ${getFirebaseErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      bucket: { type: 'string' },
      prefix: { type: 'string' },
      files: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              file_path: { type: 'string' },
              bucket: { type: 'string' },
              content_type: { type: 'string' },
              size: { type: 'integer' },
              created_at: { type: 'string' },
              updated_at: { type: 'string' },
            },
          },
        },
      },
      file_count: { type: 'integer' },
      next_page_token: { type: 'string' },
    },
  },
});

export default listFilesInBucket;
