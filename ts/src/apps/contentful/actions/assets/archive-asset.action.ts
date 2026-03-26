import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { getContentfulAssetAllowedValues } from '../../helpers/get-asset-allowed-values';

const action = 'archive_asset';

const options = {
  ...contentfulBaseOptions,
  asset_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulAssetAllowedValues,
  },
  archive: {
    type: 'bool',
    required: true,
    default_value: true,
  },
} satisfies TQoreOptions;

const ArchiveAsset = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: {
    type: 'hash',
    fields: {
      id: { type: 'string', short_desc: 'Asset ID' },
      archived: { type: 'bool', short_desc: 'Whether the asset is archived' },
    },
  },
  api_function: async (obj, _opts, context) => {
    const { space_id, asset_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'asset_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';
    const shouldArchive = obj?.archive !== false;

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);

      if (shouldArchive) {
        await client.asset.archive({ assetId: asset_id });
      } else {
        await client.asset.unarchive({ assetId: asset_id });
      }

      return { id: asset_id, archived: shouldArchive };
    } catch (error) {
      const operation = shouldArchive ? 'archive' : 'unarchive';
      throw new ContentfulError(`Failed to ${operation} asset: ${error}`);
    }
  },
});

export default ArchiveAsset;
