import { people } from '@googleapis/people';
import { OAuth2Client } from 'google-auth-library';

export const createGooglePeopleClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return people({ version: 'v1', auth });
};
