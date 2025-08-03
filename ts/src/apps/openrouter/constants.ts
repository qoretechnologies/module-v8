import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

export const OPEN_ROUTER_APP_NAME = 'OpenRouter';
export const OPEN_ROUTER_APP_LOGO =
  'PHN2ZyBmaWxsPSJjdXJyZW50Q29sb3IiIGZpbGwtcnVsZT0iZXZlbm9kZCIgaGVpZ2h0PSIxZW0iIHN0eWxlPSJmbGV4Om5vbmU7bGluZS1oZWlnaHQ6MSIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMWVtIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5PcGVuUm91dGVyPC90aXRsZT48cGF0aCBkPSJNMTYuODA0IDEuOTU3bDcuMjIgNC4xMDV2LjA4N0wxNi43MyAxMC4yMWwuMDE3LTIuMTE3LS44MjEtLjAzYy0xLjA1OS0uMDI4LTEuNjExLjAwMi0yLjI2OC4xMS0xLjA2NC4xNzUtMi4wMzguNTc3LTMuMTQ3IDEuMzUyTDguMzQ1IDExLjAzYy0uMjg0LjE5NS0uNDk1LjMzNi0uNjguNDU1bC0uNTE1LjMyMi0uMzk3LjIzNC4zODUuMjMuNTMuMzM4Yy40NzYuMzE0IDEuMTcuNzk2IDIuNzAxIDEuODY2IDEuMTEuNzc1IDIuMDgzIDEuMTc3IDMuMTQ3IDEuMzUybC4zLjA0NWMuNjk0LjA5MSAxLjM3NS4wOTQgMi44MjUuMDMzbC4wMjItMi4xNTkgNy4yMiA0LjEwNXYuMDg3TDE2LjU4OSAyMmwuMDE0LTEuODYyLS42MzUuMDIyYy0xLjM4Ni4wNDItMi4xMzcuMDAyLTMuMTM4LS4xNjItMS42OTQtLjI4LTMuMjYtLjkyNi00Ljg4MS0yLjA1OWwtMi4xNTgtMS41YTIxLjk5NyAyMS45OTcgMCAwMC0uNzU1LS40OThsLS40NjctLjI4YTU1LjkyNyA1NS45MjcgMCAwMC0uNzYtLjQzQzIuOTA4IDE0LjczLjU2MyAxNC4xMTYgMCAxNC4xMTZWOS44ODhsLjE0LjAwNGMuNTY0LS4wMDcgMi45MS0uNjIyIDMuODA5LTEuMTI0bDEuMDE2LS41OC40MzgtLjI3NGMuNDI4LS4yOCAxLjA3Mi0uNzI2IDIuNjg2LTEuODUzIDEuNjIxLTEuMTMzIDMuMTg2LTEuNzggNC44ODEtMi4wNTkgMS4xNTItLjE5IDEuOTc0LS4yMTMgMy44MTQtLjEzOGwuMDItMS45MDd6Ij48L3BhdGg+PC9zdmc+';

export const OPEN_ROUTER_CONN_OPTIONS = {
  token: {
    display_name: 'API Key',
    short_desc: 'Your Openrouter account API key',
    desc:
      `To get your API key:\n` +
      `- Go to your https://openrouter.ai/settings/keys\n` +
      `- Copy the api key value`,
    type: 'string',
  },
} satisfies TCustomConnOptions;
