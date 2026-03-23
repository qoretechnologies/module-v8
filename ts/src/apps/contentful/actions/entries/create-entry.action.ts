import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseWithContentTypeOptions } from '../../helpers/shared-options';
import { flattenEntry, getDefaultLocale, wrapFieldsWithLocale } from '../../helpers/contentful-type-mapping';
import { getContentfulEntryFieldOptions, getContentfulEntryDynamicResponseType } from '../../helpers/get-dynamic-entry-type';
import { ContentfulEntryResponseType } from '../../response-types';

const action = 'create_entry';

const options = {
  ...contentfulBaseWithContentTypeOptions,
  fields: {
    type: 'hash',
    required: true,
    get_dynamic_type: getContentfulEntryFieldOptions,
    depends_on: ['content_type_id'],
  },
  publish: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const CreateEntry = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulEntryResponseType,
  get_dynamic_response_type: getContentfulEntryDynamicResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, content_type_id, fields } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'content_type_id', 'fields'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';
    const shouldPublish = obj?.publish === true;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);
      const wrappedFields = wrapFieldsWithLocale(fields as Record<string, unknown>, defaultLocale);

      let entry = await client.entry.create(
        { contentTypeId: content_type_id },
        { fields: wrappedFields }
      );

      if (shouldPublish) {
        entry = await client.entry.publish(
          { entryId: entry.sys.id },
          { sys: { version: entry.sys.version } } as any
        ) as any;
      }

      return flattenEntry(entry, defaultLocale);
    } catch (error) {
      throw new ContentfulError(`Failed to create entry: ${error}`);
    }
  },
});

export default CreateEntry;
