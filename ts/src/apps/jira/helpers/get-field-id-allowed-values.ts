import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraFieldIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
  } = context;

  const fields: IQoreAllowedValue[] = [];

  const { data: fetchedFields } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/field`,
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  fields.push(
    ...fetchedFields.map(
      (field: any): IQoreAllowedValue => ({
        value: field.id,
        display_name: field.name,
      })
    )
  );

  return fields;
};
