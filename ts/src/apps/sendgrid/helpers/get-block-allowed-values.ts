import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridBlock {
  email: string;
  reason: string;
  created: number;
}

const mapBlockToAllowedValue = (block: ISendGridBlock): IQoreAllowedValue<string> => {
  const createdDate = new Date(block.created * 1000).toLocaleString();
  return {
    value: block.email,
    display_name: block.email,
    desc: `Reason: ${block.reason}\nCreated: ${createdDate}`,
  };
};

export const getSendGridBlockAllowedValues: TQoreGetAllowedValuesFunction<
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
      url: '/v3/suppression/blocks',
      method: 'GET',
      qs: { limit: 500 },
    });

    const blocks = response.body as ISendGridBlock[];
    return blocks.map(mapBlockToAllowedValue);
  } catch (error) {
    throw new SendGridError(`Failed to fetch allowed values for blocks: ${error.message || error}`);
  }
};
