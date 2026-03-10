// Copyright 2026 Qore Technologies, s.r.o.
import { IQoreAppActionWithFunction } from '@qoretechnologies/ts-toolkit';
import { configDotenv } from 'dotenv';
import {
  AddKeywords,
  AddNegativeKeywords,
  CreateAdGroup,
  CreateBiddingStrategy,
  CreateBudget,
  CreateCampaign,
  CreateCustomerList,
  CreateResponsiveSearchAd,
  GetCampaign,
  GetCustomerInfo,
  ListAdGroups,
  ListAds,
  ListBiddingStrategies,
  ListBudgets,
  ListCampaigns,
  ListConversionActions,
  ListCustomerLists,
  ListKeywords,
  RemoveAd,
  RemoveAdGroup,
  RemoveCampaign,
  RemoveKeyword,
  RunAdGroupReport,
  RunCampaignReport,
  RunCustomReport,
  RunKeywordReport,
  UpdateAdGroup,
  UpdateAdStatus,
  UpdateBudget,
  UpdateCampaign,
  UpdateKeyword,
  UploadClickConversion,
} from '../apps/google-ads/actions';
import { getGoogleAdsCustomerAllowedValues } from '../apps/google-ads/helpers/get-customer-allowed-values';
import { getGoogleAdsAdAllowedValues } from '../apps/google-ads/helpers/get-ad-allowed-values';
import { getGoogleAdsAdGroupAllowedValues } from '../apps/google-ads/helpers/get-ad-group-allowed-values';
import { getGoogleAdsBiddingStrategyAllowedValues } from '../apps/google-ads/helpers/get-bidding-strategy-allowed-values';
import { getGoogleAdsBudgetAllowedValues } from '../apps/google-ads/helpers/get-budget-allowed-values';
import { getGoogleAdsCampaignAllowedValues } from '../apps/google-ads/helpers/get-campaign-allowed-values';
import { getGoogleAdsConversionActionAllowedValues } from '../apps/google-ads/helpers/get-conversion-action-allowed-values';
import { getGoogleAdsCustomerListAllowedValues } from '../apps/google-ads/helpers/get-customer-list-allowed-values';
import { getGoogleAdsKeywordAllowedValues } from '../apps/google-ads/helpers/get-keyword-allowed-values';
import { NewLeadFormSubmission } from '../apps/google-ads/triggers';
import { delay } from '../global/helpers';
import { Debugger, DebugLevels } from '../utils/Debugger';
import { checkAllowedValues, skipOnTransientError } from './utils';

Debugger.level = DebugLevels.Verbose;
configDotenv({ path: '.env' });

describe('Google Ads', () => {
  const base_context = {
    conn_opts: {
      token: '',
      developer_token: '',
    } as any,
    opts: {
      customer_id: '',
    } as any,
  };

  let hasCredentials = false;

  // Track created resource IDs for cleanup
  let createdBudgetResourceName: string | undefined;
  let createdCampaignId: string | undefined;
  let createdAdGroupId: string | undefined;
  let createdAdId: string | undefined;
  let createdKeywordCriterionId: string | undefined;

  beforeAll(async () => {
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;

    if (!refreshToken || !clientId || !clientSecret || !developerToken || !customerId) {
      console.warn(
        'Skipping Google Ads tests: GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_CLIENT_ID, ' +
          'GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_DEVELOPER_TOKEN, and GOOGLE_ADS_CUSTOMER_ID ' +
          'environment variables are required.'
      );
      return;
    }

    const data = {
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    };

    const formBody = Object.keys(data)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key as keyof typeof data])}`)
      .join('&');

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody,
    });

    const responseData = await response.json();
    if (!responseData?.access_token) {
      console.warn('Failed to get Google Ads access token, skipping tests');
      return;
    }

    base_context.conn_opts.token = responseData.access_token;
    base_context.conn_opts.developer_token = developerToken;
    base_context.conn_opts.oauth2_client_id = clientId;
    base_context.conn_opts.oauth2_client_secret = clientSecret;
    base_context.conn_opts.oauth2_refresh_token = refreshToken;
    base_context.opts.customer_id = customerId;

    if (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
      base_context.conn_opts.login_customer_id = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;
    }

    hasCredentials = true;
  });

  const skipIfNoCredentials = () => {
    if (!hasCredentials) {
      console.warn('Skipping test: no Google Ads credentials');
    }
  };

  // ─── Allowed Values ───────────────────────────────────────────────────

  describe('Allowed Values', () => {
    it(
      'Should return customer allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsCustomerAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: true });
      })
    );

    it('Should return empty customer allowed values when connection options are missing', async () => {
      const emptyAllowedValues = await getGoogleAdsCustomerAllowedValues({});
      checkAllowedValues(emptyAllowedValues, { checkNonEmpty: false });
      expect(emptyAllowedValues.length).toBe(0);
    });

    it(
      'Should return campaign allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsCampaignAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it(
      'Should return ad group allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsAdGroupAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it(
      'Should return budget allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsBudgetAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it(
      'Should return bidding strategy allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsBiddingStrategyAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it(
      'Should return conversion action allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsConversionActionAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it(
      'Should return customer list allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsCustomerListAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it(
      'Should return ad allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsAdAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it(
      'Should return keyword allowed values',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const allowedValues = await getGoogleAdsKeywordAllowedValues(base_context);
        checkAllowedValues(allowedValues, { checkNonEmpty: false });
      })
    );

    it('Should return empty array when connection options are missing', async () => {
      const emptyAllowedValues = await getGoogleAdsCampaignAllowedValues({});
      checkAllowedValues(emptyAllowedValues, { checkNonEmpty: false });
      expect(emptyAllowedValues.length).toBe(0);
    });
  });

  // ─── Account Actions ──────────────────────────────────────────────────

  describe('Account Actions', () => {
    it(
      'Should get customer info',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = GetCustomerInfo as IQoreAppActionWithFunction;
        const result = await action.api_function({}, undefined, base_context);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );
  });

  // ─── Campaign CRUD Flow ───────────────────────────────────────────────

  describe('Campaign CRUD', () => {
    it(
      'Should list campaigns',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListCampaigns as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { status_filter: 'ALL', limit: 10 },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should create a budget',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = CreateBudget as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            name: `Test Budget ${Date.now()}`,
            daily_amount: 5.0,
            delivery_method: 'STANDARD',
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();
        expect(result.success).toBe(true);

        createdBudgetResourceName = result.resource_name;
      })
    );

    it(
      'Should create a campaign',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = CreateCampaign as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            name: `Test Campaign ${Date.now()}`,
            channel_type: 'SEARCH',
            status: 'PAUSED',
            daily_budget: 5.0,
            bidding_strategy: 'MANUAL_CPC',
            target_google_search: true,
            target_search_network: false,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();
        expect(result.campaign_name).toBeDefined();
        expect(result.status).toBe('PAUSED');

        // Extract campaign ID from resource_name (customers/XXXX/campaigns/YYYY)
        const parts = result.resource_name?.split('/');
        createdCampaignId = parts?.[parts.length - 1];
      })
    );

    it(
      'Should get a campaign',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdCampaignId) return;

        const action = GetCampaign as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { campaign_id: createdCampaignId },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.id).toBe(createdCampaignId);
        expect(result.name).toBeDefined();
        expect(result.status).toBeDefined();
      })
    );

    it(
      'Should update a campaign',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdCampaignId) return;

        const action = UpdateCampaign as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            campaign_id: createdCampaignId,
            name: `Updated Test Campaign ${Date.now()}`,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();
      })
    );

    it(
      'Should list budgets',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListBudgets as IQoreAppActionWithFunction;
        const result = await action.api_function({ limit: 10 }, undefined, base_context);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should update a budget',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdBudgetResourceName) return;

        // Extract budget ID from resource_name
        const parts = createdBudgetResourceName.split('/');
        const budgetId = parts[parts.length - 1];

        const action = UpdateBudget as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            budget_id: budgetId,
            name: `Updated Budget ${Date.now()}`,
            daily_amount: 10.0,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      })
    );
  });

  // ─── Ad Group CRUD ────────────────────────────────────────────────────

  describe('Ad Group CRUD', () => {
    it(
      'Should create an ad group',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdCampaignId) return;

        const action = CreateAdGroup as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            campaign_id: createdCampaignId,
            name: `Test Ad Group ${Date.now()}`,
            type: 'SEARCH_STANDARD',
            status: 'PAUSED',
            cpc_bid: 1.0,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();

        const parts = result.resource_name?.split('/');
        createdAdGroupId = parts?.[parts.length - 1];
      })
    );

    it(
      'Should list ad groups',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListAdGroups as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { campaign_id: createdCampaignId, status_filter: 'ALL', limit: 10 },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should update an ad group',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdAdGroupId) return;

        const action = UpdateAdGroup as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            ad_group_id: createdAdGroupId,
            name: `Updated Ad Group ${Date.now()}`,
            cpc_bid: 1.5,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();
      })
    );
  });

  // ─── Ad CRUD ──────────────────────────────────────────────────────────

  describe('Ad CRUD', () => {
    it(
      'Should create a responsive search ad',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdAdGroupId) return;

        const action = CreateResponsiveSearchAd as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            ad_group_id: createdAdGroupId,
            headlines: ['Test Headline 1', 'Test Headline 2', 'Test Headline 3'],
            descriptions: ['Test description one for ads.', 'Test description two for ads.'],
            final_urls: ['https://example.com'],
            path1: 'test',
            path2: 'path',
            status: 'PAUSED',
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();

        // Extract ad ID from the response
        createdAdId = result.ad_id || result.resource_name?.split('/').pop();
      })
    );

    it(
      'Should list ads',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListAds as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { ad_group_id: createdAdGroupId, limit: 10 },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should update ad status',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdAdGroupId || !createdAdId) return;

        const action = UpdateAdStatus as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            ad_group_id: createdAdGroupId,
            ad_id: createdAdId,
            status: 'PAUSED',
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
      })
    );
  });

  // ─── Keyword Management ───────────────────────────────────────────────

  describe('Keyword Management', () => {
    it(
      'Should add keywords',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdAdGroupId) return;

        const action = AddKeywords as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            ad_group_id: createdAdGroupId,
            keywords: [
              { text: 'test keyword one', match_type: 'BROAD' },
              { text: 'test keyword two', match_type: 'PHRASE' },
            ],
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);

        // Store first keyword criterion ID for later tests
        if (Array.isArray(result) && result.length > 0) {
          const resourceName = result[0]?.resource_name || '';
          createdKeywordCriterionId = resourceName.split('/').pop();
        }
      })
    );

    it(
      'Should list keywords',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListKeywords as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { ad_group_id: createdAdGroupId, limit: 10 },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should update a keyword',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdAdGroupId || !createdKeywordCriterionId) return;

        const action = UpdateKeyword as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            ad_group_id: createdAdGroupId,
            criterion_id: createdKeywordCriterionId,
            status: 'PAUSED',
            cpc_bid: 0.5,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      })
    );

    it(
      'Should add negative keywords',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials || !createdCampaignId) return;

        const action = AddNegativeKeywords as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            campaign_id: createdCampaignId,
            keywords: [{ text: 'free', match_type: 'BROAD' }],
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );
  });

  // ─── Bidding Strategies ───────────────────────────────────────────────

  describe('Bidding Strategies', () => {
    it(
      'Should list bidding strategies',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListBiddingStrategies as IQoreAppActionWithFunction;
        const result = await action.api_function({ limit: 10 }, undefined, base_context);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should create a bidding strategy',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = CreateBiddingStrategy as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            name: `Test Bidding Strategy ${Date.now()}`,
            type: 'TARGET_CPA',
            target_cpa: 5.0,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();
        expect(result.success).toBe(true);

      })
    );
  });

  // ─── Reporting ────────────────────────────────────────────────────────

  describe('Reporting', () => {
    it(
      'Should run campaign report',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = RunCampaignReport as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { date_range: 'LAST_30_DAYS', limit: 10 },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should run ad group report',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = RunAdGroupReport as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { date_range: 'LAST_30_DAYS', limit: 10 },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should run keyword report',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = RunKeywordReport as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { date_range: 'LAST_30_DAYS', limit: 10 },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should run custom report',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = RunCustomReport as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            query: `SELECT campaign.id, campaign.name FROM campaign LIMIT 5`,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );
  });

  // ─── Conversions ──────────────────────────────────────────────────────

  describe('Conversions', () => {
    it(
      'Should list conversion actions',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListConversionActions as IQoreAppActionWithFunction;
        const result = await action.api_function({ limit: 10 }, undefined, base_context);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should fail to upload click conversion with invalid GCLID',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = UploadClickConversion as IQoreAppActionWithFunction;

        await expect(
          action.api_function(
            {
              gclid: 'invalid_gclid_for_testing',
              conversion_action_id: '0',
              conversion_date_time: new Date().toISOString(),
              conversion_value: 10.0,
              currency_code: 'USD',
            },
            undefined,
            base_context
          )
        ).rejects.toThrow();
      })
    );
  });

  // ─── Customer Match ───────────────────────────────────────────────────

  describe('Customer Match', () => {
    it(
      'Should list customer lists',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = ListCustomerLists as IQoreAppActionWithFunction;
        const result = await action.api_function({ limit: 10 }, undefined, base_context);

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      })
    );

    it(
      'Should create a customer list',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const action = CreateCustomerList as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            name: `Test Customer List ${Date.now()}`,
            description: 'Automated test customer list',
            membership_life_span: 30,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.resource_name).toBeDefined();

      })
    );
  });

  // ─── Trigger ──────────────────────────────────────────────────────────

  describe('Trigger', () => {
    it('Should have correct event_info schema', () => {
      const trigger = NewLeadFormSubmission as any;

      expect(trigger.event_info).toBeDefined();
      expect(trigger.event_info.type).toBeDefined();
      expect(trigger.event_info.type.fields).toBeDefined();

      const fields = trigger.event_info.type.fields;
      expect(fields.submission_id).toBeDefined();
      expect(fields.gclid).toBeDefined();
      expect(fields.submission_date_time).toBeDefined();
      expect(fields.submission_fields).toBeDefined();
      expect(fields.campaign_id).toBeDefined();
      expect(fields.campaign_name).toBeDefined();
      expect(fields.ad_group_id).toBeDefined();
    });

    it(
      'Should return example event data matching event_info schema',
      skipOnTransientError(async () => {
        skipIfNoCredentials();
        if (!hasCredentials) return;

        const trigger = NewLeadFormSubmission as any;
        const exampleData = await trigger.get_example_event_data(base_context);
        const eventInfoFields = Object.keys(trigger.event_info.type.fields);
        const exampleFields = Object.keys(exampleData);

        // All declared fields should be present
        const missingFields = eventInfoFields.filter((f) => !exampleFields.includes(f));
        expect(missingFields).toEqual([]);

        // No extra undeclared fields
        const extraFields = exampleFields.filter((f) => !eventInfoFields.includes(f));
        expect(extraFields).toEqual([]);
      })
    );
  });

  // ─── Negative Tests ───────────────────────────────────────────────────

  describe('Negative Tests', () => {
    it('Should fail to get campaign without campaign ID', async () => {
      if (!hasCredentials) return;

      const action = GetCampaign as IQoreAppActionWithFunction;

      await expect(action.api_function({}, undefined, base_context)).rejects.toThrow();
    });

    it('Should fail to create campaign without required options', async () => {
      if (!hasCredentials) return;

      const action = CreateCampaign as IQoreAppActionWithFunction;

      await expect(action.api_function({}, undefined, base_context)).rejects.toThrow();
    });

    it('Should fail to run custom report without query', async () => {
      if (!hasCredentials) return;

      const action = RunCustomReport as IQoreAppActionWithFunction;

      await expect(action.api_function({}, undefined, base_context)).rejects.toThrow();
    });

    it('Should fail to create ad group without campaign ID', async () => {
      if (!hasCredentials) return;

      const action = CreateAdGroup as IQoreAppActionWithFunction;

      await expect(
        action.api_function(
          { name: 'Test', type: 'SEARCH_STANDARD' } as any,
          undefined,
          base_context
        )
      ).rejects.toThrow();
    });

    it('Should fail with invalid connection options', async () => {
      const action = ListCampaigns as IQoreAppActionWithFunction;

      await expect(
        action.api_function({}, undefined, {
          conn_opts: { token: 'invalid', developer_token: 'invalid' },
          opts: { customer_id: '0' },
        } as any)
      ).rejects.toThrow();
    });
  });

  // ─── Clean Up ─────────────────────────────────────────────────────────

  describe('Clean Up', () => {
    beforeEach(async () => {
      await delay(500);
    });

    it('Should remove keyword', async () => {
      if (!hasCredentials || !createdAdGroupId || !createdKeywordCriterionId) return;

      try {
        const action = RemoveKeyword as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            ad_group_id: createdAdGroupId,
            criterion_id: createdKeywordCriterionId,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.success).toBe(true);
      } catch (error) {
        console.warn('Failed to remove keyword during cleanup:', error);
      }
    });

    it('Should remove ad', async () => {
      if (!hasCredentials || !createdAdGroupId || !createdAdId) return;

      try {
        const action = RemoveAd as IQoreAppActionWithFunction;
        const result = await action.api_function(
          {
            ad_group_id: createdAdGroupId,
            ad_id: createdAdId,
          },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.removed).toBe(true);
      } catch (error) {
        console.warn('Failed to remove ad during cleanup:', error);
      }
    });

    it('Should remove ad group', async () => {
      if (!hasCredentials || !createdAdGroupId) return;

      try {
        const action = RemoveAdGroup as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { ad_group_id: createdAdGroupId },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.removed).toBe(true);
      } catch (error) {
        console.warn('Failed to remove ad group during cleanup:', error);
      }
    });

    it('Should remove campaign', async () => {
      if (!hasCredentials || !createdCampaignId) return;

      try {
        const action = RemoveCampaign as IQoreAppActionWithFunction;
        const result = await action.api_function(
          { campaign_id: createdCampaignId },
          undefined,
          base_context
        );

        expect(result).toBeDefined();
        expect(result.removed).toBe(true);
      } catch (error) {
        console.warn('Failed to remove campaign during cleanup:', error);
      }
    });
  });
});
