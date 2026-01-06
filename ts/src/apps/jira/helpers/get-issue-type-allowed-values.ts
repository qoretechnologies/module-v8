import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../conn-options';

export const getJiraIssueTypeIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error('The token and cloud_id are required to get Jira issue type allowed values');
  }

  const issueTypeIds: IQoreAllowedValue<string>[] = [];

  const { data: fetchedIssueTypes } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/issuetype`,
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  issueTypeIds.push(
    ...fetchedIssueTypes.map(
      (issueType: any): IQoreAllowedValue<string> => ({
        value: issueType.id,
        display_name: issueType.name,
      })
    )
  );

  return issueTypeIds;
};

export const getJiraIssueTypeNameAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS,
  string
> = async (context): Promise<IQoreAllowedValue<string>[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error('The token and cloud_id are required to get Jira issue type allowed values');
  }

  const issueTypeNames: IQoreAllowedValue<string>[] = [];

  const { data: fetchedIssueTypes } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/issuetype`,
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  issueTypeNames.push(
    ...fetchedIssueTypes.map(
      (issueType: any): IQoreAllowedValue<string> => ({
        value: issueType.name,
        display_name: issueType.name,
        desc: issueType.description,
      })
    )
  );

  return issueTypeNames;
};
