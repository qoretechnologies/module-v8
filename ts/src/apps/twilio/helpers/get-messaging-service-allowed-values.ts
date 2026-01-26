import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { ServiceInstance } from 'twilio/lib/rest/messaging/v1/service';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

type TTwilioMessagingService = ServiceInstance;

const mapTwilioMessagingServiceToAllowedValue = (
  service: TTwilioMessagingService
): IQoreAllowedValue<string> => {
  return {
    value: service.sid,
    display_name: service.friendlyName || service.sid,
  };
};

export const getTwilioMessagingServiceAllowedValues: TQoreGetAllowedValuesFunction<
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
    const services = await client.messaging.v1.services.list({ pageSize: 1000 });

    return services.map(mapTwilioMessagingServiceToAllowedValue);
  } catch (error) {
    throw new TwilioError(
      `Failed to fetch allowed values for messaging service: ${error.message || error}`
    );
  }
};
