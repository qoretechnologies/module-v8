import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridList {
  id: number;
  name: string;
  recipient_count: number;
}

const mapListToAllowedValue = (list: ISendGridList): IQoreAllowedValue<string> => {
  return {
    value: String(list.id),
    display_name: list.name,
    desc: `Recipients: ${list.recipient_count || 0}`,
  };
};

export const getSendGridListAllowedValues: TQoreGetAllowedValuesFunction<
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
      url: '/v3/contactdb/lists',
      method: 'GET',
    });

    const data = response.body as { lists: ISendGridList[] };
    const lists = data.lists || [];
    return lists.map(mapListToAllowedValue);
  } catch (error: any) {
    throw new SendGridError(`Failed to fetch allowed values for lists: ${error.message || error}`);
  }
};
