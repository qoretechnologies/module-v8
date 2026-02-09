/**
 * ActiveCampaign Get Table List
 *
 * Returns all available record types (tables) in ActiveCampaign.
 * Currently supports Contacts, Deals, and Accounts.
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { TQoreGetTableListFunction } from '@qoretechnologies/ts-toolkit';
import { ACTIVE_CAMPAIGN_RECORD_TYPES } from './constants';

/**
 * Get all available tables (record types) in ActiveCampaign.
 * Returns: ["Contacts", "Deals", "Accounts"]
 */
export const getActiveCampaignTableList: TQoreGetTableListFunction = async () => {
  return [...ACTIVE_CAMPAIGN_RECORD_TYPES];
};
