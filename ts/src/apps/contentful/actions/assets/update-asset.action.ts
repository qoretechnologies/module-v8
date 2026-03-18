import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getContentfulScopedClient } from '../../client';
import { CONTENTFUL_APP_NAME, ContentfulError } from '../../constants';
import { contentfulBaseOptions } from '../../helpers/shared-options';
import { getContentfulAssetAllowedValues } from '../../helpers/get-asset-allowed-values';
import { flattenAsset, getDefaultLocale } from '../../helpers/contentful-type-mapping';
import { ContentfulAssetResponseType } from '../../response-types';

const action = 'update_asset';

const options = {
  ...contentfulBaseOptions,
  asset_id: {
    type: 'string',
    required: true,
    get_allowed_values: getContentfulAssetAllowedValues,
  },
  title: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
  },
  description: {
    type: 'string',
    required: false,
    required_groups: ['update_field'],
  },
} satisfies TQoreOptions;

const UpdateAsset = QoreAppCreator.createLocalizedAction<typeof options>({
  app: CONTENTFUL_APP_NAME,
  action,
  action_code: EQoreAppActionCode.ACTION,
  options,
  response_type: ContentfulAssetResponseType,
  api_function: async (obj, _opts, context) => {
    const { space_id, asset_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['space_id', 'asset_id'],
      ErrorClass: ContentfulError,
    });

    const environmentId = obj?.environment_id || 'master';

    try {
      const client = getContentfulScopedClient(context, space_id, environmentId);
      const defaultLocale = await getDefaultLocale(client, space_id);

      const currentAsset = await client.asset.get({ assetId: asset_id });
      const fields = { ...(currentAsset.fields as Record<string, Record<string, unknown>>) };

      if (obj?.title !== undefined) {
        fields.title = { [defaultLocale]: obj.title };
      }
      if (obj?.description !== undefined) {
        fields.description = { [defaultLocale]: obj.description };
      }

      const updatedAsset = await client.asset.update(
        { assetId: asset_id },
        {
          sys: { version: currentAsset.sys.version },
          fields,
        } as any
      );

      return flattenAsset(updatedAsset, defaultLocale);
    } catch (error) {
      throw new ContentfulError(`Failed to update asset: ${error}`);
    }
  },
});

export default UpdateAsset;
