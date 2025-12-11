import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { CallInstance } from 'twilio/lib/rest/api/v2010/account/call';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

export const TwilioCallStatusAllowedValues: IQoreAllowedValue<string>[] = [
  { display_name: 'Queued', value: 'queued' },
  { display_name: 'Ringing', value: 'ringing' },
  { display_name: 'In Progress', value: 'in-progress' },
  { display_name: 'Canceled', value: 'canceled' },
  { display_name: 'Completed', value: 'completed' },
  { display_name: 'Failed', value: 'failed' },
  { display_name: 'Busy', value: 'busy' },
  { display_name: 'No Answer', value: 'no-answer' },
];

export const TwilioCallDirectionAllowedValues: IQoreAllowedValue<string>[] = [
  { display_name: 'Inbound', value: 'inbound' },
  { display_name: 'Outbound API', value: 'outbound-api' },
  { display_name: 'Outbound Dial', value: 'outbound-dial' },
  { display_name: 'Trunking Terminating', value: 'trunking-terminating' },
  { display_name: 'Trunking Originating', value: 'trunking-originating' },
];

type TTwilioItem = CallInstance;

const mapTwilioItemToAllowedValue = (item: TTwilioItem): IQoreAllowedValue<string> => {
  return {
    value: item.sid,
    display_name: `To: ${item.to} | From: ${item.from} | Status: ${item.status}`,
    desc: `Duration: ${item.duration}s\n` + `Price: ${item.price}\n` + `Start Time: ${item.startTime}`,
  };
};

export const getTwilioCallAllowedValues: TQoreGetAllowedValuesFunction<
  typeof TWILIO_CONN_OPTIONS,
  string
> = async (context) => {
  const { username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['username', 'password'],
    ErrorClass: TwilioError,
  });

  const client = createTwilioClient(username, password);

  try {
    const calls = await client.calls.list({ pageSize: 1000 });

    return calls.map(mapTwilioItemToAllowedValue);
  } catch (error) {
    throw new TwilioError(`Failed to fetch allowed values for call: ${error.message || error}`);
  }
};
