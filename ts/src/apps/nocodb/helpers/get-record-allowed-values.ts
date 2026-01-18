import {
  IQoreAllowedValue,
  TCustomConnOptions,
  TQoreGetAllowedValuesFunction,
} from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { fromV3Response, nocodbClient, NocoDBV3Response } from '../client';
import { NocoDBError } from '../constants';

/**
 * Get records from a NocoDB table as allowed values.
 * Returns records with their ID as value and a display name derived from the primary field.
 */
export const getNocoDBRecordAllowedValues: TQoreGetAllowedValuesFunction<
  TCustomConnOptions,
  string
> = async (context) => {
  try {
    const { token, url, baseId, table } = getQoreContextRequiredValues({
      context,
      connectionFields: ['token', 'url'],
      optionFields: ['baseId', 'table'],
      ErrorClass: NocoDBError,
    });

    // Fetch records from the table (limit to reasonable amount for dropdown)
    const response = await nocodbClient.get<NocoDBV3Response>(`data/${baseId}/${table}/records`, {
      token,
      connectionOptions: { url },
      params: {
        limit: '100',
      },
    });

    const records = response?.records || [];

    if (records.length === 0) {
      return [];
    }

    // Transform v3 response to flat format
    const flatRecords = fromV3Response(records);

    return flatRecords.map((record): IQoreAllowedValue<string> => {
      const id = String(record.id);
      // Try to find a suitable display field (common field names for primary/title)
      const displayValue = findDisplayValue(record, id);

      return {
        value: id,
        display_name: displayValue,
      };
    });
  } catch {
    return [];
  }
};

/**
 * Find a suitable display value for a record.
 * Looks for common primary field names, falls back to ID.
 */
function findDisplayValue(record: Record<string, unknown>, id: string): string {
  // Common primary field names in order of preference
  const primaryFieldNames = [
    'Title',
    'title',
    'Name',
    'name',
    'Label',
    'label',
    'Subject',
    'subject',
    'Description',
    'description',
  ];

  for (const fieldName of primaryFieldNames) {
    const value = record[fieldName];
    if (value && typeof value === 'string' && value.trim()) {
      return `${value} (${id})`;
    }
  }

  // If no common field found, use the first string field that's not 'id'
  for (const [key, value] of Object.entries(record)) {
    if (key !== 'id' && typeof value === 'string' && value.trim()) {
      return `${value} (${id})`;
    }
  }

  // Fall back to just the ID
  return id;
}
