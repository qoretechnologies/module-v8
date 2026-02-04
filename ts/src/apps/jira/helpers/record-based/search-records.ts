/**
 * Jira Search Records
 *
 * Implements iterator-based search for Jira issues using JQL with pagination.
 * Issues are the "records" in the Jira record-based context.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  QorusRequest,
  TQoreSearchRecordsFunction,
  TQoreSearchRecordsIterator,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapObjectToColumnFormat } from '../../../../global/helpers';
import { buildJqlFromWhere } from './apply-where-condition';
import {
  buildJiraAuthHeader,
  fetchCustomFields,
  JiraRecordError,
  JiraSearchResponse,
  MAX_PAGE_SIZE,
  transformIssueToRecord,
} from './constants';

/**
 * Search for Jira issues (records) with JQL filtering and pagination.
 * Returns an iterator function that yields batches of records in column format.
 */
export const searchJiraRecords: TQoreSearchRecordsFunction = async (ctx, where, opts) => {
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
  const limit = (opts?.limit as number) || MAX_PAGE_SIZE;

  if (!projectKey) {
    throw new JiraRecordError('Table path (project key) is required in opts.table');
  }

  try {
    // Fetch custom field definitions
    const customFieldMap = await fetchCustomFields(auth, cloud_id);

    // Build JQL query
    let jql = buildJqlFromWhere(projectKey, where, customFieldMap);

    // Handle ordering
    const orderBy = opts?.orderBy as { field: string; direction?: string } | undefined;
    if (orderBy?.field) {
      const direction = orderBy.direction === 'desc' ? 'DESC' : 'ASC';
      jql += ` ORDER BY ${orderBy.field} ${direction}`;
    } else {
      jql += ' ORDER BY created DESC';
    }

    let startAt = 0;
    let hasMore = true;
    let totalFetched = 0;

    /**
     * Iterator function that returns batches of records
     */
    const getRecords: TQoreSearchRecordsIterator = async (_ctx, blockSize) => {
      if (!hasMore || totalFetched >= limit) {
        return null;
      }

      try {
        const pageSize = Math.min(blockSize || MAX_PAGE_SIZE, MAX_PAGE_SIZE, limit - totalFetched);

        const { data } = await QorusRequest.get<any>(
          {
            headers: {
              Authorization: authHeader,
            },
            path: `/ex/jira/${cloud_id}/rest/api/3/search/jql`,
            params: {
              jql,
              startAt,
              maxResults: pageSize,
              fields: '*all',
            },
          },
          { url: 'https://api.atlassian.com', endpointId: 'Jira' }
        );

        const response = data as JiraSearchResponse;
        const issues = response?.issues ?? [];

        if (issues.length === 0) {
          hasMore = false;
          return null;
        }

        totalFetched += issues.length;
        startAt += issues.length;
        hasMore = startAt < (response?.total ?? 0) && totalFetched < limit;

        // Transform issues to flat records
        const records = issues.map((issue: JiraSearchResponse['issues'][0]) =>
          transformIssueToRecord(issue, customFieldMap)
        );

        return mapObjectToColumnFormat(records);
      } catch (error) {
        if (error instanceof JiraRecordError) {
          throw error;
        }
        throw new JiraRecordError(`Failed to search records: ${error}`);
      }
    };

    return getRecords;
  } catch (error) {
    if (error instanceof JiraRecordError) {
      throw error;
    }
    throw new JiraRecordError(`Failed to initialize search for project ${projectKey}: ${error}`);
  }
};
