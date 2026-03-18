import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulEntryAllowedValues } from '../../helpers/get-entry-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { flattenEntry, getDefaultLocale } from '../../helpers/contentful-type-mapping';
import { ContentfulEntryResponseType } from '../../response-types';

const action = 'get_entry';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  entry_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulEntryAllowedValues,
    depends_on: ['content_type_id'],
  },
} satisfies TQoreOptions;

const GetEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulEntryResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, entry_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'entry_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);
      const entry = await client.entry.get({ entryId: entry_id });

      return flattenEntry(entry, defaultLocale);
    } catch (error) {
      throw new ContentfulError(`Failed to get entry: ${error}`);
    }
  },
});

export default GetEntry;
