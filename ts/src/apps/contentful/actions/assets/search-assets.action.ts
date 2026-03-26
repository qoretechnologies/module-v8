import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { flattenAsset, getDefaultLocale } from '../../helpers/contentful-type-mapping';
import { ContentfulAssetListResponseType } from '../../response-types';

const action = 'search_assets';

const options = {
  ...contentfulBaseOptions,
  query: {
    type: 'string',
    required: false,
  },
  mime_type_group: {
    type: 'string',
    required: false,
    allowed_values: [
      { value: 'image', display_name: 'Image' },
      { value: 'video', display_name: 'Video' },
      { value: 'audio', display_name: 'Audio' },
      { value: 'richtext', display_name: 'Rich Text' },
      { value: 'presentation', display_name: 'Presentation' },
      { value: 'spreadsheet', display_name: 'Spreadsheet' },
      { value: 'pdfdocument', display_name: 'PDF Document' },
      { value: 'archive', display_name: 'Archive' },
      { value: 'plaintext', display_name: 'Plain Text' },
      { value: 'code', display_name: 'Code' },
      { value: 'markup', display_name: 'Markup' },
    ],
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

const SearchAssets = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulAssetListResponseType,
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
    const mimeTypeGroup = obj?.mime_type_group as string | undefined;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);

      const query: Record<string, unknown> = { limit, skip };

      if (queryText) {
        query.query = queryText;
      }
      if (mimeTypeGroup) {
        query.mimetype_group = mimeTypeGroup;
      }

      const assets = await client.asset.getMany({ query });

      return assets.items.map((asset) => flattenAsset(asset, defaultLocale));
    } catch (error) {
      throw new ContentfulError(`Failed to search assets: ${error}`);
    }
  },
});

export default SearchAssets;
