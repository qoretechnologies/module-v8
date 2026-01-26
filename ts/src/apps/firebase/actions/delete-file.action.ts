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

const deleteFile = QoreAppCreator.createLocalizedAction<typeof options>({
  app: FIREBASE_APP_NAME,
  action: 'delete_file',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, bucket, file_path } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['project_id', 'bucket', 'file_path'],
      connectionFields: ['token'],
      ErrorClass: FirebaseError,
    });

    try {
      await firebaseApiClient<void>({
        token,
        path: `/storage/v1/b/${bucket}/o/${encodeURIComponent(file_path)}`,
        method: 'DELETE',
        baseUrl: FIREBASE_STORAGE_URL,
      });

      return {
        file_path,
        bucket,
        deleted: true,
        message: `File ${file_path} deleted successfully from bucket ${bucket}`,
      };
    } catch (error) {
      throw new FirebaseError(`Failed to delete file: ${getFirebaseErrorMessage(error)}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      file_path: { type: 'string' },
      bucket: { type: 'string' },
      deleted: { type: 'bool' },
      message: { type: 'string' },
    },
  },
});

export default deleteFile;
