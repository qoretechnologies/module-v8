import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { RecordingInstance } from 'twilio/lib/rest/api/v2010/account/recording';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

type TTwilioItem = RecordingInstance;

const mapTwilioItemToAllowedValue = (item: TTwilioItem): IQoreAllowedValue<string> => {
  return {
    value: item.sid,
    display_name: `Call: ${item.callSid} | Duration: ${item.duration}s | Status: ${item.status}`,
    desc: `Created: ${item.dateCreated}\n` + `Price: ${item.price}`,
  };
};

export const getTwilioRecordingAllowedValues: TQoreGetAllowedValuesFunction<
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
    const recordings = await client.recordings.list({ pageSize: 1000 });

    return recordings.map(mapTwilioItemToAllowedValue);
  } catch (error) {
    throw new TwilioError(`Failed to fetch allowed values for recording: ${error.message || error}`);
  }
};
