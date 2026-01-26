import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooLeadFields = ['id', 'name', 'email_from', 'contact_name', 'partner_name'] as const;

type TOdooLead = { id: number } & {
  [K in (typeof OdooLeadFields)[number]]: string;
};

const mapOdooLeadToAllowedValue = (lead: TOdooLead): IQoreAllowedValue<number> => ({
  value: lead.id,
  display_name: lead.name,
  desc:
    `Email: ${lead.email_from}\n` +
    `Contact Name: ${lead.contact_name}\n` +
    `Company Name: ${lead.partner_name}`,
});

export const getOdooLeadIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooLead>({
    subdomain,
    username,
    password,
    model: 'crm.lead',
    fields: [...OdooLeadFields],
    mapItemToAllowedValue: mapOdooLeadToAllowedValue,
  });
};
