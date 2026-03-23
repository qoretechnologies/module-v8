import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulEntryAllowedValues } from '../../helpers/get-entry-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { flattenEntry, getDefaultLocale, wrapFieldsWithLocale } from '../../helpers/contentful-type-mapping';
import { getContentfulEntryFieldOptions, getContentfulEntryDynamicResponseType } from '../../helpers/get-dynamic-entry-type';
import { ContentfulEntryResponseType } from '../../response-types';

const action = 'update_entry';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  entry_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulEntryAllowedValues,
    depends_on: ['content_type_id'],
  },
  fields: {
    type: 'hash',
    required: true,
    required_groups: ['update_field'],
    get_dynamic_type: getContentfulEntryFieldOptions,
    depends_on: ['content_type_id'],
  },
} satisfies TQoreOptions;

const UpdateEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulEntryResponseType,
  get_dynamic_response_type: getContentfulEntryDynamicResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, entry_id, fields } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'entry_id', 'fields'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);

      const currentEntry = await client.entry.get({ entryId: entry_id });
      const updatedFields = wrapFieldsWithLocale(fields as Record<string, unknown>, defaultLocale);

      const mergedFields = {
        ...(currentEntry.fields as Record<string, Record<string, unknown>>),
        ...updatedFields,
      };

      const updatedEntry = await client.entry.update(
        { entryId: entry_id },
        {
          sys: { version: currentEntry.sys.version } as any,
          fields: mergedFields,
        }
      );

      return flattenEntry(updatedEntry, defaultLocale);
    } catch (error) {
      throw new ContentfulError(`Failed to update entry: ${error}`);
    }
  },
});

export default UpdateEntry;
