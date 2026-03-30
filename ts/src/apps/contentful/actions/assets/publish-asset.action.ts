import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { getContentfulAssetAllowedValues } from '../../helpers/get-asset-allowed-values';
import { ContentfulPublishResponseType } from '../../response-types';

const action = 'publish_asset';

const options = {
  ...contentfulBaseOptions,
  asset_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulAssetAllowedValues,
  },
} satisfies TQoreOptions;

const PublishAsset = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulPublishResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, asset_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'asset_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const asset = await client.asset.get({ assetId: asset_id });

      const published = await client.asset.publish(
        { assetId: asset_id },
        { sys: { version: asset.sys.version } } as any
      );

      return {
        id: published.sys.id,
        version: published.sys.version,
        published_at: (published.sys as any).publishedAt,
      };
    } catch (error) {
      throw new ContentfulError(`Failed to publish asset: ${error}`);
    }
  },
});

export default PublishAsset;
