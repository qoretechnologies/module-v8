import { AnalyticsAdminServiceClient } from '@google-analytics/admin';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleAnalyticsDataClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return new BetaAnalyticsDataClient({
    authClient: auth,
  });
};

export const createGoogleAnalyticsAdminClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return new AnalyticsAdminServiceClient({
    authClient: auth,
  });
};
