import { DescribeAlarmsCommand } from '@aws-sdk/client-cloudwatch';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
import {
  getAmazonDefaultRegion,
  getAWSRegionAllowedValues,
} from '../../../global/helpers/get-amazon-region-allowed-values';
import { AMAZON_CLOUDWATCH_APP_NAME, AmazonCloudWatchError } from '../constants';
import { createCloudWatchClient, formatCloudWatchDate, buildCloudWatchConsoleUrl } from '../helpers/constants';

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
} satisfies TQoreOptions;

const AmazonCloudWatchNewAlarmTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_CLOUDWATCH_APP_NAME,
  action: 'new_alarm',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonCloudWatchError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;
    const { alarm_name_prefix } = context?.opts || {};

    const getItems = () => {
      return fetchLatestAlarms({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
        alarm_name_prefix,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_cloudwatch_new_alarm',
      uniqueField: 'alarm_name',
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
      ErrorClass: AmazonCloudWatchError,
    });

    const { alarm_name_prefix } = context?.opts || {};

    const alarms = await fetchLatestAlarms({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
      alarm_name_prefix,
    });

    return alarms?.length > 0 ? alarms[0] : null;
  },
  event_info: {
    desc: 'Amazon CloudWatch New Alarm Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        alarm_name: { type: 'string' },
        alarm_description: { type: 'string' },
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
      },
    },
  },
});

export default AmazonCloudWatchNewAlarmTrigger;

const fetchLatestAlarms = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  alarm_name_prefix?: string;
}) => {
  const { access_key_id, secret_access_key, region, alarm_name_prefix } = options;

  try {
    const cloudWatchClient = createCloudWatchClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new DescribeAlarmsCommand({
      MaxRecords: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
      ...(alarm_name_prefix && { AlarmNamePrefix: alarm_name_prefix }),
    });

    const response = await cloudWatchClient.send(command);
    const alarms: any[] = [];

    if (response.MetricAlarms) {
      for (const alarm of response.MetricAlarms) {
        if (alarm.AlarmName) {
          alarms.push({
            alarm_name: alarm.AlarmName,
            alarm_description: alarm.AlarmDescription || '',
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
            console_url: buildCloudWatchConsoleUrl(region, alarm.AlarmName),
          });
        }
      }
    }

    return alarms.sort((a, b) => {
      const dateA = new Date(a.alarm_configuration_updated_timestamp || 0);
      const dateB = new Date(b.alarm_configuration_updated_timestamp || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonCloudWatchError(`Failed to fetch latest alarms: ${error.message || error}`);
  }
};
