import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { TQoreGetDefaultValueFunction } from '../../../global/models/qore';
import { JIRA_CONN_OPTIONS } from '../constants';
import { jiraDocumentFormatOption } from '../options/jira-document.option';

export const getJiraIssueDescriptionDefaultValue: TQoreGetDefaultValueFunction<
  typeof JIRA_CONN_OPTIONS
> = async (context) => {
  const {
    conn_opts: { token, cloud_id },
    opts,
  } = context;

  if (opts?.issueIdOrKey) {
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        path: `/ex/jira/${cloud_id}/rest/api/3/issue/${opts.issueIdOrKey}`,
      },
      { url: `https://api.atlassian.com`, endpointId: 'Jira' }
    );

    if (data.fields.description) {
      return data.fields.description;
    }
  }

  return jiraDocumentFormatOption.type.default_value;
};
