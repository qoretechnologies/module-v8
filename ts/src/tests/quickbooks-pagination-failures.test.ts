// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import * as helpers from '../apps/quickbooks/helpers/constants';

const failure = new Error('fixture upstream failure');
const context = { conn_opts: { token: 'fixture', realm_id: 'fixture', instance_type: 'sandbox' } };
const entities = [
  ['account', 'Account', 'Accounts'],
  ['bill', 'Bill', 'Bills'],
  ['class', 'Class', 'Classes'],
  ['credit-memo', 'CreditMemo', 'CreditMemos'],
  ['customer', 'Customer', 'Customers'],
  ['deposit', 'Deposit', 'Deposits'],
  ['estimate', 'Estimate', 'Estimates'],
  ['invoice', 'Invoice', 'Invoices'],
  ['item', 'Item', 'Items'],
  ['journal-entry', 'JournalEntry', 'JournalEntries'],
  ['payment', 'Payment', 'Payments'],
  ['purchase', 'Purchase', 'Purchases'],
  ['purchase-order', 'PurchaseOrder', 'PurchaseOrders'],
  ['refund-receipt', 'RefundReceipt', 'RefundReceipts'],
  ['sales-receipt', 'SalesReceipt', 'SalesReceipts'],
  ['tax-code', 'TaxCode', 'TaxCodes'],
  ['vendor', 'Vendor', 'Vendors'],
];

describe.each(entities)('QuickBooks %s lookup', (file, entity, plural) => {
  const lookup = require(`../apps/quickbooks/helpers/get-${file}-id-allowed-values`)[
    `getQuickbooks${entity}IdAllowedValues`
  ] as (ctx: typeof context) => Promise<Array<{ value: string }>>;
  const request = jest.fn();
  const page = (count: number, offset = 0) => ({
    QueryResponse: {
      [entity]: Array.from({ length: count }, (_, i) => ({
        Id: String(offset + i),
        Name: 'fixture',
      })),
      maxResults: count,
    },
  });
  beforeEach(() => {
    jest.useFakeTimers();
    request.mockReset();
    jest
      .spyOn(helpers, 'createQuickbooksClient')
      .mockReturnValue({ [`find${plural}`]: request } as unknown as ReturnType<
        typeof helpers.createQuickbooksClient
      >);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('propagates first-page errors', async () => {
    request.mockRejectedValue(failure);
    await expect(lookup(context)).rejects.toThrow(failure);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('propagates errors after a complete page', async () => {
    request.mockResolvedValueOnce(page(100)).mockRejectedValueOnce(failure);
    await expect(lookup(context)).rejects.toThrow(failure);
    expect(request).toHaveBeenLastCalledWith({
      desc: 'MetaData.CreateTime',
      limit: 100,
      offset: 100,
    });
  });
  it('terminates immediately for an empty QueryResponse', async () => {
    request.mockResolvedValue({ QueryResponse: {} });
    await expect(lookup(context)).resolves.toEqual([]);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('continues beyond two pages and includes the final short page', async () => {
    request
      .mockResolvedValueOnce(page(100))
      .mockResolvedValueOnce(page(100, 100))
      .mockResolvedValueOnce(page(1, 200));
    const values = await lookup(context);
    expect(values).toHaveLength(201);
    expect(values[200].value).toBe('200');
    expect(request).toHaveBeenCalledTimes(3);
  });
  it('stops at the configured cap without requesting another page', async () => {
    request.mockResolvedValue(page(100));
    await expect(lookup(context)).resolves.toHaveLength(500);
    expect(request).toHaveBeenCalledTimes(5);
  });
  it('rejects a final response delivered at the deadline', async () => {
    request.mockImplementation(async () => {
      jest.setSystemTime(Date.now() + helpers.QUICKBOOKS_ALLOWED_VALUES_TIMEOUT);
      return page(1);
    });
    await expect(lookup(context)).rejects.toThrow(/timeout/i);
  });
  it.each([{}, { QueryResponse: { [entity]: {} } }, { QueryResponse: { maxResults: 1 } }])(
    'rejects malformed responses %j',
    async (response) => {
      request.mockResolvedValue(response);
      await expect(lookup(context)).rejects.toThrow(/invalid/i);
    }
  );
});
