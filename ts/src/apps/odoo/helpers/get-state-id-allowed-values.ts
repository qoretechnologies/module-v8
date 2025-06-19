import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooStateFields = ['id', 'display_name'] as const;

type TOdooState = {
  id: number;
  display_name: string;
};

const mapOdooStateToAllowedValue = (state: TOdooState): IQoreAllowedValue<number> => ({
  value: state.id,
  display_name: state.display_name,
});

export const getOdooStateIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  const country_id = context?.opts?.country_id || context?.opts?.address_info?.country_id;

  return await fetchOdooAllowedValues<TOdooState>({
    subdomain,
    username,
    password,
    model: 'res.country.state',
    fields: [...OdooStateFields],
    ...(country_id && { filter: { country_id } }),
    mapItemToAllowedValue: mapOdooStateToAllowedValue,
  });
};
