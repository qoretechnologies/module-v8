export const FRONT_APP_NAME = 'Front';
export const FRONT_APP_LOGO =
  'PHN2ZyB3aWR0aD0iMTMwIiBoZWlnaHQ9IjEzMCIgdmlld0JveD0iMCAwIDEzMCAxMzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0yMC4wMjQyIDEwOC45NzhINDkuODA5VjUwLjA2MTZIMTA5LjE5NFYyMC4zOTg3SDIwLjAyNDJWMTA4Ljk3OFoiIGZpbGw9IiNBODU3RjEiLz4KPHBhdGggZD0iTTgzLjUwNiAxMTAuNzVDOTguMzQ1MyAxMTAuNzUgMTEwLjM3NSA5OC43MTk5IDExMC4zNzUgODMuODgwNUMxMTAuMzc1IDY5LjA0MTEgOTguMzQ1MyA1Ny4wMTE1IDgzLjUwNiA1Ny4wMTE1QzY4LjY2NjYgNTcuMDExNSA1Ni42MzcgNjkuMDQxMSA1Ni42MzcgODMuODgwNUM1Ni42MzcgOTguNzE5OSA2OC42NjY2IDExMC43NSA4My41MDYgMTEwLjc1WiIgZmlsbD0iI0E4NTdGMSIvPgo8L3N2Zz4K';

export class FrontError extends Error {
  public errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = 'FrontError';
    this.errorCode = errorCode;
  }
}

export const extractFrontErrorMessage = (error: any): string => {
  return error?.message || error;
};
