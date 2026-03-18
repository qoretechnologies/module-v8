import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class ContentfulError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentfulError';
  }
}

export const CONTENTFUL_APP_NAME = 'Contentful';

export const CONTENTFUL_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTIgMjg5Ij48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIuNSIgeDI9Ii41IiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZTViNGExIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZTY4YTFhIi8+PC9saW5lYXJHcmFkaWVudD48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIuNSIgeDI9Ii41IiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZWZkOGNlIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZTZhNTZlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZmlsbD0idXJsKCNhKSIgZD0iTTAgMjg5TDEyNS41IDE3MCAxNjIgMjA0LjUgMzYuNSAyODl6Ii8+PHBhdGggZmlsbD0iI2U4NjgyNSIgZD0iTTAgMEwxMjUuNSAxMTkgMTYyIDg0LjUgMzYuNSAwegoiLz48cGF0aCBmaWxsPSIjZTY4YTFhIiBkPSJNMzYuNSAwTDE2MiA4NC41IDE2MiAyMDQuNSAzNi41IDI4OXpNMjE1LjUgMEwyNTIgMjQuNSAyNTIgMjY0LjUgMjE1LjUgMjg5eiIvPjxwYXRoIGZpbGw9InVybCgjYikiIGQ9Ik0yMTUuNSAwTDg5LjUgMTE5IDg5LjUgMTcwIDIxNS41IDI4OXoiLz48L3N2Zz4=';

export const CONTENTFUL_API_URL = 'https://api.contentful.com';

export const CONTENTFUL_CONN_OPTIONS = {
  access_token: {
    type: 'string',
    display_name: 'Content Management API Token',
    short_desc: 'Your Contentful Content Management API access token.',
    desc: 'A personal access token for the Contentful Content Management API. Can be created in Settings > CMA tokens in your Contentful dashboard.',
  },
} satisfies TCustomConnOptions;

export const extractContentfulErrorMessage = (error: unknown): string => {
  if (error instanceof ContentfulError) {
    return error.message;
  }

  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.message) {
        return parsed.message;
      }
    } catch {
      // not JSON
    }
    return error.message;
  }

  return String(error);
};
