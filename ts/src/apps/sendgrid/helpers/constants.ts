import client from '@sendgrid/client';

export const createSendGridClient = (token: string) => {
  client.setApiKey(token);
  return client;
};
