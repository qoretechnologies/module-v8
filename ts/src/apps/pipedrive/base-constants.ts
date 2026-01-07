export const PIPEDRIVE_APP_NAME = 'Pipedrive';

export const PIPEDRIVE_APP_LOGO = `PHN2ZyB3aWR0aD0iNzIwIiBoZWlnaHQ9IjcyMCIgdmlld0JveD0iMCAwIDcyMCA3MjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI3MjAiIGhlaWdodD0iNzIwIiByeD0iMTMwIiBmaWxsPSIjMDI3NzM3Ii8+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF8zMDRfOTMyKSI+CjxwYXRoIGQ9Ik0zOTQuNzE0IDEzNC4zNTlDMzQ0LjU3MSAxMzQuMzU5IDMxNS4zMjEgMTU2Ljg1OSAzMDEuNSAxNzIuNjA5QzI5OS44OTIgMTU5LjEwOSAyOTAuODkyIDE0MS43NTIgMjU2LjUgMTQxLjc1MkgxODAuOTY0VjIyMC4xODFIMjExLjgyMUMyMTYuOTY0IDIyMC4xODEgMjE4LjU3MSAyMjEuNzg4IDIxOC41NzEgMjI2LjkzMVY1ODUuNjQ1SDMwNy45MjhWNDUwLjk2N0MzMDcuOTI4IDQ0Ny40MzEgMzA3LjkyOCA0NDMuODk1IDMwNy42MDcgNDQxLjAwMkMzMjEuNDI4IDQ1My44NTkgMzQ4LjEwNyA0NzEuNTM4IDM4OS44OTIgNDcxLjUzOEM0NzcuMzIxIDQ3MS41MzggNTM4LjM5MiA0MDIuMTA5IDUzOC4zOTIgMzAzLjEwOUM1MzkuMDM1IDIwMi4xODEgNDgwLjg1NyAxMzQuMzU5IDM5NC43MTQgMTM0LjM1OVpNMzc2LjM5MiAzOTMuNDMxQzMyOC4xNzggMzkzLjQzMSAzMDYuMzIxIDM0Ny40NjcgMzA2LjMyMSAzMDQuNzE3QzMwNi4zMjEgMjM3LjUzOCAzNDIuOTY0IDIxMy40MzEgMzc3LjY3OCAyMTMuNDMxQzQxOS43ODUgMjEzLjQzMSA0NDguMzkyIDI0OS43NTIgNDQ4LjM5MiAzMDQuMDc0QzQ0OC4wNzEgMzY2LjEwOSA0MTIuMDcxIDM5My40MzEgMzc2LjM5MiAzOTMuNDMxWiIgZmlsbD0id2hpdGUiLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8zMDRfOTMyIj4KPHJlY3Qgd2lkdGg9IjM2MCIgaGVpZ2h0PSI0NTAiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxODAgMTM1KSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=`;

export class PipedriveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PipedriveError';
  }
}

export const extractPipedriveError = (error: any): string => {
  if (error?.response?.data) {
    const data = error.response.data;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;
  }

  if (error?.error && typeof error.error === 'string') return error.error;
  if (error?.message && typeof error.message === 'string') return error.message;

  if (typeof error === 'object') return JSON.stringify(error);
  return String(error);
};
