import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class AzureDevOpsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AzureDevOpsError';
  }
}

export const AZURE_DEVOPS_APP_NAME = 'AzureDevOps';
export const AZURE_DEVOPS_APP_LOGO =
  'PHN2ZyBpZD0iZjQzMzc1MDYtNWQ5NS00ZTgwLWI3Y2EtNjg0OThjNmUwMDhlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxOCAxOCI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJiYTQyMDI3Ny03MDBlLTQyY2MtOWRlOS01Mzg4YTVjMTZlNTQiIHgxPSI5IiB5MT0iMTYuOTciIHgyPSI5IiB5Mj0iMS4wMyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPjxzdG9wIG9mZnNldD0iMCIgc3RvcC1jb2xvcj0iIzAwNzhkNCIvPjxzdG9wIG9mZnNldD0iMC4xNiIgc3RvcC1jb2xvcj0iIzEzODBkYSIvPjxzdG9wIG9mZnNldD0iMC41MyIgc3RvcC1jb2xvcj0iIzNjOTFlNSIvPjxzdG9wIG9mZnNldD0iMC44MiIgc3RvcC1jb2xvcj0iIzU1OWNlYyIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzVlYTBlZiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjx0aXRsZT5JY29uLWRldm9wcy0yNjE8L3RpdGxlPjxwYXRoIGlkPSJhOTFmMGNhNC04ZmI3LTQwMTktOWMwOS0wYTUyZTJjMDU3NTQiIGQ9Ik0xNyw0djkuNzRsLTQsMy4yOC02LjItMi4yNlYxN0wzLjI5LDEyLjQxbDEwLjIzLjhWNC40NFptLTMuNDEuNDlMNy44NSwxVjMuMjlMMi41OCw0Ljg0LDEsNi44N3Y0LjYxbDIuMjYsMVY2LjU3WiIgZmlsbD0idXJsKCNiYTQyMDI3Ny03MDBlLTQyY2MtOWRlOS01Mzg4YTVjMTZlNTQpIi8+PC9zdmc+';

export const AZURE_DEVOPS_CONN_OPTIONS = {
  organization: {
    display_name: 'Organization',
    short_desc:
      'Your Azure DevOps organization name (e.g., https://dev.azure.com/<your_organization>)',
    type: 'string',
  },
} satisfies TCustomConnOptions;
