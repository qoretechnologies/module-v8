import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getAsanaAssigneeIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get assignee id allowed values');
  }

  const workspace = context?.opts?.workspace;

  if (!workspace) {
    throw new Error('Workspace is required to get assignee id allowed values');
  }

  const assignees: IQoreAllowedValue[] = [];

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/users?workspace=${workspace}`,
    },
    { url: `https://app.asana.com`, endpointId: 'Asana' }
  );

  const { data: fetchedAssignees } = data;

  assignees.push(
    ...fetchedAssignees.map(
      (item: any): IQoreAllowedValue => ({
        value: item.gid,
        display_name: item.name,
        desc: `gid:${item.gid}\n\nAssignee: ${item.name}\n\nResource Type: ${item.resource_type}`,
      })
    )
  );

  return assignees;
};
