/**
 * Mailchimp Create Records
 *
 * Creates new members in a Mailchimp audience.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreCreateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
  mapObjectToColumnFormat,
} from '../../../../global/helpers';
import {
  getListIdByName,
  mailchimpPost,
  MailchimpError,
  TMailchimpMember,
  transformMemberToRecord,
  transformRecordToMemberPayload,
} from './constants';

/**
 * Create new members in a Mailchimp audience.
 * Accepts records in column format, returns created records in column format.
 */
export const createMailchimpRecords: TQoreCreateRecordsFunction = async (ctx, records, opts) => {
  const { token, datacenter } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'datacenter'],
    ErrorClass: MailchimpError,
  });

  const tableName = opts?.table;
  if (!tableName) {
    throw new MailchimpError('Table name (audience) is required in opts.table');
  }

  const listId = await getListIdByName({ token, datacenter, listName: tableName });

  // Convert column format to array of objects
  const recordObjects = mapColumnFormatToObject(records as Record<string, {}[]>);
  const createdRecords: Record<string, unknown>[] = [];

  for (const record of recordObjects) {
    try {
      const payload = transformRecordToMemberPayload(record as Record<string, unknown>);

      if (!payload.email_address) {
        throw new MailchimpError('email_address is required to create a member');
      }

      // Default status to 'subscribed' if not provided
      if (!payload.status) {
        payload.status = 'subscribed';
      }

      const createdMember = await mailchimpPost<TMailchimpMember>({
        token,
        datacenter,
        path: `lists/${listId}/members`,
        body: payload,
      });

      createdRecords.push(transformMemberToRecord(createdMember));
    } catch (error) {
      if (error instanceof MailchimpError) {
        throw error;
      }
      throw new MailchimpError(`Failed to create member: ${error}`);
    }
  }

  return mapObjectToColumnFormat(createdRecords);
};
