import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { TranscriptionInstance } from 'twilio/lib/rest/api/v2010/account/recording/transcription';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

export const TwilioTranscriptionStatusAllowedValues: IQoreAllowedValue<string>[] = [
  { display_name: 'In Progress', value: 'in-progress' },
  { display_name: 'Completed', value: 'completed' },
  { display_name: 'Failed', value: 'failed' },
];

type TTwilioItem = TranscriptionInstance;

const mapTwilioItemToAllowedValue = (item: TTwilioItem): IQoreAllowedValue<string> => {
  return {
    value: item.sid,
    display_name: `Recording: ${item.recordingSid} | Status: ${item.status}`,
    desc:
      `Duration: ${item.duration}s\n` +
      `Price: ${item.price}\n` +
      `Text Preview: ${item.transcriptionText?.substring(0, 100)}...`,
  };
};

export const getTwilioTranscriptionAllowedValues: TQoreGetAllowedValuesFunction<
  typeof TWILIO_CONN_OPTIONS,
  string
> = async (context) => {
  const { username, password, recordingSid } = getQoreContextRequiredValues({
    context,
    connectionFields: ['username', 'password'],
    optionFields: ['recordingSid'],
    ErrorClass: TwilioError,
  });

  const client = createTwilioClient(username, password);

  try {
    const transcriptions = await client
      .recordings(recordingSid)
      .transcriptions.list({ pageSize: 1000 });

    return transcriptions.map(mapTwilioItemToAllowedValue);
  } catch (error) {
    throw new TwilioError(
      `Failed to fetch allowed values for transcription: ${error.message || error}`
    );
  }
};
