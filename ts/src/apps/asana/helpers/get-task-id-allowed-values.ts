import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getAsanaTaskIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { project },
  } = context;

  const tasks: IQoreAllowedValue[] = [];

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/tasks?project=${project}`,
    },
    { url: `https://app.asana.com`, endpointId: 'Asana' }
  );

  const { data: fetchedTasks } = data;

  tasks.push(
    ...fetchedTasks.map(
      (project: any): IQoreAllowedValue => ({
        value: project.gid,
        display_name: project.name,
      })
    )
  );

  return tasks;
};
