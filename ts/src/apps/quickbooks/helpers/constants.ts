// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { get } from 'lodash';
import QuickBooks, { AppConfig } from 'quickbooks-node-promise';

export const createQuickbooksClient = (options: {
  realm_id: string;
  instance_type: string;
  token: string;
}) => {
  const appConfig = {
    accessToken: options.token,
    autoRefresh: false,
    debug: false,
    useProduction: options.instance_type === 'production',
  } satisfies AppConfig;

  return new QuickBooks(appConfig, options.realm_id);
};

export const QUICKBOOKS_ALLOWED_VALUES_LIMIT = 500;
export const QUICKBOOKS_ALLOWED_VALUES_TIMEOUT = 15_000; // 15 seconds

/**
 * Read complete pages up to the allowed-values limit. QueryResponse.maxResults is
 * the current page's count, not a total. An omitted entity collection is an empty
 * result only when the response does not claim to contain records.
 * @param fetchPage SDK query callback, bound to the authenticated company client
 * @param entity QueryResponse collection name, such as Account or Invoice
 * @returns Retrieved records up to QUICKBOOKS_ALLOWED_VALUES_LIMIT
 * @throws If a request fails, the response is malformed, or the scan times out.
 * @example
 * const accounts = await fetchQuickbooksRecords<Account>(
 *   (query) => client.findAccounts(query), 'Account'
 * );
 * @note A failed later page rejects the whole lookup; accumulated records are not returned.
 */
export const fetchQuickbooksRecords = async <Item>(
  fetchPage: (query: { desc: string; limit: number; offset: number }) => Promise<{
    QueryResponse: Record<string, unknown>;
  }>,
  entity: string
): Promise<Item[]> => {
  const items: Item[] = [];
  const start = Date.now();
  const checkDeadline = () => {
    if (Date.now() - start >= QUICKBOOKS_ALLOWED_VALUES_TIMEOUT) {
      throw new Error(`Timeout fetching QuickBooks ${entity} records`);
    }
  };

  while (items.length < QUICKBOOKS_ALLOWED_VALUES_LIMIT) {
    checkDeadline();
    const limit = Math.min(100, QUICKBOOKS_ALLOWED_VALUES_LIMIT - items.length);
    const response = await fetchPage({
      desc: 'MetaData.CreateTime',
      limit,
      offset: items.length,
    });
    checkDeadline();
    const result = response?.QueryResponse;
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
      throw new Error('Invalid QuickBooks query response');
    }
    const page = result[entity] ?? (result.maxResults ? undefined : []);
    if (!Array.isArray(page)) {
      throw new Error(`Invalid QuickBooks ${entity} collection`);
    }
    items.push(...(page as Item[]).slice(0, limit));
    if (page.length < limit) {
      break;
    }
  }
  return items;
};

const ERROR_PATHS = {
  QB_DETAIL: 'errorResponse.Fault.Error[0].Detail',
  QB_MESSAGE: 'errorResponse.Fault.Error[0].Message',
  GENERAL_MESSAGE: 'message',
  AXIOS_MESSAGE: 'response.data.message',
} as const;

export const getQuickbooksErrorMessage = (error: any) => {
  return (
    get(error, ERROR_PATHS.QB_DETAIL) ||
    get(error, ERROR_PATHS.QB_MESSAGE) ||
    get(error, ERROR_PATHS.GENERAL_MESSAGE) ||
    String(error)
  );
};
