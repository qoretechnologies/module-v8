import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { createSupabaseClient } from '../helpers/constants';

const action = 'create_bucket';

const options = {
  name: {
    type: 'string',
    required: true,
  },
  public_access: {
    type: 'bool',
    required: false,
    default_value: false,
  },
  file_size_limit: {
    type: 'integer',
    required: false,
  },
  allowed_mime_types: {
    type: {
      type: 'list',
      element_type: 'string',
    },
    required: false,
  },
} satisfies TQoreOptions;

const createBucket = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, projectId, name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['name'],
      connectionFields: ['token', 'projectId'],
      ErrorClass: SupabaseError,
    });

    const { public_access = false, file_size_limit, allowed_mime_types } = obj || {};

    try {
      const client = createSupabaseClient({ token, projectId });

      const bucketOptions: any = {
        public: public_access,
      };

      if (file_size_limit) {
        bucketOptions.fileSizeLimit = file_size_limit;
      }

      if (allowed_mime_types && allowed_mime_types.length > 0) {
        bucketOptions.allowedMimeTypes = allowed_mime_types;
      }

      const { data, error } = await client.storage.createBucket(name, bucketOptions);

      if (error) {
        throw new SupabaseError(`Supabase create bucket error: ${error.message}`);
      }

      return {
        bucket_id: data.name,
        bucket_name: data.name,
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
      bucket_id: { type: 'string' },
      bucket_name: { type: 'string' },
    },
  },
});

export default createBucket;
