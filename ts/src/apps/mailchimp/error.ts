export class MailchimpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MailchimpError';
  }
}
