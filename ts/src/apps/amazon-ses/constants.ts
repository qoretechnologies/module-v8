export class AmazonSESError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonSESError';
  }
}

export const AMAZON_SES_APP_NAME = 'AmazonSES';
export const AMAZON_SES_APP_LOGO = `PHN2ZyB3aWR0aD0iMjE0MCIgaGVpZ2h0PSIyNTAwIiB2aWV3Qm94PSIwIDAgMjU2IDI5OSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PHBhdGggZD0iTTYwLjU1NiA0Ny42MDJMMCAxNDQuMDFsNjAuNTU2IDk2LjQyNCAxLjA1Ni0uNzUzTDYwLjgzNyA0Ny44bC0uMjgxLS4xOTgiIGZpbGw9IiM4NzY5MjkiLz48cGF0aCBkPSJNMTI4LjE4NyAyMjMuMTA1bC02Ny42MzEgMTcuMzI5VjQ3LjYwMmw2Ny42MzEgMTcuMzI1djE1OC4xNzgiIGZpbGw9IiNEOUE3NDEiLz48cGF0aCBkPSJNMjU1Ljk3OSA3MS44NjhsLTMyLjYgNS4zOTFMMTQ4LjUzOCAwbC0zNy4yMDcgMTYuMjkyIDQuOTA4IDkuMTUzLTI2LjMzMyAxMC41MjZ2MjQzLjQyOGwzOC4yOCAxOS4xNTMuNjM3LS40OTktLjU4OS0yNTAuMjM1IDgxLjE0MiAxMjIuOTY4IDQ2LjYwMy05OC45MTgiIGZpbGw9IiM4NzY5MjkiLz48cGF0aCBkPSJNMTQ4LjUzOCAwbDk5LjY3OSA0OS44MzctMzkuNDE3IDcxLjUyTDE0OC41MzggMCIgZmlsbD0iI0Q5QTc0MSIvPjxwYXRoIGQ9Ik0yNTUuOTc1IDcxLjg2OEwyNTYgMjM0LjU5NmwtMTI3LjgxMyA2My45NTYtLjAxNy0yNzcuODY5IDgwLjYzIDE0Ni4yOTEgNDcuMTc1LTk1LjEwNiIgZmlsbD0iI0Q5QTc0MSIvPjwvc3ZnPg==`;

export const SES_MESSAGE_SOURCES = [
  { value: 'MAIL_FROM_DOMAIN', display_name: 'Mail From Domain' },
  { value: 'EMAIL_ADDRESS', display_name: 'Email Address' },
];

export const SES_BOUNCE_TYPES = [
  { value: 'Undetermined', display_name: 'Undetermined' },
  { value: 'Permanent', display_name: 'Permanent' },
  { value: 'Transient', display_name: 'Transient' },
];

export const SES_COMPLAINT_TYPES = [
  { value: 'abuse', display_name: 'Abuse' },
  { value: 'auth-failure', display_name: 'Authentication Failure' },
  { value: 'fraud', display_name: 'Fraud' },
  { value: 'not-spam', display_name: 'Not Spam' },
  { value: 'other', display_name: 'Other' },
  { value: 'virus', display_name: 'Virus' },
];
