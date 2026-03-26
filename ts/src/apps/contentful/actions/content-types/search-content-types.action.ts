import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { ContentfulContentTypeListResponseType } from '../../response-types';

const action = 'search_content_types';

const options = {
  ...contentfulBaseOptions,
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

const SearchContentTypes = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulContentTypeListResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';
    const limit = (obj?.limit as number) || 100;
    const skip = (obj?.skip as number) || 0;
    const queryText = obj?.query as string | undefined;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);

      const query: Record<string, unknown> = { limit, skip };
      if (queryText) {
        query.query = queryText;
      }

      const contentTypes = await client.contentType.getMany({ query });

      return contentTypes.items.map((ct) => ({
        id: ct.sys.id,
        name: ct.name,
        description: ct.description,
        display_field: ct.displayField,
        fields: ct.fields.map((f) => ({
          id: f.id,
          name: f.name,
          type: f.type,
          required: f.required,
          localized: f.localized,
        })),
      }));
    } catch (error) {
      throw new ContentfulError(`Failed to search content types: ${error}`);
    }
  },
});

export default SearchContentTypes;
