import { drive } from '@googleapis/drive';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleDriveClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return drive({ version: 'v3', auth });
};
