// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { QorusRequest, TQoreGetDefaultValueFunction } from '@qoretechnologies/ts-toolkit';
import { JIRA_CONN_OPTIONS } from '../conn-options';
import { jiraDocumentFormatOption } from '../options/jira-document.option';

export const getJiraIssueDescriptionDefaultValue: TQoreGetDefaultValueFunction<
  typeof JIRA_CONN_OPTIONS,
  Record<string, unknown>
> = async (context) => {
  const token = context?.conn_opts?.token;
  const cloud_id = context?.conn_opts?.cloud_id;
  const opts = context?.opts;

  if (!token || !cloud_id) {
    throw new Error(
      'The token and cloud_id are required to get Jira issue description default value'
    );
  }

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
