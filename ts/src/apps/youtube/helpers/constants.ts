import { youtube } from '@googleapis/youtube';
import { OAuth2Client } from 'google-auth-library';

export const createYouTubeClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return youtube({
    version: 'v3',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
