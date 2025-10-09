import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, humanizeNameTitle } from '../../../global/helpers';
import { SUPABASE_APP_NAME, SupabaseError } from '../constants';
import { createSupabaseClient } from '../helpers/constants';

const action = 'list_buckets';

const options = {} satisfies TQoreOptions;

const listBuckets = QoreAppCreator.createLocalizedAction<typeof options>({
  app: SUPABASE_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, projectId } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['token', 'projectId'],
      ErrorClass: SupabaseError,
    });

    try {
      const client = createSupabaseClient({ token, projectId });

      const { data: buckets, error } = await client.storage.listBuckets();

      if (error) {
        throw new SupabaseError(`Supabase list buckets error: ${error.message}`);
      }

      return {
        success: true,
        total_buckets: buckets?.length || 0,
        buckets: (buckets || []).map((bucket) => ({
          id: bucket.id,
          name: bucket.name,
          owner: bucket.owner,
          public: bucket.public,
          created_at: bucket.created_at,
          updated_at: bucket.updated_at,
          file_size_limit: bucket.file_size_limit,
          allowed_mime_types: bucket.allowed_mime_types,
        })),
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
      success: { type: 'boolean' },
      total_buckets: { type: 'integer' },
      buckets: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              id: { type: 'string' },
              name: { type: 'string' },
              owner: { type: 'string' },
              public: { type: 'boolean' },
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
        },
      },
    },
  },
});

export default listBuckets;
