import { createAction, OAuth2PropertyValue, PieceAuthProperty, Property } from '../../framework';
import { assertNotNullOrUndefined } from '../../shared/common';
import { HttpError, HttpHeaders, HttpMethod, HttpRequest, QueryParams, httpClient } from '../http';

export const getAccessTokenOrThrow = (auth: OAuth2PropertyValue | undefined): string => {
  const accessToken = auth?.access_token;

  if (accessToken === undefined) {
    throw new Error('Invalid bearer token');
  }

  return accessToken;
};

export function createCustomApiCallAction({
  auth,
  baseUrl,
  authMapping,
  description,
  displayName,
  name,
}: {
  auth?: PieceAuthProperty;
  baseUrl: (auth?: unknown) => string;
  authMapping?: (auth: unknown) => Promise<HttpHeaders>;
  //   add description as a parameter that can be null
  description?: string | null;
  displayName?: string | null;
  name?: string | null;
}) {
  return createAction({
    name: name ? name : 'custom_api_call',
    displayName: displayName ? displayName : 'Custom API Call',
    description: description ? description : 'Make a custom API call to a specific endpoint',
    auth: auth ? auth : undefined,
    requireAuth: auth ? true : false,
    props: {
      // Changed the url option type to a string for better UX, check if it will be alright for future apps and actions
      // url: Property.DynamicProperties({
      //   displayName: 'URL',
      //   required: true,
      //   refreshers: [],
      //   defaultValue: baseUrl.length ? undefined : baseUrl(),
      //   props: async ({ auth }) => {
      //     return {
      //       url: Property.ShortText({
      //         displayName: 'URL',
      //         description: 'The full URL to use, including the base URL',
      //         required: true,
      //         defaultValue: baseUrl(auth),
      //       }),
      //     };
      //   },
      // }),
      url: Property.ShortText({
        displayName: 'URL',
        required: true,
        defaultValue: baseUrl.length ? undefined : baseUrl(),
      }),
      method: Property.StaticDropdown({
        displayName: 'Method',
        required: true,
        options: {
          options: Object.values(HttpMethod).map((v) => {
            return {
              label: v,
              value: v,
            };
          }),
        },
      }),
      headers: Property.Object({
        displayName: 'Headers',
        description: 'Authorization headers are injected automatically from your connection.',
        required: false,
      }),
      queryParams: Property.Object({
        displayName: 'Query Parameters',
        required: false,
      }),
      body: Property.Json({
        displayName: 'Body',
        required: false,
      }),
      failsafe: Property.Checkbox({
        displayName: 'No Error on Failure',
        required: false,
      }),
      timeout: Property.Number({
        displayName: 'Timeout (in seconds)',
        required: false,
      }),
    },

    run: async (context) => {
      const { method, url, headers, queryParams, body, failsafe, timeout } = context.propsValue;
      assertNotNullOrUndefined(method, 'Method');
      assertNotNullOrUndefined(url, 'URL');

      let headersValue = headers as HttpHeaders;
      if (authMapping) {
        const headers = await authMapping(context.auth);
        if (headers) {
          headersValue = {
            ...headersValue,
            ...headers,
          };
        }
      }

      const request: HttpRequest<Record<string, unknown>> = {
        method,
        url,
        headers: headersValue,
        queryParams: queryParams as QueryParams,
        timeout: timeout ? timeout * 1000 : 0,
      };

      if (body) {
        request.body = body;
      }

      try {
        return await httpClient.sendRequest(request);
      } catch (error) {
        if (failsafe) {
          return (error as HttpError).errorMessage();
        }
        throw error;
      }
    },
  });
}
