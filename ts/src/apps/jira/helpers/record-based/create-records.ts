/**
 * Jira Create Records
 *
 * Creates new issues using bulk create API (up to 50 at a time).
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QorusRequest, TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import {
  buildJiraAuthHeader,
  fetchCustomFields,
  JiraBulkCreateResponse,
  JiraIssue,
  JiraRecordError,
  MAX_BULK_CREATE,
  transformIssueToRecord,
  transformRecordToCreatePayload,
} from './constants';

/**
 * Create new Jira issues (records) using bulk create API.
 */
export const createJiraRecords: TQoreCreateRecordsFunction = async (ctx, records, opts) => {
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

    const recordsArray = mapColumnFormatToObject(records);
    const createdRecords: Record<string, unknown>[] = [];

    // Process in batches of MAX_BULK_CREATE (50)
    for (let i = 0; i < recordsArray.length; i += MAX_BULK_CREATE) {
      const batch = recordsArray.slice(i, i + MAX_BULK_CREATE);
      const issueUpdates = batch.map((record) =>
        transformRecordToCreatePayload(record, projectKey, customFieldMap)
      );

      const { data } = await QorusRequest.post<any>(
        {
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
          },
          path: `/ex/jira/${cloud_id}/rest/api/3/issue/bulk`,
          data: { issueUpdates },
        },
        { url: 'https://api.atlassian.com', endpointId: 'Jira' }
      );

      const response = data as JiraBulkCreateResponse;

      // Fetch created issues to get full data
      for (const created of response?.issues ?? []) {
        const { data: issueData } = await QorusRequest.get<any>(
          {
            headers: {
              Authorization: authHeader,
            },
            path: `/ex/jira/${cloud_id}/rest/api/3/issue/${created.key}`,
            params: { fields: '*all' },
          },
          { url: 'https://api.atlassian.com', endpointId: 'Jira' }
        );
        const issue = issueData as JiraIssue;
        createdRecords.push(transformIssueToRecord(issue, customFieldMap));
      }

      if (response?.errors?.length > 0) {
        console.warn('Some issues failed to create:', response.errors);
      }
    }

    return mapObjectToColumnFormat(createdRecords);
  } catch (error) {
    if (error instanceof JiraRecordError) {
      throw error;
    }
    throw new JiraRecordError(`Failed to create records: ${error}`);
  }
};
