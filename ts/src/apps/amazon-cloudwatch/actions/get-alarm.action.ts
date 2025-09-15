import { DescribeAlarmsCommand } from '@aws-sdk/client-cloudwatch';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_CLOUDWATCH_APP_NAME, AmazonCloudWatchError } from '../constants';
import { createCloudWatchClient, formatCloudWatchDate, buildCloudWatchConsoleUrl } from '../helpers/constants';
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
  alarm_name: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getAmazonCloudWatchAlarmAllowedValues,
    depends_on: ['region'],
  },
} satisfies TQoreOptions;

const getAlarm = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDWATCH_APP_NAME,
  action: 'get_alarm',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, alarm_name } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      connectionFields: ['access_key_id', 'secret_access_key'],
      optionFields: ['alarm_name'],
      ErrorClass: AmazonCloudWatchError,
    });

    const region = obj?.region || context?.conn_opts?.region;

    try {
      const cloudWatchClient = createCloudWatchClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new DescribeAlarmsCommand({
        AlarmNames: [alarm_name],
      });

      const response = await cloudWatchClient.send(command);

      if (!response.MetricAlarms || response.MetricAlarms.length === 0) {
        throw new AmazonCloudWatchError(`Alarm '${alarm_name}' not found`);
      }

      const alarm = response.MetricAlarms[0];

      return {
        alarm_name: alarm.AlarmName || '',
        alarm_description: alarm.AlarmDescription || '',
        alarm_arn: alarm.AlarmArn || '',
        actions_enabled: alarm.ActionsEnabled || false,
        ok_actions: alarm.OKActions || [],
        alarm_actions: alarm.AlarmActions || [],
        insufficient_data_actions: alarm.InsufficientDataActions || [],
        state_value: alarm.StateValue || '',
        state_reason: alarm.StateReason || '',
        state_reason_data: alarm.StateReasonData || '',
        state_updated_timestamp: formatCloudWatchDate(alarm.StateUpdatedTimestamp),
        metric_name: alarm.MetricName || '',
        namespace: alarm.Namespace || '',
        statistic: alarm.Statistic || '',
        extended_statistic: alarm.ExtendedStatistic || '',
        dimensions: (alarm.Dimensions || []).map((dim) => ({
          name: dim.Name || '',
          value: dim.Value || '',
        })),
        period: alarm.Period || 0,
        unit: alarm.Unit || '',
        evaluation_periods: alarm.EvaluationPeriods || 0,
        datapoints_to_alarm: alarm.DatapointsToAlarm || 0,
        threshold: alarm.Threshold || 0,
        comparison_operator: alarm.ComparisonOperator || '',
        treat_missing_data: alarm.TreatMissingData || '',
        evaluate_low_sample_count_percentile: alarm.EvaluateLowSampleCountPercentile || '',
        alarm_configuration_updated_timestamp: formatCloudWatchDate(
          alarm.AlarmConfigurationUpdatedTimestamp
        ),
        console_url: buildCloudWatchConsoleUrl(region || 'us-east-1', alarm_name),
        retrieved_at: new Date().toISOString(),
      };
    } catch (error) {
      throw new AmazonCloudWatchError(`Failed to get alarm: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      alarm_name: { type: 'string' },
      alarm_description: { type: 'string' },
      alarm_arn: { type: 'string' },
      actions_enabled: { type: 'boolean' },
      ok_actions: {
        type: {
          type: 'list',
          element_type: 'string',
        },
      },
      alarm_actions: {
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
      state_value: { type: 'string' },
      state_reason: { type: 'string' },
      state_reason_data: { type: 'string' },
      state_updated_timestamp: { type: 'string' },
      metric_name: { type: 'string' },
      namespace: { type: 'string' },
      statistic: { type: 'string' },
      extended_statistic: { type: 'string' },
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
      period: { type: 'integer' },
      unit: { type: 'string' },
      evaluation_periods: { type: 'integer' },
      datapoints_to_alarm: { type: 'integer' },
      threshold: { type: 'number' },
      comparison_operator: { type: 'string' },
      treat_missing_data: { type: 'string' },
      evaluate_low_sample_count_percentile: { type: 'string' },
      alarm_configuration_updated_timestamp: { type: 'string' },
      console_url: { type: 'string' },
      retrieved_at: { type: 'string' },
    },
  },
});

export default getAlarm;
