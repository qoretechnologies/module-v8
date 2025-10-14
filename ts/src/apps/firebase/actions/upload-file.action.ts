import {
  EQoreAppActionCode,
  QoreAppCreator,
  TQoreFile,
  TQoreOptions,
} from '@qoretechnologies/ts-toolkit';
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
  file_path: {
    required: true,
    type: 'string',
  },
  bucket: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getFirebaseBucketAllowedValues,
    depends_on: ['project_id'],
  },
  file: {
    required: true,
    type: 'file',
  },
  metadata: {
    required: false,
    type: 'hash',
  },
} satisfies TQoreOptions;

const uploadFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'upload_file',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, bucket, file, file_path } = getQoreContextRequiredValues<{
      file: TQoreFile;
      bucket: string;
      file_path: string;
      project_id: string;
      token: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'bucket', 'file', 'file_path'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    const { metadata } = obj || {};

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
      }>({
        token,
        path: `/upload/storage/v1/b/${bucket}/o`,
        method: 'POST',
        params: {
          uploadType: 'media',
          name: file_path,
        },
        body: {
          contentEncoding: 'base64',
          ...(metadata && { metadata }),
        },
        headers: {
          'Content-Type': file.mime_type || 'application/octet-stream',
          'Content-Length': file.content.length.toString(),
        },
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
        md5_hash: response.md5Hash,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to upload file: ${getFirebaseErrorMessage(error)}`);
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
      md5_hash: { type: 'string' },
    },
  },
});

export default uploadFile;
