import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { flattenAsset, getDefaultLocale } from '../../helpers/contentful-type-mapping';
import { ContentfulAssetResponseType } from '../../response-types';

const action = 'create_asset';

const options = {
  ...contentfulBaseOptions,
  title: {
    type: 'string',
    required: true,
  },
  description: {
    type: 'string',
    required: false,
  },
  file_name: {
    type: 'string',
    required: true,
  },
  file_url: {
    type: 'string',
    required: true,
  },
  content_type: {
    type: 'string',
    required: true,
    allowed_values: [
      { value: 'image/jpeg', display_name: 'JPEG Image' },
      { value: 'image/png', display_name: 'PNG Image' },
      { value: 'image/gif', display_name: 'GIF Image' },
      { value: 'image/svg+xml', display_name: 'SVG Image' },
      { value: 'image/webp', display_name: 'WebP Image' },
      { value: 'application/pdf', display_name: 'PDF Document' },
      { value: 'video/mp4', display_name: 'MP4 Video' },
      { value: 'audio/mpeg', display_name: 'MP3 Audio' },
      { value: 'application/json', display_name: 'JSON' },
      { value: 'text/plain', display_name: 'Plain Text' },
      { value: 'text/html', display_name: 'HTML' },
      { value: 'text/csv', display_name: 'CSV' },
    ],
    allowed_values_creatable: true,
  },
  publish: {
    type: 'bool',
    required: false,
    default_value: false,
  },
} satisfies TQoreOptions;

const CreateAsset = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulAssetResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, title, file_name, file_url, content_type } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'title', 'file_name', 'file_url', 'content_type'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';
    const description = obj?.description as string | undefined;
    const shouldPublish = obj?.publish === true;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);

      let asset = await client.asset.create(
        {},
        {
          fields: {
            title: { [defaultLocale]: title },
            description: description ? { [defaultLocale]: description } : undefined,
            file: {
              [defaultLocale]: {
                contentType: content_type,
                fileName: file_name,
                upload: file_url,
              },
            },
          } as any,
        }
      );

      // Process the asset (download and store the file)
      await client.asset.processForAllLocales({}, asset);

      // Wait briefly for processing, then fetch updated asset
      await new Promise((resolve) => setTimeout(resolve, 2000));
      asset = await client.asset.get({ assetId: asset.sys.id });

      if (shouldPublish) {
        asset = await client.asset.publish(
          { assetId: asset.sys.id },
          { sys: { version: asset.sys.version } } as any
        ) as any;
      }

      return flattenAsset(asset, defaultLocale);
    } catch (error) {
      throw new ContentfulError(`Failed to create asset: ${error}`);
    }
  },
});

export default CreateAsset;
