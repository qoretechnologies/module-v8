import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';

export const getAsanaTimePeriodIdAllowedValues: TQoreGetAllowedValuesFunction = async (
  context
): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token },
    opts: { workspace },
  } = context;

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
