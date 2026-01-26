import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooPartnerFields = ['id', 'name', 'email', 'company_type'] as const;

type TOdooPartner = { id: number } & {
  [K in (typeof OdooPartnerFields)[number]]: string;
};

const mapOdooPartnerToAllowedValue = (partner: TOdooPartner): IQoreAllowedValue<number> => ({
  value: partner.id,
  display_name: partner.name,
  desc: `Email: ${partner.email}\nType: ${partner.company_type}`,
});

export const getOdooPartnerAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooPartner>({
    subdomain,
    username,
    password,
    model: 'res.partner',
    fields: [...OdooPartnerFields],
    mapItemToAllowedValue: mapOdooPartnerToAllowedValue,
  });
};
