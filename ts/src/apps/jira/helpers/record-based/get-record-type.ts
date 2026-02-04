/**
 * Jira Get Record Type
 *
 * Returns the schema for issues in a specific project,
 * including standard fields and project-specific custom fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import {
  IQoreTypeObjectNonList,
  QorusRequest,
  TQoreAppActionOption,
  TQoreGetRecordTypeFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  buildJiraAuthHeader,
  CUSTOM_FIELD_PREFIX,
  JiraField,
  JiraRecordError,
  mapJiraFieldTypeToQore,
  STANDARD_ISSUE_FIELDS,
} from './constants';

/**
 * Get the record type (schema) for issues in a Jira project.
 */
export const getJiraRecordType: TQoreGetRecordTypeFunction = async (ctx, tablePath) => {
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

  const projectKey = tablePath;

  try {
    // Build base fields from standard issue fields
    const fields: Record<string, TQoreAppActionOption> = {};

    for (const [fieldName, fieldType] of Object.entries(STANDARD_ISSUE_FIELDS)) {
      fields[fieldName] = { type: fieldType } as TQoreAppActionOption;
    }

    // Fetch all fields (includes custom fields)
    const { data } = await QorusRequest.get<any>(
      {
        headers: {
          Authorization: authHeader,
        },
        path: `/ex/jira/${cloud_id}/rest/api/3/field`,
      },
      { url: 'https://api.atlassian.com', endpointId: 'Jira' }
    );

    const allFields = data as JiraField[];

    // Add custom fields with cf_ prefix
    for (const field of allFields ?? []) {
      if (field.custom && field.id.startsWith('customfield_')) {
        const qoreType = mapJiraFieldTypeToQore(field.schema);
        const customFieldKey = `${CUSTOM_FIELD_PREFIX}${field.name.replaceAll(/\s+/g, '_')}`;

        fields[customFieldKey] = { type: qoreType } as TQoreAppActionOption;
      }
    }

    return {
      type: 'hash',
      fields,
    } as IQoreTypeObjectNonList;
  } catch (error) {
    if (error instanceof JiraRecordError) {
      throw error;
    }
    throw new JiraRecordError(`Failed to get record type for project ${projectKey}: ${error}`);
  }
};
