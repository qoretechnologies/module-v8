import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { IQoreAllowedValue, TQoreGetAllowedValuesFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';

export const getJiraUserIdAllowedValues: TQoreGetAllowedValuesFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context): Promise<IQoreAllowedValue[]> => {
  const {
    conn_opts: { token, cloud_id },
  } = context;

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
        desc:
          `Type: ${user.accountType}\n\nEmail: ${user.emailAddress}\n\n` +
          `Id: ${user.accountId}\n\nLink: [View user] (${user.self})`,
      })
    )
  );

  return userIds;
};
