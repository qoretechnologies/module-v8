import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { OdooError } from '../constants';
import { fetchOdooAllowedValues } from './constants';

const OdooTeamFields = ['id', 'display_name'] as const;

type TOdooTeam = { id: number } & {
  [K in (typeof OdooTeamFields)[number]]: string;
};

const mapOdooTeamToAllowedValue = (team: TOdooTeam): IQoreAllowedValue<number> => ({
  value: team.id,
  display_name: team.display_name,
});

export const getOdooTeamIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  number
> = async (context) => {
  const { subdomain, username, password } = getQoreContextRequiredValues({
    context,
    connectionFields: ['subdomain', 'username', 'password'],
    ErrorClass: OdooError,
  });

  return await fetchOdooAllowedValues<TOdooTeam>({
    subdomain,
    username,
    password,
    model: 'crm.team',
    fields: [...OdooTeamFields],
    mapItemToAllowedValue: mapOdooTeamToAllowedValue,
  });
};
