import { ListLayersCommand, ListLayerVersionsCommand } from '@aws-sdk/client-lambda';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { Debugger } from '../../../utils/Debugger';
import { AMAZON_LAMBDA_APP_NAME, AmazonLambdaError } from '../constants';
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
} satisfies TQoreOptions;

const AWSLambdaNewLayerVersionTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_LAMBDA_APP_NAME,
  action: 'new_layer_version',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonLambdaError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;

    const getItems = () => {
      return fetchLatestLayerVersions({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'aws_lambda_new_layer_version',
      uniqueField: 'layer_version_arn',
      getItems,
      update,
      should_stop,
    });
  },
  get_example_event_data: async (context) => {
    const { access_key_id, secret_access_key, region } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['region'],
      ErrorClass: AmazonLambdaError,
    });

    const layerVersions = await fetchLatestLayerVersions({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
    });

    return layerVersions?.length > 0 ? layerVersions[0] : null;
  },
  event_info: {
    desc: 'AWS Lambda New Layer Version Trigger Event Info',
    type: {
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
});

export default AWSLambdaNewLayerVersionTrigger;

const fetchLatestLayerVersions = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
}) => {
  const { access_key_id, secret_access_key, region } = options;

  try {
    const lambdaClient = createLambdaClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const layersCommand = new ListLayersCommand({
      MaxItems: 50,
    });
    const layersResponse = await lambdaClient.send(layersCommand);

    const layerVersions: any[] = [];

    if (layersResponse.Layers) {
      for (const layer of layersResponse.Layers) {
        if (layer.LayerName) {
          try {
            const versionsCommand = new ListLayerVersionsCommand({
              LayerName: layer.LayerName,
              MaxItems: 50,
            });
            const versionsResponse = await lambdaClient.send(versionsCommand);

            if (versionsResponse.LayerVersions) {
              for (const version of versionsResponse.LayerVersions) {
                layerVersions.push({
                  layer_name: layer.LayerName,
                  layer_version_arn: version.LayerVersionArn || '',
                  version: version.Version || 0,
                  description: version.Description || '',
                  created_date: formatLambdaDate(version.CreatedDate),
                  compatible_runtimes: version.CompatibleRuntimes || [],
                  license_info: version.LicenseInfo || '',
                  compatible_architectures: version.CompatibleArchitectures || [],
                });
              }
            }
          } catch (versionError) {
            Debugger.log(`Failed to get versions for layer ${layer.LayerName}:`, versionError);
          }
        }
      }
    }

    return layerVersions.sort((a, b) => {
      const dateA = new Date(a.created_date || 0);
      const dateB = new Date(b.created_date || 0);

      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonLambdaError(`Failed to fetch latest layer versions: ${error.message || error}`);
  }
};
