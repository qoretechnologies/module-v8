import { QorusRequest, TCustomConnOptions } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';

export const getAsanaTaskIdAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get Asana tasks allowed values');
  }

  const project = context?.opts?.project;

  if (!project) {
    throw new Error('Project is required to get Asana tasks allowed values');
  }

  const tasks: IQoreAllowedValue<string>[] = [];

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
      (item: any): IQoreAllowedValue => ({
        value: item.gid,
        display_name: item.name,
        short_desc: item.gid,
      })
    )
  );

  return tasks;
};
