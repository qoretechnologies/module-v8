import { IQoreAllowedValue } from '@qoretechnologies/ts-toolkit';

// Common GA4 dimensions grouped by category
export const GA4_COMMON_DIMENSIONS: IQoreAllowedValue<string>[] = [
  // Time dimensions
  { value: 'date', display_name: 'Date', desc: 'The date of the event (YYYYMMDD format)' },
  { value: 'dateHour', display_name: 'Date + Hour', desc: 'The combined date and hour (YYYYMMDDHH format)' },
  { value: 'dateHourMinute', display_name: 'Date + Hour + Minute', desc: 'The combined date, hour, and minute' },
  { value: 'day', display_name: 'Day', desc: 'The day of the month (01-31)' },
  { value: 'dayOfWeek', display_name: 'Day of Week', desc: 'The day of the week (0-6, Sunday=0)' },
  { value: 'dayOfWeekName', display_name: 'Day of Week Name', desc: 'The name of the day of the week' },
  { value: 'hour', display_name: 'Hour', desc: 'The hour of the day (00-23)' },
  { value: 'month', display_name: 'Month', desc: 'The month of the year (01-12)' },
  { value: 'week', display_name: 'Week', desc: 'The week of the year (01-53)' },
  { value: 'year', display_name: 'Year', desc: 'The 4-digit year' },

  // User dimensions
  { value: 'userAgeBracket', display_name: 'Age', desc: 'User age brackets (e.g., 18-24, 25-34)' },
  { value: 'userGender', display_name: 'Gender', desc: 'User gender' },
  { value: 'newVsReturning', display_name: 'New vs Returning', desc: 'Whether the user is new or returning' },

  // Geography dimensions
  { value: 'country', display_name: 'Country', desc: 'The country from which user activity originated' },
  { value: 'countryId', display_name: 'Country ID', desc: 'The geographic ID of the country' },
  { value: 'city', display_name: 'City', desc: 'The city from which user activity originated' },
  { value: 'cityId', display_name: 'City ID', desc: 'The geographic ID of the city' },
  { value: 'continent', display_name: 'Continent', desc: 'The continent from which user activity originated' },
  { value: 'continentId', display_name: 'Continent ID', desc: 'The geographic ID of the continent' },
  { value: 'region', display_name: 'Region', desc: 'The geographic region' },

  // Technology dimensions
  { value: 'browser', display_name: 'Browser', desc: 'The browser used' },
  { value: 'deviceCategory', display_name: 'Device Category', desc: 'The device type (desktop, mobile, tablet)' },
  { value: 'deviceModel', display_name: 'Device Model', desc: 'The mobile device model' },
  { value: 'language', display_name: 'Language', desc: 'The language setting of the browser/device' },
  { value: 'operatingSystem', display_name: 'Operating System', desc: 'The operating system used' },
  { value: 'operatingSystemVersion', display_name: 'OS Version', desc: 'The operating system version' },
  { value: 'platform', display_name: 'Platform', desc: 'The platform (web, iOS, Android)' },
  { value: 'screenResolution', display_name: 'Screen Resolution', desc: 'The screen resolution of the device' },

  // Acquisition dimensions
  { value: 'sessionSource', display_name: 'Session Source', desc: 'The source of the session' },
  { value: 'sessionMedium', display_name: 'Session Medium', desc: 'The medium of the session' },
  { value: 'sessionCampaignName', display_name: 'Session Campaign', desc: 'The campaign name for the session' },
  { value: 'sessionDefaultChannelGroup', display_name: 'Session Channel Group', desc: 'The default channel grouping' },
  { value: 'sessionSourceMedium', display_name: 'Session Source/Medium', desc: 'Combined source and medium' },
  { value: 'firstUserSource', display_name: 'First User Source', desc: 'The source that first acquired the user' },
  { value: 'firstUserMedium', display_name: 'First User Medium', desc: 'The medium that first acquired the user' },
  { value: 'firstUserCampaignName', display_name: 'First User Campaign', desc: 'The campaign that first acquired the user' },
  { value: 'firstUserDefaultChannelGroup', display_name: 'First User Channel Group', desc: 'First user default channel group' },
  { value: 'googleAdsAdGroupName', display_name: 'Google Ads Ad Group', desc: 'The Google Ads ad group name' },
  { value: 'googleAdsCampaignName', display_name: 'Google Ads Campaign', desc: 'The Google Ads campaign name' },

  // Content dimensions
  { value: 'pagePath', display_name: 'Page Path', desc: 'The URL path of the page' },
  { value: 'pagePathPlusQueryString', display_name: 'Page Path + Query String', desc: 'Full page path with query string' },
  { value: 'pageTitle', display_name: 'Page Title', desc: 'The title of the page' },
  { value: 'landingPage', display_name: 'Landing Page', desc: 'The first page viewed in a session' },
  { value: 'landingPagePlusQueryString', display_name: 'Landing Page + Query String', desc: 'Landing page with query string' },
  { value: 'hostname', display_name: 'Hostname', desc: 'The hostname of the URL' },
  { value: 'pageReferrer', display_name: 'Page Referrer', desc: 'The referring URL' },

  // Event dimensions
  { value: 'eventName', display_name: 'Event Name', desc: 'The name of the event' },
  { value: 'isConversionEvent', display_name: 'Is Conversion Event', desc: 'Whether the event is a conversion' },

  // E-commerce dimensions
  { value: 'itemBrand', display_name: 'Item Brand', desc: 'The brand of the item' },
  { value: 'itemCategory', display_name: 'Item Category', desc: 'The category of the item' },
  { value: 'itemId', display_name: 'Item ID', desc: 'The ID of the item' },
  { value: 'itemName', display_name: 'Item Name', desc: 'The name of the item' },
  { value: 'transactionId', display_name: 'Transaction ID', desc: 'The ID of the e-commerce transaction' },
];

export const getDimensionsAllowedValues = () => GA4_COMMON_DIMENSIONS;
