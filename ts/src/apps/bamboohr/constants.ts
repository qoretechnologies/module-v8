import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class BambooHRError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BambooHRError';
  }
}

export const BAMBOOHR_APP_NAME = 'BambooHR';
export const BAMBOOHR_BASE_URL = 'https://api.bamboohr.com/api/gateway.php';

export const BAMBOOHR_APP_LOGO =
  'PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxuczp4PSJuc19leHRlbmQ7IiB4bWxuczppPSJuc19haTsiIHhtbG5zOmdyYXBoPSJuc19ncmFwaHM7IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDEzMy41IDEwNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTMzLjUgMTA1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CiA8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogIC5zdDB7ZmlsbDojNzNDNDFEO30KIDwvc3R5bGU+CiA8bWV0YWRhdGE+CiAgPHNmdyB4bWxucz0ibnNfc2Z3OyI+CiAgIDxzbGljZXM+CiAgIDwvc2xpY2VzPgogICA8c2xpY2VTb3VyY2VCb3VuZHMgYm90dG9tTGVmdE9yaWdpbj0idHJ1ZSIgaGVpZ2h0PSIxMDUiIHdpZHRoPSIxMzMuNSIgeD0iLTI4MC45IiB5PSItNDAuNiI+CiAgIDwvc2xpY2VTb3VyY2VCb3VuZHM+CiAgPC9zZnc+CiA8L21ldGFkYXRhPgogPGRlc2M+CiAgQ3JlYXRlZCB3aXRoIFNrZXRjaC4KIDwvZGVzYz4KIDxnIGlkPSJQYWdlLTEiPgogIDxnIGlkPSJNYXJrZXRwbGFjZSI+CiAgIDxnIGlkPSJMb2dvX3gyRl9CYW1ib29IUl94MkZfTG9nbyI+CiAgICA8cGF0aCBpZD0iQmFtYm9vSFIiIGNsYXNzPSJzdDAiIGQ9Ik05Ny41LDMyLjNjMTkuMywwLDM2LDE2LjYsMzYsMzUuOGMwLDIwLjgtMTYsMzYuOS0zNy4yLDM2LjljLTE5LjIsMC0zNS45LTEzLjQtMzUuOS0zNVYwCgkJCQloMTEuMWwwLDQyLjhsMS4zLTEuNEM3Ny43LDM2LjcsODQuNiwzMi4zLDk3LjUsMzIuM3ogTTk2LjQsOTQuOWMxNS44LDAsMjUuOC0xMS4xLDI1LjgtMjUuOGMwLTEzLjUtOS41LTI2LjQtMjUuNS0yNi40CgkJCQljLTE2LjEsMC0yNiwxMi0yNiwyNi43QzcwLjYsODQsODIuNCw5NC45LDk2LjQsOTQuOXogTTM4LjIsOC41YzguMyw4LjcsOS4yLDEzLjUsMTIuMSwyMmw0LjksMTZjMCwwLTQuOS0wLjktOC45LTEuNQoJCQkJYy00LjYtMC43LTYuNy0xLjQtMTIuNi0zLjhjLTUuOS0yLjQtMTEuMi04LjItMTYuNC0xNC43QzEyLjIsMjAuMSwwLDkuOSwwLDkuOXMzLjgsMC4yLDcuNiwxLjJjMy4xLDAuOCwxMS4zLDMuNCwxOS43LDcuNwoJCQkJYzEuOSwxLDIuOSwxLjYsNC43LDIuN2MyLjgsMS43LDUuNyw0LjMsOC41LDcuMWMzLjMsMy4zLDYuMiw2LDguNyw5Yy0yLjctNC45LTkuNy0yMi42LTIzLjMtMzcuMkMyNC42LTEuMSwzNS4zLDUuNSwzOC4yLDguNXoiPgogICAgPC9wYXRoPgogICA8L2c+CiAgPC9nPgogPC9nPgo8L3N2Zz4=';

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
