/**
 * Jira Update Records
 *
 * Updates existing issues matching WHERE conditions.
 * Note: Jira does not have a bulk update API, so updates are performed sequentially.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QorusRequest, TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { searchJiraRecords } from './search-records';
import {
  buildJiraAuthHeader,
  fetchCustomFields,
  JiraRecordError,
  normalizeSetToSingleRecord,
  transformRecordToUpdatePayload,
} from './constants';

/**
 * Update Jira issues (records) matching WHERE conditions.
 */
export const updateJiraRecords: TQoreUpdateRecordsFunction = async (ctx, set, where, opts) => {
  const { cloud_id } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['cloud_id'],
    ErrorClass: JiraRecordError,
  });

  // Get auth credentials - support both OAuth2 (token) and Basic Auth (username/password)
  const connOpts = ctx?.conn_opts ?? {};
  const auth = {
    token: connOpts.token,
    username: connOpts.username,
    password: connOpts.password,
  };
  const authHeader = buildJiraAuthHeader(auth);

  const projectKey = opts?.table;

  if (!projectKey) {
    throw new JiraRecordError('Table path (project key) is required in opts.table');
  }

  try {
    // Fetch custom field definitions
    const customFieldMap = await fetchCustomFields(auth, cloud_id);

    // Normalize set values (in case they come as arrays)
    const updateData = normalizeSetToSingleRecord(set);

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

    // Build update payload
    const payload = transformRecordToUpdatePayload(updateData, customFieldMap);

    // Update each issue sequentially (no bulk update API)
    let updatedCount = 0;
    for (const issueKey of issueKeys) {
      try {
        await QorusRequest.put(
          {
            headers: {
              Authorization: authHeader,
              'Content-Type': 'application/json',
            },
            path: `/ex/jira/${cloud_id}/rest/api/3/issue/${issueKey}`,
            data: payload,
          },
          { url: 'https://api.atlassian.com', endpointId: 'Jira' }
        );
        updatedCount++;
      } catch (error) {
        console.warn(`Failed to update issue ${issueKey}:`, error);
      }
    }

    return updatedCount;
  } catch (error) {
    if (error instanceof JiraRecordError) {
      throw error;
    }
    throw new JiraRecordError(`Failed to update records: ${error}`);
  }
};
