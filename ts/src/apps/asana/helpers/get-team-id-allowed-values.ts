import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getAsanaTeamIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { workspace },
  } = context;

  const teams: IQoreAllowedValue[] = [];

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/teams?workspace=${workspace}`,
    },
    { url: `https://app.asana.com`, endpointId: 'Asana' }
  );

  const { data: fetchedTeams } = data;

  teams.push(
    ...fetchedTeams.map(
      (team: any): IQoreAllowedValue => ({
        value: team.gid,
        display_name: team.name,
        short_desc: team.gid,
      })
    )
  );

  return teams;
};
