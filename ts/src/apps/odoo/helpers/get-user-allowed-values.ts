import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooUserFields = ['id', 'display_name', 'email', 'role'] as const;

type TOdooUser = { id: number } & {
  [K in (typeof OdooUserFields)[number]]: string;
};

const mapOdooUserToAllowedValue = (user: TOdooUser): IQoreAllowedValue<number> => ({
  value: user.id,
  display_name: user.display_name,
  desc: `Email: ${user.email}\n` + `Role: ${user.role}`,
});

export const getOdooUserIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooUser>({
    subdomain,
    username,
    password,
    model: 'res.users',
    fields: [...OdooUserFields],
    mapItemToAllowedValue: mapOdooUserToAllowedValue,
  });
};
