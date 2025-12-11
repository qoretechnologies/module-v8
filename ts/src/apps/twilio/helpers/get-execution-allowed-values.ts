import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { ExecutionInstance } from 'twilio/lib/rest/studio/v2/flow/execution';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

export const TwilioExecutionStatusAllowedValues: IQoreAllowedValue<string>[] = [
  { display_name: 'Active', value: 'active' },
  { display_name: 'Ended', value: 'ended' },
];

type TTwilioItem = ExecutionInstance;

const mapTwilioItemToAllowedValue = (item: TTwilioItem): IQoreAllowedValue<string> => {
  return {
    value: item.sid,
    display_name: `Flow: ${item.flowSid} | Contact: ${item.contactChannelAddress} | Status: ${item.status}`,
    desc: `Created: ${item.dateCreated}\n` + `Updated: ${item.dateUpdated}`,
  };
};

export const getTwilioExecutionAllowedValues: TQoreGetAllowedValuesFunction<
  typeof TWILIO_CONN_OPTIONS,
  string
> = async (context) => {
  const { username, password, flowSid } = getQoreContextRequiredValues({
    context,
    connectionFields: ['username', 'password'],
    optionFields: ['flowSid'],
    ErrorClass: TwilioError,
  });

  const client = createTwilioClient(username, password);

  try {
    const executions = await client.studio.v2.flows(flowSid).executions.list({ pageSize: 100 });

    return executions.map(mapTwilioItemToAllowedValue);
  } catch (error) {
    throw new TwilioError(
      `Failed to fetch allowed values for execution: ${error.message || error}`
    );
  }
};
