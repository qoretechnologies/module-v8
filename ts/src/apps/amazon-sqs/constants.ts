export const AMAZON_SQS_APP_NAME = 'AmazonSQS';
export const AMAZON_SQS_APP_LOGO = `PHN2ZyB3aWR0aD0iMjA3MSIgaGVpZ2h0PSIyNTAwIiB2aWV3Qm94PSIwIDAgMjU2IDMwOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PHBhdGggZD0iTTI1NS45OTEgMTAwLjIxMWwtNC4xMTItLjA2OS0xMjMuNzkyLTM2LjY1LS4wNzQtMS42OTZWMEwyNTYgNjQuMDA2bC0uMDA5IDM2LjIwNSIgZmlsbD0iI0Q5QTc0MSIvPjxwYXRoIGQ9Ik0xMjggNjUuNWwuMDEzLTY1LjVMLjAxNyA2My45ODEgMCAyNDQuOTk2bC4wNjQuMDMydi4wMDJsMTI3LjkyMyA2My45NzMuNDI1LS41OTEtLjE2NS02MC44NzEtLjI1MS0uMzM5TDEyMCAyNDEuNSAyMSAyMTJsLjUtMTE0LjUgMTA2LjUtMzIiIGZpbGw9IiM4NzY5MjkiLz48cGF0aCBkPSJNMTQ3LjE0MSAxOTUuMjk4bC0xMzAuNzkgMTguMzk5LjAwOS0xMTguNDE3IDEzMC43OSAxOC40MjQtLjAwOSA4MS41OTQiIGZpbGw9IiNEOUE3NDEiLz48cGF0aCBkPSJNODAuODY0IDE4Ny44MTNsNDcuMTMyIDYgLjAwOC03OC42NTgtNDcuMTMxIDUuOTk1LS4wMDkgNjYuNjYzTTMzLjM4NSAxODEuNzcxbDMwLjU4NyAzLjg4OC4wMDktNjIuMzYzLTMwLjU5NiAzLjg5N3Y1NC41NzgiIGZpbGw9IiM4NzY5MjkiLz48cGF0aCBkPSJNMTYuMzYgOTUuMjhsMTExLjY1My0zMy40ODQgMTI3Ljk3OCAzOC40MTUtMTA4Ljc2IDEzLjUwMkwxNi4zNiA5NS4yOCIgZmlsbD0iIzYyNEExRSIvPjxwYXRoIGQ9Ik0yNTUuOTI3IDE3Ny4zNzZsLTEyNy45MzEgMTYuMTQ1LjAwOC03OC4zNjYgMTI3LjkyMyAxNi4yOTZ2NDUuOTI1TTI1NS45MTggMjA4LjgzNGwtMi43NTMuMTE5LTEyNC43NzYgMzcuNzctLjM5My40NzktLjAwOSA2MS44MDEgMTI3LjkzMS02My45NTF2LTM2LjIxOCIgZmlsbD0iI0Q5QTc0MSIvPjxwYXRoIGQ9Ik0xNi4zNTEgMjEzLjY5N2wxMTEuNjQ1IDMzLjUwNSAxMjcuOTIyLTM4LjM2OC0xMDguNzc3LTEzLjUzNi0xMzAuNzkgMTguMzk5IiBmaWxsPSIjRkFENzkxIi8+PC9zdmc+`;

export class AmazonSQSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonSQSError';
  }
}

export const SQS_MESSAGE_ATTRIBUTES = [
  { value: 'String', display_name: 'String' },
  { value: 'Number', display_name: 'Number' },
  { value: 'Binary', display_name: 'Binary' },
];

export const SQS_QUEUE_TYPES = [
  { value: 'Standard', display_name: 'Standard Queue' },
  { value: 'FIFO', display_name: 'FIFO Queue' },
];

export const SQS_CONTENT_BASED_DEDUPLICATION = [
  { value: 'true', display_name: 'Enable' },
  { value: 'false', display_name: 'Disable' },
];

export const SQS_VISIBILITY_TIMEOUT_RANGE = {
  min: 0,
  max: 43200, // 12 hours in seconds
};

export const SQS_MESSAGE_RETENTION_PERIOD_RANGE = {
  min: 60, // 1 minute
  max: 1209600, // 14 days in seconds
};

export const SQS_DELAY_SECONDS_RANGE = {
  min: 0,
  max: 900, // 15 minutes in seconds
};

export const SQS_RECEIVE_MESSAGE_WAIT_TIME_SECONDS_RANGE = {
  min: 0,
  max: 20,
};

export const SQS_MAX_RECEIVE_COUNT_RANGE = {
  min: 1,
  max: 1000,
};
