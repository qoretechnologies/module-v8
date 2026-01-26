import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class NocoDBError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NocoDBError';
  }
}

export const NOCODB_APP_NAME = 'NocoDB';
export const NOCODB_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIyNTEuMzU1IiB4Mj0iMjUxLjM1NSIgeTE9IjUwMi40MTEiIHkyPSI1MS44OTQiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoMSAwIDAgLTEgMCA1MTQpIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNDM1MWU4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojMmExZWE1Ii8+PC9saW5lYXJHcmFkaWVudD48cGF0aCBkPSJtMTI4IDIzMS44IDU4LjcgNTguOHY5M0gxMjh6bTI0Ni43LTEyNC45djI2Ny4yYzAgNS41LTQuNSA5LjktMTAgOS45LTIuNiAwLTUuMS0xLTctMi45TDEyOCAxNzMuOXYtNTguNmMwLTUuNSA0LjQtOS45IDkuOS05LjloLjVjMi42IDAgNS4yIDEuMSA3IDIuOWwxNzAuNSAxNDcuOVYxMDYuOXoiIHN0eWxlPSJmaWxsOnVybCgjYSkiLz48bGluZWFyR3JhZGllbnQgaWQ9ImIiIHgxPSIxMDIuODgzIiB4Mj0iNTY5LjY3NCIgeTE9IjEwNS42MTUiIHkyPSI1NzAuMTc0IiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KDEgMCAwIC0xIDAgNTE0KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6IzQzNTFlOCIvPjxzdG9wIG9mZnNldD0iMSIgc3R5bGU9InN0b3AtY29sb3I6IzJhMWVhNSIvPjwvbGluZWFyR3JhZGllbnQ+PHBhdGggZD0iTTY0IDBDMjguNyAwIDAgMjguNyAwIDY0djM4NGMwIDM1LjMgMjguNyA2NCA2NCA2NGgzODRjMzUuMyAwIDY0LTI4LjcgNjQtNjRWNjRjMC0zNS4zLTI4LjctNjQtNjQtNjR6bTEzLjUgNDUuNWMtMTcuNyAwLTMyIDE0LjMtMzIgMzJ2MzU3YzAgMTcuNyAxNC4zIDMyIDMyIDMyaDM1N2MxNy43IDAgMzItMTQuMyAzMi0zMnYtMzU3YzAtMTcuNy0xNC4zLTMyLTMyLTMyeiIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6dXJsKCNiKSIvPjwvc3ZnPg==';

export const NOCODB_CONN_OPTIONS = {
  url: {
    type: 'string',
    display_name: 'NocoDB API URL',
    short_desc: 'The URL of the NocoDB instance to connect to.',
    desc: 'Please enter your NocoDB API URL. For hosted instances, use https://app.nocodb.com. For self-hosted instances, use your custom URL.',
    default_value: 'https://app.nocodb.com',
  },
  token: {
    type: 'string',
    display_name: 'NocoDB API Token',
    short_desc: 'Please enter your NocoDB API token.',
    desc: `Can be found by clicking on your account icon -> Copy Auth Token, or create an API token in Account Settings -> Tokens.`,
  },
} satisfies TCustomConnOptions;
