import { docs } from '@googleapis/docs';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleDocsClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return docs({ version: 'v1', auth });
};
