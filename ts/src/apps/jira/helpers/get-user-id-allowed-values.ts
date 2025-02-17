import {
  IQoreAllowedValue,
  QorusRequest,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraUserIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;

  if (!token || !cloud_id) {
    throw new Error('The token and cloud_id are required to get Jira user allowed values');
  }
  const userIds: IQoreAllowedValue[] = [];

  const { data: fetchedUsers } = await QorusRequest.get<any>(
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      path: `/ex/jira/${cloud_id}/rest/api/3/users`,
    },
    { url: `https://api.atlassian.com`, endpointId: 'Jira' }
  );

  userIds.push(
    ...fetchedUsers.map(
      (user: any): IQoreAllowedValue => ({
        value: user.accountId,
        display_name: user.displayName,
        ...(user.avatarUrls?.['48x48'] && { image: user.avatarUrls['48x48'] }),
        desc:
          `Type: ${user.accountType}\n\nEmail: ${user.emailAddress}\n\n` +
          `Id: ${user.accountId}\n`,
      })
    )
  );

  return userIds;
};
