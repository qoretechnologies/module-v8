/**
 * Dropbox App Constants
 */

export const DROPBOX_APP_NAME = 'Dropbox';

export const DROPBOX_APP_LOGO =
  'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iODAwIiB3aWR0aD0iMTIwMCIgaWQ9InN2ZzEyNiIgdmVyc2lv' +
  'bj0iMS4xIiB2aWV3Qm94PSItMzUuMzE3NSAtNTAgMzA2LjA4NSAzMDAiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW' +
  '5rIj4KIDxkZWZzIGlkPSJkZWZzMTEyIj4KICA8c3R5bGUgaWQ9InN0eWxlMTEwIj4KICAgLmNscy0xe2ZpbGw6IzAwNjFmZn0KICA8L3N0eWxl' +
  'PgogPC9kZWZzPgogPHBhdGggaWQ9InBvbHlnb24xMTYiIGNsYXNzPSJjbHMtMSIgZD0iTTU4Ljg2IDc1bDU4Ljg3LTM3LjVMNTguODYgMCAwIDM3' +
  'LjV6Ij4KIDwvcGF0aD4KIDxwYXRoIGlkPSJwb2x5Z29uMTE4IiBjbGFzcz0iY2xzLTEiIGQ9Ik0xNzYuNTkgNzVsNTguODYtMzcuNUwxNzYuNTk' +
  'gMGwtNTguODYgMzcuNXoiPgogPC9wYXRoPgogPHBhdGggaWQ9InBvbHlnb24xMjAiIGNsYXNzPSJjbHMtMSIgZD0iTTExNy43MyAxMTIuNUw1OC' +
  '44NiA3NSAwIDExMi41IDU4Ljg2IDE1MHoiPgogPC9wYXRoPgogPHBhdGggaWQ9InBvbHlnb24xMjIiIGNsYXNzPSJjbHMtMSIgZD0iTTE3Ni41O' +
  'SAxNTBsNTguODYtMzcuNUwxNzYuNTkgNzVsLTU4Ljg2IDM3LjV6Ij4KIDwvcGF0aD4KIDxwYXRoIGlkPSJwb2x5Z29uMTI0IiBjbGFzcz0iY2xz' +
  'LTEiIGQ9Ik0xNzYuNTkgMTYyLjVMMTE3LjczIDEyNWwtNTguODcgMzcuNSA1OC44NyAzNy41eiI+CiA8L3BhdGg+Cjwvc3ZnPg==';

/**
 * Dropbox API URLs
 */
export const DROPBOX_API_URL = 'https://api.dropboxapi.com';
export const DROPBOX_CONTENT_URL = 'https://content.dropboxapi.com';

/**
 * Custom error class for Dropbox operations
 */
export class DropboxError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'DropboxError';
    this.errorCode = errorCode;
  }
}

/**
 * Extract error message from various error formats
 */
export const extractDropboxErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  // Dropbox API error format
  if (error?.error_summary) {
    return error.error_summary;
  }

  // Standard error format
  if (error?.message) {
    return error.message;
  }

  return String(error);
};
