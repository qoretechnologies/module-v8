import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { callMondayAPI } from './constants';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { MondayError } from '../constants';

type TMondayUser = {
  id: number;
  name: string;
  email: string;
  title?: string;
  photo_thumb?: string;
  is_guest?: boolean;
  enabled?: boolean;
};

type TMondayTeam = {
  id: number;
  name: string;
};

type TUsersResponseType = {
  data: {
    users: TMondayUser[];
  };
};

type TTeamsResponseType = {
  data: {
    teams: TMondayTeam[];
  };
};

const mapMondayUser = (user: TMondayUser): IQoreAllowedValue<Record<string, any>> => {
  const details = [
    `User ID: ${user.id}`,
    `Name: ${user.name}`,
    `Email: ${user.email}`,
    user.title && `Title: ${user.title}`,
    user.is_guest && 'Guest User',
    user.enabled === false && 'Disabled',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    value: { id: user.id, kind: 'person' },
    display_name: user.name,
    short_desc: details,
  };
};

const mapMondayTeam = (team: TMondayTeam): IQoreAllowedValue<Record<string, any>> => ({
  value: { id: team.id, kind: 'team' },
  display_name: `${team.name} (Team)`,
  short_desc: `Team ID: ${team.id}\n\nName: ${team.name}`,
});

export const getMondayPeopleAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  Record<string, any>
> = async (context): Promise<IQoreAllowedValue<Record<string, any>>[]> => {
  const { token } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token'],
    ErrorClass: MondayError,
  });

  const usersQuery = `
    query GetUsers {
      users {
        id
        name
        email
        title
        photo_thumb
        is_guest
        enabled
      }
    }
  `;

  const teamsQuery = `
    query GetTeams {
      teams {
        id
        name
      }
    }
  `;

  const [usersResponse, teamsResponse] = await Promise.all([
    callMondayAPI<TUsersResponseType>({
      query: usersQuery,
      token,
    }),
    callMondayAPI<TTeamsResponseType>({
      query: teamsQuery,
      token,
    }),
  ]);

  const users = usersResponse.data?.users || [];
  const teams = teamsResponse.data?.teams || [];

  const activeUsers = users.filter((user) => user.enabled !== false);

  const userValues = activeUsers.map(mapMondayUser);
  const teamValues = teams.map(mapMondayTeam);

  return [...teamValues, ...userValues];
};
