/**
 * Mailchimp Get Table List
 *
 * Returns all available audiences (lists) as table names.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../../global/helpers';
import { getMailchimpLists, MailchimpError } from './constants';

/**
 * Get all available tables (audiences).
 * Returns audience names as table identifiers.
 */
export const getMailchimpTableList: TQoreGetTableListFunction = async (ctx) => {
  const { token, datacenter } = getQoreContextRequiredValues({
    context: ctx,
    connectionFields: ['token', 'datacenter'],
    ErrorClass: MailchimpError,
  });

  try {
    const listsMap = await getMailchimpLists({ token, datacenter });
    return Array.from(listsMap.keys());
  } catch (error) {
    if (error instanceof MailchimpError) {
      throw error;
    }
    throw new MailchimpError(`Failed to get table list: ${error}`);
  }
};
