import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { toColumnLetter } from './constants';
import { getGoogleSheetHeadersAllowedValues } from '../helpers/get-headers-allowed-values';

const MAX_FETCH_SIZE = 1000;

const options = {
  spreadsheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
    on_change: ['refetch'],
  },
  sheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleSheetIdAllowedValues,
    depends_on: ['spreadsheet_id'],
  },
  limit: {
    required: true,
    type: 'integer',
    default_value: 10,
  },
  offset: {
    required: false,
    type: 'integer',
    default_value: 0,
  },
  search_from_last_row: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
  max_rows_to_search: {
    required: false,
    type: 'integer',
    default_value: 5000,
  },
  response_type: {
    required: true,
    type: 'string',
    default_value: 'raw',
    allowed_values: [
      {
        display_name: 'Raw values only',
        value: 'raw',
        desc: 'Return only raw row values as arrays (most efficient)',
      },
      {
        display_name: 'Header mapped values',
        value: 'mapped-headers',
        desc: 'Return values mapped to column headers',
      },
      {
        display_name: 'Column letter mapped values',
        value: 'mapped-columns',
        desc: 'Return values mapped to column letters (A, B, C, etc.)',
      },
    ],
  },
  search: {
    required: false,
    type: {
      type: 'hash',
      fields: {
        header: {
          required_groups: ['search'],
          get_allowed_values: getGoogleSheetHeadersAllowedValues,
          allowed_values_creatable: true,
          type: 'string',
        },
        column: {
          required_groups: ['search'],
          type: 'string',
        },
        type: {
          required: false,
          preselected: true,
          type: 'string',
          default_value: 'contains',
          allowed_values: [
            {
              display_name: 'Exact match',
              value: 'exact',
            },
            {
              display_name: 'Contains',
              value: 'contains',
            },
          ],
        },
        value: {
          required: true,
          type: 'softstring',
        },
      },
    },
    depends_on: ['spreadsheet_id', 'sheet_id'],
  },
} satisfies TQoreOptions;

const findSpreadsheetRows = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'find_spreadsheet_rows',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id, sheet_id } = getQoreContextRequiredValues({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id', 'sheet_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const search = obj?.search;
    const searchType = search?.type || 'contains';
    const limit = obj?.limit || 10;
    const offset = obj?.offset || 0;
    const searchFromLastRow = obj?.search_from_last_row || false;
    const maxRowsToSearch = obj?.max_rows_to_search || 5000;
    const responseType = obj?.response_type || 'raw';

    if (search && !search.header && !search.column) {
      throw new GoogleSheetsError('Either header or column must be provided in search criteria');
    }

    if (maxRowsToSearch <= 0) {
      throw new GoogleSheetsError('max_rows_to_search must be greater than 0');
    }

    try {
      const sheetsClient = createGoogleSheetsClient(token);

      const spreadsheet = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.properties',
      });

      const sheets = spreadsheet.data.sheets || [];
      const targetSheet = sheets.find((s) => s.properties?.sheetId?.toString() === sheet_id);

      if (!targetSheet) {
        throw new GoogleSheetsError(`Sheet with ID ${sheet_id} not found in spreadsheet`);
      }

      const sheetTitle = targetSheet.properties?.title;

      if (!sheetTitle) {
        throw new GoogleSheetsError(`Could not determine sheet title for sheet ID ${sheet_id}`);
      }

      const metadataResponse = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        ranges: [sheetTitle],
        includeGridData: false,
      });

      const gridProperties = metadataResponse.data.sheets?.[0]?.properties?.gridProperties;
      const totalRowCount = (gridProperties?.rowCount || 0) - 1;
      const columnCount = gridProperties?.columnCount || 0;

      if (totalRowCount <= 0 || columnCount === 0) {
        return createEmptyResponse(responseType, totalRowCount, 0);
      }

      if (!search) {
        const startRow = offset + 2;
        const endRow = startRow + limit - 1;

        const valuesResponse = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: spreadsheet_id,
          range: `${sheetTitle}!A${startRow}:${toColumnLetter(columnCount - 1)}${endRow}`,
          valueRenderOption: 'UNFORMATTED_VALUE',
        });

        const rows = valuesResponse.data.values || [];

        let headers: string[] = [];
        if (responseType === 'mapped-headers') {
          const headersResponse = await sheetsClient.spreadsheets.values.get({
            spreadsheetId: spreadsheet_id,
            range: `${sheetTitle}!1:1`,
          });
          headers = headersResponse.data.values?.[0] || [];
        }

        const rowsWithIndices = rows.map((values, i) => ({
          row_index: startRow + i,
          values,
        }));

        return createResponse({
          headers,
          responseType,
          rows: rowsWithIndices,
          rowsFound: rowsWithIndices.length,
          rowsSearched: rowsWithIndices.length,
          totalRows: totalRowCount,
        });
      }

      let headers = [];
      if (search.header || responseType === 'mapped-headers') {
        const headersResponse = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: spreadsheet_id,
          range: `${sheetTitle}!1:1`,
        });

        headers = headersResponse.data.values?.[0] || [];

        if (headers.length === 0) {
          return createEmptyResponse(responseType, totalRowCount, 0);
        }
      }

      let columnIndex = -1;
      let columnLetter = '';

      if (search.header) {
        columnIndex = headers.findIndex((h) => h === search.header);
        if (columnIndex === -1) {
          throw new GoogleSheetsError(`Header "${search.header}" not found in sheet`);
        }
        columnLetter = toColumnLetter(columnIndex);
      } else if (search.column) {
        columnLetter = search.column.toUpperCase();
        columnIndex = columnLetterToIndex(columnLetter);
      }

      const rowsToSearch = Math.min(totalRowCount, maxRowsToSearch);
      let startRow, endRow;

      if (searchFromLastRow) {
        startRow = totalRowCount - rowsToSearch + 1;
        if (startRow < 1) startRow = 1;
        endRow = totalRowCount;
      } else {
        startRow = 1;
        endRow = rowsToSearch;
      }

      startRow++;
      endRow++;

      const matchingRows: {
        row_index: number;
        values: any[];
      }[] = [];

      for (let chunkStart = startRow; chunkStart <= endRow; chunkStart += MAX_FETCH_SIZE) {
        const chunkEnd = Math.min(chunkStart + MAX_FETCH_SIZE - 1, endRow);

        const searchColumnResponse = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: spreadsheet_id,
          range: `${sheetTitle}!${columnLetter}${chunkStart}:${columnLetter}${chunkEnd}`,
          valueRenderOption: 'UNFORMATTED_VALUE',
        });

        const searchColumnValues = searchColumnResponse.data.values || [];

        const matchingIndices: number[] = [];
        for (let i = 0; i < searchColumnValues.length; i++) {
          const rowValue = searchColumnValues[i][0];
          if (rowValue !== undefined) {
            const searchValue = String(search.value).trim();
            const formattedRowValue = String(rowValue).trim();

            if (searchType === 'contains' && formattedRowValue.includes(searchValue)) {
              matchingIndices.push(i + chunkStart);
            } else if (searchType === 'exact' && formattedRowValue === searchValue) {
              matchingIndices.push(i + chunkStart);
            }
          }
        }

        if (matchingIndices.length > 0) {
          const ranges = matchingIndices.map(
            (rowIndex) => `${sheetTitle}!A${rowIndex}:${toColumnLetter(columnCount - 1)}${rowIndex}`
          );

          const batchResponse = await sheetsClient.spreadsheets.values.batchGet({
            spreadsheetId: spreadsheet_id,
            ranges: ranges,
            valueRenderOption: 'UNFORMATTED_VALUE',
          });

          const valueRanges = batchResponse.data.valueRanges || [];

          valueRanges.forEach((range, index) => {
            const rowData = range.values?.[0] || [];
            matchingRows.push({
              row_index: matchingIndices[index],
              values: rowData,
            });

            if (matchingRows.length >= offset + limit) {
              return false;
            }
          });
        }

        if (matchingRows.length >= offset + limit) {
          break;
        }
      }

      if (searchFromLastRow) {
        matchingRows.reverse();
      }

      const paginatedRows = matchingRows.slice(offset, offset + limit);

      return createResponse({
        headers,
        responseType,
        rows: paginatedRows,
        rowsFound: matchingRows.length,
        rowsSearched: rowsToSearch,
        totalRows: totalRowCount,
      });
    } catch (error) {
      throw new GoogleSheetsError(`Failed to find rows: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      rows_found: { type: 'integer' },
      total_rows: { type: 'integer' },
      rows_searched: { type: 'integer' },
      rows: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              row_index: { type: 'integer' },
              values: {
                type: 'any',
              },
            },
          },
        },
      },
    },
  },
});

const createEmptyResponse = (responseType: string, totalRows: number, rowsSearched: number) => {
  const baseResponse = {
    rows_found: 0,
    total_rows: totalRows,
    rows_searched: rowsSearched,
  };

  switch (responseType) {
    case 'raw':
      return {
        ...baseResponse,
        rows: [],
      };
    case 'mapped-headers':
      return {
        ...baseResponse,
        rows: [],
      };
    case 'mapped-columns':
      return {
        ...baseResponse,
        rows: [],
      };
    default:
      return {
        ...baseResponse,
        raws: [],
      };
  }
};

const createResponse = ({
  rows,
  headers,
  rowsFound,
  totalRows,
  rowsSearched,
  responseType,
}: {
  rows: any[];
  headers: string[];
  rowsFound: number;
  totalRows: number;
  rowsSearched: number;
  responseType: string;
}) => {
  const baseResponse = {
    rows_found: rowsFound,
    total_rows: totalRows,
    rows_searched: rowsSearched,
  };

  switch (responseType) {
    case 'mapped-headers':
      return {
        ...baseResponse,
        rows: rows.map(({ row_index, values }) => {
          const mappedValues: Record<string, any> = {};
          headers.forEach((header, index) => {
            if (header) {
              mappedValues[header] = index < values.length ? values[index] : '';
            }
          });

          return {
            row_index,
            values: mappedValues,
          };
        }),
      };
    case 'mapped-columns':
      return {
        ...baseResponse,
        rows: rows.map(({ row_index, values }) => {
          const mappedValues: Record<string, any> = {};
          values.forEach((value: any, index: number) => {
            mappedValues[toColumnLetter(++index)] = value;
          });

          return {
            row_index,
            values: mappedValues,
          };
        }),
      };
    case 'raw':
    default:
      return {
        ...baseResponse,
        rows: rows.map(({ row_index, values }) => ({
          row_index,
          values,
        })),
      };
  }
};

const columnLetterToIndex = (column: string) => {
  column = column.toUpperCase();
  let index = 0;

  for (let i = 0; i < column.length; i++) {
    index = index * 26 + column.charCodeAt(i) - 64;
  }

  return index - 1;
};

export default findSpreadsheetRows;
