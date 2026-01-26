import { SetAlarmStateCommand } from '@aws-sdk/client-cloudwatch';
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
  CLOUDWATCH_STATE_REASONS,
} from '../constants';
import { buildCloudWatchConsoleUrl, createCloudWatchClient } from '../helpers/constants';
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
  state_value: {
    required: true,
    type: 'string',
    allowed_values: CLOUDWATCH_ALARM_STATES,
  },
  state_reason: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    allowed_values: CLOUDWATCH_STATE_REASONS,
  },
} satisfies TQoreOptions;

const setAlarmState = QoreAppCreator.createLocalizedAction<typeof options>({
  app: AMAZON_CLOUDWATCH_APP_NAME,
  action: 'set_alarm_state',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { access_key_id, secret_access_key, alarm_name, state_value, state_reason } =
      getQoreContextRequiredValues({
        context: { ...context, opts: obj },
        connectionFields: ['access_key_id', 'secret_access_key'],
        optionFields: ['alarm_name', 'state_value', 'state_reason'],
        ErrorClass: AmazonCloudWatchError,
      });

    const region = obj?.region || context?.conn_opts?.region;

    try {
      const cloudWatchClient = createCloudWatchClient({
        access_key_id,
        secret_access_key,
        region: region || 'us-east-1',
      });

      const command = new SetAlarmStateCommand({
        AlarmName: alarm_name,
        StateValue: state_value,
        StateReason: state_reason,
      });

      await cloudWatchClient.send(command);

      return {
        success: true,
        region,
        alarm_name,
        state_value,
        state_reason,
        console_url: buildCloudWatchConsoleUrl(region || 'us-east-1', alarm_name),
        state_updated_at: new Date().toISOString(),
        message: `Successfully set alarm '${alarm_name}' state to '${state_value}'`,
      };
    } catch (error) {
      throw new AmazonCloudWatchError(`Failed to set alarm state: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      success: { type: 'bool' },
      region: { type: 'string' },
      alarm_name: { type: 'string' },
      state_value: { type: 'string' },
      state_reason: { type: 'string' },
      console_url: { type: 'string' },
      state_updated_at: { type: 'string' },
      message: { type: 'string' },
    },
  },
});

export default setAlarmState;
