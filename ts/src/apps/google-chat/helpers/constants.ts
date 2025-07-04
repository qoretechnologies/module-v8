import { chat } from '@googleapis/chat';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleChatClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return chat({ version: 'v1', auth: token });
};
