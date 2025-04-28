import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { XeroError } from '../constants';
import { getTenantIdRequired, getTokenRequired, getXeroAllowedValues } from './constants';

type XeroContact = {
  ContactID: string;
  Name: string;
  EmailAddress?: string;
  FirstName?: string;
  LastName?: string;
  ContactStatus?: string;
  Addresses?: {
    AddressType: string;
    AddressLine1?: string;
    City?: string;
    Region?: string;
    Country?: string;
  }[];
  Phones?: {
    PhoneType: string;
    PhoneNumber?: string;
  }[];
  IsCustomer?: boolean;
  IsSupplier?: boolean;
};

const mapXeroContactToAllowedValue = (contact: XeroContact): IQoreAllowedValue<string> => ({
  display_name: contact.Name,
  value: contact.ContactID,
  desc:
    `Email: ${contact.EmailAddress || 'N/A'}\n\n` +
    `Status: ${contact.ContactStatus || 'Active'}\n\n` +
    `Customer: ${contact.IsCustomer ? 'Yes' : 'No'}\n\n` +
    `Supplier: ${contact.IsSupplier ? 'Yes' : 'No'}\n\n` +
    `Address: ${contact.Addresses?.find((a) => a.AddressType === 'STREET')?.AddressLine1 || 'N/A'}\n\n` +
    `Phone: ${contact.Phones?.find((p) => p.PhoneType === 'DEFAULT')?.PhoneNumber || 'N/A'}`,
});

export const getXeroContactIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const token = getTokenRequired(context);
    const tenantId = getTenantIdRequired(context);

    return await getXeroAllowedValues({
      token,
      tenantId,
      path: 'Contacts',
      dataPath: 'Contacts',
      mapItemToAllowedValue: mapXeroContactToAllowedValue,
    });
  } catch (error) {
    throw new XeroError(`Couldn't fetch Xero contact IDs: ${error}`);
  }
};
