import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

// Common GA4 metrics grouped by category
export const GA4_COMMON_METRICS: IQoreAllowedValue<string>[] = [
  // User metrics
  { value: 'activeUsers', display_name: 'Active Users', desc: 'The number of distinct users who visited your site/app' },
  { value: 'newUsers', display_name: 'New Users', desc: 'The number of users who interacted for the first time' },
  { value: 'totalUsers', display_name: 'Total Users', desc: 'The total number of unique users' },
  { value: 'dauPerMau', display_name: 'DAU / MAU', desc: 'Daily active users divided by monthly active users' },
  { value: 'dauPerWau', display_name: 'DAU / WAU', desc: 'Daily active users divided by weekly active users' },
  { value: 'wauPerMau', display_name: 'WAU / MAU', desc: 'Weekly active users divided by monthly active users' },

  // Session metrics
  { value: 'sessions', display_name: 'Sessions', desc: 'The total number of sessions' },
  { value: 'sessionsPerUser', display_name: 'Sessions per User', desc: 'The average number of sessions per user' },
  { value: 'averageSessionDuration', display_name: 'Avg. Session Duration', desc: 'Average session duration in seconds' },
  { value: 'engagedSessions', display_name: 'Engaged Sessions', desc: 'Sessions that lasted 10+ seconds, had 1+ conversion, or 2+ page views' },
  { value: 'engagementRate', display_name: 'Engagement Rate', desc: 'Percentage of engaged sessions' },
  { value: 'bounceRate', display_name: 'Bounce Rate', desc: 'Percentage of sessions that were not engaged' },
  { value: 'userEngagementDuration', display_name: 'User Engagement Duration', desc: 'Total user engagement duration in seconds' },

  // Page/Screen metrics
  { value: 'screenPageViews', display_name: 'Views', desc: 'The total number of app screens or web pages viewed' },
  { value: 'screenPageViewsPerSession', display_name: 'Views per Session', desc: 'Average page/screen views per session' },
  { value: 'screenPageViewsPerUser', display_name: 'Views per User', desc: 'Average page/screen views per user' },
  { value: 'scrolledUsers', display_name: 'Scrolled Users', desc: 'Users who scrolled to 90% of page depth' },

  // Event metrics
  { value: 'eventCount', display_name: 'Event Count', desc: 'The total number of events' },
  { value: 'eventCountPerUser', display_name: 'Events per User', desc: 'Average events per user' },
  { value: 'eventsPerSession', display_name: 'Events per Session', desc: 'Average events per session' },
  { value: 'eventValue', display_name: 'Event Value', desc: 'Sum of the event parameter value' },

  // Conversion metrics
  { value: 'conversions', display_name: 'Conversions', desc: 'The total number of conversion events' },
  { value: 'keyEvents', display_name: 'Key Events', desc: 'Count of key events (formerly conversions)' },

  // Revenue/E-commerce metrics
  { value: 'totalRevenue', display_name: 'Total Revenue', desc: 'Sum of revenue from purchases, subscriptions, and ads' },
  { value: 'purchaseRevenue', display_name: 'Purchase Revenue', desc: 'Sum of revenue from purchases' },
  { value: 'ecommercePurchases', display_name: 'E-commerce Purchases', desc: 'Number of completed purchases' },
  { value: 'transactions', display_name: 'Transactions', desc: 'Count of e-commerce transactions' },
  { value: 'purchaserConversionRate', display_name: 'Purchaser Conversion Rate', desc: 'Percentage of users who made a purchase' },
  { value: 'totalPurchasers', display_name: 'Total Purchasers', desc: 'Number of users who completed a purchase' },
  { value: 'firstTimePurchasers', display_name: 'First-time Purchasers', desc: 'Users who completed their first purchase' },
  { value: 'averagePurchaseRevenue', display_name: 'Avg. Purchase Revenue', desc: 'Average revenue per purchase' },
  { value: 'averagePurchaseRevenuePerUser', display_name: 'Avg. Revenue per User', desc: 'Average revenue per purchasing user' },
  { value: 'totalAdRevenue', display_name: 'Ad Revenue', desc: 'Total revenue from ads' },

  // Item metrics
  { value: 'itemsViewed', display_name: 'Items Viewed', desc: 'Number of items viewed' },
  { value: 'itemsAddedToCart', display_name: 'Items Added to Cart', desc: 'Number of items added to cart' },
  { value: 'itemsCheckedOut', display_name: 'Items Checked Out', desc: 'Number of items in checkout' },
  { value: 'itemsPurchased', display_name: 'Items Purchased', desc: 'Number of items purchased' },
  { value: 'itemRevenue', display_name: 'Item Revenue', desc: 'Total revenue from items' },
  { value: 'cartToViewRate', display_name: 'Cart-to-View Rate', desc: 'Add to cart divided by item views' },
  { value: 'purchaseToViewRate', display_name: 'Purchase-to-View Rate', desc: 'Purchases divided by item views' },

  // Ads metrics
  { value: 'advertiserAdClicks', display_name: 'Ad Clicks', desc: 'Total number of times users clicked on an ad' },
  { value: 'advertiserAdCost', display_name: 'Ad Cost', desc: 'Total cost of ads' },
  { value: 'advertiserAdCostPerClick', display_name: 'Cost per Click', desc: 'Average cost per ad click' },
  { value: 'advertiserAdImpressions', display_name: 'Ad Impressions', desc: 'Total number of ad impressions' },
  { value: 'returnOnAdSpend', display_name: 'ROAS', desc: 'Return on ad spend' },

  // Publisher metrics (for apps with ads)
  { value: 'publisherAdClicks', display_name: 'Publisher Ad Clicks', desc: 'Number of ad clicks on your property' },
  { value: 'publisherAdImpressions', display_name: 'Publisher Ad Impressions', desc: 'Number of ad impressions on your property' },
];

// Real-time specific metrics
export const GA4_REALTIME_METRICS: IQoreAllowedValue<string>[] = [
  { value: 'activeUsers', display_name: 'Active Users', desc: 'Users currently on your site/app' },
  { value: 'screenPageViews', display_name: 'Views', desc: 'Page/screen views in the specified time range' },
  { value: 'eventCount', display_name: 'Event Count', desc: 'Events in the specified time range' },
  { value: 'conversions', display_name: 'Conversions', desc: 'Conversions in the specified time range' },
  { value: 'keyEvents', display_name: 'Key Events', desc: 'Key events in the specified time range' },
];

// Real-time specific dimensions
export const GA4_REALTIME_DIMENSIONS: IQoreAllowedValue<string>[] = [
  { value: 'country', display_name: 'Country', desc: 'The country of the active user' },
  { value: 'city', display_name: 'City', desc: 'The city of the active user' },
  { value: 'deviceCategory', display_name: 'Device Category', desc: 'The device type (desktop, mobile, tablet)' },
  { value: 'platform', display_name: 'Platform', desc: 'The platform (web, iOS, Android)' },
  { value: 'unifiedScreenName', display_name: 'Page/Screen', desc: 'The current page or screen name' },
  { value: 'eventName', display_name: 'Event Name', desc: 'The name of the event' },
  { value: 'audienceName', display_name: 'Audience', desc: 'The audience the user belongs to' },
  { value: 'minutesAgo', display_name: 'Minutes Ago', desc: 'How many minutes ago the event occurred' },
];

export const getMetricsAllowedValues = () => GA4_COMMON_METRICS;
export const getRealtimeMetricsAllowedValues = () => GA4_REALTIME_METRICS;
export const getRealtimeDimensionsAllowedValues = () => GA4_REALTIME_DIMENSIONS;
