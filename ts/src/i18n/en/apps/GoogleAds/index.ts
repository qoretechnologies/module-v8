import { BaseTranslation } from '../../../i18n-types';

const customerIdOption = {
  customer_id: {
    displayName: 'Customer Account',
    shortDesc: 'Google Ads customer account to use',
    longDesc: 'Select the Google Ads customer account (Customer ID) for this action.',
  },
};

const GoogleAdsAppEn = {
  displayName: 'Google Ads',
  groups: ['Advertising & Marketing', 'Google Workspace Suite'],
  shortDesc: 'Connect with Google Ads to manage campaigns, conversions, and audiences',
  longDesc:
    'Integrate with Google Ads to manage your advertising campaigns, track conversions, sync customer lists, ' +
    'and automate reporting. This integration covers campaign management, ad group and ad CRUD, keyword management, ' +
    'budget and bidding strategies, offline conversion uploads, customer match audiences, and lead form triggers.',
  connectionMessage: {
    title: 'Connect to Google Ads',
    content: `To connect to Google Ads, you need a **Google OAuth2 connection** and a following additional options:

## Developer Token
A developer token is required to access the Google Ads API. To obtain one:
1. Sign in to your **Google Ads Manager Account**
2. Navigate to **Tools & Settings** > **API Center**
3. Apply for a developer token if you don't have one
4. Copy the 22-character alphanumeric token

## Manager Account ID (Optional)
If you're using a Manager Account (MCC) to access client accounts, enter the Manager Account ID (10 digits, without hyphens).

**Note:** The Google Ads Customer Account is selected per action. After connecting, you will be able to choose from your accessible customer accounts when configuring each action.`,
  },
  actions: {
    // --- Accounts ---
    get_customer_info: {
      displayName: 'Get Customer Info',
      shortDesc: 'Get information about the current Google Ads customer account',
      longDesc:
        'Returns details about the authenticated Google Ads customer account, including accessible customer IDs.',
      options: {
        ...customerIdOption,
      },
    },

    // --- Campaigns ---
    list_campaigns: {
      displayName: 'List Campaigns',
      shortDesc: 'List campaigns with performance metrics',
      longDesc:
        'Retrieves campaigns from the Google Ads account with optional status filtering and performance metrics for a specified date range.',
      options: {
        ...customerIdOption,
        status_filter: {
          displayName: 'Status Filter',
          shortDesc: 'Filter campaigns by status',
          longDesc: 'Only return campaigns with the specified status. If not set, all non-removed campaigns are returned.',
        },
        date_range: {
          displayName: 'Date Range',
          shortDesc: 'Date range for performance metrics',
          longDesc: 'The predefined date range for retrieving performance metrics alongside campaign data.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of campaigns to return',
          longDesc: 'The maximum number of campaigns to return. Default is 100.',
        },
      },
    },
    get_campaign: {
      displayName: 'Get Campaign',
      shortDesc: 'Get details of a specific campaign',
      longDesc: 'Retrieves detailed information about a specific campaign by its ID, including status, budget, bidding strategy, and performance metrics.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'The campaign to retrieve',
          longDesc: 'Select or enter the ID of the campaign to retrieve details for.',
        },
      },
    },
    create_campaign: {
      displayName: 'Create Campaign',
      shortDesc: 'Create a new advertising campaign',
      longDesc:
        'Creates a new campaign in Google Ads with the specified channel type, budget, bidding strategy, and targeting settings. A campaign budget is created automatically.',
      options: {
        ...customerIdOption,
        name: {
          displayName: 'Campaign Name',
          shortDesc: 'Name for the new campaign',
          longDesc: 'A descriptive name for the campaign.',
        },
        channel_type: {
          displayName: 'Channel Type',
          shortDesc: 'Advertising channel type',
          longDesc: 'The type of advertising channel for this campaign (e.g., Search, Display, Shopping, Video).',
        },
        status: {
          displayName: 'Initial Status',
          shortDesc: 'Whether to start the campaign as enabled or paused',
          longDesc: 'Set to PAUSED to create the campaign without immediately serving ads.',
        },
        daily_budget: {
          displayName: 'Daily Budget',
          shortDesc: 'Daily budget amount in account currency',
          longDesc: 'The daily budget amount in your account currency (e.g., 50.00 for $50/day).',
        },
        bidding_strategy: {
          displayName: 'Bidding Strategy',
          shortDesc: 'Campaign bidding strategy',
          longDesc: 'The bidding strategy to use for this campaign.',
        },
        target_google_search: {
          displayName: 'Target Google Search',
          shortDesc: 'Show ads on Google Search',
          longDesc: 'Whether to show ads on Google Search results pages.',
        },
        target_search_network: {
          displayName: 'Target Search Network',
          shortDesc: 'Show ads on search partner sites',
          longDesc: 'Whether to show ads on Google search partner websites.',
        },
      },
    },
    update_campaign: {
      displayName: 'Update Campaign',
      shortDesc: 'Update an existing campaign',
      longDesc: 'Updates campaign properties such as name, status (enable/pause), and bidding strategy.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'The campaign to update',
          longDesc: 'Select or enter the ID of the campaign to update.',
        },
        name: {
          displayName: 'Campaign Name',
          shortDesc: 'New name for the campaign',
          longDesc: 'The updated name for the campaign. Leave empty to keep the current name.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'New status for the campaign',
          longDesc: 'Set the campaign status to ENABLED, PAUSED, or REMOVED.',
        },
      },
    },
    remove_campaign: {
      displayName: 'Remove Campaign',
      shortDesc: 'Remove a campaign',
      longDesc: 'Removes (soft deletes) a campaign from the Google Ads account. The campaign will be marked as REMOVED and will no longer serve ads.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'The campaign to remove',
          longDesc: 'Select or enter the ID of the campaign to remove.',
        },
      },
    },

    // --- Ad Groups ---
    list_ad_groups: {
      displayName: 'List Ad Groups',
      shortDesc: 'List ad groups with performance metrics',
      longDesc: 'Retrieves ad groups from the Google Ads account, optionally filtered by campaign.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'Filter by campaign',
          longDesc: 'Only return ad groups belonging to this campaign.',
        },
        status_filter: {
          displayName: 'Status Filter',
          shortDesc: 'Filter ad groups by status',
          longDesc: 'Only return ad groups with the specified status.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of ad groups to return',
          longDesc: 'The maximum number of ad groups to return. Default is 100.',
        },
      },
    },
    create_ad_group: {
      displayName: 'Create Ad Group',
      shortDesc: 'Create a new ad group within a campaign',
      longDesc: 'Creates a new ad group in a specified campaign with the given name, type, status, and CPC bid.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'The campaign to create the ad group in',
          longDesc: 'Select the campaign where the new ad group will be created.',
        },
        name: {
          displayName: 'Ad Group Name',
          shortDesc: 'Name for the new ad group',
          longDesc: 'A descriptive name for the ad group.',
        },
        type: {
          displayName: 'Ad Group Type',
          shortDesc: 'Type of ad group',
          longDesc: 'The type of ad group to create.',
        },
        status: {
          displayName: 'Initial Status',
          shortDesc: 'Whether to start the ad group as enabled or paused',
          longDesc: 'Set to PAUSED to create the ad group without immediately serving ads.',
        },
        cpc_bid: {
          displayName: 'CPC Bid',
          shortDesc: 'Maximum cost-per-click bid amount',
          longDesc: 'The maximum CPC bid amount in your account currency (e.g., 1.50 for $1.50).',
        },
      },
    },
    update_ad_group: {
      displayName: 'Update Ad Group',
      shortDesc: 'Update an existing ad group',
      longDesc: 'Updates ad group properties such as name, status, and CPC bid.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group to update',
          longDesc: 'Select or enter the ID of the ad group to update.',
        },
        name: {
          displayName: 'Ad Group Name',
          shortDesc: 'New name for the ad group',
          longDesc: 'The updated name for the ad group. Leave empty to keep the current name.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'New status for the ad group',
          longDesc: 'Set the ad group status to ENABLED, PAUSED, or REMOVED.',
        },
        cpc_bid: {
          displayName: 'CPC Bid',
          shortDesc: 'New maximum CPC bid amount',
          longDesc: 'The updated maximum CPC bid amount in your account currency.',
        },
      },
    },
    remove_ad_group: {
      displayName: 'Remove Ad Group',
      shortDesc: 'Remove an ad group',
      longDesc: 'Removes (soft deletes) an ad group. It will be marked as REMOVED and its ads will stop serving.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group to remove',
          longDesc: 'Select or enter the ID of the ad group to remove.',
        },
      },
    },

    // --- Ads ---
    list_ads: {
      displayName: 'List Ads',
      shortDesc: 'List ads with performance metrics',
      longDesc: 'Retrieves ads from the Google Ads account, optionally filtered by campaign, ad group, or status.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'Filter by campaign',
          longDesc: 'Only return ads belonging to this campaign.',
        },
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'Filter by ad group',
          longDesc: 'Only return ads belonging to this ad group.',
        },
        status_filter: {
          displayName: 'Status Filter',
          shortDesc: 'Filter ads by status',
          longDesc: 'Only return ads with the specified status. If not set, all non-removed ads are returned.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of ads to return',
          longDesc: 'The maximum number of ads to return. Default is 100.',
        },
      },
    },
    create_responsive_search_ad: {
      displayName: 'Create Responsive Search Ad',
      shortDesc: 'Create a new responsive search ad',
      longDesc:
        'Creates a responsive search ad (RSA) in a specified ad group with multiple headlines, descriptions, and final URLs. ' +
        'Google Ads will automatically test combinations to find the best-performing ad.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group to create the ad in',
          longDesc: 'Select the ad group where the new ad will be created.',
        },
        headlines: {
          displayName: 'Headlines',
          shortDesc: 'Ad headlines (3-15 required)',
          longDesc: 'List of headlines for the responsive search ad. Provide at least 3 and up to 15 headlines (max 30 characters each).',
        },
        descriptions: {
          displayName: 'Descriptions',
          shortDesc: 'Ad descriptions (2-4 required)',
          longDesc: 'List of descriptions for the responsive search ad. Provide at least 2 and up to 4 descriptions (max 90 characters each).',
        },
        final_urls: {
          displayName: 'Final URLs',
          shortDesc: 'Landing page URLs',
          longDesc: 'The URLs that users will be directed to after clicking the ad.',
        },
        path1: {
          displayName: 'Display Path 1',
          shortDesc: 'First part of the display URL path',
          longDesc: 'The first part of the display URL path shown in the ad (max 15 characters).',
        },
        path2: {
          displayName: 'Display Path 2',
          shortDesc: 'Second part of the display URL path',
          longDesc: 'The second part of the display URL path shown in the ad (max 15 characters).',
        },
        status: {
          displayName: 'Initial Status',
          shortDesc: 'Whether to start the ad as enabled or paused',
          longDesc: 'Set to PAUSED to create the ad without immediately serving it.',
        },
      },
    },
    update_ad_status: {
      displayName: 'Update Ad Status',
      shortDesc: 'Enable, pause, or remove an ad',
      longDesc: 'Updates the status of an ad within an ad group.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group containing the ad',
          longDesc: 'Select the ad group that contains the ad to update.',
        },
        ad_id: {
          displayName: 'Ad',
          shortDesc: 'The ad to update',
          longDesc: 'The ID of the ad to update.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'New status for the ad',
          longDesc: 'Set the ad status to ENABLED, PAUSED, or REMOVED.',
        },
      },
    },
    remove_ad: {
      displayName: 'Remove Ad',
      shortDesc: 'Remove an ad',
      longDesc: 'Removes (soft deletes) an ad from an ad group.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group containing the ad',
          longDesc: 'Select the ad group that contains the ad to remove.',
        },
        ad_id: {
          displayName: 'Ad',
          shortDesc: 'The ad to remove',
          longDesc: 'The ID of the ad to remove.',
        },
      },
    },

    // --- Keywords ---
    list_keywords: {
      displayName: 'List Keywords',
      shortDesc: 'List keywords with performance metrics',
      longDesc: 'Retrieves keywords from the Google Ads account with optional filtering by campaign or ad group, including performance metrics.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'Filter by campaign',
          longDesc: 'Only return keywords belonging to this campaign.',
        },
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'Filter by ad group',
          longDesc: 'Only return keywords belonging to this ad group.',
        },
        date_range: {
          displayName: 'Date Range',
          shortDesc: 'Date range for performance metrics',
          longDesc: 'The predefined date range for retrieving performance metrics.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of keywords to return',
          longDesc: 'The maximum number of keywords to return. Default is 100.',
        },
      },
    },
    add_keywords: {
      displayName: 'Add Keywords',
      shortDesc: 'Add keywords to an ad group',
      longDesc: 'Adds one or more keywords to a specified ad group with the given match type and optional CPC bid.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group to add keywords to',
          longDesc: 'Select the ad group where the keywords will be added.',
        },
        keywords: {
          displayName: 'Keywords',
          shortDesc: 'Keywords to add',
          longDesc: 'List of keyword entries to add, each with text and match type.',
          type: {
            element_type: {
              fields: {
                text: {
                  displayName: 'Keyword Text',
                  shortDesc: 'The keyword text',
                  longDesc: 'The keyword phrase to target.',
                },
                match_type: {
                  displayName: 'Match Type',
                  shortDesc: 'Keyword match type',
                  longDesc: 'How closely the search query must match: BROAD, PHRASE, or EXACT.',
                },
                cpc_bid: {
                  displayName: 'CPC Bid',
                  shortDesc: 'Optional CPC bid override',
                  longDesc: 'An optional CPC bid amount for this keyword. Overrides the ad group bid.',
                },
              },
            },
          },
        },
      },
    },
    add_negative_keywords: {
      displayName: 'Add Negative Keywords',
      shortDesc: 'Add negative keywords to a campaign',
      longDesc: 'Adds campaign-level negative keywords to prevent ads from showing for certain search terms.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'The campaign to add negative keywords to',
          longDesc: 'Select the campaign where the negative keywords will be added.',
        },
        keywords: {
          displayName: 'Negative Keywords',
          shortDesc: 'Negative keywords to add',
          longDesc: 'List of negative keyword entries to add, each with text and match type.',
          type: {
            element_type: {
              fields: {
                text: {
                  displayName: 'Keyword Text',
                  shortDesc: 'The negative keyword text',
                  longDesc: 'The keyword phrase to exclude.',
                },
                match_type: {
                  displayName: 'Match Type',
                  shortDesc: 'Keyword match type',
                  longDesc: 'How closely the search query must match for exclusion: BROAD, PHRASE, or EXACT.',
                },
              },
            },
          },
        },
      },
    },
    update_keyword: {
      displayName: 'Update Keyword',
      shortDesc: 'Update a keyword status or bid',
      longDesc: 'Updates an existing keyword in an ad group, allowing you to change its status or CPC bid.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group containing the keyword',
          longDesc: 'Select the ad group that contains the keyword to update.',
        },
        criterion_id: {
          displayName: 'Keyword Criterion ID',
          shortDesc: 'The criterion ID of the keyword to update',
          longDesc: 'The criterion ID of the keyword within the ad group.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'New status for the keyword',
          longDesc: 'Set the keyword status to ENABLED, PAUSED, or REMOVED.',
        },
        cpc_bid: {
          displayName: 'CPC Bid',
          shortDesc: 'New maximum CPC bid amount',
          longDesc: 'The updated maximum CPC bid amount in your account currency.',
        },
      },
    },
    remove_keyword: {
      displayName: 'Remove Keyword',
      shortDesc: 'Remove a keyword from an ad group',
      longDesc: 'Removes a keyword from the specified ad group.',
      options: {
        ...customerIdOption,
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'The ad group containing the keyword',
          longDesc: 'Select the ad group that contains the keyword to remove.',
        },
        criterion_id: {
          displayName: 'Keyword Criterion ID',
          shortDesc: 'The criterion ID of the keyword to remove',
          longDesc: 'The criterion ID of the keyword within the ad group.',
        },
      },
    },

    // --- Budgets ---
    list_budgets: {
      displayName: 'List Budgets',
      shortDesc: 'List campaign budgets',
      longDesc: 'Retrieves all campaign budgets in the Google Ads account.',
      options: {
        ...customerIdOption,
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of budgets to return',
          longDesc: 'The maximum number of budgets to return. Default is 100.',
        },
      },
    },
    create_budget: {
      displayName: 'Create Budget',
      shortDesc: 'Create a new campaign budget',
      longDesc: 'Creates a new campaign budget with a specified daily amount.',
      options: {
        ...customerIdOption,
        name: {
          displayName: 'Budget Name',
          shortDesc: 'Name for the budget',
          longDesc: 'A descriptive name for the campaign budget.',
        },
        daily_amount: {
          displayName: 'Daily Amount',
          shortDesc: 'Daily budget amount in account currency',
          longDesc: 'The daily budget amount in your account currency (e.g., 50.00 for $50/day).',
        },
        delivery_method: {
          displayName: 'Delivery Method',
          shortDesc: 'How the budget is spent throughout the day',
          longDesc: 'STANDARD spreads the budget evenly. ACCELERATED spends it as fast as possible (deprecated for most campaign types).',
        },
      },
    },
    update_budget: {
      displayName: 'Update Budget',
      shortDesc: 'Update an existing campaign budget',
      longDesc: 'Updates the daily amount or name of an existing campaign budget.',
      options: {
        ...customerIdOption,
        budget_id: {
          displayName: 'Budget',
          shortDesc: 'The budget to update',
          longDesc: 'Select or enter the ID of the budget to update.',
        },
        name: {
          displayName: 'Budget Name',
          shortDesc: 'New name for the budget',
          longDesc: 'The updated name for the budget. Leave empty to keep the current name.',
        },
        daily_amount: {
          displayName: 'Daily Amount',
          shortDesc: 'New daily budget amount',
          longDesc: 'The updated daily budget amount in your account currency.',
        },
      },
    },

    // --- Bidding ---
    list_bidding_strategies: {
      displayName: 'List Bidding Strategies',
      shortDesc: 'List portfolio bidding strategies',
      longDesc: 'Retrieves all portfolio bidding strategies in the Google Ads account.',
      options: {
        ...customerIdOption,
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of strategies to return',
          longDesc: 'The maximum number of bidding strategies to return. Default is 100.',
        },
      },
    },
    create_bidding_strategy: {
      displayName: 'Create Bidding Strategy',
      shortDesc: 'Create a portfolio bidding strategy',
      longDesc: 'Creates a new portfolio bidding strategy that can be shared across multiple campaigns.',
      options: {
        ...customerIdOption,
        name: {
          displayName: 'Strategy Name',
          shortDesc: 'Name for the bidding strategy',
          longDesc: 'A descriptive name for the portfolio bidding strategy.',
        },
        type: {
          displayName: 'Strategy Type',
          shortDesc: 'Type of bidding strategy',
          longDesc: 'The bidding optimization goal (e.g., Target CPA, Target ROAS, Maximize Conversions).',
        },
        target_cpa: {
          displayName: 'Target CPA',
          shortDesc: 'Target cost-per-acquisition amount',
          longDesc: 'The target CPA in your account currency. Required when strategy type is TARGET_CPA.',
        },
        target_roas: {
          displayName: 'Target ROAS',
          shortDesc: 'Target return on ad spend',
          longDesc: 'The target ROAS as a ratio (e.g., 3.0 for 300% ROAS). Required when strategy type is TARGET_ROAS.',
        },
      },
    },
    update_bidding_strategy: {
      displayName: 'Update Bidding Strategy',
      shortDesc: 'Update a portfolio bidding strategy',
      longDesc: 'Updates an existing portfolio bidding strategy.',
      options: {
        ...customerIdOption,
        strategy_id: {
          displayName: 'Bidding Strategy',
          shortDesc: 'The bidding strategy to update',
          longDesc: 'Select or enter the ID of the bidding strategy to update.',
        },
        name: {
          displayName: 'Strategy Name',
          shortDesc: 'New name for the bidding strategy',
          longDesc: 'The updated name. Leave empty to keep the current name.',
        },
        target_cpa: {
          displayName: 'Target CPA',
          shortDesc: 'Updated target CPA amount',
          longDesc: 'The updated target CPA in your account currency.',
        },
        target_roas: {
          displayName: 'Target ROAS',
          shortDesc: 'Updated target ROAS',
          longDesc: 'The updated target ROAS as a ratio.',
        },
      },
    },

    // --- Reporting ---
    run_campaign_report: {
      displayName: 'Run Campaign Report',
      shortDesc: 'Generate a campaign performance report',
      longDesc: 'Runs a performance report across campaigns with configurable metrics, date range, and filters.',
      options: {
        ...customerIdOption,
        date_range: {
          displayName: 'Date Range',
          shortDesc: 'Predefined date range for the report',
          longDesc: 'The date range for the report. Use predefined ranges like LAST_7_DAYS, LAST_30_DAYS, etc.',
        },
        start_date: {
          displayName: 'Start Date',
          shortDesc: 'Custom start date (YYYY-MM-DD)',
          longDesc: 'Custom start date in YYYY-MM-DD format. Used when Date Range is set to CUSTOM.',
        },
        end_date: {
          displayName: 'End Date',
          shortDesc: 'Custom end date (YYYY-MM-DD)',
          longDesc: 'Custom end date in YYYY-MM-DD format. Used when Date Range is set to CUSTOM.',
        },
        status_filter: {
          displayName: 'Status Filter',
          shortDesc: 'Filter by campaign status',
          longDesc: 'Only include campaigns with the specified status.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of rows',
          longDesc: 'The maximum number of rows to return. Default is 100.',
        },
      },
    },
    run_ad_group_report: {
      displayName: 'Run Ad Group Report',
      shortDesc: 'Generate an ad group performance report',
      longDesc: 'Runs a performance report across ad groups with configurable metrics and date range.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'Filter by campaign',
          longDesc: 'Only include ad groups from this campaign.',
        },
        date_range: {
          displayName: 'Date Range',
          shortDesc: 'Predefined date range for the report',
          longDesc: 'The date range for the report.',
        },
        start_date: {
          displayName: 'Start Date',
          shortDesc: 'Custom start date (YYYY-MM-DD)',
          longDesc: 'Custom start date. Used when Date Range is CUSTOM.',
        },
        end_date: {
          displayName: 'End Date',
          shortDesc: 'Custom end date (YYYY-MM-DD)',
          longDesc: 'Custom end date. Used when Date Range is CUSTOM.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of rows',
          longDesc: 'The maximum number of rows to return. Default is 100.',
        },
      },
    },
    run_keyword_report: {
      displayName: 'Run Keyword Report',
      shortDesc: 'Generate a keyword performance report',
      longDesc: 'Runs a performance report across keywords with metrics like clicks, impressions, CPC, and conversions.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'Filter by campaign',
          longDesc: 'Only include keywords from this campaign.',
        },
        ad_group_id: {
          displayName: 'Ad Group',
          shortDesc: 'Filter by ad group',
          longDesc: 'Only include keywords from this ad group.',
        },
        date_range: {
          displayName: 'Date Range',
          shortDesc: 'Predefined date range for the report',
          longDesc: 'The date range for the report.',
        },
        start_date: {
          displayName: 'Start Date',
          shortDesc: 'Custom start date (YYYY-MM-DD)',
          longDesc: 'Custom start date. Used when Date Range is CUSTOM.',
        },
        end_date: {
          displayName: 'End Date',
          shortDesc: 'Custom end date (YYYY-MM-DD)',
          longDesc: 'Custom end date. Used when Date Range is CUSTOM.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of rows',
          longDesc: 'The maximum number of rows to return. Default is 100.',
        },
      },
    },
    run_custom_report: {
      displayName: 'Run Custom Report',
      shortDesc: 'Run a custom GAQL query',
      longDesc:
        'Execute a raw Google Ads Query Language (GAQL) query for advanced reporting. ' +
        'GAQL supports SELECT, FROM, WHERE, ORDER BY, and LIMIT clauses.',
      options: {
        ...customerIdOption,
        query: {
          displayName: 'GAQL Query',
          shortDesc: 'The GAQL query to execute',
          longDesc:
            'A Google Ads Query Language query. Example: SELECT campaign.name, metrics.clicks FROM campaign WHERE campaign.status = \'ENABLED\' AND segments.date DURING LAST_30_DAYS',
        },
      },
    },

    // --- Conversions ---
    list_conversion_actions: {
      displayName: 'List Conversion Actions',
      shortDesc: 'List all conversion action definitions',
      longDesc: 'Retrieves all conversion actions configured in the Google Ads account.',
      options: {
        ...customerIdOption,
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of conversion actions to return',
          longDesc: 'The maximum number of conversion actions to return. Default is 100.',
        },
      },
    },
    upload_click_conversion: {
      displayName: 'Upload Click Conversion',
      shortDesc: 'Upload an offline click conversion',
      longDesc:
        'Uploads an offline conversion associated with a Google Click ID (GCLID). ' +
        'This closes the loop between ad clicks and offline sales/actions.',
      options: {
        ...customerIdOption,
        gclid: {
          displayName: 'GCLID',
          shortDesc: 'Google Click ID',
          longDesc: 'The Google Click ID (GCLID) associated with the conversion. Found in the URL after a user clicks an ad.',
        },
        conversion_action_id: {
          displayName: 'Conversion Action',
          shortDesc: 'The conversion action to record',
          longDesc: 'Select the conversion action that this conversion should be attributed to.',
        },
        conversion_date_time: {
          displayName: 'Conversion Date/Time',
          shortDesc: 'When the conversion occurred',
          longDesc: 'The date and time of the conversion in format: yyyy-mm-dd HH:mm:ss+|-HH:mm (e.g., 2026-03-01 12:00:00+00:00).',
        },
        conversion_value: {
          displayName: 'Conversion Value',
          shortDesc: 'Monetary value of the conversion',
          longDesc: 'The monetary value of the conversion in your account currency.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'ISO 4217 currency code',
          longDesc: 'The currency code for the conversion value (e.g., USD, EUR, GBP).',
        },
        order_id: {
          displayName: 'Order ID',
          shortDesc: 'Unique order/transaction ID',
          longDesc: 'A unique identifier for the order or transaction. Used for deduplication.',
        },
      },
    },
    upload_call_conversion: {
      displayName: 'Upload Call Conversion',
      shortDesc: 'Upload an offline call conversion',
      longDesc: 'Uploads a conversion associated with a phone call from a Google Ads call extension.',
      options: {
        ...customerIdOption,
        caller_id: {
          displayName: 'Caller ID',
          shortDesc: 'Phone number of the caller',
          longDesc: 'The phone number of the caller in E.164 format (e.g., +18005550100).',
        },
        conversion_action_id: {
          displayName: 'Conversion Action',
          shortDesc: 'The conversion action to record',
          longDesc: 'Select the conversion action that this conversion should be attributed to.',
        },
        conversion_date_time: {
          displayName: 'Conversion Date/Time',
          shortDesc: 'When the conversion occurred',
          longDesc: 'The date and time of the conversion in format: yyyy-mm-dd HH:mm:ss+|-HH:mm.',
        },
        call_start_date_time: {
          displayName: 'Call Start Date/Time',
          shortDesc: 'When the call started',
          longDesc: 'The date and time when the call started in format: yyyy-mm-dd HH:mm:ss+|-HH:mm.',
        },
        conversion_value: {
          displayName: 'Conversion Value',
          shortDesc: 'Monetary value of the conversion',
          longDesc: 'The monetary value of the conversion.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'ISO 4217 currency code',
          longDesc: 'The currency code for the conversion value.',
        },
      },
    },
    upload_enhanced_conversion: {
      displayName: 'Upload Enhanced Conversion',
      shortDesc: 'Upload an enhanced conversion with user data',
      longDesc:
        'Uploads a conversion using hashed first-party user data (email, phone) instead of a GCLID. ' +
        'User data is automatically SHA-256 hashed before upload for privacy.',
      options: {
        ...customerIdOption,
        conversion_action_id: {
          displayName: 'Conversion Action',
          shortDesc: 'The conversion action to record',
          longDesc: 'Select the conversion action that this conversion should be attributed to.',
        },
        conversion_date_time: {
          displayName: 'Conversion Date/Time',
          shortDesc: 'When the conversion occurred',
          longDesc: 'The date and time of the conversion in format: yyyy-mm-dd HH:mm:ss+|-HH:mm.',
        },
        conversion_value: {
          displayName: 'Conversion Value',
          shortDesc: 'Monetary value of the conversion',
          longDesc: 'The monetary value of the conversion.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'ISO 4217 currency code',
          longDesc: 'The currency code for the conversion value.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Customer email address',
          longDesc: 'The customer email address. Will be normalized and SHA-256 hashed before upload.',
        },
        phone_number: {
          displayName: 'Phone Number',
          shortDesc: 'Customer phone number in E.164 format',
          longDesc: 'The customer phone number in E.164 format (e.g., +18005550100). Will be SHA-256 hashed before upload.',
        },
        order_id: {
          displayName: 'Order ID',
          shortDesc: 'Unique order/transaction ID',
          longDesc: 'A unique identifier for deduplication.',
        },
      },
    },
    upload_conversion_adjustment: {
      displayName: 'Upload Conversion Adjustment',
      shortDesc: 'Adjust or retract a previously uploaded conversion',
      longDesc: 'Adjusts the value of a previously uploaded conversion or retracts it entirely.',
      options: {
        ...customerIdOption,
        conversion_action_id: {
          displayName: 'Conversion Action',
          shortDesc: 'The conversion action to adjust',
          longDesc: 'Select the conversion action of the conversion to adjust.',
        },
        adjustment_type: {
          displayName: 'Adjustment Type',
          shortDesc: 'Type of adjustment',
          longDesc: 'RESTATE to change the conversion value, RETRACTION to remove the conversion entirely.',
        },
        order_id: {
          displayName: 'Order ID',
          shortDesc: 'Order ID of the conversion to adjust',
          longDesc: 'The order ID that was provided when the conversion was originally uploaded.',
        },
        gclid: {
          displayName: 'GCLID',
          shortDesc: 'GCLID of the conversion to adjust',
          longDesc: 'The GCLID associated with the original conversion. Required if Order ID was not set.',
        },
        adjustment_date_time: {
          displayName: 'Adjustment Date/Time',
          shortDesc: 'When the adjustment occurred',
          longDesc: 'The date and time of the adjustment in format: yyyy-mm-dd HH:mm:ss+|-HH:mm.',
        },
        adjusted_value: {
          displayName: 'Adjusted Value',
          shortDesc: 'New conversion value',
          longDesc: 'The new conversion value. Required for RESTATE adjustments.',
        },
        currency_code: {
          displayName: 'Currency Code',
          shortDesc: 'ISO 4217 currency code',
          longDesc: 'The currency code for the adjusted value.',
        },
      },
    },

    // --- Customer Match ---
    list_customer_lists: {
      displayName: 'List Customer Lists',
      shortDesc: 'List audience/customer match lists',
      longDesc: 'Retrieves all user lists (customer match lists) in the Google Ads account.',
      options: {
        ...customerIdOption,
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of lists to return',
          longDesc: 'The maximum number of customer lists to return. Default is 100.',
        },
      },
    },
    create_customer_list: {
      displayName: 'Create Customer List',
      shortDesc: 'Create a new customer match audience list',
      longDesc: 'Creates a new CRM-based user list for customer match targeting.',
      options: {
        ...customerIdOption,
        name: {
          displayName: 'List Name',
          shortDesc: 'Name for the customer list',
          longDesc: 'A descriptive name for the customer match list.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Description of the customer list',
          longDesc: 'A description of the customer list and its intended use.',
        },
        membership_life_span: {
          displayName: 'Membership Life Span',
          shortDesc: 'Days until a member is automatically removed',
          longDesc: 'The number of days a user remains on the list. Set to 10000 for no expiration.',
        },
      },
    },
    add_contacts_to_customer_list: {
      displayName: 'Add Contacts to Customer List',
      shortDesc: 'Upload contacts to a customer match list',
      longDesc:
        'Adds contacts to a customer match list using hashed user data. ' +
        'Email addresses and phone numbers are automatically normalized and SHA-256 hashed before upload.',
      options: {
        ...customerIdOption,
        user_list_id: {
          displayName: 'Customer List',
          shortDesc: 'The customer list to add contacts to',
          longDesc: 'Select the customer match list where contacts will be added.',
        },
        contacts: {
          displayName: 'Contacts',
          shortDesc: 'List of contacts to add',
          longDesc: 'A list of contacts with email, phone, or address data to add to the customer list.',
          type: {
            element_type: {
              fields: {
                email: {
                  displayName: 'Email',
                  shortDesc: 'Contact email address',
                  longDesc: 'The contact email address. Will be normalized and SHA-256 hashed before upload.',
                },
                phone_number: {
                  displayName: 'Phone Number',
                  shortDesc: 'Contact phone number in E.164 format',
                  longDesc: 'The contact phone number in E.164 format (e.g., +18005550100). Will be SHA-256 hashed.',
                },
              },
            },
          },
        },
      },
    },
    remove_contacts_from_customer_list: {
      displayName: 'Remove Contacts from Customer List',
      shortDesc: 'Remove contacts from a customer match list',
      longDesc: 'Removes contacts from a customer match list using their identifying information.',
      options: {
        ...customerIdOption,
        user_list_id: {
          displayName: 'Customer List',
          shortDesc: 'The customer list to remove contacts from',
          longDesc: 'Select the customer match list to remove contacts from.',
        },
        contacts: {
          displayName: 'Contacts',
          shortDesc: 'List of contacts to remove',
          longDesc: 'A list of contacts with email, phone, or address data to remove from the customer list.',
          type: {
            element_type: {
              fields: {
                email: {
                  displayName: 'Email',
                  shortDesc: 'Contact email address',
                  longDesc: 'The contact email address to match for removal.',
                },
                phone_number: {
                  displayName: 'Phone Number',
                  shortDesc: 'Contact phone number in E.164 format',
                  longDesc: 'The contact phone number to match for removal.',
                },
              },
            },
          },
        },
      },
    },
  },
  triggers: {
    new_lead_form_submission: {
      displayName: 'New Lead Form Submission',
      shortDesc: 'Triggers when a new lead is submitted through a Google Ads lead form extension',
      longDesc:
        'Monitors Google Ads lead form extensions for new submissions. ' +
        'Polls the lead form submission data and triggers for each new lead.',
      options: {
        ...customerIdOption,
        campaign_id: {
          displayName: 'Campaign',
          shortDesc: 'Filter by campaign',
          longDesc: 'Only trigger for lead form submissions from this campaign. Leave empty to monitor all campaigns.',
        },
      },
      event_info: {
        desc: 'Contains information about the lead form submission including contact details, campaign info, and GCLID.',
      },
    },
  },
} satisfies BaseTranslation;

export default GoogleAdsAppEn;
