import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraIssueTypeIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
  } = context;

  const issueTypeIds: IQoreAllowedValue[] = [];

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
      (issueType: any): IQoreAllowedValue => ({
        value: issueType.id,
        display_name: issueType.name,
      })
    )
  );

  return issueTypeIds;
};

export const getJiraIssueTypeNameAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
  } = context;

  const issueTypeNames: IQoreAllowedValue[] = [];

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
      (issueType: any): IQoreAllowedValue => ({
        value: issueType.name,
        display_name: issueType.description,
      })
    )
  );

  return issueTypeNames;
};
