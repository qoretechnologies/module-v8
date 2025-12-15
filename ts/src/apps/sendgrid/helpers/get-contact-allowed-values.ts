import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SENDGRID_CONN_OPTIONS, SendGridError } from '../constants';
import { createSendGridClient } from './constants';

interface ISendGridContact {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
}

const mapContactToAllowedValue = (contact: ISendGridContact): IQoreAllowedValue<string> => {
  const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
  return {
    value: contact.id,
    display_name: contact.email,
    desc: name ? `Name: ${name}` : undefined,
  };
};

export const getSendGridContactAllowedValues: TQoreGetAllowedValuesFunction<
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
      url: '/v3/contactdb/recipients',
      method: 'GET',
      qs: { page_size: 1000 },
    });

    const data = response.body as { recipients: ISendGridContact[] };
    const contacts = data.recipients || [];
    return contacts.map(mapContactToAllowedValue);
  } catch (error) {
    throw new SendGridError(
      `Failed to fetch allowed values for contacts: ${error.message || error}`
    );
  }
};
