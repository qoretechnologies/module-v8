import { WebflowClient } from 'webflow-api';

export const createWebflowClient = (token: string) => {
  return new WebflowClient({
    accessToken: token,
  });
};
