import { tasks } from '@googleapis/tasks';
import { OAuth2Client } from 'google-auth-library';

export const createGoogleTasksClient = (token: string) => {
  const auth = new OAuth2Client();
  auth.setCredentials({ access_token: token });

  return tasks({
    version: 'v1',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
