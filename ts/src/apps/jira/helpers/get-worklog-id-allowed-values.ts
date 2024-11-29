import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraWorklogIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
    opts: { issueIdOrKey },
  } = context;

  const worklogs: IQoreAllowedValue[] = [];
  let startAt = 0;
  let total = 0;
  const maxResults = 100;

  do {
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

    const { worklogs: fetchedWorklogs, total: fetchedTotal } = data;

    worklogs.push(
      ...fetchedWorklogs.map(
        (worklog: any): IQoreAllowedValue => ({
          value: worklog.id,
          // eslint-disable-next-line max-len
          display_name: `${worklog?.author?.displayName} - ${new Date(worklog?.started).toUTCString()} - ${worklog?.timeSpent}`,
        })
      )
    );

    total = fetchedTotal;
    startAt += maxResults;
  } while (startAt < total);

  return worklogs;
};
