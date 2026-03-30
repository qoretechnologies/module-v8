import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulEntryAllowedValues } from '../../helpers/get-entry-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { flattenEntry, getDefaultLocale } from '../../helpers/contentful-type-mapping';
import { getContentfulEntryDynamicResponseType } from '../../helpers/get-dynamic-entry-type';
import { ContentfulEntryResponseType } from '../../response-types';

const action = 'get_entry_with_replacement';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  entry_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulEntryAllowedValues,
    depends_on: ['content_type_id'],
  },
  replacements: {
    type: {
      type: 'list',
      element_type: {
        type: 'hash',
        fields: {
          tag: { type: 'string', short_desc: 'The tag/placeholder to search for in text fields' },
          value: { type: 'string', short_desc: 'The replacement value' },
        },
      },
    },
    required: true,
  },
} satisfies TQoreOptions;

const GetEntryWithReplacement = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulEntryResponseType,
  get_dynamic_response_type: getContentfulEntryDynamicResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, entry_id, replacements } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'entry_id', 'replacements'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);
      const entry = await client.entry.get({ entryId: entry_id });
      const flattened = flattenEntry(entry, defaultLocale);

      const replacementList = replacements as Array<{ tag: string; value: string }>;

      for (const key of Object.keys(flattened)) {
        const val = flattened[key];
        if (typeof val === 'string') {
          let replaced = val;
          for (const { tag, value } of replacementList) {
            replaced = replaced.split(tag).join(value);
          }
          flattened[key] = replaced;
        }
      }

      return flattened;
    } catch (error) {
      throw new ContentfulError(`Failed to get entry with replacement: ${error}`);
    }
  },
});

export default GetEntryWithReplacement;
