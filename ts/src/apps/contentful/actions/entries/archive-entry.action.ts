import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulEntryAllowedValues } from '../../helpers/get-entry-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';

const action = 'archive_entry';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  entry_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulEntryAllowedValues,
  },
  archive: {
    type: 'bool',
    required: true,
    default_value: true,
  },
} satisfies TQoreOptions;

const ArchiveEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string', short_desc: 'Entry ID' },
      archived: { type: 'bool', short_desc: 'Whether the entry is archived' },
    },
  },
  api_function: async (obj, _opts, context) => {
    const { space_id, entry_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'entry_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';
    const shouldArchive = obj?.archive !== false;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);

      if (shouldArchive) {
        await client.entry.archive({ entryId: entry_id });
      } else {
        await client.entry.unarchive({ entryId: entry_id });
      }

      return { id: entry_id, archived: shouldArchive };
    } catch (error) {
      const operation = shouldArchive ? 'archive' : 'unarchive';
      throw new ContentfulError(`Failed to ${operation} entry: ${error}`);
    }
  },
});

export default ArchiveEntry;
