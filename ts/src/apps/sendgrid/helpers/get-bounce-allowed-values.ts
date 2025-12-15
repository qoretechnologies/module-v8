import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridBounce {
  email: string;
  reason: string;
  status: string;
  created: number;
}

const mapBounceToAllowedValue = (bounce: ISendGridBounce): IQoreAllowedValue<string> => {
  const createdDate = new Date(bounce.created * 1000).toLocaleString();
  return {
    value: bounce.email,
    display_name: bounce.email,
    desc: `Status: ${bounce.status}\nReason: ${bounce.reason}\nCreated: ${createdDate}`,
  };
};

export const getSendGridBounceAllowedValues: TQoreGetAllowedValuesFunction<
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
      url: '/v3/suppression/bounces',
      method: 'GET',
      qs: { limit: 500 },
    });

    const bounces = response.body as ISendGridBounce[];
    return bounces.map(mapBounceToAllowedValue);
  } catch (error: any) {
    throw new SendGridError(
      `Failed to fetch allowed values for bounces: ${error.message || error}`
    );
  }
};
