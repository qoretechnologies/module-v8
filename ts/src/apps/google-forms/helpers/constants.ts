import { forms } from '@googleapis/forms';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleFormsClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return forms({ version: 'v1', auth });
};
