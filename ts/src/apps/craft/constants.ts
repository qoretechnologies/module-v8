import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export const CRAFT_APP_NAME = 'Craft';
export const CRAFT_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMTAuODkgMTEwLjg5Ij4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjMjU0MDc4OwogICAgICB9CgogICAgICAuY2xzLTEsIC5jbHMtMiwgLmNscy0zIHsKICAgICAgICBmaWxsLXJ1bGU6IGV2ZW5vZGQ7CiAgICAgIH0KCiAgICAgIC5jbHMtMiB7CiAgICAgICAgZmlsbDogI2ZmNjJmZDsKICAgICAgfQoKICAgICAgLmNscy0zIHsKICAgICAgICBmaWxsOiAjMDA3OGZmOwogICAgICB9CiAgICA8L3N0eWxlPgogIDwvZGVmcz4KICA8ZyBpZD0iY3JhZnRfbG9nb3BhY2siPgogICAgPGcgaWQ9ImNyYWZ0X2ljb25fY29sb3VyX3JlZ3VsYXIiPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im01OS4wNSwxMDcuNmMwLDEuODIsMS40NywzLjI5LDMuMjksMy4yOWg0NS4zNmMxLjgyLDAsMy4zLTEuNDgsMy4xOC0zLjI5LTEuNjMtMjYuMDYtMjIuNDgtNDYuOTItNDguNTQtNDguNTQtMS44MS0uMTEtMy4yOSwxLjM3LTMuMjksMy4xOHY0NS4zNloiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJtNTEuODQsNjIuMzRjMC0xLjgyLTEuNDctMy4yOS0zLjI5LTMuMjlIMy4xOWMtMS44MiwwLTMuMywxLjQ4LTMuMTgsMy4yOSwxLjYzLDI2LjA2LDIyLjQ4LDQ2LjkyLDQ4LjU0LDQ4LjU0LDEuODEuMTEsMy4yOS0xLjM3LDMuMjktMy4xOHYtNDUuMzZaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTUxLjg0LDQ4LjU1YzAsMS44Mi0xLjQ3LDMuMjktMy4yOSwzLjI5SDMuMTljLTEuODIsMC0zLjMtMS40OC0zLjE4LTMuMjlDMS42MywyMi40OSwyMi40OSwxLjYzLDQ4LjU1LDBjMS44MS0uMTEsMy4yOSwxLjM3LDMuMjksMy4xOHY0NS4zNloiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtNTkuMDUsMy4yOWMwLTEuODIsMS40Ny0zLjI5LDMuMjktMy4yOWg0NS4zNmMxLjgyLDAsMy4zLDEuNDgsMy4xOCwzLjI5LTEuNjMsMjYuMDYtMjIuNDgsNDYuOTItNDguNTQsNDguNTQtMS44MS4xMS0zLjI5LTEuMzctMy4yOS0zLjE4VjMuMjlaIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4=';

export class CraftError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'CraftError';
    this.errorCode = errorCode;
  }
}

export const CRAFT_CONN_OPTIONS = {
  url: {
    display_name: 'Craft API URL',
    short_desc: 'Your Craft API URL',
    desc: 'To get your Craft API URL, log in to your Craft account, navigate to the Imagine tab -> "Add Your First API Connection". After that, you will see your API URL after pressing on the created API Connection.\n\n**Important:** Craft has two types of API connections:\n- **Daily notes & Tasks API**: Required for Tasks and Daily Notes actions (List Tasks, Create Task, Update Task, Delete Tasks, Get Daily Note Blocks)\n- **Selected Documents API**: Required for all other actions (Documents, Collections, and Blocks actions)\n\nMake sure to create and use the appropriate API connection based on the actions you need.',
    type: 'string',
  },
  token: {
    display_name: 'Craft API Token (Optional)',
    short_desc: 'If access mode is set to Api Key, provide your Craft API Key here',
    type: 'string',
    preselected: true,
  },
} satisfies TCustomConnOptions;
