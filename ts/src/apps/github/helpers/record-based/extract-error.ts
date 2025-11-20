export const extractGitHubErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data) {
    const data = error.response.data;

    if (data.message && data.errors && Array.isArray(data.errors)) {
      const errorMessages = data.errors
        .map((err: any) => {
          if (typeof err === 'string') return err;
          if (err.message) return err.message;
          if (err.code) return `${err.code}: ${err.field || 'unknown field'}`;
          return JSON.stringify(err);
        })
        .join('; ');
      return `${data.message} - ${errorMessages}`;
    }

    if (data.message) {
      return data.message;
    }

    if (typeof data === 'string') {
      return data;
    }
  }

  if (error?.message) {
    return error.message;
  }

  return String(error);
};

export const extractGitHubErrorCode = (error: any): string | undefined => {
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    const firstError = error.response.data.errors[0];
    if (firstError?.code) {
      return firstError.code;
    }
  }

  if (error?.code) {
    return error.code;
  }

  return undefined;
};

export type TGitHubRateLimitInfo = {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
};

export const extractRateLimitInfo = (error: any): TGitHubRateLimitInfo | null => {
  const headers = error?.response?.headers;
  if (!headers) return null;

  const limit = headers['x-ratelimit-limit'];
  const remaining = headers['x-ratelimit-remaining'];
  const reset = headers['x-ratelimit-reset'];
  const used = headers['x-ratelimit-used'];

  if (limit || remaining || reset || used) {
    return {
      limit: limit ? parseInt(limit, 10) : 0,
      remaining: remaining ? parseInt(remaining, 10) : 0,
      reset: reset ? parseInt(reset, 10) : 0,
      used: used ? parseInt(used, 10) : 0,
    };
  }

  return null;
};

export const getTimeUntilReset = (resetTimestamp: number): number => {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, resetTimestamp - now);
};

export const isRateLimitError = (error: any): boolean => {
  const status = error?.response?.status;
  return status === 403 || status === 429;
};

export const shouldRetryAfterDelay = (error: any, maxWaitSeconds: number = 300): boolean => {
  if (!isRateLimitError(error)) {
    return false;
  }

  const rateLimitInfo = extractRateLimitInfo(error);
  if (!rateLimitInfo) {
    return true;
  }

  const timeUntilReset = getTimeUntilReset(rateLimitInfo.reset);
  return timeUntilReset <= maxWaitSeconds;
};
