/**
 * Freshdesk API Client
 *
 * Extends QoreApiClient with Freshdesk-specific configuration:
 * - Dynamic base URL from subdomain (https://{subdomain}.freshdesk.com)
 * - Bearer token authentication (API key encoded as base64)
 *
 * Copyright 2026 Qore Technologies, s.r.o.
 */

import { QoreApiClient, RequestOptions } from '../../global/helpers/QoreApiClient';
import { FRESHDESK_APP_NAME } from './constants';

export class FreshdeskApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: '', // Dynamic, resolved per-request from connectionOptions.subdomain
      appName: FRESHDESK_APP_NAME,
    });
  }

  /**
   * Build base URL from subdomain connection option
   */
  protected getBaseUrl(options: RequestOptions): string {
    const subdomain = options?.connectionOptions?.subdomain;

    if (subdomain) {
      return `https://${subdomain}.freshdesk.com`;
    }

    return options?.baseUrl || '';
  }
}

// Export singleton instance
export const freshdeskClient = new FreshdeskApiClient();
