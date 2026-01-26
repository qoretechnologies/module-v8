import { BaseRequestOptions, QoreApiClient } from '../../global/helpers/QoreApiClient';
import { OPEN_WEATHER_MAP_API_URL, OPEN_WEATHER_MAP_APP_NAME } from './constants';

/**
 * OpenWeatherMap API Client
 *
 * OpenWeatherMap uses API key authentication via query parameter (appid).
 * This client automatically adds the API key to all requests.
 */
class OpenWeatherMapApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: OPEN_WEATHER_MAP_API_URL,
      appName: OPEN_WEATHER_MAP_APP_NAME,
    });
  }

  /**
   * OpenWeatherMap doesn't use Authorization headers.
   * The API key is passed as a query parameter instead.
   */
  protected buildHeaders(
    _token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
  }

  /**
   * Format path to ensure /data/2.5/ prefix
   */
  protected formatPath(path: string): string {
    let formattedPath = path.trim().replace(/^\/+/, '');

    if (!formattedPath.startsWith('data/')) {
      formattedPath = `data/2.5/${formattedPath}`;
    }

    return `/${formattedPath}`;
  }

  /**
   * Override get to add API key to query parameters
   */
  async get<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    const params = {
      ...options?.params,
      appid: options?.token,
    };

    return super.get<ResponseType>(path, {
      ...options,
      params,
    });
  }
}

export const openWeatherMapClient = new OpenWeatherMapApiClient();
