export class IntercomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IntercomError';
  }
}
