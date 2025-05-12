import { drive } from '@googleapis/drive';
import { sheets } from '@googleapis/sheets';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleSheetsClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return sheets({ version: 'v4', auth });
};

export const createDriveClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return drive({ version: 'v3', auth });
};
