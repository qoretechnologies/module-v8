import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooSourceFields = ['id', 'name'] as const;
type TOdooSource = { id: number } & { [K in (typeof OdooSourceFields)[number]]: string };

const mapOdooSource = (source: TOdooSource): IQoreAllowedValue<number> => ({
  value: source.id,
  display_name: source.name,
});

export const getOdooMarketingSourceAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues({
    model: 'utm.source',
    fields: [...OdooSourceFields],
    mapItemToAllowedValue: mapOdooSource,
    subdomain,
    username,
    password,
  });
};
