import { GoogleGenAI } from '@google/genai';

export const createGeminiClient = (apiKey: string) => {
  const client = new GoogleGenAI({
    apiKey,
  });

  return client;
};
