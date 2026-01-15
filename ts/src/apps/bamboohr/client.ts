/**
 * BambooHR API Client
 *
 * Extends QoreApiClient with BambooHR-specific configuration:
 * - Basic Auth (API key as username, 'x' as password)
 * - Dynamic path formatting with company domain: /{companyDomain}/v1/{path}
 * - Accept header set to application/json
 * - File upload/download support for employee and company files
 *
 * @see https://documentation.bamboohr.com/reference
 */

import { QoreApiClient, BaseRequestOptions } from '../../global/helpers/QoreApiClient';
import { BAMBOOHR_APP_NAME, BAMBOOHR_BASE_URL } from './constants';
import { IBambooHRConnectionOptions, TQoreFile } from './types';

export class BambooHRApiClient extends QoreApiClient {
  constructor() {
    super({
      baseUrl: BAMBOOHR_BASE_URL,
      appName: BAMBOOHR_APP_NAME,
    });
  }

  /**
   * BambooHR uses Basic Auth with API key as username and 'x' as password.
   * Also sets Accept header to application/json.
   */
  protected buildHeaders(
    token?: string,
    customHeaders?: Record<string, string>
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    // Token is the API key - use Basic Auth
    if (token) {
      const credentials = Buffer.from(`${token}:x`).toString('base64');
      headers.Authorization = `Basic ${credentials}`;
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Override get to include company domain in path.
   */
  async get<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return super.get<ResponseType>(this.formatPathWithOptions(path, options), options);
  }

  /**
   * Override post to include company domain in path.
   */
  async post<ResponseType = unknown>(
    path: string,
    body?: unknown,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return super.post<ResponseType>(this.formatPathWithOptions(path, options), body, options);
  }

  /**
   * Helper to format path with company domain.
   * Transforms path to include: /{companyDomain}/v1/{path}
   */
  private formatPathWithOptions(path: string, options?: BaseRequestOptions): string {
    const clean = path.trim().replace(/^\/+/, '').replace(/\/+$/, '');
    const companyDomain = options?.connectionOptions?.company_domain;

    if (!companyDomain) {
      return clean;
    }

    // Return the full path including company domain - base class will prepend baseUrl
    return `${companyDomain}/v1/${clean}`;
  }

  /**
   * BambooHR returns items in 'employees' for most list endpoints.
   */
  protected getDefaultItemsPath(): string {
    return 'employees';
  }

  /**
   * Override delete to include company domain in path.
   */
  async delete<ResponseType = unknown>(
    path: string,
    options?: BaseRequestOptions
  ): Promise<ResponseType> {
    return super.delete<ResponseType>(this.formatPathWithOptions(path, options), options);
  }

  /**
   * Upload a file to BambooHR using multipart/form-data.
   * Used for employee and company file uploads.
   *
   * @param path - API path (e.g., 'employees/123/files' or 'files')
   * @param file - File to upload (TQoreFile format with base64 content)
   * @param formFields - Additional form fields (category, share, etc.)
   * @param options - Request options including token and connection options
   * @returns Response from BambooHR API
   */
  async uploadFile<ResponseType = unknown>(
    path: string,
    file: TQoreFile,
    formFields: Record<string, string>,
    options: BaseRequestOptions
  ): Promise<ResponseType> {
    const fullPath = this.formatPathWithOptions(path, options);
    const headers = this.buildHeaders(options.token);

    // Decode base64 content to Buffer
    const fileBuffer = Buffer.from(file.content, 'base64');

    // Build multipart form data manually
    const boundary = `----BambooHRFormBoundary${Date.now()}`;
    const parts: Buffer[] = [];

    // Add form fields
    for (const [key, value] of Object.entries(formFields)) {
      parts.push(
        Buffer.from(
          `--${boundary}\r\n` +
            `Content-Disposition: form-data; name="${key}"\r\n\r\n` +
            `${value}\r\n`
        )
      );
    }

    // Add file field and closing boundary
    parts.push(
      Buffer.from(
        `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n` +
          `Content-Type: ${file.mime_type || 'application/octet-stream'}\r\n\r\n`
      ),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    );

    const body = Buffer.concat(parts);

    const response = await fetch(`${BAMBOOHR_BASE_URL}/${fullPath}`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length.toString(),
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BambooHR upload failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Return empty object for successful uploads (BambooHR returns 201 with no body)
    // or parse JSON if available
    const text = await response.text();
    if (text) {
      try {
        return JSON.parse(text) as ResponseType;
      } catch {
        return { message: 'File uploaded successfully' } as ResponseType;
      }
    }

    // For 201 responses, return the Location header if available
    const location = response.headers.get('Location');
    if (location) {
      const fileIdMatch = /\/(\d+)$/.exec(location);
      if (fileIdMatch) {
        return { id: fileIdMatch[1], message: 'File uploaded successfully' } as ResponseType;
      }
    }

    return { message: 'File uploaded successfully' } as ResponseType;
  }

  /**
   * Download a file from BambooHR.
   * Returns the file content as base64-encoded string.
   *
   * @param path - API path (e.g., 'employees/123/files/456' or 'files/789')
   * @param options - Request options including token and connection options
   * @returns File content and metadata
   */
  async downloadFile(
    path: string,
    options: BaseRequestOptions
  ): Promise<{ content: string; mime_type: string; name?: string }> {
    const fullPath = this.formatPathWithOptions(path, options);
    const headers = this.buildHeaders(options.token);

    const response = await fetch(`${BAMBOOHR_BASE_URL}/${fullPath}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`BambooHR download failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Get content type and filename from headers
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename: string | undefined;

    if (contentDisposition) {
      const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (filenameMatch) {
        filename = filenameMatch[1].replaceAll(/['"]/g, '');
      }
    }

    // Convert response to base64
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString('base64');

    return {
      content,
      mime_type: contentType,
      name: filename,
    };
  }
}

// Export singleton instance
export const bambooHRClient = new BambooHRApiClient();

/**
 * Helper type for extracting connection options from context.
 */
export type TBambooHRClientOptions = {
  token: string;
  connectionOptions: IBambooHRConnectionOptions;
};
