import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { delay } from '../../../global/helpers';
import { Debugger } from '../../../utils/Debugger';
import { JIRA_CONN_OPTIONS } from '../conn-options';
import { JIRA_ALLOWED_VALUES_FETCH_DELAY, JIRA_ALLOWED_VALUES_TIMEOUT } from './constants';

const fetchJiraWorklogs = async ({
  token,
  cloud_id,
  issueIdOrKey,
  startAt,
  maxResults,
}: {
  token: string;
  cloud_id: string;
  issueIdOrKey: string;
  startAt: number;
  maxResults: number;
}): Promise<{ worklogs: any[]; total: number }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/issue/${issueIdOrKey}/worklog`,
      params: {
        jql: '',
        startAt: startAt.toString(),
        maxResults: maxResults.toString(),
      },
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  return { worklogs: data.worklogs, total: data.total };
};

const mapJiraWorklog = (worklog: any): IQoreAllowedValue => ({
  value: worklog.id,
  display_name: `${worklog.id} - ${worklog.timeSpent}`,
  desc:
    `Id: ${worklog.id}\n\nAuthor: ${worklog.author?.displayName}\n\n` +
    `Started: ${new Date(worklog.started).toUTCString()}\n\nTime spent: ${worklog.timeSpent}\n\n`,
});

export const getJiraWorklogIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;
  const issueIdOrKey = context?.opts?.issueIdOrKey;

  if (!token || !cloud_id || !issueIdOrKey) {
    throw new Error(
      'The token, cloud_id, and issueIdOrKey are required to get Jira worklog allowed values'
    );
  }

  const worklogs: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let startAt = 0;
  let total = 0;
  const maxResults = 100;

  try {
    do {
      if (Date.now() - startTime > JIRA_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(
          `Timeout fetching jira worklogs for issue ${issueIdOrKey} at startAt=${startAt}`
        );
        break;
      }

      const { worklogs: fetchedWorklogs, total: fetchedTotal } = await fetchJiraWorklogs({
        token,
        cloud_id,
        issueIdOrKey,
        startAt,
        maxResults,
      });

      worklogs.push(...fetchedWorklogs.map(mapJiraWorklog));

      total = fetchedTotal;
      startAt += maxResults;

      if (startAt < total) {
        await delay(JIRA_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (startAt < total);
  } catch (error) {
    Debugger.log(
      `Error fetching jira worklogs for issue ${issueIdOrKey} at startAt=${startAt}:`,
      error
    );

    return worklogs;
  }

  return worklogs;
};
