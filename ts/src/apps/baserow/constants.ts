import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class BaserowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BaserowError';
  }
}

export const BASEROW_APP_NAME = 'Baserow';
export const BASEROW_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIGlkPSJXYXJzdHdhXzEiIHg9IjAiIHk9IjAiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjxzdHlsZT4uc3Qwe2ZpbGw6IzRkNjhjNH0uc3Qye2ZpbGw6IzJiYzNmMX08L3N0eWxlPjxwYXRoIGQ9Ik0yOTEuOCA1MTJIMjcuNUMxMi4zIDUxMiAwIDQ5OS43IDAgNDg0LjVWNDEzYzAtMTUuMiAxMi4zLTI3LjUgMjcuNS0yNy41aDI2NC4yYzE1LjIgMCAyNy41IDEyLjMgMjcuNSAyNy41djcxLjVjLjEgMTUuMi0xMi4yIDI3LjUtMjcuNCAyNy41IiBjbGFzcz0ic3QwIi8+PHBhdGggZD0iTTQ4NC41IDMxOS4zaC00NTdDMTIuMyAzMTkuMyAwIDMwNyAwIDI5MS44di03MS41YzAtMTUuMiAxMi4zLTI3LjUgMjcuNS0yNy41aDQ1N2MxNS4yIDAgMjcuNSAxMi4zIDI3LjUgMjcuNXY3MS41YzAgMTUuMi0xMi4zIDI3LjUtMjcuNSAyNy41IiBzdHlsZT0iZmlsbDojNTE5MGVmIi8+PHBhdGggZD0iTTQ4NC41IDEyNi42SDIyMC4yYy0xNS4yIDAtMjcuNS0xMi4zLTI3LjUtMjcuNVYyNy41QzE5Mi43IDEyLjMgMjA1IDAgMjIwLjIgMGgyNjQuMkM0OTkuNyAwIDUxMiAxMi4zIDUxMiAyNy41Vjk5YzAgMTUuMy0xMi4zIDI3LjYtMjcuNSAyNy42IiBjbGFzcz0ic3QyIi8+PHBhdGggZD0iTTQ4NC41IDUxMkg0MTNjLTE1LjIgMC0yNy41LTEyLjMtMjcuNS0yNy41VjQxM2MwLTE1LjIgMTIuMy0yNy41IDI3LjUtMjcuNWg3MS41YzE1LjIgMCAyNy41IDEyLjMgMjcuNSAyNy41djcxLjVjMCAxNS4yLTEyLjMgMjcuNS0yNy41IDI3LjUiIGNsYXNzPSJzdDAiLz48cGF0aCBkPSJNMjcuNSAwSDk5YzE1LjIgMCAyNy41IDEyLjMgMjcuNSAyNy41Vjk5YzAgMTUuMi0xMi4zIDI3LjUtMjcuNSAyNy41SDI3LjVDMTIuMyAxMjYuNiAwIDExNC4zIDAgOTkuMVYyNy41QzAgMTIuMyAxMi4zIDAgMjcuNSAwIiBjbGFzcz0ic3QyIi8+PC9zdmc+';

export const BASEROW_CONN_OPTIONS = {
  url: {
    type: 'string',
    display_name: 'Baserow API URL',
    short_desc: 'The URL of the Baserow API to connect to.',
    desc: 'Please enter your Baserow API URL. If you are using baserow.io, you can leave the default one.',
    default_value: 'https://api.baserow.io',
  },
  token: {
    type: 'string',
    display_name: 'Baserow API Token',
    short_desc: 'Please enter your Baserow API token.',
    desc: `Can be found by clicking on your account in the top left corner -> Settings -> API tokens.`,
  },
} satisfies TCustomConnOptions;
