import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { FlowInstance } from 'twilio/lib/rest/studio/v2/flow';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { TWILIO_CONN_OPTIONS, TwilioError } from '../constants';
import { createTwilioClient } from './constants';

type TTwilioItem = FlowInstance;

const mapTwilioItemToAllowedValue = (item: TTwilioItem): IQoreAllowedValue<string> => {
  return {
    value: item.sid,
    display_name: `${item.friendlyName} | Status: ${item.status}`,
    desc: `SID: ${item.sid}\n` + `Created: ${item.dateCreated}`,
  };
};

export const getTwilioFlowAllowedValues: TQoreGetAllowedValuesFunction<
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
    const flows = await client.studio.v2.flows.list({ pageSize: 1000 });

    return flows.map(mapTwilioItemToAllowedValue);
  } catch (error) {
    throw new TwilioError(`Failed to fetch allowed values for flow: ${error.message || error}`);
  }
};
