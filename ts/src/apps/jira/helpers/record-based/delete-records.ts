/**
 * Jira Delete Records
 *
 * Deletes issues matching WHERE conditions.
 * Note: Jira does not have a bulk delete API, so deletes are performed sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QorusRequest, TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { searchJiraRecords } from './search-records';
import { buildJiraAuthHeader, JiraRecordError } from './constants';

/**
 * Delete Jira issues (records) matching WHERE conditions.
 */
export const deleteJiraRecords: TQoreDeleteRecordsFunction = async (ctx, where, opts) => {
  const { cloud_id } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['cloud_id'],
    ErrorClass: JiraRecordError,
  });

  // Get auth credentials - support both OAuth2 (token) and Basic Auth (username/password)
  const connOpts = ctx?.conn_opts ?? {};
  const authHeader = buildJiraAuthHeader({
    token: connOpts.token,
    username: connOpts.username,
    password: connOpts.password,
  });

  const projectKey = opts?.table;

  if (!projectKey) {
    throw new JiraRecordError('Table path (project key) is required in opts.table');
  }

  try {
    // Search for matching records
    const iterator = await searchJiraRecords(ctx, where, { table: projectKey });
    const issueKeys: string[] = [];

    // Collect all matching issue keys
    let batch = await iterator(ctx, 100);
    while (batch !== null) {
      const keys = batch.key as string[];
      if (keys) {
        issueKeys.push(...keys);
      }
      batch = await iterator(ctx, 100);
    }

    if (issueKeys.length === 0) {
      return 0;
    }

    // Delete each issue sequentially (no bulk delete API)
    let deletedCount = 0;
    for (const issueKey of issueKeys) {
      try {
        await QorusRequest.deleteReq(
          {
            headers: {
              Authorization: authHeader,
            },
            path: `/ex/jira/${cloud_id}/rest/api/3/issue/${issueKey}`,
          },
          { url: 'https://api.atlassian.com', endpointId: 'Jira' }
        );
        deletedCount++;
      } catch (error) {
        console.warn(`Failed to delete issue ${issueKey}:`, error);
      }
    }

    return deletedCount;
  } catch (error) {
    if (error instanceof JiraRecordError) {
      throw error;
    }
    throw new JiraRecordError(`Failed to delete records: ${error}`);
  }
};
