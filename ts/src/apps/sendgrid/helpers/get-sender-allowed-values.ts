import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridSender {
  id: number;
  nickname: string;
  from: {
    email: string;
    name: string;
  };
  reply_to: {
    email: string;
    name: string;
  };
  verified: {
    status: boolean;
    reason: string;
  };
}

type TSendGridSendersResponse = ISendGridSender[]; 

const mapSenderToAllowedValue = (sender: ISendGridSender): IQoreAllowedValue<string> => {
  const displayName = sender.from.name
    ? `${sender.from.name} <${sender.from.email}>`
    : sender.from.email;

  return {
    value: sender.from.email,
    display_name: displayName,
    desc: `Nickname: ${sender.nickname}\nVerified: ${sender.verified.status ? 'Yes' : 'No'}`,
  };
};

export const getSendGridSenderAllowedValues: TQoreGetAllowedValuesFunction<
  typeof SENDGRID_CONN_OPTIONS,
  string
> = async (context) => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: SendGridError,
  });

  const client = createSendGridClient(token);

  try {
    const [response] = await client.request({
      url: '/v3/senders',
      method: 'GET',
    });

    const data = response.body as TSendGridSendersResponse;

    return data.map(mapSenderToAllowedValue);
  } catch (error) {
    throw new SendGridError(
      `Failed to fetch allowed values for senders: ${error.message || error}`
    );
  }
};
