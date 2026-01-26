import { DescribeAlarmsCommand, StateValue } from '@aws-sdk/client-cloudwatch';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import {
  AMAZON_CLOUDWATCH_APP_NAME,
  AmazonCloudWatchError,
  CLOUDWATCH_ALARM_STATES,
} from '../constants';
import {
  buildCloudWatchConsoleUrl,
  createCloudWatchClient,
  formatCloudWatchDate,
} from '../helpers/constants';

const options = {
  region: {
    required: false,
    preselected: true,
    type: 'string',
    allowed_values_creatable: true,
    get_default_value: getAmazonDefaultRegion,
    get_allowed_values: getAWSRegionAllowedValues,
  },
  alarm_name_prefix: {
    required: false,
    type: 'string',
  },
  state_filter: {
    required: false,
    type: 'string',
    allowed_values: CLOUDWATCH_ALARM_STATES,
  },
  max_records: {
    required: false,
    type: 'integer',
    default_value: 50,
  },
} satisfies TQoreOptions;

const listAlarms = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDWATCH_APP_NAME,
  action: 'list_alarms',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonCloudWatchError,
    });

    const region = obj?.region || context?.conn_opts?.region;
    const { alarm_name_prefix, state_filter, max_records } = obj || {};

    try {
      const cloudWatchClient = createCloudWatchClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new DescribeAlarmsCommand({
        MaxRecords: max_records || 50,
        ...(alarm_name_prefix && { AlarmNamePrefix: alarm_name_prefix }),
        ...(state_filter && { StateValue: state_filter as StateValue }),
      });

      const response = await cloudWatchClient.send(command);
      const alarms: any[] = [];

      if (response.MetricAlarms) {
        for (const alarm of response.MetricAlarms) {
          if (alarm.AlarmName) {
            alarms.push({
              alarm_name: alarm.AlarmName,
              alarm_description: alarm.AlarmDescription || '',
              alarm_arn: alarm.AlarmArn || '',
              actions_enabled: alarm.ActionsEnabled || false,
              state_value: alarm.StateValue || '',
              state_reason: alarm.StateReason || '',
              state_updated_timestamp: formatCloudWatchDate(alarm.StateUpdatedTimestamp),
              metric_name: alarm.MetricName || '',
              namespace: alarm.Namespace || '',
              threshold: alarm.Threshold || 0,
              comparison_operator: alarm.ComparisonOperator || '',
              evaluation_periods: alarm.EvaluationPeriods || 0,
              period: alarm.Period || 0,
              statistic: alarm.Statistic || '',
              dimensions: (alarm.Dimensions || []).map((dim) => ({
                name: dim.Name || '',
                value: dim.Value || '',
              })),
              alarm_actions: alarm.AlarmActions || [],
              ok_actions: alarm.OKActions || [],
              insufficient_data_actions: alarm.InsufficientDataActions || [],
              alarm_configuration_updated_timestamp: formatCloudWatchDate(
                alarm.AlarmConfigurationUpdatedTimestamp
              ),
              console_url: buildCloudWatchConsoleUrl(region || 'us-east-1', alarm.AlarmName),
            });
          }
        }
      }

      const stateCount = alarms.reduce(
        (acc, alarm) => {
          const state = alarm.state_value;
          acc[state] = (acc[state] || 0) + 1;

          return acc;
        },
        {} as Record<string, number>
      );

      return {
        region: region || 'us-east-1',
        alarm_count: alarms.length,
        state_summary: stateCount,
        filters: {
          alarm_name_prefix: alarm_name_prefix || '',
          state_filter: state_filter || '',
          max_records: max_records || 50,
        },
        alarms,
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonCloudWatchError(`Failed to list alarms: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      region: { type: 'string' },
      alarm_count: { type: 'integer' },
      state_summary: {
        type: {
          type: 'hash',
        },
      },
      filters: {
        type: {
          type: 'hash',
          fields: {
            alarm_name_prefix: { type: 'string' },
            state_filter: { type: 'string' },
            max_records: { type: 'integer' },
          },
        },
      },
      alarms: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              alarm_name: { type: 'string' },
              alarm_description: { type: 'string' },
              alarm_arn: { type: 'string' },
              actions_enabled: { type: 'bool' },
              state_value: { type: 'string' },
              state_reason: { type: 'string' },
              state_updated_timestamp: { type: 'string' },
              metric_name: { type: 'string' },
              namespace: { type: 'string' },
              threshold: { type: 'number' },
              comparison_operator: { type: 'string' },
              evaluation_periods: { type: 'integer' },
              period: { type: 'integer' },
              statistic: { type: 'string' },
              dimensions: {
                type: {
                  type: 'list',
                  element_type: {
                    type: 'hash',
                    fields: {
                      name: { type: 'string' },
                      value: { type: 'string' },
                    },
                  },
                },
              },
              alarm_actions: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              ok_actions: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              insufficient_data_actions: {
                type: {
                  type: 'list',
                  element_type: 'string',
                },
              },
              alarm_configuration_updated_timestamp: { type: 'string' },
              console_url: { type: 'string' },
            },
          },
        },
      },
      retrieved_at: { type: 'string' },
    },
  },
});

export default listAlarms;
