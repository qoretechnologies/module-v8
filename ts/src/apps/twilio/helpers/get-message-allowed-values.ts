import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

export const TwilioMessageStatusAllowedValues: IQoreAllowedValue<string>[] = [
  { display_name: 'Queued', value: 'queued' },
  { display_name: 'Sending', value: 'sending' },
  { display_name: 'Sent', value: 'sent' },
  { display_name: 'Failed', value: 'failed' },
  { display_name: 'Delivered', value: 'delivered' },
  { display_name: 'Undelivered', value: 'undelivered' },
  { display_name: 'Receiving', value: 'receiving' },
  { display_name: 'Received', value: 'received' },
  { display_name: 'Accepted', value: 'accepted' },
  { display_name: 'Scheduled', value: 'scheduled' },
  { display_name: 'Read', value: 'read' },
  { display_name: 'Partially Delivered', value: 'partially_delivered' },
  { display_name: 'Canceled', value: 'canceled' },
];

export const TwilioMessageDirectionAllowedValues: IQoreAllowedValue<string>[] = [
  { display_name: 'Inbound', value: 'inbound' },
  { display_name: 'Outbound API', value: 'outbound-api' },
  { display_name: 'Outbound Call', value: 'outbound-call' },
  { display_name: 'Outbound Reply', value: 'outbound-reply' },
];

type TTwilioItem = MessageInstance;

const mapTwilioItemToAllowedValue = (item: TTwilioItem): IQoreAllowedValue<string> => {
  return {
    value: item.sid,
    display_name: `To: ${item.to} | From: ${item.from} | Status: ${item.status}`,
    desc: `Price: ${item.price}\n` + `Date Sent: ${item.dateSent}\n` + `Body: ${item.body}`,
  };
};

export const getTwilioMessageAllowedValues: TQoreGetAllowedValuesFunction<
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
    const messages = await client.messages.list({ pageSize: 1000 });

    return messages.map(mapTwilioItemToAllowedValue);
  } catch (error) {
    throw new TwilioError(`Failed to fetch allowed values for message: ${error.message || error}`);
  }
};
