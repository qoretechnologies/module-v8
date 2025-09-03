import { ListLayerVersionsCommand, Runtime } from '@aws-sdk/client-lambda';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_LAMBDA_APP_NAME, AmazonLambdaError, LAMBDA_RUNTIME_OPTIONS } from '../constants';
import { createLambdaClient, formatLambdaDate } from '../helpers/constants';
import { getAWSLambdaLayerAllowedValues } from '../helpers/get-layer-allowed-values';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
    on_change: ['refetch'],
  },
  layer_name: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAWSLambdaLayerAllowedValues,
    depends_on: ['region'],
  },
  compatible_runtime: {
    required: false,
    type: 'string',
    allowed_values: LAMBDA_RUNTIME_OPTIONS,
  },
  max_items: {
    required: false,
    type: 'integer',
    default_value: 50,
  },
  next_marker: {
    required: false,
    type: 'string',
  },
} satisfies TQoreOptions;

const listLayerVersions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_LAMBDA_APP_NAME,
  action: 'list_layer_versions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, layer_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['layer_name'],
      ErrorClass: AmazonLambdaError,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { compatible_runtime, max_items, next_marker } = obj || {};

    try {
      const lambdaClient = createLambdaClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new ListLayerVersionsCommand({
        LayerName: layer_name,
        CompatibleRuntime: compatible_runtime as Runtime,
        MaxItems: max_items || 50,
        ...(next_marker && { Marker: next_marker }),
      });

      const response = await lambdaClient.send(command);

      const layerVersions = (response.LayerVersions || []).map((version) => ({
        layer_name,
        layer_version_arn: version.LayerVersionArn || '',
        version: version.Version || 0,
        description: version.Description || '',
        created_date: formatLambdaDate(version.CreatedDate),
        compatible_runtimes: version.CompatibleRuntimes || [],
        license_info: version.LicenseInfo || '',
        compatible_architectures: version.CompatibleArchitectures || [],
      }));

      return {
        layer_name,
        version_count: layerVersions.length,
        layer_versions: layerVersions,
        next_marker: response.NextMarker || null,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonLambdaError(`Failed to list layer versions: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      layer_name: { type: 'string' },
      version_count: { type: 'integer' },
      layer_versions: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              layer_name: { type: 'string' },
              layer_version_arn: { type: 'string' },
              version: { type: 'integer' },
              description: { type: 'string' },
              created_date: { type: 'string' },
              compatible_runtimes: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              license_info: { type: 'string' },
              compatible_architectures: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
            },
          },
        },
      },
      next_marker: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listLayerVersions;
