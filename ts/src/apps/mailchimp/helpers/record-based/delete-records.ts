/**
 * Mailchimp Delete Records
 *
 * Archives (soft deletes) members from a Mailchimp audience using WHERE conditions.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreDeleteRecordsFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import {
  getListIdByName,
  getSubscriberHash,
  mailchimpDelete,
  MailchimpError,
} from './constants';
import { searchMailchimpRecords } from './search-records';

/**
 * Delete (archive) members from a Mailchimp audience matching WHERE conditions.
 * Returns the count of deleted records.
 *
 * Note: This uses Mailchimp's DELETE endpoint which archives the member.
 * The member's data is preserved and can be recovered.
 */
export const deleteMailchimpRecords: TQoreDeleteRecordsFunction = async (ctx, where, opts) => {
  const { token, datacenter } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'datacenter'],
    ErrorClass: MailchimpError,
  });

  const tableName = opts?.table;
  if (!tableName) {
    throw new MailchimpError('Table name (audience) is required in opts.table');
  }

  if (!where) {
    throw new MailchimpError('WHERE condition is required for delete operations (safety check)');
  }

  const listId = await getListIdByName({ token, datacenter, listName: tableName });

  // Find matching members using search
  const iterator = await searchMailchimpRecords(ctx, where, opts);
  const matchingEmails: string[] = [];

  let batch = await iterator(ctx, 1000);
  while (batch) {
    const emails = (batch.email_address as string[]) || [];
    matchingEmails.push(...emails);
    batch = await iterator(ctx, 1000);
  }

  // Delete each matching member
  let deletedCount = 0;

  for (const email of matchingEmails) {
    try {
      const subscriberHash = await getSubscriberHash(email);

      await mailchimpDelete({
        token,
        datacenter,
        path: `lists/${listId}/members/${subscriberHash}`,
      });

      deletedCount++;
    } catch (error) {
      // Log failure but continue with remaining records
      console.error(`Failed to delete member ${email}: ${error}`);
    }
  }

  return deletedCount;
};
