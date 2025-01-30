import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { FRESHDESK_CONN_OPTIONS } from '../constants';
import { fetchFreshdeskAllowedValues } from './constants';

type TFreshdeskContact = {
  id: number;
  email: string;
  name: string;
};

const mapFreshdeskContact = (contact: TFreshdeskContact): IQoreAllowedValue => ({
  value: contact.id.toString(),
  display_name: contact.name || contact.email,
  desc: `ID: ${contact.id}\n\nName: ${contact.name}\n\nEmail: ${contact.email}`,
});

export const getFreshdeskContactIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof FRESHDESK_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, subdomain },
  } = context;

  const contacts = await fetchFreshdeskAllowedValues<TFreshdeskContact>({
    subdomain,
    token,
    path: '/api/v2/contacts',
    mapItemToAllowedValue: mapFreshdeskContact,
  });

  return contacts;
};
