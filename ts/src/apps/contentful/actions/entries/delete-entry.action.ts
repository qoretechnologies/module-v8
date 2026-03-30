import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulEntryAllowedValues } from '../../helpers/get-entry-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';

const action = 'delete_entry';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  entry_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulEntryAllowedValues,
    depends_on: ['content_type_id'],
  },
} satisfies TQoreOptions;

const DeleteEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string', short_desc: 'Deleted entry ID' },
      deleted: { type: 'bool', short_desc: 'Whether the entry was successfully deleted' },
    },
  },
  api_function: async (obj, _opts, context) => {
    const { space_id, entry_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'entry_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);

      // Unpublish if published before deleting
      try {
        const entry = await client.entry.get({ entryId: entry_id });
        if ((entry.sys as any).publishedVersion) {
          await client.entry.unpublish({ entryId: entry_id });
        }
      } catch {
        // Entry may already be unpublished
      }

      await client.entry.delete({ entryId: entry_id });

      return { id: entry_id, deleted: true };
    } catch (error) {
      throw new ContentfulError(`Failed to delete entry: ${error}`);
    }
  },
});

export default DeleteEntry;
