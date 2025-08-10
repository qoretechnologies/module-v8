import Anthropic from '@anthropic-ai/sdk';

export const createClaudeClient = (apiKey: string) => {
  const client = new Anthropic({
    apiKey,
  });

  return client;
};
