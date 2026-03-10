// Copyright 2026 Qore Technologies, s.r.o.
// Accounts
export { default as GetCustomerInfo } from './get-customer-info.action';

// Campaigns
export { default as ListCampaigns } from './list-campaigns.action';
export { default as GetCampaign } from './get-campaign.action';
export { default as CreateCampaign } from './create-campaign.action';
export { default as UpdateCampaign } from './update-campaign.action';
export { default as RemoveCampaign } from './remove-campaign.action';

// Ad Groups
export { default as ListAdGroups } from './list-ad-groups.action';
export { default as CreateAdGroup } from './create-ad-group.action';
export { default as UpdateAdGroup } from './update-ad-group.action';
export { default as RemoveAdGroup } from './remove-ad-group.action';

// Ads
export { default as ListAds } from './list-ads.action';
export { default as CreateResponsiveSearchAd } from './create-responsive-search-ad.action';
export { default as UpdateAdStatus } from './update-ad-status.action';
export { default as RemoveAd } from './remove-ad.action';

// Keywords
export { default as ListKeywords } from './list-keywords.action';
export { default as AddKeywords } from './add-keywords.action';
export { default as UpdateKeyword } from './update-keyword.action';
export { default as RemoveKeyword } from './remove-keyword.action';
export { default as AddNegativeKeywords } from './add-negative-keywords.action';

// Budgets
export { default as ListBudgets } from './list-budgets.action';
export { default as CreateBudget } from './create-budget.action';
export { default as UpdateBudget } from './update-budget.action';

// Bidding
export { default as ListBiddingStrategies } from './list-bidding-strategies.action';
export { default as CreateBiddingStrategy } from './create-bidding-strategy.action';
export { default as UpdateBiddingStrategy } from './update-bidding-strategy.action';

// Reporting
export { default as RunCampaignReport } from './run-campaign-report.action';
export { default as RunAdGroupReport } from './run-ad-group-report.action';
export { default as RunKeywordReport } from './run-keyword-report.action';
export { default as RunCustomReport } from './run-custom-report.action';

// Conversions
export { default as UploadClickConversion } from './upload-click-conversion.action';
export { default as UploadCallConversion } from './upload-call-conversion.action';
export { default as UploadEnhancedConversion } from './upload-enhanced-conversion.action';
export { default as UploadConversionAdjustment } from './upload-conversion-adjustment.action';
export { default as ListConversionActions } from './list-conversion-actions.action';

// Customer Match
export { default as ListCustomerLists } from './list-customer-lists.action';
export { default as CreateCustomerList } from './create-customer-list.action';
export { default as AddContactsToCustomerList } from './add-contacts-to-customer-list.action';
export { default as RemoveContactsFromCustomerList } from './remove-contacts-from-customer-list.action';
