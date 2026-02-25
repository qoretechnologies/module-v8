/**
 * Mailchimp Update Records
 *
 * Updates existing members in a Mailchimp audience using WHERE conditions.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreUpdateRecordsFunction } from '@qoretechnologies/ts-toolkit';
import {
  getQoreContextRequiredValues,
  mapColumnFormatToObject,
} from '../../../../global/helpers';
import {
  getListIdByName,
  getSubscriberHash,
  mailchimpPut,
  MailchimpError,
  normalizeSetToSingleRecord,
  transformRecordToMemberPayload,
} from './constants';
import { searchMailchimpRecords } from './search-records';

/**
 * Update members in a Mailchimp audience matching WHERE conditions.
 * Returns the count of updated records.
 */
export const updateMailchimpRecords: TQoreUpdateRecordsFunction = async (
  ctx,
  updateFields,
  where,
  opts
) => {
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

  // Normalize the update fields
  const updateRecord = normalizeSetToSingleRecord(
    updateFields,
    (data) => mapColumnFormatToObject(data as Record<string, {}[]>) as Record<string, unknown>[]
  );

  const updatePayload = transformRecordToMemberPayload(updateRecord);

  // Find matching members using search
  const iterator = await searchMailchimpRecords(ctx, where, opts);
  const matchingRecords: Record<string, unknown>[] = [];

  let batch = await iterator(ctx, 1000);
  while (batch) {
    const emails = (batch.email_address as string[]) || [];
    const ids = (batch.id as string[]) || [];
    for (let i = 0; i < emails.length; i++) {
      matchingRecords.push({
        email_address: emails[i],
        id: ids[i],
      });
    }
    batch = await iterator(ctx, 1000);
  }

  // Update each matching member, collecting any per-record errors
  let updatedCount = 0;
  const errors: string[] = [];

  for (const member of matchingRecords) {
    try {
      const email = member.email_address as string;
      const subscriberHash = await getSubscriberHash(email);

      await mailchimpPut({
        token,
        datacenter,
        path: `lists/${listId}/members/${subscriberHash}`,
        body: {
          ...updatePayload,
          email_address: email, // Always include email for PUT (upsert endpoint)
        },
      });

      updatedCount++;
    } catch (error) {
      errors.push(`${member.email_address}: ${error}`);
    }
  }

  if (errors.length > 0) {
    throw new MailchimpError(
      `Updated ${updatedCount} of ${matchingRecords.length} members; ${errors.length} failed:\n${errors.join('\n')}`
    );
  }

  return updatedCount;
};
