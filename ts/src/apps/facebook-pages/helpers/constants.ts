import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';

export const createFacebookClient = (token: string) => {
  return FacebookAdsApi.init(token);
};
