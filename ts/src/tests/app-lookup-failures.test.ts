// Copyright 2026 Qore Technologies, s.r.o.
// SPDX-License-Identifier: MIT

import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import axios from 'axios';
import { Debugger } from '../utils/Debugger';

const failure = new Error('fixture upstream failure');
const request = jest.fn();
// SDK namespaces/chained query builders all reach the same observable request.
const sdk: unknown = new Proxy(() => undefined, {
  get: (_target, key) =>
    key === 'then'
      ? undefined
      : [
            'get',
            'list',
            'query',
            'getMany',
            'getAll',
            'getManyForOrganization',
            'search',
            'read',
            'getPosts',
            'searchRead',
            'getCustomDomain',
            'listItems',
          ].includes(String(key))
        ? request
        : sdk,
  apply: () => sdk,
});
const factoryMocks: Array<[string, string[]]> = [
  ['../apps/contentful/client', ['getContentfulClient', 'getContentfulScopedClient']],
  ['../apps/webflow/helpers/constants', ['createWebflowClient']],
  ['../apps/notion/helpers/constants', ['createNotionClient']],
  ['../apps/google-sheets/helpers/constants', ['createGoogleSheetsClient']],
  ['../apps/google-meet/helpers/constants', ['createGoogleMeetClient']],
];
for (const [module, names] of factoryMocks) {
  jest.doMock(module, () => ({
    ...jest.requireActual(module),
    ...Object.fromEntries(names.map((name) => [name, () => sdk])),
  }));
}
jest.doMock('@typeform/api-client', () => ({ createClient: () => sdk }));
jest.doMock('@microsoft/microsoft-graph-client', () => ({
  Client: { initWithMiddleware: () => sdk },
}));
jest.doMock('facebook-nodejs-business-sdk', () => ({
  FacebookAdsApi: { init: () => sdk },
  Page: function () {
    return sdk;
  },
}));
jest.doMock('../apps/google-ads/helpers/constants', () => ({
  ...jest.requireActual('../apps/google-ads/helpers/constants'),
  getGoogleAdsCustomerFromContext: () => ({ customer: sdk }),
}));

// Values needed to enter each lookup. No actual credentials or network requests.
const fields: Record<string, unknown> = new Proxy(
  { url: 'https://example.invalid', base_uri: 'example.invalid' },
  {
    get: (target, key) => Reflect.get(target, key) ?? 'fixture',
  }
);
const context = { conn_opts: fields, opts: fields };
const fixtures: Array<[string, string]> = [
  ['airtable/helpers/get-base-id-allowed-values', 'getAirtableBaseIdAllowedValues'],
  ['airtable/helpers/get-table-id-allowed-values', 'getAirtableTableIdAllowedValues'],
  ['contentful/helpers/get-asset-allowed-values', 'getContentfulAssetAllowedValues'],
  ['contentful/helpers/get-content-type-allowed-values', 'getContentfulContentTypeAllowedValues'],
  ['contentful/helpers/get-dynamic-entry-type', 'getContentfulEntryFieldOptions'],
  ['contentful/helpers/get-dynamic-entry-type', 'getContentfulEntryDynamicResponseType'],
  ['contentful/helpers/get-entry-allowed-values', 'getContentfulEntryAllowedValues'],
  ['contentful/helpers/get-environment-allowed-values', 'getContentfulEnvironmentAllowedValues'],
  ['contentful/helpers/get-field-allowed-values', 'getContentfulFieldAllowedValues'],
  ['contentful/helpers/get-space-allowed-values', 'getContentfulSpaceAllowedValues'],
  ['esignature/helpers/get-document-id-allowed-values', 'getEsignatureDocumentIdAllowedValues'],
  ['esignature/helpers/get-recipient-id-allowed-values', 'getEsignatureRecipientIdAllowedValues'],
  ['facebook-pages/helpers/get-post-id-allowed-values', 'getFacebookPostIdAllowedValues'],
  ['freshdesk/helpers/get-record-allowed-values', 'getFreshdeskRecordCurrentValue'],
  ['freshdesk/helpers/get-record-allowed-values', 'getFreshdeskRecordVersion'],
  ['freshdesk/helpers/get-record-allowed-values', 'getFreshdeskSchemaRecordValue'],
  ['freshdesk/helpers/get-record-allowed-values', 'getFreshdeskRecordIdAllowedValues'],
  ['freshdesk/helpers/get-ticket-allowed-values', 'getFreshdeskTicketIdAllowedValues'],
  ['freshdesk/helpers/get-ticket-allowed-values', 'getFreshdeskTicketStatusAllowedValues'],
  ['freshdesk/helpers/get-ticket-allowed-values', 'getFreshdeskTicketPriorityAllowedValues'],
  ['freshdesk/helpers/get-ticket-allowed-values', 'getFreshdeskTicketSourceAllowedValues'],
  ['google-ads/helpers/get-ad-allowed-values', 'getGoogleAdsAdAllowedValues'],
  ['google-ads/helpers/get-ad-group-allowed-values', 'getGoogleAdsAdGroupAllowedValues'],
  [
    'google-ads/helpers/get-bidding-strategy-allowed-values',
    'getGoogleAdsBiddingStrategyAllowedValues',
  ],
  ['google-ads/helpers/get-budget-allowed-values', 'getGoogleAdsBudgetAllowedValues'],
  ['google-ads/helpers/get-campaign-allowed-values', 'getGoogleAdsCampaignAllowedValues'],
  [
    'google-ads/helpers/get-conversion-action-allowed-values',
    'getGoogleAdsConversionActionAllowedValues',
  ],
  ['google-ads/helpers/get-customer-allowed-values', 'getGoogleAdsCustomerAllowedValues'],
  ['google-ads/helpers/get-customer-list-allowed-values', 'getGoogleAdsCustomerListAllowedValues'],
  ['google-ads/helpers/get-keyword-allowed-values', 'getGoogleAdsKeywordAllowedValues'],
  ['google-sheets/helpers/get-sheet-rows-options', 'getSheetRowsOptions'],
  ['hubspot/helpers/get-event-info-type', 'getHubspotCustomObjectEventInfoType'],
  ['hubspot/helpers/get-form-allowed-values', 'getHubspotFormAllowedValues'],
  ['hubspot/helpers/get-form-field-allowed-values', 'getHubspotFormFieldAllowedValues'],
  ['hubspot/helpers/get-list-folder-allowed-values', 'getHubspotFolderAllowedValues'],
  ['hubspot/helpers/get-list-id-allowed-values', 'getHubspotListAllowedValues'],
  ['hubspot/helpers/get-object-properties', 'getHubspotContactPropertiesType'],
  ['hubspot/helpers/get-object-properties', 'getHubspotCompanyPropertiesType'],
  ['hubspot/helpers/get-object-properties', 'getHubspotDealPropertiesType'],
  ['hubspot/helpers/get-object-properties', 'getHubspotLeadPropertiesType'],
  ['hubspot/helpers/get-object-properties', 'getHubspotProductPropertiesType'],
  ['hubspot/helpers/get-object-properties', 'getHubspotTicketPropertiesType'],
  ['hubspot/helpers/get-object-properties', 'getHubspotContactPropertiesTypeOptional'],
  ['hubspot/helpers/get-object-properties', 'getHubspotCompanyPropertiesTypeOptional'],
  ['hubspot/helpers/get-object-properties', 'getHubspotDealPropertiesTypeOptional'],
  ['hubspot/helpers/get-object-properties', 'getHubspotLeadPropertiesTypeOptional'],
  ['hubspot/helpers/get-object-properties', 'getHubspotProductPropertiesTypeOptional'],
  ['hubspot/helpers/get-object-properties', 'getHubspotUserPropertiesTypeOptional'],
  ['hubspot/helpers/get-object-properties', 'getHubspotCustomObjectPropertiesType'],
  ['jira/helpers/get-comment-id-allowed-values', 'getJiraCommentIdAllowedValues'],
  ['jira/helpers/get-default-description-value', 'getJiraIssueDescriptionDefaultValue'],
  ['jira/helpers/get-issue-id-allowed-values', 'getJiraIssueIdAllowedValues'],
  ['jira/helpers/get-worklog-id-allowed-values', 'getJiraWorklogIdAllowedValues'],
  ['netsuite/helpers/get-record-type-allowed-values', 'getNetsuiteRecordTypesAllowedValues'],
  ['nocodb/helpers/get-attachment-field-allowed-values', 'getNocoDBAttachmentFieldAllowedValues'],
  ['nocodb/helpers/get-base-allowed-values', 'getNocoDBBaseAllowedValues'],
  ['nocodb/helpers/get-button-field-allowed-values', 'getNocoDBButtonFieldAllowedValues'],
  ['nocodb/helpers/get-link-field-allowed-values', 'getNocoDBLinkFieldAllowedValues'],
  ['nocodb/helpers/get-record-allowed-values', 'getNocoDBRecordAllowedValues'],
  ['nocodb/helpers/get-table-allowed-values', 'getNocoDBTableAllowedValues'],
  ['nocodb/helpers/get-table-allowed-values', 'getNocoDBTableIdAllowedValues'],
  ['nocodb/helpers/get-workspace-allowed-values', 'getNocoDBWorkspaceAllowedValues'],
  ['notion/helpers/get-discussion-allowed-values', 'getNotionDiscussionsAllowedValues'],
  ['notion/helpers/get-page-allowed-values', 'getNotionPageAllowedValues'],
  ['outlook/helpers/get-email-folder-allowed-values', 'getOutlookMailFoldersAllowedValues'],
  ['seatable/helpers/get-table-allowed-values', 'getSeaTableTableAllowedValues'],
  ['serenity/helpers/get-agent-params-allowed-values', 'getSerenityAgentParamsAllowedValues'],
  ['serenity/helpers/get-conversation-allowed-values', 'getSerenityConversationAllowedValues'],
  [
    'serenity/helpers/get-execute-agent-params-default-value',
    'getSerenityExecuteAgentParamsDefaultValue',
  ],
  ['teams/helpers/get-chat-id-allowed-values', 'getTeamsChatIdAllowedValues'],
  ['typeform/helpers/get-form-allowed-values', 'getTypeformFormIdAllowedValues'],
  ['typeform/helpers/get-image-allowed-values', 'getTypeformImageIdAllowedValues'],
  ['typeform/helpers/get-workspace-allowed-values', 'getTypeformWorkspaceIdAllowedValues'],
  ['webflow/helpers/get-collection-allowed-values', 'getWebflowCollectionAllowedValues'],
  ['webflow/helpers/get-custom-domain-allowed-values', 'getWebflowCustomDomainAllowedValues'],
  ['webflow/helpers/get-item-id-allowed-values', 'getWebflowItemAllowedValues'],
  ['webflow/helpers/get-locale-id-allowed-values', 'getWebflowCmsLocaleIdAllowedValues'],
  ['webflow/helpers/get-order-id-allowed-values', 'getWebflowOrderIdAllowedValues'],
  ['webflow/helpers/get-site-id-allowed-values', 'getWebflowSiteIdAllowedValues'],
  ['bamboohr/helpers/get-file-categories', 'getEmployeeFileCategoriesAllowedValues'],
  ['bamboohr/helpers/get-file-categories', 'getCompanyFileCategoriesAllowedValues'],
  ['bamboohr/helpers/get-time-off-types', 'getTimeOffTypesAllowedValues'],
  ['serenity/helpers/get-agent-allowed-values', 'getSerenitySystemAgentAllowedValues'],
  ['serenity/helpers/get-agent-allowed-values', 'getSerenityConversationAgentAllowedValues'],
];

describe.each(fixtures)('%s %s', (file, name) => {
  const lookup = require(`../apps/${file}`)[name] as (ctx: typeof context) => Promise<unknown>;
  beforeEach(() => {
    request.mockReset().mockRejectedValue(failure);
    jest.spyOn(Debugger, 'log').mockImplementation(() => undefined);
    for (const method of ['get', 'post', 'put', 'deleteReq', 'patch'] as const) {
      if (method in QorusRequest) {
        jest.spyOn(QorusRequest, method as 'get').mockImplementation(request);
      }
    }
    jest.spyOn(axios, 'get').mockImplementation(request);
    jest.spyOn(axios, 'post').mockImplementation(request);
    jest.spyOn(global, 'fetch').mockImplementation(request);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects an upstream error instead of returning cacheable fallback data', async () => {
    await expect(lookup(context)).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalled();
  });
});

describe('nested lookup failures and successful results', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    request.mockReset().mockRejectedValue(failure);
    jest.spyOn(Debugger, 'log').mockImplementation(() => undefined);
    jest.spyOn(QorusRequest, 'get').mockImplementation(request);
    jest.spyOn(QorusRequest, 'post').mockImplementation(request);
    jest.spyOn(global, 'fetch').mockImplementation(request);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('Google Ads rejects HTTP 429 instead of returning empty customer choices', async () => {
    request.mockResolvedValue({ ok: false, status: 429 });
    const {
      getGoogleAdsCustomerAllowedValues,
    } = require('../apps/google-ads/helpers/get-customer-allowed-values');
    await expect(getGoogleAdsCustomerAllowedValues(context)).rejects.toThrow('HTTP 429');
  });

  it.each(['getContentfulEntryFieldOptions', 'getContentfulEntryDynamicResponseType'])(
    'Contentful %s preserves a successfully empty custom schema',
    async (method) => {
      request.mockResolvedValue({ fields: [] });
      const schema = await require('../apps/contentful/helpers/get-dynamic-entry-type')[method](
        context
      );
      expect(schema.type).toBe('hash');
      expect(schema.fields).toBeDefined();
      expect(request).toHaveBeenCalledTimes(1);
    }
  );

  it('Contentful propagates a failed organization-scoped space lookup', async () => {
    request
      .mockResolvedValueOnce({ items: [] })
      .mockResolvedValueOnce({ items: [{ sys: { id: 'org' } }] });
    const {
      getContentfulSpaceAllowedValues,
    } = require('../apps/contentful/helpers/get-space-allowed-values');
    await expect(getContentfulSpaceAllowedValues(context)).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('Typeform propagates a failed second page', async () => {
    request.mockResolvedValueOnce({ items: [{ id: 'one', title: 'Form' }], page_count: 2 });
    const {
      getTypeformFormIdAllowedValues,
    } = require('../apps/typeform/helpers/get-form-allowed-values');
    await expect(getTypeformFormIdAllowedValues(context)).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('Typeform returns mapped choices for a successful scan', async () => {
    request.mockResolvedValue({
      items: [{ id: 'one', title: 'Form', type: 'form' }],
      page_count: 1,
    });
    const {
      getTypeformFormIdAllowedValues,
    } = require('../apps/typeform/helpers/get-form-allowed-values');
    await expect(getTypeformFormIdAllowedValues(context)).resolves.toEqual([
      { value: 'one', display_name: 'Form', desc: 'Id: one\nType: form\n' },
    ]);
  });

  it('Notion propagates a failed later search page', async () => {
    request.mockResolvedValueOnce({
      results: [{ id: 'one' }],
      has_more: true,
      next_cursor: 'next',
    });
    const {
      getNotionPageAllowedValues,
    } = require('../apps/notion/helpers/get-page-allowed-values');
    await Promise.all([
      expect(getNotionPageAllowedValues(context)).rejects.toThrow(failure.message),
      jest.runAllTimersAsync(),
    ]);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('Notion propagates a failed comment lookup', async () => {
    request.mockResolvedValueOnce({ results: [{ id: 'one' }] });
    const {
      getNotionDiscussionsAllowedValues,
    } = require('../apps/notion/helpers/get-discussion-allowed-values');
    await expect(getNotionDiscussionsAllowedValues(context)).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('Notion rejects an empty response after its deadline', async () => {
    request.mockImplementation(async () => {
      jest.setSystemTime(Date.now() + 10_000);
      return { results: [] };
    });
    const {
      getNotionDiscussionsAllowedValues,
    } = require('../apps/notion/helpers/get-discussion-allowed-values');
    await expect(getNotionDiscussionsAllowedValues(context)).rejects.toThrow(/timed out/i);
  });

  it('Outlook propagates a failed child-folder lookup', async () => {
    request.mockResolvedValueOnce({ value: [{ id: 'one', childFolderCount: 1 }] });
    const {
      getOutlookMailFoldersAllowedValues,
    } = require('../apps/outlook/helpers/get-email-folder-allowed-values');
    await expect(getOutlookMailFoldersAllowedValues(context)).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it.each(['fetchOutlookAttachments', 'fetchOutlookAttachmentContent'])(
    'Outlook %s rejects requested attachment failures',
    async (method) => {
      const emails = [{ id: 'one', hasAttachments: true, attachments: [{ id: 'attachment' }] }];
      await expect(
        require('../apps/outlook/helpers/search-emails.helpers')[method](sdk, emails)
      ).rejects.toThrow(failure.message);
      expect(request).toHaveBeenCalledTimes(1);
    }
  );

  it('BambooHR retries a failed lookup immediately and caches only the success', async () => {
    const {
      getCompanyFileCategories,
      clearFileCategoriesCache,
    } = require('../apps/bamboohr/helpers/get-file-categories');
    clearFileCategoriesCache();
    const conn = { token: 'fixture', company_domain: 'fixture' };
    request
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce({ data: { categories: [{ id: 1, name: 'Policy' }] } });
    await expect(getCompanyFileCategories(conn)).rejects.toThrow(failure.message);
    await expect(getCompanyFileCategories(conn)).resolves.toEqual([{ id: 1, name: 'Policy' }]);
    await expect(getCompanyFileCategories(conn)).resolves.toEqual([{ id: 1, name: 'Policy' }]);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('Freshdesk shared allowed-values helper propagates transport errors', async () => {
    const { fetchFreshdeskAllowedValues } = require('../apps/freshdesk/helpers/constants');
    await expect(
      fetchFreshdeskAllowedValues({
        token: 'fixture',
        subdomain: 'fixture',
        path: 'agents',
        mapItemToAllowedValue: (item: { id: string }) => ({ value: item.id }),
      })
    ).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each([
    'create-anomaly-score',
    'create-centroid',
    'create-prediction',
    'create-topic-distribution',
  ])('BigML %s rejects a failed dynamic input schema lookup', async (action) => {
    const definition = require(`../apps/bigml/actions/${action}.action`).default;
    await expect(definition.options.input_data.get_dynamic_type(context)).rejects.toThrow(
      failure.message
    );
    expect(request).toHaveBeenCalledTimes(1);
  });
});

describe('Zendesk generated allowed-values helper', () => {
  const {
    CreateZendeskGetAllowedValuesFunction,
  } = require('../apps/zendesk/helpers/create-get-allowed-values-function');
  const lookup = CreateZendeskGetAllowedValuesFunction('users');
  beforeEach(() => {
    jest.useFakeTimers();
    request.mockReset().mockRejectedValue(failure);
    jest.spyOn(QorusRequest, 'get').mockImplementation(request);
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });
  it('propagates a failed first request', async () => {
    await expect(lookup(context)).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('propagates a failed second page', async () => {
    request.mockResolvedValueOnce({
      data: { users: [{ id: 1, name: 'One' }], next_page: 'https://example.invalid/users?page=2' },
    });
    await Promise.all([
      expect(lookup(context)).rejects.toThrow(failure.message),
      jest.runAllTimersAsync(),
    ]);
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('rejects a response that arrives at the deadline', async () => {
    request.mockImplementation(async () => {
      jest.setSystemTime(Date.now() + 60_000);
      return { data: { users: [] } };
    });
    await expect(lookup(context)).rejects.toThrow(/timeout/i);
  });
});

describe('additional reference metadata and nested reads', () => {
  beforeEach(() => {
    request.mockReset().mockRejectedValue(failure);
    jest.spyOn(QorusRequest, 'get').mockImplementation(request);
    jest.spyOn(Debugger, 'log').mockImplementation(() => undefined);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Google Meet propagates a failed meeting-code lookup', async () => {
    const {
      getConferenceIdByMeetingCode,
    } = require('../apps/google-meet/helpers/get-conference-id-by-meeting-code.helper');
    await expect(getConferenceIdByMeetingCode('abc-defg-hij', 'fixture')).rejects.toThrow(
      failure.message
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('HubSpot propagates failed dynamic event fields', async () => {
    const {
      createHubspotGetDynamicEventInfoType,
    } = require('../apps/hubspot/helpers/get-event-info-type');
    const lookup = createHubspotGetDynamicEventInfoType({
      object: 'contacts',
      defaultProperties: { type: 'hash', fields: {} },
    });
    await expect(lookup({ ...context, opts: { additionalProperties: ['email'] } })).rejects.toThrow(
      failure.message
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('Magento propagates failed object-field discovery', async () => {
    const { fetchMagentoObjectFieldsAllowedValues } = require('../apps/magento/helpers/constants');
    await expect(
      fetchMagentoObjectFieldsAllowedValues({
        token: 'fixture',
        url: 'https://example.invalid',
        path: '/products',
      })
    ).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('Pipedrive propagates a failed field-name mapping lookup', async () => {
    const { getPipedriveFieldNameToIdMap } = require('../apps/pipedrive/helpers/get-object-fields');
    await expect(getPipedriveFieldNameToIdMap('fixture', 'dealFields')).rejects.toThrow(
      failure.message
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('Outlook rejects a failed later email page', async () => {
    request.mockResolvedValueOnce({ value: [{ id: 'one' }], '@odata.nextLink': 'next' });
    const { fetchOutlookEmails } = require('../apps/outlook/helpers/search-emails.helpers');
    await expect(
      fetchOutlookEmails(sdk, { limit: 2, folderPath: '/me/messages', selectFields: ['id'] })
    ).rejects.toThrow(failure.message);
    expect(request).toHaveBeenCalledTimes(2);
  });
});
