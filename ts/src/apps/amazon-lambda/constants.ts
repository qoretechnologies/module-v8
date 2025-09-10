export class AmazonLambdaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AmazonLambdaError';
  }
}

export const AMAZON_LAMBDA_APP_NAME = 'AmazonLambda';
export const AMAZON_LAMBDA_APP_LOGO =
  'PHN2ZyB3aWR0aD0iMjA2NSIgaGVpZ2h0PSIyNTAwIiB2aWV3Qm94PSIwIDAgMjU2IDMxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+PHBhdGggZD0iTTAgMjQ1LjI2MmwxNi4zMjIgOC4xNjFMMTkgMjQ4LjY2OFY1OS4zMzNsLTIuNjc4LTMuNDk0TDAgNjR2MTgxLjI2MiIgZmlsbD0iIzlENTAyNSIvPjxwYXRoIGQ9Ik00Ny42NzggNjMuNTdsLTMxLjM1Ni03LjczMXYxOTcuNTg0bDMxLjM1Ni03LjMwMlY2My41NyIgZmlsbD0iI0Y2ODUzNiIvPjxwYXRoIGQ9Ik0xNDMuODkzIDc4LjYwNGwyMi4zMzUtMTEuNTk3IDc0LjMwOSAyOC43NzgtMTkuNzU4IDIuNTc3LTc2Ljg4Ni0xOS43NTgiIGZpbGw9IiM2QjNBMTkiLz48cGF0aCBkPSJNMTQ0Ljc1MiAyMzAuNjU4bDIxLjkwNiAxMS41OTcgNzQuMzA4LTI4Ljc3OC0xOS43NTgtMi41NzgtNzYuNDU2IDE5Ljc1OSIgZmlsbD0iI0ZCQkY5MyIvPjxwYXRoIGQ9Ik0xNTAuMzM2IDE5OC44NzJsMzkuMDg3IDUuMTU1IDIuMjQ0LTQuMDI3di05MGwtMi4yNDQtNC43NjUtMzkuMDg3IDUuMTU0djg4LjQ4M00zNS42NTEgNDUuOTZsMjQuMDU0LTEyLjAyN0w2Mi4zMzMgMzl2MjMxbC0yLjYyOCA1LjMyOS0yNC4wNTQtMTIuMDI3VjQ1Ljk2IiBmaWxsPSIjOUQ1MDI1Ii8+PHBhdGggZD0iTTEwOC42NzEgMjU5LjAwN2wtNDguOTY2IDE1Ljg5MlYzMy45MzNsNDguOTY2IDE1Ljg5M3YyMDkuMTgxIiBmaWxsPSIjRjY4NTM2Ii8+PHBhdGggZD0iTTg5Ljc3MiAyODkuOTMzTDEyOCAzMDkuMjYybDQtNC41OTV2LTI5OUwxMjggMCA4OS43NzIgMTkuMzI5djI3MC42MDRNMjE5LjkxOSA5OC4zNjJsMTkuNzU5LTIuNTc3IDEuNjk3IDIuNDY1VjIxMWwtMS42OTcgMi45MDYtMTkuNzU5LTIuNTc3Vjk4LjM2MiIgZmlsbD0iIzlENTAyNSIvPjxwYXRoIGQ9Ik0xODkuNDIzIDEwNS4yMzV2OTkuMjIxbDQwLjgwNS00OS44MjUtNDAuODA1LTQ5LjM5NiIgZmlsbD0iI0Y2ODUzNiIvPjxwYXRoIGQ9Ik0yMzkuNjc4IDU1LjgzOUwxMjggMHYzMDkuMjYybDEyOC02NFY2NGwtMTYuMzIyLTguMTYxem0wIDE1OC4yMTdsLTczLjQ1IDIxLjkzNlY3My4yN2w3My40NSAyMS45MzZ2MTE4Ljg1eiIgZmlsbD0iI0Y2ODUzNiIvPjwvc3ZnPg==';

export const LAMBDA_RUNTIME_OPTIONS = [
  { value: 'nodejs20.x', display_name: 'Node.js 20.x' },
  { value: 'nodejs18.x', display_name: 'Node.js 18.x' },
  { value: 'nodejs16.x', display_name: 'Node.js 16.x' },
  { value: 'python3.12', display_name: 'Python 3.12' },
  { value: 'python3.11', display_name: 'Python 3.11' },
  { value: 'python3.10', display_name: 'Python 3.10' },
  { value: 'python3.9', display_name: 'Python 3.9' },
  { value: 'python3.8', display_name: 'Python 3.8' },
  { value: 'java21', display_name: 'Java 21' },
  { value: 'java17', display_name: 'Java 17' },
  { value: 'java11', display_name: 'Java 11' },
  { value: 'java8', display_name: 'Java 8' },
  { value: 'dotnet8', display_name: '.NET 8' },
  { value: 'dotnet6', display_name: '.NET 6' },
  { value: 'go1.x', display_name: 'Go 1.x' },
  { value: 'ruby3.2', display_name: 'Ruby 3.2' },
  { value: 'ruby3.1', display_name: 'Ruby 3.1' },
  { value: 'provided.al2023', display_name: 'Custom Runtime on Amazon Linux 2023' },
  { value: 'provided.al2', display_name: 'Custom Runtime on Amazon Linux 2' },
];

export const LAMBDA_ARCHITECTURE_OPTIONS = [
  { value: 'x86_64', display_name: 'x86_64' },
  { value: 'arm64', display_name: 'ARM64' },
];

export const LAMBDA_INVOCATION_TYPE_OPTIONS = [
  { value: 'RequestResponse', display_name: 'Synchronous (RequestResponse)' },
  { value: 'Event', display_name: 'Asynchronous (Event)' },
  { value: 'DryRun', display_name: 'Dry Run (Validate only)' },
];

export const LAMBDA_LOG_TYPE_OPTIONS = [
  { value: 'None', display_name: 'None' },
  { value: 'Tail', display_name: 'Tail (Last 4KB)' },
];
