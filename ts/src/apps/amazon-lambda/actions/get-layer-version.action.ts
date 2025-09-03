import { GetLayerVersionCommand } from '@aws-sdk/client-lambda';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_LAMBDA_APP_NAME, AmazonLambdaError } from '../constants';
import { createLambdaClient, formatFileSize, formatLambdaDate } from '../helpers/constants';
import {
  getAWSLambdaLayerAllowedValues,
  getAWSLambdaLayerVersionAllowedValues,
} from '../helpers/get-layer-allowed-values';

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
    on_change: ['refetch'],
  },
  version_number: {
    required: true,
    type: 'number',
    allowed_values_creatable: true,
    get_allowed_values: getAWSLambdaLayerVersionAllowedValues,
    depends_on: ['region', 'layer_name'],
  },
} satisfies TQoreOptions;

const getLayerVersion = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_LAMBDA_APP_NAME,
  action: 'get_layer_version',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, layer_name, version_number } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['layer_name', 'version_number'],
        ErrorClass: AmazonLambdaError,
      });

    const region = obj?.region || context?.conn_opts?.region;

    try {
      const lambdaClient = createLambdaClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new GetLayerVersionCommand({
        LayerName: layer_name,
        VersionNumber: version_number,
      });

      const response = await lambdaClient.send(command);

      return {
        layer_name,
        layer_arn: response.LayerArn || '',
        layer_version_arn: response.LayerVersionArn || '',
        version: response.Version || 0,
        description: response.Description || '',
        created_date: formatLambdaDate(response.CreatedDate),
        compatible_runtimes: response.CompatibleRuntimes || [],
        license_info: response.LicenseInfo || '',
        compatible_architectures: response.CompatibleArchitectures || [],
        content: response.Content
          ? {
              location: response.Content.Location || '',
              code_sha256: response.Content.CodeSha256 || '',
              code_size: response.Content.CodeSize || 0,
              formatted_code_size: formatFileSize(response.Content.CodeSize),
              signing_profile_version_arn: response.Content.SigningProfileVersionArn || '',
              signing_job_arn: response.Content.SigningJobArn || '',
            }
          : null,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonLambdaError(`Failed to get layer version: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      layer_name: { type: 'string' },
      layer_arn: { type: 'string' },
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
      content: {
        type: {
          type: 'hash',
          fields: {
            location: { type: 'string' },
            code_sha256: { type: 'string' },
            code_size: { type: 'integer' },
            formatted_code_size: { type: 'string' },
            signing_profile_version_arn: { type: 'string' },
            signing_job_arn: { type: 'string' },
          },
        },
      },
      retrieved_at: { type: 'string' },
    },
  },
});

export default getLayerVersion;
