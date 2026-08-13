// Copyright 2026 Qore Technologies, s.r.o.
import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class GoogleAdsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GoogleAdsError';
  }
}

export const GOOGLE_ADS_APP_NAME = 'GoogleAds';

/**
 * The Google Ads API version this application's own REST calls address.
 *
 * It must match the version `google-ads-api` speaks, because the application uses both: the SDK for
 * most work and raw REST for `listAccessibleCustomers` and the offline user-data jobs. The SDK's
 * major tracks the API version, so the installed major *is* the pin, and a test asserts the two
 * agree rather than trusting this string on its own.
 *
 * Google releases roughly quarterly and sunsets a version about a year after release: v23 shipped
 * 2026-01-28 and sunsets around February 2027. Moving is therefore real work with a real date, but
 * it is gated on the SDK, not on this constant — see the module's audit notes.
 */
export const GOOGLE_ADS_API_VERSION = 'v23';

export const GOOGLE_ADS_APP_LOGO =
  'PHN2ZyB2aWV3Qm94PSIwIDAgMTkyIDE5MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuMiAxMTEuM0w2NS44IDE5LjZjNS42LTkuNiAxOC4xLTEyLjggMjcuNi03LjIgOS42IDUuNiAxMi44IDE4LjEgNy4yIDI3LjZMNDcuMSAxMzEuNmMtNS42IDkuNi0xOC4xIDEyLjgtMjcuNiA3LjItOS42LTUuNS0xMi45LTE3LjktNy4zLTI3LjV6IiBmaWxsPSIjRkJCQzA0Ii8+PHBhdGggZD0iTTEyNi4yIDExMS4zbDUzLjYtOTEuN2M1LjYtOS42IDIuNC0yMi03LjItMjcuNi05LjYtNS42LTIyLTIuNC0yNy42IDcuMmwtNTMuNiA5MS43Yy01LjYgOS42LTIuNCAyMiA3LjIgMjcuNiA5LjYgNS41IDIyIDIuNCAyNy42LTcuMnoiIGZpbGw9IiM0Mjg1RjQiLz48Y2lyY2xlIGN4PSIzNCIgY3k9IjE0NCIgcj0iMjgiIGZpbGw9IiMzNEE4NTMiLz48L3N2Zz4K';

export const GOOGLE_ADS_CONN_OPTIONS = {
  developer_token: {
    display_name: 'Developer Token',
    short_desc: 'Your Google Ads API developer token',
    desc: 'A 22-character alphanumeric developer token obtained from your Google Ads Manager Account API Center.',
    type: 'string',
    sensitive: true,
  },
  login_customer_id: {
    display_name: 'Manager Account ID',
    short_desc: 'Manager (MCC) account ID for accessing client accounts',
    desc: 'The Google Ads Manager Account ID (10 digits, without hyphens). Required only when using a manager account to access client accounts.',
    type: 'string',
  },
} satisfies TCustomConnOptions;
