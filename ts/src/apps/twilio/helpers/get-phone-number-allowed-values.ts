import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { IncomingPhoneNumberInstance } from 'twilio/lib/rest/api/v2010/account/incomingPhoneNumber';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

type TTwilioPhoneNumber = IncomingPhoneNumberInstance;

const mapTwilioPhoneNumberToAllowedValue = (
  phoneNumber: TTwilioPhoneNumber
): IQoreAllowedValue<string> => {
  return {
    value: phoneNumber.phoneNumber,
    display_name: phoneNumber.friendlyName || phoneNumber.phoneNumber,
    desc:
      `SID: ${phoneNumber.sid}\n` +
      `Capabilities: ${JSON.stringify(phoneNumber.capabilities)}\n` +
      `Status: ${phoneNumber.status}`,
  };
};

export const getTwilioPhoneNumberAllowedValues: TQoreGetAllowedValuesFunction<
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
    const phoneNumbers = await client.incomingPhoneNumbers.list({ pageSize: 1000 });

    return phoneNumbers.map(mapTwilioPhoneNumberToAllowedValue);
  } catch (error) {
    throw new TwilioError(
      `Failed to fetch allowed values for phone numbers: ${error.message || error}`
    );
  }
};
