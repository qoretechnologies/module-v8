/**
 * ActiveCampaign Create Records
 *
 * Creates records sequentially for the specified entity type.
 * Custom fields are handled per-entity: inline for Contacts/Accounts,
 * separate API calls for Deals.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues, mapColumnFormatToObject, mapObjectToColumnFormat } from '../../../../global/helpers';
import { activeCampaignClient } from '../constants';
import {
  ActiveCampaignRecordError,
  ACTIVE_CAMPAIGN_RECORD_TYPES,
  ENTITY_CONFIG,
  TActiveCampaignRecordType,
  transformRecordToPayload,
  transformToRecord,
} from './constants';

/**
 * Create deal custom field values via separate API calls
 */
const createDealCustomFields = async (
  dealId: string,
  customFields: Array<{ id: string; value: unknown }>,
  token: string,
  instanceUrl: string
): Promise<void> => {
  for (const cf of customFields) {
    await activeCampaignClient.post('dealCustomFieldData', {
      dealCustomFieldDatum: {
        dealId: Number(dealId),
        customFieldId: Number(cf.id),
        fieldValue: String(cf.value),
      },
    }, {
      token,
      baseUrl: instanceUrl,
    });
  }
};

/**
 * Create records for the specified ActiveCampaign entity type.
 * Records are created sequentially (no batch API available).
 */
export const createActiveCampaignRecords: TQoreCreateRecordsFunction = async (context, records, options) => {
  const { token, instance_url } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'instance_url'] as const,
    ErrorClass: ActiveCampaignRecordError,
  });

  const tableName = options?.table as TActiveCampaignRecordType | undefined;

  if (!tableName) {
    throw new ActiveCampaignRecordError('Table name is required in options.table');
  }

  if (!ACTIVE_CAMPAIGN_RECORD_TYPES.includes(tableName)) {
    throw new ActiveCampaignRecordError(
      `Unknown table: ${tableName}. Available tables: ${ACTIVE_CAMPAIGN_RECORD_TYPES.join(', ')}`
    );
  }

  const entityConfig = ENTITY_CONFIG[tableName];
  const recordsArray = mapColumnFormatToObject(records);

  if (recordsArray.length === 0) {
    return mapObjectToColumnFormat([]);
  }

  const createdRecords: Record<string, unknown>[] = [];

  for (const record of recordsArray) {
    const { standardPayload, customFields } = transformRecordToPayload(record, tableName);

    const response = await activeCampaignClient.post<Record<string, unknown>>(
      entityConfig.apiPath,
      { [entityConfig.itemKey]: standardPayload },
      { token, baseUrl: instance_url }
    );

    const createdItem = response[entityConfig.itemKey] as Record<string, unknown>;

    // For deals, create custom field values via separate API
    if (tableName === 'Deals' && customFields.length > 0 && createdItem?.id) {
      await createDealCustomFields(String(createdItem.id), customFields, token, instance_url);
    }

    createdRecords.push(transformToRecord(createdItem, tableName));
  }

  return mapObjectToColumnFormat(createdRecords);
};
