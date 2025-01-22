import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getAsanaTeamIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts,
  } = context;

  const teams: IQoreAllowedValue[] = [];
  let workspace = opts.workspace;

  if (opts.project && !opts.workspace) {
    const { data: project } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/api/1.0/projects/${opts.project}`,
      },
      { url: `https://app.asana.com`, endpointId: 'Asana' }
    );

    workspace = project?.data?.workspace?.gid;
    if (!workspace) {
      throw new Error('Workspace option is required');
    }
  }

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
