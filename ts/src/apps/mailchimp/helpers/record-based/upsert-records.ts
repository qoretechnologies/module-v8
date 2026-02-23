/**
 * Mailchimp Upsert Records
 *
 * Uses Mailchimp's native PUT upsert to create or update members.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpsertRecordsFunction, TQoreUpsertRecordsResultCode } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
} from '../../../../global/helpers';
import {
  getListIdByName,
  getSubscriberHash,
  mailchimpPut,
  MailchimpError,
  TMailchimpMember,
  transformRecordToMemberPayload,
} from './constants';

/**
 * Upsert members in a Mailchimp audience.
 * Uses Mailchimp's native PUT endpoint which creates if not exists, updates if exists.
 * Returns result codes for each record.
 */
export const upsertMailchimpRecords: TQoreUpsertRecordsFunction = async (ctx, records, opts) => {
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
  const results: TQoreUpsertRecordsResultCode[] = [];

  for (const record of recordObjects) {
    try {
      const payload = transformRecordToMemberPayload(record as Record<string, unknown>);
      const email = payload.email_address as string;

      if (!email) {
        throw new MailchimpError('email_address is required to upsert a member');
      }

      // Default status to 'subscribed' if not provided
      if (!payload.status) {
        payload.status = 'subscribed';
      }

      const subscriberHash = await getSubscriberHash(email);

      // Mailchimp PUT is natively upsert
      const result = await mailchimpPut<TMailchimpMember>({
        token,
        datacenter,
        path: `lists/${listId}/members/${subscriberHash}`,
        body: payload,
      });

      // Determine if this was an insert or update based on timestamps
      // If signup timestamp matches last_changed, it's likely a new member
      if (result.timestamp_signup === result.last_changed) {
        results.push('inserted');
      } else {
        results.push('updated');
      }
    } catch (error) {
      if (error instanceof MailchimpError) {
        throw error;
      }
      throw new MailchimpError(`Failed to upsert member: ${error}`);
    }
  }

  return results;
};
