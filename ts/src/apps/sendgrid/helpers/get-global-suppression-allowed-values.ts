import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridGlobalSuppression {
  email: string;
  created: number;
}

const mapSuppressionToAllowedValue = (
  suppression: ISendGridGlobalSuppression
): IQoreAllowedValue<string> => {
  const createdDate = new Date(suppression.created * 1000).toLocaleString();
  return {
    value: suppression.email,
    display_name: suppression.email,
    desc: `Created: ${createdDate}`,
  };
};

export const getSendGridGlobalSuppressionAllowedValues: TQoreGetAllowedValuesFunction<
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
      url: '/v3/suppression/unsubscribes',
      method: 'GET',
      qs: { limit: 500 },
    });

    const suppressions = response.body as ISendGridGlobalSuppression[];
    return suppressions.map(mapSuppressionToAllowedValue);
  } catch (error) {
    throw new SendGridError(
      `Failed to fetch allowed values for global suppressions: ${error.message || error}`
    );
  }
};
