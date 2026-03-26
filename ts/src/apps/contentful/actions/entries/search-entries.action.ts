import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { flattenEntry, getDefaultLocale } from '../../helpers/contentful-type-mapping';
import { getContentfulEntryDynamicResponseType } from '../../helpers/get-dynamic-entry-type';
import { ContentfulEntryListResponseType } from '../../response-types';

const action = 'search_entries';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  query: {
    type: 'string',
    required: false,
  },
  limit: {
    type: 'int',
    required: false,
    default_value: 100,
  },
  skip: {
    type: 'int',
    required: false,
    default_value: 0,
  },
} satisfies TQoreOptions;

const SearchEntries = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulEntryListResponseType,
  get_dynamic_response_type: getContentfulEntryDynamicResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, content_type_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'content_type_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';
    const limit = (obj?.limit as number) || 100;
    const skip = (obj?.skip as number) || 0;
    const queryText = obj?.query as string | undefined;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);

      const query: Record<string, unknown> = {
        content_type: content_type_id,
        limit,
        skip,
      };

      if (queryText) {
        query.query = queryText;
      }

      const entries = await client.entry.getMany({ query });

      return entries.items.map((entry) => flattenEntry(entry, defaultLocale));
    } catch (error) {
      throw new ContentfulError(`Failed to search entries: ${error}`);
    }
  },
});

export default SearchEntries;
