import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { getContentfulEntryAllowedValues } from '../../helpers/get-entry-allowed-values';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { ContentfulPublishResponseType } from '../../response-types';

const action = 'publish_entry';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  entry_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulEntryAllowedValues,
  },
} satisfies TQoreOptions;

const PublishEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulPublishResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, entry_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'entry_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const entry = await client.entry.get({ entryId: entry_id });

      const published = await client.entry.publish(
        { entryId: entry_id },
        { sys: { version: entry.sys.version } } as any
      );

      return {
        id: published.sys.id,
        version: published.sys.version,
        published_at: (published.sys as any).publishedAt,
      };
    } catch (error) {
      throw new ContentfulError(`Failed to publish entry: ${error}`);
    }
  },
});

export default PublishEntry;
