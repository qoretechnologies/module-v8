import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { JIRA_CONN_OPTIONS } from '../constants';
import { JIRA_ALLOWED_VALUES_FETCH_DELAY, JIRA_ALLOWED_VALUES_TIMEOUT } from './constants';

const fetchJiraIssues = async ({
  token,
  cloud_id,
  startAt,
  maxResults,
}: {
  token: string;
  cloud_id: string;
  startAt: number;
  maxResults: number;
}): Promise<{ issues: any[]; total: number }> => {
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

  return { issues: data.issues, total: data.total };
};

const mapJiraIssue = (issue: {
  id: string;
  fields: {
    summary: string;
    issuetype: { name: string };
    project: { name: string };
    status: { name: string };
    priority: { name: string };
    assignee: { displayName: string };
  };
  key: any;
}): IQoreAllowedValue => ({
  value: issue.id,
  display_name: issue?.fields?.summary,
  desc:
    `Key: ${issue.key}\n\nId: ${issue.id}\n\nType: ${issue?.fields?.issuetype?.name}\n\n` +
    `Project: ${issue?.fields?.project?.name}\n\nStatus: ${issue?.fields?.status?.name}\n\n` +
    `Priority: ${issue?.fields?.priority?.name}\n\nAssignee: ${issue?.fields?.assignee?.displayName}\n\n`,
});

export const getJiraIssueIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error('The token and cloud_id are required to get Jira issue allowed values');
  }

  const issues: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let startAt = 0;
  let total = 0;
  const maxResults = 100;

  try {
    do {
      if (Date.now() - startTime > JIRA_ALLOWED_VALUES_TIMEOUT) {
        Debugger.info(`Jira issues fetch timeout`);

        return issues;
      }

      const { issues: fetchedIssues, total: fetchedTotal } = await fetchJiraIssues({
        token,
        cloud_id,
        startAt,
        maxResults,
      });

      issues.push(...fetchedIssues.map(mapJiraIssue));

      total = fetchedTotal;
      startAt += maxResults;

      if (startAt < total) {
        await delay(JIRA_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (startAt < total);
  } catch (error) {
    Debugger.info(`Error fetching jira issues: ${error}`);

    return issues;
  }

  return issues;
};
