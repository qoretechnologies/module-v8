import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { NETSUITE_CONN_OPTIONS } from '../conn-options';
import { fetchNetsuiteAllowedValues } from './constants';

type TNetsuiteContactData = {
  id: string;
  fullname: string;
  firstname: string;
  lastname: string;
  middlename: string;
  email: string;
  datecreated: string;
  phone: string;
};

const fieldsToFetch = [
  'id',
  'fullname',
  'firstname',
  'lastname',
  'middlename',
  'email',
  'datecreated',
  'phone',
];

const mapNetSuiteContact = (contact: TNetsuiteContactData): IQoreAllowedValue => ({
  value: contact.id,
  display_name: contact.fullname,
  desc:
    `ID: ${contact.id}\n\nFull Name: ${contact.fullname}\n\nFirst Name: ${contact.firstname}\n\n` +
    `Last Name: ${contact.lastname}\n\nMiddle Name: ${contact.middlename}\n\nEmail: ${contact.email}\n\n` +
    `Date Created: ${contact.datecreated}\n\nPhone: ${contact.phone}`,
});

export const getNetsuiteContactIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof NETSUITE_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const account_id = context?.conn_opts?.account_id;

  if (!token || !account_id) {
    throw new Error('The token and account_id are required to get NetSuite contact allowed values');
  }

  const contacts = await fetchNetsuiteAllowedValues({
    account_id,
    token,
    mapItemToAllowedValue: mapNetSuiteContact,
    query: `SELECT ${fieldsToFetch.join(',')} FROM contact ORDER BY contact.datecreated DESC`,
  });

  return contacts;
};
