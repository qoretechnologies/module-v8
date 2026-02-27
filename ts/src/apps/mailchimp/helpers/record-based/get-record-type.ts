/**
 * Mailchimp Get Record Type
 *
 * Returns the dynamic schema for member records in a specific audience,
 * including standard member fields and audience-specific merge fields.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetRecordTypeFunction, TQoreType, TQoreTypeObject } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  CUSTOM_FIELD_PREFIX,
  getListIdByName,
  getMergeFieldsForList,
  MailchimpError,
} from './constants';

/**
 * Map Mailchimp merge field types to Qore types
 */
const mapMergeFieldTypeToQore = (mailchimpType: string): TQoreType => {
  const typeMap: Record<string, TQoreType> = {
    text: 'string',
    number: 'number',
    address: 'string',
    phone: 'string',
    date: 'date',
    birthday: 'string',
    zip: 'string',
    url: 'string',
    imageurl: 'string',
    radio: 'string',
    dropdown: 'string',
  };

  return typeMap[mailchimpType] || 'string';
};

/**
 * Get the record type (schema) for members in a specific audience.
 * Includes standard member fields and dynamic merge fields.
 */
export const getMailchimpRecordType: TQoreGetRecordTypeFunction = async (context, tableName) => {
  const { token, datacenter } = getQoreContextRequiredValues({
    context,
    connectionFields: ['token', 'datacenter'],
    ErrorClass: MailchimpError,
  });

  const listId = await getListIdByName({ token, datacenter, listName: tableName });

  // Fetch merge fields for this audience
  const mergeFieldDefs: Record<string, { type: TQoreType; desc: string }> = {};

  try {
    const mergeFields = await getMergeFieldsForList({ token, datacenter, listId });

    for (const field of mergeFields) {
      mergeFieldDefs[`${CUSTOM_FIELD_PREFIX}${field.tag}`] = {
        type: mapMergeFieldTypeToQore(field.type),
        desc: `Merge field: ${field.name} (${field.type})${field.required ? ' [required]' : ''}`,
      };
    }
  } catch {
    // Merge fields might fail for some audiences, continue with base fields
  }

  return {
    type: 'hash',
    fields: {
      // Core identifiers
      id: { type: 'string', desc: 'Subscriber hash (MD5 of lowercase email)' },
      email_address: { type: 'string', desc: 'Email address' },
      unique_email_id: { type: 'string', desc: 'Unique email ID' },
      web_id: { type: 'int', desc: 'Web ID for Mailchimp UI' },
      list_id: { type: 'string', desc: 'Audience (list) ID' },

      // Status and type
      status: { type: 'string', desc: 'Subscription status (subscribed, unsubscribed, pending, cleaned, transactional, archived)' },
      email_type: { type: 'string', desc: 'Email type (html or text)' },

      // Profile
      vip: { type: 'bool', desc: 'VIP status' },
      member_rating: { type: 'int', desc: 'Star rating (1-5)' },
      language: { type: 'string', desc: 'Subscriber language' },
      email_client: { type: 'string', desc: 'Email client used' },

      // Tags
      tags_count: { type: 'int', desc: 'Number of tags' },
      tags: { type: 'string', desc: 'Comma-separated tag names' },

      // Timestamps
      timestamp_signup: { type: 'date', desc: 'Signup timestamp' },
      timestamp_opt: { type: 'date', desc: 'Opt-in timestamp' },
      last_changed: { type: 'date', desc: 'Last changed timestamp' },

      // IP addresses
      ip_signup: { type: 'string', desc: 'Signup IP address' },
      ip_opt: { type: 'string', desc: 'Opt-in IP address' },

      // Stats (flattened)
      avg_open_rate: { type: 'number', desc: 'Average email open rate' },
      avg_click_rate: { type: 'number', desc: 'Average email click rate' },

      // Location (flattened)
      location_latitude: { type: 'number', desc: 'Location latitude' },
      location_longitude: { type: 'number', desc: 'Location longitude' },
      location_country_code: { type: 'string', desc: 'Location country code' },
      location_timezone: { type: 'string', desc: 'Location timezone' },

      // Dynamic merge fields
      ...mergeFieldDefs,
    },
  } satisfies TQoreTypeObject;
};
