import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { createSupabaseClient } from '../helpers/constants';
import { getSupabaseBucketAllowedValues } from '../helpers/get-bucket-allowed-values';

const action = 'get_bucket';

const options = {
  bucket_id: {
    type: 'string',
    required: true,
    allowed_values_creatable: true,
    get_allowed_values: getSupabaseBucketAllowedValues,
  },
} satisfies TQoreOptions;

const getBucket = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, projectId, bucket_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['bucket_id'],
      connectionFields: ['token', 'projectId'],
      ErrorClass: SupabaseError,
    });

    try {
      const client = createSupabaseClient({ token, projectId });

      const { data: bucket, error } = await client.storage.getBucket(bucket_id);

      if (error) {
        throw new SupabaseError(`Supabase get bucket error: ${error.message}`);
      }

      if (!bucket) {
        throw new SupabaseError(`Bucket '${bucket_id}' not found`);
      }

      return {
        success: true,
        id: bucket.id,
        name: bucket.name,
        owner: bucket.owner,
        public: bucket.public,
        created_at: bucket.created_at,
        updated_at: bucket.updated_at,
        file_size_limit: bucket.file_size_limit,
        allowed_mime_types: bucket.allowed_mime_types,
      };
    } catch (error) {
      if (error instanceof SupabaseError) {
        throw error;
      }
      throw new SupabaseError(`Failed to ${humanizeNameTitle(action)}: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      id: { type: 'string' },
      name: { type: 'string' },
      owner: { type: 'string' },
      public: { type: 'bool' },
      created_at: { type: 'string' },
      updated_at: { type: 'string' },
      file_size_limit: { type: 'integer' },
      allowed_mime_types: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
    },
  },
});

export default getBucket;
