import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class AzureDevOpsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AzureDevOpsError';
  }
}

export const AZURE_DEVOPS_APP_NAME = 'AzureDevOps';

/**
 * The released Azure DevOps REST API revision.
 *
 * Used by every family this application calls that has one: Profiles, Work Items and Service Hooks
 * *subscriptions*. `7.1` is the generation Microsoft treats as canonical — its reference pages
 * default to the `azure-devops-rest-7.1` moniker even where a `7.2` page also exists.
 */
export const AZURE_DEVOPS_API_VERSION = '7.1';

/**
 * The Graph API revision.
 *
 * Separate from {@link AZURE_DEVOPS_API_VERSION} because **the Graph API has never been released**:
 * Microsoft publishes it only as `-preview.N`, under both the 7.1 and 7.2 monikers, and there is no
 * GA revision to move to. Microsoft's rule that a preview API may be deactivated 12 weeks after
 * release therefore does not apply yet — it starts only once a GA revision ships, which is the
 * event that makes this a deadline rather than a standing condition.
 *
 * This is a vendor choice, not a defect in this application, and should not be re-raised as one.
 */
export const AZURE_DEVOPS_GRAPH_API_VERSION = '7.2-preview.1';

/**
 * The Service Hooks *test notifications* revision.
 *
 * Separate from {@link AZURE_DEVOPS_API_VERSION} for the same reason as the Graph API: Microsoft
 * publishes `/_apis/hooks/testnotifications` only as a preview revision, while the neighbouring
 * `/_apis/hooks/subscriptions` in the same family is released and uses the GA revision above. Two
 * endpoints of one service sitting on different release tracks is why these are separate constants
 * rather than one.
 */
export const AZURE_DEVOPS_SERVICE_HOOKS_TEST_API_VERSION = '7.2-preview.1';
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
