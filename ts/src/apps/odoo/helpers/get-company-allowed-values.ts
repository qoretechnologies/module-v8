import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooCompanyFields = ['id', 'name'] as const;

type TOdooCompany = { id: number } & {
  [K in (typeof OdooCompanyFields)[number]]: string;
};

const mapOdooCompanyToAllowedValue = (company: TOdooCompany): IQoreAllowedValue<number> => ({
  value: company.id,
  display_name: company.name,
});

export const getOdooCompanyAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooCompany>({
    subdomain,
    username,
    password,
    model: 'res.company',
    fields: [...OdooCompanyFields],
    mapItemToAllowedValue: mapOdooCompanyToAllowedValue,
  });
};
