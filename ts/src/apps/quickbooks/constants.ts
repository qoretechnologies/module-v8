import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const QUICKBOOKS_APP_NAME = 'Quickbooks';
export const QUICKBOOKS_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIGlkPSJhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2OSA2OSI+PGRlZnM+PHN0eWxlPi5iLC5jLC5ke3N0cm9rZS13aWR0aDowcHg7fS5je2ZpbGw6IzJjYTAxYzt9LmR7ZmlsbDojZmZmO308L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iYyIgZD0ibTMwLjc3LDYxLjU0YzE2Ljk5LDAsMzAuNzctMTMuNzgsMzAuNzctMzAuNzdTNDcuNzYsMCwzMC43NywwLDAsMTMuNzgsMCwzMC43N3MxMy43NywzMC43NywzMC43NywzMC43N1oiLz48cGF0aCBjbGFzcz0iZCIgZD0ibTIwLjUxLDE4LjhjLTYuNjEsMC0xMS45Nyw1LjM2LTExLjk3LDExLjk3czUuMzUsMTEuOTYsMTEuOTcsMTEuOTZoMS43MXYtNC40NGgtMS43MWMtNC4xNSwwLTcuNTItMy4zNy03LjUyLTcuNTIsMC00LjE1LDMuMzctNy41Miw3LjUyLTcuNTJoNC4xMXYyMy4yNWMwLDIuNDUsMS45OSw0LjQ0LDQuNDQsNC40NFYxOC44aC04LjU1LDBabTIwLjUyLDIzLjkzYzYuNjEsMCwxMS45Ny01LjM2LDExLjk3LTExLjk2cy01LjM1LTExLjk2LTExLjk3LTExLjk2aC0xLjcxdjQuNDRoMS43MWM0LjE1LDAsNy41MiwzLjM3LDcuNTIsNy41MnMtMy4zNyw3LjUyLTcuNTIsNy41MmgtNC4xMVYxNS4wNGMwLTIuNDUtMS45OS00LjQ0LTQuNDQtNC40NHYzMi4xM2g4LjU1czAsMCwwLDBaIi8+PC9zdmc+';

export class QuickbooksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuickbooksError';
  }
}

export const QUICKBOOKS_CONN_OPTIONS = {
  instance_type: {
    display_name: 'Instance Type',
    desc: 'Type of Quickbooks instance to connect to.',
    type: 'string',
    default_value: 'quickbooks',
    allowed_values: [
      {
        value: 'quickbooks',
        display_name: 'Production',
      },
      {
        value: 'sandbox-quickbooks',
        display_name: 'Sandbox',
      },
    ],
  },
  realm_id: {
    display_name: 'Realm ID',
    desc: 'The Realm ID of the Quickbooks company you want to connect to.',
    type: 'string',
  },
} satisfies TCustomConnOptions;
