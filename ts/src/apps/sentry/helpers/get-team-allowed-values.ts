import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { SentryError } from '../constants';
import { fetchSentryAllowedValues } from './constants';

type TSentryTeam = {
  id: string;
  slug: string;
  name: string;
};

const mapSentryTeamToAllowedValue = (team: TSentryTeam): IQoreAllowedValue<string> => {
  return {
    value: team.slug,
    display_name: team.name,
  };
};

export const getSentryTeamAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  const { token, organization } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'organization'],
    ErrorClass: SentryError,
  });

  return await fetchSentryAllowedValues<TSentryTeam>({
    token,
    path: `/api/0/organizations/${organization}/teams/`,
    mapItemToAllowedValue: mapSentryTeamToAllowedValue,
  });
};
