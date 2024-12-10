import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraIssueIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
  } = context;

  const issues: IQoreAllowedValue[] = [];
  let startAt = 0;
  let total = 0;
  const maxResults = 100;

  do {
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/ex/jira/${cloud_id}/rest/api/3/search`,
        params: {
          jql: '',
          startAt: startAt.toString(),
          maxResults: maxResults.toString(),
        },
      },
      { url: `https://api.atlassian.com`, endpointId: 'Jira' }
    );

    const { issues: fetchedIssues, total: fetchedTotal } = data;

    issues.push(
      ...fetchedIssues.map(
        (issue: any): IQoreAllowedValue => ({
          value: issue.id,
          display_name: issue?.fields?.summary,
          desc:
            `Key: ${issue.key}\n\nId: ${issue.id}\n\nType: ${issue?.fields?.issuetype?.name}\n\n` +
            `Project: ${issue?.fields?.project?.name}\n\nStatus: ${issue?.fields?.status?.name}\n\n` +
            `Priority: ${issue?.fields?.priority?.name}\n\nAssignee: ${issue?.fields?.assignee?.displayName}\n\n`,
        })
      )
    );

    total = fetchedTotal;
    startAt += maxResults;
  } while (startAt < total);

  return issues;
};
