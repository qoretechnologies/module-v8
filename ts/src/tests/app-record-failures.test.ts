// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import { baserowClient } from '../apps/baserow/client';
import { updateBaserowRecords } from '../apps/baserow/helpers/record-based/update-records';
import { deleteBaserowRecords } from '../apps/baserow/helpers/record-based/delete-records';
import { clickUpClient } from '../apps/clickup/client';
import * as clickupTables from '../apps/clickup/helpers/record-based/constants';
import { createClickUpRecords } from '../apps/clickup/helpers/record-based/create-records';
import { updateClickUpRecords } from '../apps/clickup/helpers/record-based/update-records';
import { searchClickUpRecords } from '../apps/clickup/helpers/record-based/search-records';
import { getClickUpRecordType } from '../apps/clickup/helpers/record-based/get-record-type';
import { asanaClient } from '../apps/asana/client';
import { getAsanaRecordType } from '../apps/asana/helpers/record-based/get-record-type';
import { clearMappingsCache as clearAsana } from '../apps/asana/helpers/record-based/constants';
import { getFreshdeskRecordType } from '../apps/freshdesk/helpers/record-based/get-record-type';
import { clearCustomFieldsCache } from '../apps/freshdesk/helpers/record-based/constants';
import { freshdeskClient } from '../apps/freshdesk/client';
import {
  clearFieldCache,
  getRecordFieldsViaQuery,
} from '../apps/netsuite/helpers/record-based/constants';
import { getMailchimpRecordType } from '../apps/mailchimp/helpers/record-based/get-record-type';
import * as mailchimpTables from '../apps/mailchimp/helpers/record-based/constants';
import { getZendeskRecordType } from '../apps/zendesk/helpers/record-based/get-record-type';
import { getPipedriveLeadRecordType } from '../apps/pipedrive/helpers/record-based/get-lead-record-type';
import { searchActiveCampaignRecords } from '../apps/active-campaign/helpers/record-based/search-records';
import { activeCampaignClient } from '../apps/active-campaign/helpers/constants';
import { Debugger } from '../utils/Debugger';

const failure = new Error('fixture upstream failure');
const context = {
  conn_opts: {
    token: 'fixture',
    url: 'https://example.invalid',
    subdomain: 'fixture',
    datacenter: 'us1',
    instance_url: 'https://example.invalid',
  },
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(Debugger, 'log').mockImplementation(() => undefined);
  // Block unexpected requests as well as the explicitly injected failures.
  jest.spyOn(QorusRequest, 'get').mockRejectedValue(failure);
  jest.spyOn(QorusRequest, 'post').mockRejectedValue(failure);
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe.each(['update', 'delete'])('Baserow %s', (operation) => {
  it('rejects a failed second selection page before attempting mutations', async () => {
    const get = jest
      .spyOn(QorusRequest, 'get')
      .mockResolvedValueOnce({ data: [{ id: 1, name: 'Tasks' }] })
      .mockResolvedValueOnce({ data: { results: [{ id: 1 }], count: 2 } })
      .mockRejectedValueOnce(failure);
    const post = jest.spyOn(baserowClient, 'post');
    const patch = jest.spyOn(baserowClient, 'patch');
    const result =
      operation === 'update'
        ? updateBaserowRecords(context, { name: 'changed' }, undefined, { table: 'Tasks' })
        : deleteBaserowRecords(context, undefined, { table: 'Tasks' });
    await Promise.all([expect(result).rejects.toThrow(failure.message), jest.runAllTimersAsync()]);
    expect(get).toHaveBeenCalledTimes(3);
    expect(post).not.toHaveBeenCalled();
    expect(patch).not.toHaveBeenCalled();
  });
});

describe('ClickUp custom field resolution', () => {
  const table = 'Workspace|Space|List';
  const actions = [
    () => getClickUpRecordType(context, table),
    () => searchClickUpRecords(context, undefined, { table }),
    () => createClickUpRecords(context, { name: ['fixture'] }, { table }),
    () => updateClickUpRecords(context, { name: 'fixture' }, undefined, { table }),
  ];
  it.each(actions.map((action, index) => ({ action, index })))(
    'propagates failure in operation $index before writing',
    async ({ action }) => {
      jest
        .spyOn(clickupTables, 'getClickUpListIdByPath')
        .mockResolvedValue({ listId: 'list', workspaceId: 'workspace', spaceId: 'space' });
      const get = jest.spyOn(clickUpClient, 'get').mockRejectedValue(failure);
      const post = jest.spyOn(clickUpClient, 'post');
      const put = jest.spyOn(clickUpClient, 'put');
      await expect(action()).rejects.toThrow(failure.message);
      expect(get).toHaveBeenCalledWith('list/list/field', { token: 'fixture' });
      expect(post).not.toHaveBeenCalled();
      expect(put).not.toHaveBeenCalled();
    }
  );
});

it('Asana does not cache failed custom fields and can recover immediately', async () => {
  clearAsana();
  const get = jest
    .spyOn(asanaClient, 'get')
    .mockResolvedValueOnce({ data: [{ gid: 'w', name: 'Workspace' }] })
    .mockResolvedValueOnce({ data: [{ gid: 'p', name: 'Project' }] })
    .mockRejectedValueOnce(failure)
    .mockResolvedValueOnce({ data: [{ gid: 'f', name: 'Priority', resource_subtype: 'text' }] });
  await expect(getAsanaRecordType(context, 'Workspace|Project')).rejects.toThrow(failure.message);
  const schema = await getAsanaRecordType(context, 'Workspace|Project');
  expect(schema).toMatchObject({ fields: { cf_Priority: { type: 'string' } } });
  expect(get).toHaveBeenCalledTimes(4);
});

it('Freshdesk does not cache a failed custom-field schema', async () => {
  clearCustomFieldsCache();
  const get = jest
    .spyOn(freshdeskClient, 'get')
    .mockRejectedValueOnce(failure)
    .mockResolvedValueOnce([{ name: 'cf_priority', type: 'custom_text' }]);
  await expect(getFreshdeskRecordType(context, 'Tickets')).rejects.toThrow(failure.message);
  expect(await getFreshdeskRecordType(context, 'Tickets')).toMatchObject({
    fields: { cf_priority: { type: 'string' } },
  });
  expect(get).toHaveBeenCalledTimes(2);
});

it('NetSuite does not cache a failed schema query', async () => {
  clearFieldCache();
  const post = jest
    .spyOn(QorusRequest, 'post')
    .mockRejectedValueOnce(failure)
    .mockResolvedValueOnce({
      data: { items: [{ id: 'one', name: 'Invoice' }], count: 1, hasMore: false },
    });
  const opts = { token: 'fixture', accountId: 'fixture', recordType: 'invoice' };
  await expect(getRecordFieldsViaQuery(opts)).rejects.toThrow(failure.message);
  expect((await getRecordFieldsViaQuery(opts)).get('name')).toBe('string');
  expect(post).toHaveBeenCalledTimes(2);
});

it('Mailchimp propagates a failed merge-field lookup after resolving the list', async () => {
  jest.spyOn(mailchimpTables, 'getListIdByName').mockResolvedValue('list');
  const get = jest.spyOn(QorusRequest, 'get');
  await expect(getMailchimpRecordType(context, 'List')).rejects.toThrow(failure.message);
  expect(get).toHaveBeenCalled();
});

it.each(['tickets', 'users', 'organizations', 'custom'])(
  'Zendesk rejects failed %s dynamic fields',
  async (table) => {
    await expect(getZendeskRecordType(context, table)).rejects.toThrow(failure.message);
    expect(QorusRequest.get).toHaveBeenCalled();
  }
);

it('Pipedrive rejects a failed lead reference lookup', async () => {
  await expect(getPipedriveLeadRecordType(context)).rejects.toThrow(failure.message);
  expect(QorusRequest.get).toHaveBeenCalled();
});

it.each(['Contacts', 'Deals'])(
  'ActiveCampaign rejects failed %s custom-field enrichment',
  async (table) => {
    const key = table.toLowerCase();
    const get = jest
      .spyOn(activeCampaignClient, 'get')
      .mockResolvedValueOnce({ [key]: [{ id: 'one' }], meta: { total: 1 } })
      .mockRejectedValueOnce(failure);
    const iterator = await searchActiveCampaignRecords(
      context,
      {
        exp: '==',
        args: [{ field: 'cf_1' }, { value: 'yes' }],
      },
      { table }
    );
    await expect(iterator(context, 100)).rejects.toThrow(failure.message);
    expect(get).toHaveBeenCalledTimes(2);
  }
);

it('Airtable rejects a failed table lookup after fetching bases', async () => {
  const { getAirtableTableList } = require('../apps/airtable/helpers/record-based/get-table-list');
  const get = jest
    .spyOn(QorusRequest, 'get')
    .mockResolvedValueOnce({ data: { bases: [{ id: 'base', name: 'Base' }] } });
  await expect(getAirtableTableList(context)).rejects.toThrow(failure.message);
  expect(get).toHaveBeenCalledTimes(2);
});

it('Google Sheets propagates a failed record-option lookup', async () => {
  const tables = require('../apps/google-sheets/helpers/record-based/constants');
  const {
    GoogleSheetsSearchOptions,
  } = require('../apps/google-sheets/helpers/record-based/options');
  const lookup = jest.spyOn(tables, 'getGoogleSheetsTableIdByName').mockRejectedValue(failure);
  await expect(
    GoogleSheetsSearchOptions.sheet_id.get_allowed_values({ ...context, opts: { table: 'Sheet' } })
  ).rejects.toThrow(failure.message);
  expect(lookup).toHaveBeenCalledTimes(1);
});

it('ZohoCRM propagates a failed upsert-option lookup', async () => {
  const {
    ZohoCrmUpsertOptions,
  } = require('../apps/zohocrm/helpers/record-based/get-upsert-options');
  await expect(
    ZohoCrmUpsertOptions.duplicate_check_fields.get_element_allowed_values({
      ...context,
      opts: { table: 'Contacts' },
    })
  ).rejects.toThrow(failure.message);
  expect(QorusRequest.get).toHaveBeenCalled();
});
