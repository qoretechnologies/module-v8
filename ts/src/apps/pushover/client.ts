
/**
 * Pushover API Client
 *
 * Extends QoreApiClient with Pushover-specific configuration:
 * - Authentication via POST body parameters (token, user) instead of headers
 * - Custom postWithAuth() method to inject credentials into body
 * - No pagination needed for these endpoints
 */

import { QoreApiClient, BaseRequestOptions } from '../../global/helpers/QoreApiClient';
import { PUSHOVER_APP_NAME, PUSHOVER_BASE_URL, PushoverError } from './constants';

/**
 * Pushover API response structure
 */
export interface PushoverResponse {
  status: number;
  request: string;
  errors?: string[];
  receipt?: string;
  devices?: string[];
  licenses?: string[];
  group?: number;
}

/**
 * Options for Pushover requests with authentication
 */
export interface PushoverRequestOptions extends Omit<BaseRequestOptions, 'token'> {
  /** Pushover application API token */
  appToken: string;
  /** Pushover user key */
  userKey: string;
}

export class PushoverApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: PUSHOVER_BASE_URL,
      appName: PUSHOVER_APP_NAME,
    });
  }

  /**
   * Pushover doesn't use header-based auth - return empty headers
   */
  protected buildHeaders(
    _token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    return customHeaders || {};
  }

  /**
   * POST with Pushover authentication - injects token and user into body
   *
   * Pushover requires authentication credentials to be sent in the POST body,
   * not in headers. This method handles that pattern.
   */
  async postWithAuth<ResponseType extends PushoverResponse = PushoverResponse>(
    path: string,
    body: Record<string, any>,
    options: PushoverRequestOptions
  ): Promise<ResponseType> {
    const { appToken, userKey, ...restOptions } = options;

    // Inject auth credentials into body (Pushover's pattern)
    const authBody = {
      token: appToken,
      user: userKey,
      ...body,
    };

    const response = await this.post<ResponseType>(path, authBody, restOptions);

    // Pushover returns status: 1 for success, status: 0 for failure
    if (response?.status !== 1) {
      const errors = response?.errors?.join(', ') || 'Unknown error';
      throw new PushoverError(`Pushover API error: ${errors}`);
    }

    return response;
  }
}

// Export singleton instance
export const pushoverClient = new PushoverApiClient();
