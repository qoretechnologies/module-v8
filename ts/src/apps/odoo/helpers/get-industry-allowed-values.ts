import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooIndustryFields = ['id', 'name', 'full_name'] as const;

type TOdooIndustry = { id: number } & {
  [K in (typeof OdooIndustryFields)[number]]: string;
};

const mapOdooIndustryToAllowedValue = (industry: TOdooIndustry): IQoreAllowedValue<number> => ({
  value: industry.id,
  display_name: industry.name,
  desc: `Full Name: ${industry.full_name || industry.name}\nID: ${industry.id}`,
});

export const getOdooIndustryAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooIndustry>({
    subdomain,
    username,
    password,
    model: 'res.partner.industry',
    fields: [...OdooIndustryFields],
    mapItemToAllowedValue: mapOdooIndustryToAllowedValue,
  });
};
