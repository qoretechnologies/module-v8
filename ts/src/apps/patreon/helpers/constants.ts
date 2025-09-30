import { PatreonCreatorClient } from 'patreon-api.ts';

const TOKEN_EXPIRES_IN = 2678400;

export const createPatreonClient = (token: string) => {
  const client = new PatreonCreatorClient({
    oauth: {
      tokenType: 'oauth',
      validateToken: false,
      token: {
        access_token: token,
        token_type: 'Bearer',
        expires_in: TOKEN_EXPIRES_IN.toString(),
        expires_in_epoch: (Date.now() + TOKEN_EXPIRES_IN).toString(),
      },
    } as any,
  });

  return client;
};
