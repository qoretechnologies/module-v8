/**
 * Jira Get Table List
 *
 * Returns all accessible project keys as table paths.
 * In the record-based context, Projects are "tables" and Issues are "records".
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QorusRequest, TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { buildJiraAuthHeader, JiraProject, JiraRecordError } from './constants';

/**
 * Get list of all accessible Jira project keys as table paths.
 */
export const getJiraTableList: TQoreGetTableListFunction = async (ctx) => {
  const { cloud_id } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['cloud_id'],
    ErrorClass: JiraRecordError,
  });

  // Get auth credentials - support both OAuth2 (token) and Basic Auth (username/password)
  const connOpts = ctx?.conn_opts || {};
  const authHeader = buildJiraAuthHeader({
    token: connOpts.token,
    username: connOpts.username,
    password: connOpts.password,
  });

  try {
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: authHeader,
        },
        path: `/ex/jira/${cloud_id}/rest/api/3/project/search`,
      },
      { url: 'https://api.atlassian.com', endpointId: 'Jira' }
    );

    const response = data as { values: JiraProject[] };
    const tables = (response?.values || []).map((project: JiraProject) => project.key);

    return tables;
  } catch (error) {
    if (error instanceof JiraRecordError) {
      throw error;
    }
    throw new JiraRecordError(`Failed to get table list: ${error}`);
  }
};
