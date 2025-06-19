import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooLangFields = ['id', 'display_name', 'code'] as const;

type TOdooLang = { id: number } & {
  [K in (typeof OdooLangFields)[number]]: string;
};

const mapOdooLangToAllowedValue = (lang: TOdooLang): IQoreAllowedValue<string> => ({
  value: lang.code,
  display_name: lang.display_name,
  desc: `Code: ${lang.code}\n`,
});

export const getOdooLangIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooLang>({
    subdomain,
    username,
    password,
    model: 'res.lang',
    fields: [...OdooLangFields],
    mapItemToAllowedValue: mapOdooLangToAllowedValue,
  });
};
