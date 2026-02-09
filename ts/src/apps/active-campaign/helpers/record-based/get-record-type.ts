/**
 * ActiveCampaign Get Record Type
 *
 * Returns the dynamic schema (type definition) for a given entity type,
 * including standard fields and custom fields fetched from the API.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreType, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  fetchActiveCampaignAccountCustomFields,
  fetchActiveCampaignContactCustomFields,
} from '../get-custom-field-type';
import { activeCampaignClient } from '../constants';
import {
  AC_FIELD_TYPE_TO_QORE,
  ActiveCampaignRecordError,
  CUSTOM_FIELD_PREFIX,
  getStandardFields,
  TActiveCampaignRecordType,
  ACTIVE_CAMPAIGN_RECORD_TYPES,
} from './constants';

/**
 * Fetch deal custom field metadata from ActiveCampaign API
 */
const fetchDealCustomFields = async (options: {
  token: string;
  url: string;
}): Promise<Array<{ id: string; fieldLabel: string; fieldType: string; fieldOptions: string[] }>> => {
  try {
    const fields = await activeCampaignClient.fetchPaginated<{
      id: string;
      fieldLabel: string;
      fieldType: string;
      fieldOptions: string[];
    }>({
      path: 'dealCustomFieldMeta',
      token: options.token,
      baseUrl: options.url,
      itemsPath: 'dealCustomFieldMeta',
      maxResults: 500,
    });

    return fields;
  } catch (error) {
    throw new ActiveCampaignRecordError(`Failed to fetch deal custom fields: ${error}`);
  }
};

/**
 * Build custom field type definitions for an entity
 */
const getCustomFieldTypes = async (
  entityType: TActiveCampaignRecordType,
  token: string,
  instanceUrl: string
): Promise<Record<string, TQoreType>> => {
  const fields: Record<string, TQoreType> = {};

  if (entityType === 'Contacts') {
    const { fields: contactFields } = await fetchActiveCampaignContactCustomFields({
      token,
      url: instanceUrl,
    });

    for (const field of contactFields) {
      const qoreType = AC_FIELD_TYPE_TO_QORE[field.type] || 'any';
      fields[`${CUSTOM_FIELD_PREFIX}${field.id}`] = qoreType;
    }
  } else if (entityType === 'Deals') {
    const dealFields = await fetchDealCustomFields({ token, url: instanceUrl });

    for (const field of dealFields) {
      const qoreType = AC_FIELD_TYPE_TO_QORE[field.fieldType] || 'any';
      fields[`${CUSTOM_FIELD_PREFIX}${field.id}`] = qoreType;
    }
  } else if (entityType === 'Accounts') {
    const accountFields = await fetchActiveCampaignAccountCustomFields({
      token,
      url: instanceUrl,
    });

    for (const field of accountFields) {
      const qoreType = AC_FIELD_TYPE_TO_QORE[field.fieldType] || 'any';
      fields[`${CUSTOM_FIELD_PREFIX}${field.id}`] = qoreType;
    }
  }

  return fields;
};

/**
 * Get the record type (schema) for a given ActiveCampaign entity.
 * Returns standard fields plus custom fields fetched from the API.
 */
export const getActiveCampaignRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'] as const,
    ErrorClass: ActiveCampaignRecordError,
  });

  const entityType = tableName as TActiveCampaignRecordType;

  if (!ACTIVE_CAMPAIGN_RECORD_TYPES.includes(entityType)) {
    throw new ActiveCampaignRecordError(
      `Unknown table: ${tableName}. Available tables: ${ACTIVE_CAMPAIGN_RECORD_TYPES.join(', ')}`
    );
  }

  const standardFields = getStandardFields(entityType);
  const customFields = await getCustomFieldTypes(entityType, token, instance_url);

  // Build Qore type hash with all fields including descriptions
  const typeFields: Record<string, { type: TQoreType; desc?: string }> = {};

  for (const [fieldName, fieldType] of Object.entries(standardFields)) {
    typeFields[fieldName] = { type: fieldType };
  }

  for (const [fieldName, fieldType] of Object.entries(customFields)) {
    typeFields[fieldName] = { type: fieldType, desc: 'Custom field' };
  }

  return {
    type: 'hash',
    fields: typeFields,
  } as TQoreTypeObject;
};
