export const BUSINESS_CENTRAL_APP_NAME = 'BusinessCentral';
export const BUSINESS_CENTRAL_APP_MODULE = 'CdsRestDataProvider';

export class BusinessCentralError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Microsoft Business Central Error';
  }
}
