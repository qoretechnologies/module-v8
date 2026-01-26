import { TCustomConnOptions } from '@qoretechnologies/ts-toolkit';

export class BrevoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BrevoError';
  }
}

export const BREVO_APP_NAME = 'Brevo';
export const BREVO_APP_LOGO =
  'PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBpZD0iQnJldm8tLVN0cmVhbWxpbmUtU2ltcGxlLUljb25zIiBoZWlnaHQ9IjI0IiB3aWR0aD0iMjQiPgogIDxkZXNjPgogICAgQnJldm8gU3RyZWFtbGluZSBJY29uOiBodHRwczovL3N0cmVhbWxpbmVocS5jb20KICA8L2Rlc2M+CiAgPHRpdGxlPkJyZXZvPC90aXRsZT4KICA8cGF0aCBkPSJNMTIgMEExMiAxMiAwIDAgMCAwIDEyYTEyIDEyIDAgMCAwIDEyIDEyIDEyIDEyIDAgMCAwIDEyIC0xMkExMiAxMiAwIDAgMCAxMiAwek03LjIgNC44aDUuNzQ3YzIuMzQgMCAzLjg5NSAxLjQwNiAzLjg5NSAzLjUxNiAwIDEuMDIyIC0wLjM0OCAxLjg2MiAtMS4wOSAyLjU4OEMxNy4xODkgMTEuODEyIDE4IDEzLjIyIDE4IDE0Ljc4NWMwIDIuODYgLTIuNjQgNS4wMTYgLTYuMTY0IDUuMDE2SDcuMTk5di0xNXptMi4wODUgMS45NTJ2NS41MzdoMC4wN2MwLjIzMyAtMC40MzIgMC44NTggLTAuNzk2IDIuMjQ5IC0xLjIyNiAyLjAzOSAtMC42NTkgMy4wMzcgLTEuNTIgMy4wMzcgLTIuNjU1IDAgLTAuOTk4IC0wLjc2NiAtMS42NTYgLTEuOTI0IC0xLjY1Nkg5LjI4NXptNC44NyA1LjI2NmMtMC43NjYgMC4zODUgLTEuNjcgMC43NDggLTIuNzYgMS4xMSAtMS4yMjkgMC4zODcgLTIuMTEgMS4zODYgLTIuMTEgMi40MDd2Mi4zMTVoMi4zNjVjMi4zODcgMCA0LjE0OSAtMS4zNCA0LjE0OSAtMy4xNTUgMCAtMS4wNjcgLTAuNjI1IC0yLjA4NyAtMS42NDUgLTIuNjc3eiIgZmlsbD0iIzAwNmE0MyIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==';

export const BREVO_CONN_OPTIONS = {
  token: {
    display_name: 'API Key',
    short_desc: 'Your Brevo account API key',
    desc:
      `To get your API key:\n` +
      `- Go to (https://app.brevo.com/settings/keys/api)[https://app.brevo.com/settings/keys/api]\n` +
      `- Generate a new API key\n` +
      `- Copy the api key value`,
    type: 'string',
  },
} satisfies TCustomConnOptions;

export const extractBrevoError = (error: any) => {
  return error?.response?.data?.message || error;
};
