import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getAsanaWorkspaceProjectIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { workspace },
  } = context;

  const projects: IQoreAllowedValue[] = [];

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/workspaces/${workspace}/projects`,
    },
    { url: `https://app.asana.com`, endpointId: 'Asana' }
  );

  const { data: fetchedProjects } = data;

  projects.push(
    ...fetchedProjects.map(
      (project: any): IQoreAllowedValue => ({
        value: project.gid,
        display_name: project.name,
      })
    )
  );

  return projects;
};
