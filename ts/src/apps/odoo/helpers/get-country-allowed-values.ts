import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooCountryFields = ['id', 'display_name', 'code', 'image_url'] as const;

type TOdooCountry = { id: number } & {
  [K in (typeof OdooCountryFields)[number]]: string;
};

const mapOdooCountryToAllowedValue =
  (subdomain: string) =>
  (country: TOdooCountry): IQoreAllowedValue<number> => ({
    value: country.id,
    display_name: country.display_name,
    desc: `Code: ${country.code}\n`,
    ...(country.image_url && { image: `https://${subdomain}.odoo.com${country.image_url}` }),
  });

export const getOdooCountryIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooCountry>({
    subdomain,
    username,
    password,
    model: 'res.country',
    fields: [...OdooCountryFields],
    mapItemToAllowedValue: mapOdooCountryToAllowedValue(subdomain),
  });
};
