import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class SupabaseError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'SupabaseError';
    this.errorCode = errorCode;
  }
}

export const EQoreRecordBasedAppErrorCodes = {
  DUPLICATE_RECORD: 'DUPLICATE-RECORD',
} as const;

export const SUPABASE_DUPLICATE_ERROR_CODE = '23505';

export const SupabaseErrorCodeToQoreErrorCodeMap: Record<string, string> = {
  [SUPABASE_DUPLICATE_ERROR_CODE]: EQoreRecordBasedAppErrorCodes.DUPLICATE_RECORD,
};

export const SUPABASE_APP_NAME = 'Supabase';
export const SUPABASE_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCA5NiA5NiIgaWQ9IlN1cGFiYXNlLUljb24tLVN0cmVhbWxpbmUtU3ZnLUxvZ29zIiBoZWlnaHQ9IjEwMCIgd2lkdGg9IjEwMCI+CiAgPGRlc2M+CiAgICBTdXBhYmFzZSBJY29uIFN0cmVhbWxpbmUgSWNvbjogaHR0cHM6Ly9zdHJlYW1saW5laHEuY29tCiAgPC9kZXNjPgogIDxwYXRoIGZpbGw9InVybCgjYSkiIGQ9Ik01NS43MjIzIDkzLjQzODNjLTIuNDAxNCAzLjAyNDEtNy4yNzA1IDEuMzY3Mi03LjMyODQtMi40OTQybC0uODQ2LTU2LjQ3NzNoMzcuOTc1MmM2Ljg3ODQgMCAxMC43MTQ2IDcuOTQ0NSA2LjQzNzUgMTMuMzMxNWwtMzYuMjM4MyA0NS42NFoiPjwvcGF0aD4KICA8cGF0aCBmaWxsPSJ1cmwoI2IpIiBmaWxsLW9wYWNpdHk9Ii4yIiBkPSJNNTUuNzIyMyA5My40MzgzYy0yLjQwMTQgMy4wMjQxLTcuMjcwNSAxLjM2NzItNy4zMjg0LTIuNDk0MmwtLjg0Ni01Ni40NzczaDM3Ljk3NTJjNi44Nzg0IDAgMTAuNzE0NiA3Ljk0NDUgNi40Mzc1IDEzLjMzMTVsLTM2LjIzODMgNDUuNjRaIj48L3BhdGg+CiAgPHBhdGggZmlsbD0iIzNlY2Y4ZSIgZD0iTTQwLjI3OCAyLjU2MTg5YzIuNDAxNC0zLjAyNDQzNiA3LjI3MDUtMS4zNjcyNiA3LjMyODQgMi40OTQxN2wuMzcwNyA1Ni40NzcyNGgtMzcuNWMtNi44Nzg1MyAwLTEwLjcxNDgxOS03Ljk0NDYtNi40Mzc1My0xMy4zMzE1TDQwLjI3OCAyLjU2MTg5WiI+PC9wYXRoPgogIDxkZWZzPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMTAxMS41OCIgeDI9IjMxODkuMTIiIHkxPSIxMjg2LjcxIiB5Mj0iMjE5OS45NyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjMjQ5MzYxIj48L3N0b3A+CiAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzNlY2Y4ZSI+PC9zdG9wPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iYiIgeDE9IjEzOS41NjEiIHgyPSIxNTM3LjQ0IiB5MT0iLTc2Mi4wNTQiIHkyPSIxODY5LjM4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxzdG9wPjwvc3RvcD4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLW9wYWNpdHk9IjAiPjwvc3RvcD4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgo8L3N2Zz4=';

export const SUPABASE_CONN_OPTIONS = {
  projectId: {
    type: 'string',
    display_name: 'Project ID',
    short_desc: 'The ID of the project to connect to. Available in the project settings.',
    desc: 'You can find the project ID in the URL when you are in your project on Supabase or in the project settings.',
  },
  token: {
    type: 'string',
    display_name: 'API Key',
    short_desc: 'The API key for the project to connect to. Available in the project settings.',
    desc: `To get the api key, go to Project Settings > API Keys > service_role 'secret'`,
  },
} satisfies TCustomConnOptions;
