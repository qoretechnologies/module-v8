import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { getContentfulAssetAllowedValues } from '../../helpers/get-asset-allowed-values';

const action = 'delete_asset';

const options = {
  ...contentfulBaseOptions,
  asset_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulAssetAllowedValues,
  },
} satisfies TQoreOptions;

const DeleteAsset = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string', short_desc: 'Deleted asset ID' },
      deleted: { type: 'bool', short_desc: 'Whether the asset was successfully deleted' },
    },
  },
  api_function: async (obj, _opts, context) => {
    const { space_id, asset_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'asset_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);

      // Unpublish if published before deleting
      try {
        const asset = await client.asset.get({ assetId: asset_id });
        if ((asset.sys as any).publishedVersion) {
          await client.asset.unpublish({ assetId: asset_id });
        }
      } catch {
        // Asset may already be unpublished
      }

      await client.asset.delete({ assetId: asset_id });

      return { id: asset_id, deleted: true };
    } catch (error) {
      throw new ContentfulError(`Failed to delete asset: ${error}`);
    }
  },
});

export default DeleteAsset;
