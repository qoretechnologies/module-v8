import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../conn-options';
import { Debugger } from '../../../utils/Debugger';
import { delay } from '../../../global/helpers';
import { JIRA_ALLOWED_VALUES_FETCH_DELAY, JIRA_ALLOWED_VALUES_TIMEOUT } from './constants';

const fetchJiraComments = async ({
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
}): Promise<{ comments: any[]; total: number }> => {
  const { data } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/issue/${issueIdOrKey}/comment`,
      params: {
        startAt: startAt.toString(),
        maxResults: maxResults.toString(),
      },
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  return { comments: data.comments, total: data.total };
};

const mapJiraComment = (comment: {
  id: string;
  author: { displayName: string };
  created: string;
  self: string;
}): IQoreAllowedValue => ({
  value: comment.id,
  display_name: comment.author?.displayName || 'Unknown author',
  desc:
    `Id: ${comment.id}\n\nAuthor: ${comment.author?.displayName}\n\nCreated: ${comment.created}\n\n` +
    `Link: [View comment](${comment.self})`,
});

export const getJiraCommentIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;
  const issueIdOrKey = context?.opts?.issueIdOrKey;

  if (!token || !cloud_id || !issueIdOrKey) {
    throw new Error(
      'The token, cloud_id and issueIdOrKey are required to get Jira comment allowed values'
    );
  }

  const comments: IQoreAllowedValue[] = [];
  const startTime = Date.now();
  let startAt = 0;
  let total = 0;
  const maxResults = 100;

  try {
    do {
      if (Date.now() - startTime > JIRA_ALLOWED_VALUES_TIMEOUT) {
        Debugger.log(
          `Timeout fetching jira comments for issue ${issueIdOrKey} at startAt=${startAt}`
        );

        return comments;
      }

      const { comments: fetchedComments, total: fetchedTotal } = await fetchJiraComments({
        token,
        cloud_id,
        issueIdOrKey,
        startAt,
        maxResults,
      });

      comments.push(...fetchedComments.map(mapJiraComment));

      total = fetchedTotal;
      startAt += maxResults;

      if (startAt < total) {
        await delay(JIRA_ALLOWED_VALUES_FETCH_DELAY);
      }
    } while (startAt < total);
  } catch (error) {
    Debugger.log(
      `Error fetching jira comments for issue ${issueIdOrKey} at startAt=${startAt}:`,
      error
    );

    return comments;
  }

  return comments;
};
