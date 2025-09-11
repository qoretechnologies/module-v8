export class AmazonCloudWatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonCloudWatchError';
  }
}

export const AMAZON_CLOUDWATCH_APP_NAME = 'AmazonCloudWatch';
export const AMAZON_CLOUDWATCH_APP_LOGO =
  'PHN2ZyB3aWR0aD0iMjIwNyIgaGVpZ2h0PSIyNTAwIiB2aWV3Qm94PSIwIDAgMjU2IDI5MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PHBhdGggZD0iTTI1NiAxOTkuMzA1bC0xMjcuOTU3LTE4Ljc5N0wwIDE5OS4zMjlsMTI4LjAxIDQ3LjQzOUwyNTYgMTk5LjMwNSIgZmlsbD0iI0I3Q0E5RCIvPjxwYXRoIGQ9Ik0yNS42MjEgMTk3LjExM2wyMS42MyA2Ljc2MSAxLjk3MS0yLjIzOFY1MC4yODRsLTEuOTcxLTIuNTg1LTIxLjYzIDguMjc0djE0MS4xNCIgZmlsbD0iIzRCNjEyQyIvPjxwYXRoIGQ9Ik0xMjMuODMyIDE5MC40MjNsLTc2LjU4MSAxMy40NTFWNDcuNzAzbDc2LjU4MSAxNy4yMjJ2MTI1LjQ5OCIgZmlsbD0iIzc1OUMzRSIvPjxwYXRoIGQ9Ik04OS42ODYgMjE2Ljg4OWwtMjkuODQ4LTkuMjAxVjE0LjkyOEw4OS42ODYuMDA0bDIuNjEyIDIuODQ1djIxMC44NThsLTIuNjEyIDMuMTgyIiBmaWxsPSIjNEI2MTJDIi8+PHBhdGggZD0iTTE5MS45NjcgMTkyLjg5NEw4OS42ODYgMjE2Ljg4OVYwbDEwMi4yODEgMzkuODY2djE1My4wMjgiIGZpbGw9IiM3NTlDM0UiLz48cGF0aCBkPSJNMTI3Ljk2NSAyNDQuNzE0TDAgMTk5LjMyOXYyNi4zMjRsMTI3Ljk2NSA2My45ODN2LTQ0LjkyMiIgZmlsbD0iIzRCNjEyQyIvPjxwYXRoIGQ9Ik0yNTYgMjI1LjYyMmwtMTI4LjAzNSA2NC4wMTR2LTQ0LjkyMkwyNTYgMTk5LjMwNXYyNi4zMTciIGZpbGw9IiM3NTlDM0UiLz48cGF0aCBkPSJNMjIwLjAzOSAxNTUuNjkyaC0zMS4wMjZsLTg4LjQ0NSA2LjAyNkwxMjggMTY2Ljc3NWw5Mi4wMzktMTEuMDgzIiBmaWxsPSIjQjdDQTlEIi8+PHBhdGggZD0iTTEwMC41NjggMjE5LjkwNmwyNy40MiA4LjIyNi43ODktLjg0OS0uMDIzLTYxLjg0OS0uNzg5LS43NTgtMjcuMzk3LTIuOTU4djU4LjE4OCIgZmlsbD0iIzRCNjEyQyIvPjxwYXRoIGQ9Ik0yMjAuMDM5IDE1NS42OTJsLTkyLjA3NCA4Ljk4LjAyMyA2My40NiA5Mi4wNTEtMjcuNzExdi00NC43MjkiIGZpbGw9IiM3NTlDM0UiLz48L3N2Zz4=';

export const CLOUDWATCH_ALARM_STATES = [
  { value: 'OK', display_name: 'OK' },
  { value: 'ALARM', display_name: 'ALARM' },
  { value: 'INSUFFICIENT_DATA', display_name: 'INSUFFICIENT_DATA' },
];

export const CLOUDWATCH_STATE_REASONS = [
  { value: 'Threshold Crossed', display_name: 'Threshold Crossed' },
  { value: 'Insufficient Data', display_name: 'Insufficient Data' },
  { value: 'User Update', display_name: 'User Update' },
  { value: 'OK', display_name: 'OK' },
];

export const CLOUDWATCH_COMPARISON_OPERATORS = [
  { value: 'GreaterThanThreshold', display_name: 'Greater Than Threshold' },
  { value: 'GreaterThanOrEqualToThreshold', display_name: 'Greater Than Or Equal To Threshold' },
  { value: 'LessThanThreshold', display_name: 'Less Than Threshold' },
  { value: 'LessThanOrEqualToThreshold', display_name: 'Less Than Or Equal To Threshold' },
];
