import { QorusRequest } from '@qoretechnologies/ts-toolkit';
import {
  MONDAY_API_VERSION,
  MONDAY_APP_NAME,
  MONDAY_MAX_PAGE_SIZE,
  MondayError,
} from '../constants';

export type TMondayApiDynamicOptions = { [key: string]: any };

type TCallMondayApiOptions = {
  query: string;
  variables?: TMondayApiDynamicOptions;
  token: string;
};

export const callMondayAPI = async <ResponseType = unknown>(
  options: TCallMondayApiOptions
): Promise<ResponseType> => {
  const { query, token } = options;

  const response = await QorusRequest.post<{ data: ResponseType }>(
    {
      path: '/v2',
      headers: {
        Authorization: `Bearer ${token}`,
        'API-Version': MONDAY_API_VERSION,
      },
      data: {
        query,
        ...(options.variables && { variables: options.variables }),
      },
    },
    {
      url: 'https://api.monday.com',
      endpointId: MONDAY_APP_NAME,
    }
  );

  const responseData = response?.data;

  if (!responseData) {
    throw new Error(`No data returned from monday.com API for the given query: ${query}`);
  }

  return responseData;
};

type TFetchAllMondayPagesOptions = {
  token: string;
  /** the root field the query selects, and the key the rows are read back from */
  collection: string;
  /** builds the query text for one page; receives the page size and the 1-based page number */
  buildQuery: (limit: number, page: number) => string;
  /** defaults to {@link MONDAY_MAX_PAGE_SIZE} */
  pageSize?: number;
};

/**
 * Reads every page of one of monday's paged root queries.
 *
 * These queries (`users`, `boards`, ...) are page-based, not cursor-based: pages are numbered from
 * 1 and there is no cursor and no total count, so the only end-of-collection signal is a page
 * shorter than `limit`. A collection whose size is an exact multiple of the page size therefore
 * costs one extra, empty request — that request is what proves the collection is exhausted.
 *
 * Every caller must go through this rather than issuing a bare selection: monday defaults an
 * omitted `limit` to a small number (200 for `users`, 25 for `boards`) and reports no error when it
 * truncates, so an unpaged selection silently returns a prefix of the collection.
 *
 * An absent collection is an error, never an empty result — GraphQL renders an empty list as `[]`,
 * so a missing key means the field was not resolved and returning `[]` for it would turn a failed
 * request into an empty picker.
 */
export const fetchAllMondayPages = async <RowType>(
  options: TFetchAllMondayPagesOptions
): Promise<RowType[]> => {
  const { token, collection, buildQuery, pageSize = MONDAY_MAX_PAGE_SIZE } = options;

  const rows: RowType[] = [];

  for (let page = 1; ; ++page) {
    const response = await callMondayAPI<{ data: Record<string, RowType[] | undefined> }>({
      query: buildQuery(pageSize, page),
      token,
    });

    const pageRows = response.data?.[collection];

    if (!pageRows) {
      throw new MondayError(
        `no "${collection}" collection returned from the monday.com API on page ${page}`
      );
    }

    rows.push(...pageRows);

    if (pageRows.length < pageSize) {
      return rows;
    }
  }
};
