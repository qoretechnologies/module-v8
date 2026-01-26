import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { FRESHDESK_CONN_OPTIONS } from '../conn-options';
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
  const token = context?.conn_opts?.token;
  const subdomain = context?.conn_opts?.subdomain;

  if (!token) {
    throw new Error('The token is required to get Freshdesk contact allowed values');
  }

  if (!subdomain) {
    throw new Error('The subdomain option is required to get Freshdesk contact allowed values');
  }

  const contacts = await fetchFreshdeskAllowedValues<TFreshdeskContact>({
    subdomain,
    token,
    path: '/api/v2/contacts',
    mapItemToAllowedValue: mapFreshdeskContact,
  });

  return contacts;
};
