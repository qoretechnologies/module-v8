import { ListLayersCommand, Runtime } from '@aws-sdk/client-lambda';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_LAMBDA_APP_NAME, AmazonLambdaError, LAMBDA_RUNTIME_OPTIONS } from '../constants';
import { createLambdaClient, formatLambdaDate } from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  compatible_runtime: {
    required: false,
    type: 'string',
    allowed_values_creatable: true,
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

const listLayers = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_LAMBDA_APP_NAME,
  action: 'list_layers',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
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

      const command = new ListLayersCommand({
        CompatibleRuntime: compatible_runtime as Runtime,
        MaxItems: max_items || 50,
        ...(next_marker && { Marker: next_marker }),
      });

      const response = await lambdaClient.send(command);

      const layers = (response.Layers || []).map((layer) => {
        const latestVersion = layer.LatestMatchingVersion;

        return {
          layer_name: layer.LayerName || '',
          layer_arn: layer.LayerArn || '',
          latest_matching_version: latestVersion
            ? {
                layer_version_arn: latestVersion.LayerVersionArn || '',
                version: latestVersion.Version || 0,
                description: latestVersion.Description || '',
                created_date: formatLambdaDate(latestVersion.CreatedDate),
                compatible_runtimes: latestVersion.CompatibleRuntimes || [],
                license_info: latestVersion.LicenseInfo || '',
                compatible_architectures: latestVersion.CompatibleArchitectures || [],
              }
            : null,
        };
      });

      return {
        layer_count: layers.length,
        layers,
        next_marker: response.NextMarker || null,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonLambdaError(`Failed to list layers: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      layer_count: { type: 'integer' },
      layers: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              layer_name: { type: 'string' },
              layer_arn: { type: 'string' },
              latest_matching_version: {
                type: {
                  type: 'hash',
                  fields: {
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
          },
        },
      },
      next_marker: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listLayers;
