export class AmazonSNSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonSNSError';
  }
}

export const AMAZON_SNS_APP_NAME = 'AmazonSNS';
export const AMAZON_SNS_APP_LOGO =
  'PHN2ZyB3aWR0aD0iMjQ5MCIgaGVpZ2h0PSIyNTAwIiB2aWV3Qm94PSIwIDAgMjU2IDI1NyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PHBhdGggZD0iTTk4Ljg3NSAyMzIuMDMzbC0yNi40MzMtNy40MDgtMjUuMDAxLTI4LjUwOCAzMS4yNzItLjg2MyAyMC4xNjIgMzYuNzc5TTM3Ljc1IDIxMy4yMzNsLTE0Ljg3NS00LjE2Ni0xNC4wNTgtMTYuMDM0IDE3LjA4Mi0yLjgwOSAxMS44NTEgMjMuMDA5IiBmaWxsPSIjOTk1QjgwIi8+PHBhdGggZD0iTTAgMTkxLjAxN2wxNS4yMDQgMy4wOTEgMi4yMDctMy44ODJWNTguNTAzbC0yLjIwNy0yLjU2MUwwIDY0LjZ2MTI2LjQxNyIgZmlsbD0iIzdCM0Y2NSIvPjxwYXRoIGQ9Ik03My45MzMgNjkuNzA4TDE1LjIwOCA1NS45NDJ2MTM4LjE2Nmw4Ljc5OC0uODE4IDEzLjc0NCAxOS45NDMgMTAuNi0yMi4yMDUgMjUuNTgzLTIuMzc4VjY5LjcwOCIgZmlsbD0iI0MxN0I5RCIvPjxwYXRoIGQ9Ik0zMy45NTggMTk4LjEzM2wyNi4wNjMgNS4yNSAxLjcxNi00LjA0NVYzNy40NGwtMS43MTYtMy42NjUtMjYuMDYzIDEzLjIwOHYxNTEuMTUiIGZpbGw9IiM3QjNGNjUiLz48cGF0aCBkPSJNMjA4LjczNCA4MS41MTZMNjAuMDIxIDMzLjc3NXYxNjkuNjEybDE3LjIyMS0yLjIxNiAyMS42MzMgMzAuODYyIDE3LjEyNi0zNS44NSA5Mi43MzMtMTEuOTMzVjgxLjUxNiIgZmlsbD0iI0MxN0I5RCIvPjxwYXRoIGQ9Ik0xODEuODMzIDI1Ni40OTJsLTM3LjU2Ni0xMC41MjUtMzUuNTA5LTQwLjUgNDYuMDMzLS40NjggMjcuMDQyIDUxLjQ5MyIgZmlsbD0iIzk5NUI4MCIvPjxwYXRoIGQ9Ik04OS41OTEgMjA4Ljk1bDM4LjMzIDcuNDE3IDIuOTc3LTIuNTY2VjQuMTE3TDEyNy45MjEgMGwtMzguMzMgMTkuMTU4VjIwOC45NSIgZmlsbD0iIzdCM0Y2NSIvPjxwYXRoIGQ9Ik0yNTYgNjQuMDMzTDEyNy45MjUgMHYyMTYuMzY3bDIyLjU5Ny00LjUyOCAzMS4zMTEgNDQuNjUzIDI2LjkwMS01Ni4zMDktLjAxNy0uMDAyTDI1NiAxOTAuNzA4VjY0LjAzMyIgZmlsbD0iI0MxN0I5RCIvPjwvc3ZnPg==';

export const SNS_MESSAGE_ATTRIBUTES_LIMIT = 10;
export const SNS_MESSAGE_BODY_LIMIT = 262144; // 256 KB

export const SNS_PROTOCOL_TYPES = [
  { value: 'http', display_name: 'HTTP' },
  { value: 'https', display_name: 'HTTPS' },
  { value: 'email', display_name: 'Email' },
  { value: 'email-json', display_name: 'Email (JSON)' },
  { value: 'sms', display_name: 'SMS' },
  { value: 'sqs', display_name: 'SQS' },
  { value: 'application', display_name: 'Application' },
  { value: 'lambda', display_name: 'Lambda' },
  { value: 'firehose', display_name: 'Firehose' },
];

export const SNS_MESSAGE_STRUCTURE_TYPES = [
  { value: 'json', display_name: 'JSON' },
  { value: 'String', display_name: 'String' },
];
