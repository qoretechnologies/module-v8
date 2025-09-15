import { DescribeAlarmsCommand, StateValue } from '@aws-sdk/client-cloudwatch';
import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { DEFAULT_TRIGGER_POLL_ITEM_LIMIT } from '../../../global/constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { pollCreatedItemsForTrigger } from '../../../global/helpers/event-triggers';
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
  createCloudWatchClient,
  formatCloudWatchDate,
  buildCloudWatchConsoleUrl,
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
} satisfies TQoreOptions;

const AmazonCloudWatchAlarmStateChangeTrigger = QoreAppCreator.createLocalizedTrigger({
  app: AMAZON_CLOUDWATCH_APP_NAME,
  action: 'alarm_state_change',
  action_code: EQoreAppActionCode.EVENT,
  options,
  event_function: async (context, update, should_stop) => {
    const { access_key_id, secret_access_key } = getQoreContextRequiredValues({
      context,
      connectionFields: ['access_key_id', 'secret_access_key'],
      ErrorClass: AmazonCloudWatchError,
    });

    const region = context?.opts?.region || context?.conn_opts?.region;
    const { alarm_name_prefix, state_filter } = context?.opts || {};

    const getItems = () => {
      return fetchAlarmsWithStateChanges({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
        alarm_name_prefix,
        state_filter,
      });
    };

    await pollCreatedItemsForTrigger({
      trigger_name: 'amazon_cloudwatch_alarm_state_change',
      uniqueField: 'state_change_key',
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

    const { alarm_name_prefix, state_filter } = context?.opts || {};

    const alarms = await fetchAlarmsWithStateChanges({
      access_key_id,
      secret_access_key,
      region: region || 'us-east-1',
      alarm_name_prefix,
      state_filter,
    });

    return alarms?.length > 0 ? alarms[0] : null;
  },
  event_info: {
    desc: 'Amazon CloudWatch Alarm State Change Trigger Event Info',
    type: {
      type: 'hash',
      fields: {
        state_change_key: { type: 'string' },
        alarm_name: { type: 'string' },
        current_state: { type: 'string' },
        state_reason: { type: 'string' },
        state_reason_data: { type: 'string' },
        state_updated_timestamp: { type: 'string' },
        alarm_description: { type: 'string' },
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
        console_url: { type: 'string' },
      },
    },
  },
});

export default AmazonCloudWatchAlarmStateChangeTrigger;

const fetchAlarmsWithStateChanges = async (options: {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  alarm_name_prefix?: string;
  state_filter?: string;
}) => {
  const { access_key_id, secret_access_key, region, alarm_name_prefix, state_filter } = options;

  try {
    const cloudWatchClient = createCloudWatchClient({
      access_key_id,
      secret_access_key,
      region,
    });

    const command = new DescribeAlarmsCommand({
      MaxRecords: DEFAULT_TRIGGER_POLL_ITEM_LIMIT,
      ...(alarm_name_prefix && { AlarmNamePrefix: alarm_name_prefix }),
      ...(state_filter && { StateValue: state_filter as StateValue }),
    });

    const response = await cloudWatchClient.send(command);
    const alarmStateChanges: any[] = [];

    if (response.MetricAlarms) {
      for (const alarm of response.MetricAlarms) {
        if (alarm.AlarmName && alarm.StateValue) {
          const stateChangeKey = `${alarm.AlarmName}_${alarm.StateUpdatedTimestamp?.getTime() || Date.now()}_${alarm.StateValue}`;

          alarmStateChanges.push({
            state_change_key: stateChangeKey,
            alarm_name: alarm.AlarmName,
            current_state: alarm.StateValue,
            state_reason: alarm.StateReason || '',
            state_reason_data: alarm.StateReasonData || '',
            state_updated_timestamp: formatCloudWatchDate(alarm.StateUpdatedTimestamp),
            alarm_description: alarm.AlarmDescription || '',
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
            console_url: buildCloudWatchConsoleUrl(region, alarm.AlarmName),
          });
        }
      }
    }

    return alarmStateChanges.sort((a, b) => {
      const dateA = new Date(a.state_updated_timestamp || 0);
      const dateB = new Date(b.state_updated_timestamp || 0);

      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    throw new AmazonCloudWatchError(
      `Failed to fetch alarms with state changes: ${error.message || error}`
    );
  }
};
