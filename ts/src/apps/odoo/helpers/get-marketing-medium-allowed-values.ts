import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooMarketingMediumFields = ['id', 'display_name', 'name'] as const;

type TOdooMarketingMedium = { id: number } & {
  [K in (typeof OdooMarketingMediumFields)[number]]: string;
};

const mapOdooMarketingMediumToAllowedValue = (
  medium: TOdooMarketingMedium
): IQoreAllowedValue<number> => ({
  value: medium.id,
  display_name: medium.display_name || medium.name,
  desc: `Medium: ${medium.name}`,
});

export const getOdooMarketingMediumAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooMarketingMedium>({
    subdomain,
    username,
    password,
    model: 'utm.medium',
    fields: [...OdooMarketingMediumFields],
    mapItemToAllowedValue: mapOdooMarketingMediumToAllowedValue,
  });
};
