import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class SeaTableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SeaTableError';
  }
}

export const SEATABLE_APP_NAME = 'SeaTable';
export const SEATABLE_APP_LOGO =
  'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgcHJlc2VydmVBc3BlY3RSYXRpbz0ieE1pZFlNaWQgbWVldCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDYyIDYyIiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zOnNlcmlmPSJodHRwOi8vd3d3LnNlcmlmLmNvbS8iIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLW1pdGVybGltaXQ6MjsiPgogIDxnIHRyYW5zZm9ybT0ibWF0cml4KDAuNDMxMDA1LDAsMCwwLjQzMTAwNSw5LDApIj4KICAgIDxwYXRoIGQ9Ik0xMy4yNiwxMDkuOTM4TDQ3LjE3MiwxNDMuODVMOTUuOTE1LDk1LjEwOEMxMDQuNzU5LDg2LjI2MyAxMDQuNzU5LDcxLjkyMyA5NS45MTUsNjMuMDhMNzguMDE5LDQ1LjE4Mkw3Ny43LDQ0Ljg2M0wyNC4xNTUsOTguMjkyTDI0LjUzLDk4LjY2N0wxMy4yNiwxMDkuOTM4WiIgc3R5bGU9ImZpbGw6dXJsKCNfTGluZWFyMSk7Ii8+CiAgICA8cGF0aCBkPSJNMjQuNTMsOTguNjY3TDg5LjI4OSwzMy45MTNMNTUuMzc3LDBMNi42MzMsNDguNzQzQy0yLjIxMSw1Ny41ODcgLTIuMjExLDcxLjkyNyA2LjYzMyw4MC43NzFMMjQuNTMsOTguNjY3WiIgc3R5bGU9ImZpbGw6cmdiKDI1NSwxMjgsMCk7Ii8+CiAgPC9nPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJfTGluZWFyMSIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0ibWF0cml4KC05LjQ2ODEsLTI3LjQyMzQsMjcuNDIzNCwtOS40NjgxLDU3LjkwNCw5MS4wNDQ4KSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCIgc3R5bGU9InN0b3AtY29sb3I6cmdiKDI1NSwxMjgsMCk7c3RvcC1vcGFjaXR5OjEiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjpyZ2IoMjM2LDQwLDU1KTtzdG9wLW9wYWNpdHk6MSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+Cjwvc3ZnPgo=';

export const SEATABLE_CONN_OPTIONS = {
  url: {
    type: 'string',
    display_name: 'SeaTable Server URL',
    short_desc: 'The URL of the SeaTable server to connect to.',
    desc: 'Please enter your SeaTable server URL. For SeaTable Cloud, use https://cloud.seatable.io. For self-hosted instances, use your custom URL.',
    default_value: 'https://cloud.seatable.io',
  },
  token: {
    type: 'string',
    display_name: 'SeaTable API Token',
    short_desc: 'Please enter your SeaTable API token.',
    desc: 'The API token grants access to a specific base. Create one in SeaTable by right-clicking a base and selecting "API Token".',
    sensitive: true,
  },
} satisfies TCustomConnOptions;
