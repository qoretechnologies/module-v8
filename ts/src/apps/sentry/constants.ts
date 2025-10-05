import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class SentryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SentryError';
  }
}

export const SENTRY_APP_NAME = 'Sentry';
export const SENTRY_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPgo8c3ZnIHdpZHRoPSI4MDBweCIgaGVpZ2h0PSI4MDBweCIgdmlld0JveD0iMCAwIDMyIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0aXRsZT5maWxlX3R5cGVfc2VudHJ5PC90aXRsZT48cGF0aCBkPSJNMTguMjQyLDQuMzUyYTIuNTMsMi41MywwLDAsMC0zLjUzNC0uOTg2LDIuNjQzLDIuNjQzLDAsMCwwLS45NDYuOTg2TDEwLjA3NCwxMS4wMWwuOTQxLjU2M2ExOC45NjUsMTguOTY1LDAsMCwxLDksMTUuMTc5SDE3LjQyNkExNi4yNDQsMTYuMjQ0LDAsMCwwLDkuNzExLDEzLjlsLS45NDEtLjU2MUw1LjMzNCwxOS41NjVsLjk0MS41NjJBOS4xMTYsOS4xMTYsMCwwLDEsMTAuNSwyNi43NTJINC41ODdhLjQzNi40MzYsMCwwLDEtLjQzNC0uNDM3LjQ2NC40NjQsMCwwLDEsLjA1OC0uMjMxbDEuNjQ4LTIuOTc2YTUuOTMyLDUuOTMyLDAsMCwwLTEuODgxLTEuMTE5TDIuMzQ3LDI0Ljk1OEEyLjc1OSwyLjc1OSwwLDAsMCwzLjMsMjguNjQxLDIuNTEsMi41MSwwLDAsMCw0LjU4NywyOWg4LjEzOFYyNy44NzhhMTEuMzY2LDExLjM2NiwwLDAsMC00LjQ2Ny05LjFsMS4zLTIuMzM4QTE0LjA4OSwxNC4wODksMCwwLDEsMTUuMywyNy44Njh2MS4xMjZoNi45VjI3Ljg3YTIxLjM0MiwyMS4zNDIsMCwwLDAtOS4xOS0xNy42NmwyLjYxOC00LjczM2EuNDE4LjQxOCwwLDAsMSwuNTgzLS4xNjIuNDMzLjQzMywwLDAsMSwuMTU2LjE2MkwyNy43OCwyNi4wODRhLjQ1Ni40NTYsMCwwLDEtLjE1NS42MDguNC40LDAsMCwxLS4yMjEuMDZoLTIuNjdjLjAzMy43NTIuMDM3LDEuNSwwLDIuMjUyaDIuNjc5QTIuNjQ0LDIuNjQ0LDAsMCwwLDMwLDI2LjMwN2EyLjc4MSwyLjc4MSwwLDAsMC0uMzQ2LTEuMzQ3WiIgc3R5bGU9ImZpbGw6I0ZCNDIyNiIvPjwvc3ZnPg==';

export const SENTRY_CONN_OPTIONS = {
  token: {
    type: 'string',
    display_name: 'Auth Token',
    short_desc:
      'You can create authentication tokens within Sentry: [see here](https://sentry.io/settings/account/api/auth-tokens/)',
    desc: 'To make sure all the actions and triggers work, the token should have the most permissive scopes.',
  },
  organization: {
    type: 'string',
    display_name: 'Organization Slug',
    short_desc:
      'The slug of the organization you want to work with. Example: "qorus-dev" from https://qorus-dev.sentry.io/',
    desc: 'You can find the organization slug in the URL when you are in your organization on Sentry.',
  },
} satisfies TCustomConnOptions;
