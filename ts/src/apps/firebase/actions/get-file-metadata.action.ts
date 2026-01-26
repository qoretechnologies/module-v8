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
  file_path: {
    required: true,
    type: 'string',
  },
} satisfies TQoreOptions;

const getFileMetadata = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'get_file_metadata',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, bucket, file_path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['bucket', 'file_path'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    try {
      const response = await firebaseApiClient<{
        name: string;
        bucket: string;
        generation: string;
        metageneration: string;
        contentType: string;
        timeCreated: string;
        updated: string;
        size: string;
        md5Hash: string;
        metadata?: Record<string, string>;
        contentEncoding?: string;
        contentDisposition?: string;
        cacheControl?: string;
      }>({
        token,
        path: `/storage/v1/b/${bucket}/o/${encodeURIComponent(file_path)}`,
        method: 'GET',
        baseUrl: FIREBASE_STORAGE_URL,
      });

      return {
        file_path: response.name,
        bucket: response.bucket,
        content_type: response.contentType,
        size: parseInt(response.size),
        created_at: response.timeCreated,
        updated_at: response.updated,
        generation: response.generation,
        metageneration: response.metageneration,
        md5_hash: response.md5Hash,
        metadata: response.metadata,
        content_encoding: response.contentEncoding,
        content_disposition: response.contentDisposition,
        cache_control: response.cacheControl,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to get file metadata: ${getFirebaseErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      file_path: { type: 'string' },
      bucket: { type: 'string' },
      content_type: { type: 'string' },
      size: { type: 'integer' },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
      generation: { type: 'string' },
      metageneration: { type: 'string' },
      md5_hash: { type: 'string' },
      metadata: { type: 'hash' },
      content_encoding: { type: 'string' },
      content_disposition: { type: 'string' },
      cache_control: { type: 'string' },
    },
  },
});

export default getFileMetadata;
