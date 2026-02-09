import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridVerifiedSender {
  id: number;
  nickname: string;
  from_email: string;
  from_name: string;
  reply_to: string;
  reply_to_name: string;
  verified: boolean;
  locked: boolean;
}

interface ISendGridVerifiedSendersResponse {
  results: ISendGridVerifiedSender[];
}

const mapSenderToAllowedValue = (sender: ISendGridVerifiedSender): IQoreAllowedValue<string> => {
  const displayName = sender.from_name
    ? `${sender.from_name} <${sender.from_email}>`
    : sender.from_email;

  return {
    value: sender.from_email,
    display_name: displayName,
    desc: `Nickname: ${sender.nickname}\nVerified: ${sender.verified ? 'Yes' : 'No'}`,
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
      url: '/v3/verified_senders',
      method: 'GET',
    });

    const data = response.body as ISendGridVerifiedSendersResponse;

    return data.results.map(mapSenderToAllowedValue);
  } catch (error) {
    throw new SendGridError(
      `Failed to fetch allowed values for senders: ${error instanceof Error ? error.message : error}`
    );
  }
};
