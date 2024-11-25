import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraCommentIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
    opts: { issueIdOrKey },
  } = context;

  const comments: IQoreAllowedValue[] = [];
  let startAt = 0;
  let total = 0;
  const maxResults = 100;

  do {
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/ex/jira/${cloud_id}/rest/api/3/issue/${issueIdOrKey}/comment`,
        params: {
          jql: '',
          startAt: startAt.toString(),
          maxResults: maxResults.toString(),
        },
      },
      { url: `https://api.atlassian.com`, endpointId: 'Jira' }
    );

    const { comments: fetchedComments, total: fetchedTotal } = data;

    comments.push(
      ...fetchedComments.map(
        (comment: any): IQoreAllowedValue => ({
          value: comment.id,
          // eslint-disable-next-line max-len
          display_name: `${comment?.author?.displayName} - ${new Date(comment?.created).toUTCString()}`,
        })
      )
    );

    total = fetchedTotal;
    startAt += maxResults;
  } while (startAt < total);

  return comments;
};
