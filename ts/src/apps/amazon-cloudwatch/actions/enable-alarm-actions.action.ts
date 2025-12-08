import { EnableAlarmActionsCommand } from '@aws-sdk/client-cloudwatch';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_CLOUDWATCH_APP_NAME, AmazonCloudWatchError } from '../constants';
import { createCloudWatchClient, buildCloudWatchConsoleUrl } from '../helpers/constants';
import { getAmazonCloudWatchAlarmAllowedValues } from '../helpers/get-alarm-allowed-values';

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
  alarm_names: {
    required: true,
    type: {
      type: 'list',
      element_type: 'string',
    },
    element_allowed_values_creatable: true,
    get_element_allowed_values: getAmazonCloudWatchAlarmAllowedValues,
    depends_on: ['region'],
  },
} satisfies TQoreOptions;

const enableAlarmActions = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDWATCH_APP_NAME,
  action: 'enable_alarm_actions',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, alarm_names } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['alarm_names'],
      ErrorClass: AmazonCloudWatchError,
    });

    const region = obj?.region || context?.conn_opts?.region;

    if (!alarm_names || alarm_names.length === 0) {
      throw new AmazonCloudWatchError('At least one alarm name must be provided');
    }

    try {
      const cloudWatchClient = createCloudWatchClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new EnableAlarmActionsCommand({
        AlarmNames: alarm_names,
      });

      await cloudWatchClient.send(command);

      return {
        success: true,
        region,
        alarm_names,
        enabled_count: alarm_names.length,
        console_urls: alarm_names.map((alarmName: string) => ({
          alarm_name: alarmName,
          url: buildCloudWatchConsoleUrl(region || 'us-east-1', alarmName),
        })),
        enabled_at: new Date().toISOString(),
        message: `Successfully enabled actions for ${alarm_names.length} alarm(s)`,
      };
    } catch (error) {
      throw new AmazonCloudWatchError(`Failed to enable alarm actions: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      region: { type: 'string' },
      alarm_names: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      enabled_count: { type: 'integer' },
      console_urls: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              alarm_name: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
      enabled_at: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default enableAlarmActions;
