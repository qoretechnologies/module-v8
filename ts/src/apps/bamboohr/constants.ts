import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class BambooHRError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BambooHRError';
  }
}

export const BAMBOOHR_APP_NAME = 'BambooHR';
export const BAMBOOHR_BASE_URL = 'https://api.bamboohr.com/api/gateway.php';

// BambooHR logo - green leaf with "bambooHR" text
// Source: Based on official BambooHR branding (green #73C41D)
export const BAMBOOHR_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgMTI4Ij48ZGVmcz48c3R5bGU+LmF7ZmlsbDojNzNDNDFEfS5ie2ZpbGw6IzJFM0Q0OX08L3N0eWxlPjwvZGVmcz48cGF0aCBjbGFzcz0iYSIgZD0iTTAgNjRjMC0xNy43IDE0LjMtMzIgMzItMzJzMzIgMTQuMyAzMiAzMi0xNC4zIDMyLTMyIDMyUzAgODEuNyAwIDY0em0xNiAwYzAgOC44IDcuMiAxNiAxNiAxNnMxNi03LjIgMTYtMTYtNy4yLTE2LTE2LTE2LTE2IDcuMi0xNiAxNnoiLz48cGF0aCBjbGFzcz0iYSIgZD0iTTMyIDhDMTQuMyA4IDAgMjIuMyAwIDQwdjQ4YzAgMTcuNyAxNC4zIDMyIDMyIDMyczMyLTE0LjMgMzItMzJWNDBjMC0xNy43LTE0LjMtMzItMzItMzJ6bTAgMTZjOC44IDAgMTYgNy4yIDE2IDE2djQ4YzAgOC44LTcuMiAxNi0xNiAxNnMtMTYtNy4yLTE2LTE2VjQwYzAtOC44IDcuMi0xNiAxNi0xNnoiLz48cGF0aCBjbGFzcz0iYiIgZD0iTTgwIDQwaDI0djQ4YzAgMTMuMyAxMC43IDI0IDI0IDI0czI0LTEwLjcgMjQtMjRWNDBoMjR2NDhjMCAyNi41LTIxLjUgNDgtNDggNDhzLTQ4LTIxLjUtNDgtNDhWNDB6Ii8+PHBhdGggY2xhc3M9ImIiIGQ9Ik0xOTIgNDBjMjYuNSAwIDQ4IDIxLjUgNDggNDhzLTIxLjUgNDgtNDggNDgtNDgtMjEuNS00OC00OCAyMS41LTQ4IDQ4LTQ4em0wIDI0Yy0xMy4zIDAtMjQgMTAuNy0yNCAyNHMxMC43IDI0IDI0IDI0IDI0LTEwLjcgMjQtMjQtMTAuNy0yNC0yNC0yNHoiLz48cGF0aCBjbGFzcz0iYiIgZD0iTTI4OCA0MGMyNi41IDAgNDggMjEuNSA0OCA0OHMtMjEuNSA0OC00OCA0OC00OC0yMS41LTQ4LTQ4IDIxLjUtNDggNDgtNDh6bTAgMjRjLTEzLjMgMC0yNCAxMC43LTI0IDI0czEwLjcgMjQgMjQgMjQgMjQtMTAuNyAyNC0yNC0xMC43LTI0LTI0LTI0eiIvPjxwYXRoIGNsYXNzPSJhIiBkPSJNMzUyIDQwaDI0djY4YzAgNC40IDMuNiA4IDggOHM4LTMuNiA4LThWNjRjMC0xMy4zIDEwLjctMjQgMjQtMjRzMjQgMTAuNyAyNCA2NHY0NGgtMjRWNjhjMC00LjQtMy42LTgtOC04cy04IDMuNi04IDh2NDBjMCAxNy43LTE0LjMgMzItMzIgMzJzLTMyLTE0LjMtMzItMzJWNDB6Ii8+PHBhdGggY2xhc3M9ImIiIGQ9Ik00NjQgMTZoMjR2MTJoLTI0ek00NjQgNDBoMjR2NjhoLTI0eiIvPjxwYXRoIGNsYXNzPSJhIiBkPSJNNDY0IDQwaDI0djY4YzAgMTMuMyAxMC43IDI0IDI0IDI0di0yNGMwIDAtOCAwLTgtOFY0MHoiLz48L3N2Zz4=';

export const BAMBOOHR_CONN_OPTIONS = {
  api_key: {
    type: 'string',
    display_name: 'API Key',
    short_desc: 'Your BambooHR API key.',
    desc: 'Generate an API key in BambooHR by navigating to Account > API Keys. The key is used for authentication with the BambooHR API.',
    sensitive: true,
  },
  company_domain: {
    type: 'string',
    display_name: 'Company Domain',
    short_desc: 'Your BambooHR company subdomain.',
    desc: 'The subdomain of your BambooHR account. For example, if you access BambooHR at https://mycompany.bamboohr.com, your company domain is "mycompany".',
  },
} satisfies TCustomConnOptions;
