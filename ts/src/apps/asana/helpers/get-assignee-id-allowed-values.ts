import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getAsanaAssigneeIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { workspace },
  } = context;

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
