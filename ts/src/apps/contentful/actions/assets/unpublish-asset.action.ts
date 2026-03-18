import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { getContentfulAssetAllowedValues } from '../../helpers/get-asset-allowed-values';

const action = 'unpublish_asset';

const options = {
  ...contentfulBaseOptions,
  asset_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulAssetAllowedValues,
  },
} satisfies TQoreOptions;

const UnpublishAsset = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string', short_desc: 'Asset ID' },
      version: { type: 'int', short_desc: 'Current version number' },
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
      const unpublished = await client.asset.unpublish({ assetId: asset_id });

      return {
        id: unpublished.sys.id,
        version: unpublished.sys.version,
      };
    } catch (error) {
      throw new ContentfulError(`Failed to unpublish asset: ${error}`);
    }
  },
});

export default UnpublishAsset;
