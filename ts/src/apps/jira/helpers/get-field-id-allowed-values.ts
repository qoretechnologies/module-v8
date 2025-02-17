import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraFieldIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error('The token and cloud_id are required to get Jira field allowed values');
  }

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
