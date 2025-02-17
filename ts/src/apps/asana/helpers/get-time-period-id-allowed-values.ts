import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';

export const getAsanaTimePeriodIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;

  if (!token) {
    throw new Error('Token is required to get Asana time periods allowed values');
  }

  const workspace = context?.opts?.workspace;

  if (!workspace) {
    throw new Error('Workspace is required to get Asana time periods allowed values');
  }

  const timePeriods: IQoreAllowedValue[] = [];

  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/api/1.0/time_periods?workspace=${workspace}`,
    },
    { url: `https://app.asana.com`, endpointId: 'Asana' }
  );

  const { data: fetchedTimePeriods } = data;

  timePeriods.push(
    ...fetchedTimePeriods.map(
      (timePeriod: any): IQoreAllowedValue => ({
        value: timePeriod.gid,
        display_name: `${timePeriod.start_on} - ${timePeriod.end_on} (${timePeriod.display_name})`,
        desc:
          `gid:${timePeriod.gid}\n\nStart On: ${timePeriod.start_on}\n\n` +
          `End On: ${timePeriod.end_on}\n\nDisplay Name: ${timePeriod.display_name}\n\n` +
          `Period: ${timePeriod.period}`,
      })
    )
  );

  return timePeriods;
};
