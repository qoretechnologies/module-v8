export class FirestoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirestoreError';
  }
}

export const FIRESTORE_APP_NAME = 'Firestore';

export const FIRESTORE_APP_LOGO = '';

export const getFirestoreErrorMessage = (error: any) => {
  if (!error?.message) {
    return error?.toString() || 'An unknown error occurred';
  }

  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error.message.trim().startsWith('{')) {
    try {
      const errorData = JSON.parse(error.message);
      return errorData.error?.message || error.message;
    } catch (e) {
      return error.message;
    }
  }

  return error.message;
};
