import {
  IQoreAllowedValue,
  QorusRequest,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getAsanaWorkspaceProjectIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get Asana projects allowed values');
  }

  const workspace = context?.opts?.workspace;

  if (!workspace) {
    throw new Error('Workspace is required to get Asana projects allowed values');
  }

  const projects: IQoreAllowedValue<string>[] = [];

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
        short_desc: project.gid,
      })
    )
  );

  return projects;
};
