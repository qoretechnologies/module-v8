import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';
import { getGoogleSheetIdAllowedValues } from '../helpers/get-sheet-id-allowed-values';
import { quoteSheetTitle, toColumnLetter } from './constants';
import { getGoogleSheetHeadersAllowedValues } from '../helpers/get-headers-allowed-values';

const MAX_FETCH_SIZE = 1000;

/** The Sheets API value render option of each value_render option value */
const VALUE_RENDER_OPTIONS: Record<string, string> = {
  unformatted: 'UNFORMATTED_VALUE',
  formatted: 'FORMATTED_VALUE',
  formula: 'FORMULA',
};

/** The Sheets API date-time render option of each date_render option value */
const DATE_RENDER_OPTIONS: Record<string, string> = {
  serial_number: 'SERIAL_NUMBER',
  formatted_string: 'FORMATTED_STRING',
};

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
    type: 'bool',
    default_value: false,
  },
  max_rows_to_search: {
    required: false,
    type: 'integer',
    default_value: 5000,
  },
  header_row: {
    required: false,
    type: 'integer',
    default_value: 1,
  },
  value_render: {
    required: false,
    type: 'string',
    default_value: 'unformatted',
    allowed_values: [
      {
        display_name: 'Values',
        value: 'unformatted',
        desc: 'Numbers, booleans, and text as stored in the cells; dates and times as serial numbers',
      },
      {
        display_name: 'Displayed text',
        value: 'formatted',
        desc: 'Each value as text, as the sheet displays it',
      },
      {
        display_name: 'Formulas',
        value: 'formula',
        desc: 'The formula of each formula cell; other cells as stored',
      },
    ],
  },
  date_render: {
    required: false,
    type: 'string',
    default_value: 'serial_number',
    allowed_values: [
      {
        display_name: 'Serial numbers',
        value: 'serial_number',
        desc: 'Dates and times as serial numbers: days since 30 December 1899, with the time as the fraction',
      },
      {
        display_name: 'Displayed text',
        value: 'formatted_string',
        desc: 'Dates and times as text, as the sheet displays them',
      },
    ],
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
    const headerRow = obj?.header_row ?? 1;
    const valueRender = obj?.value_render || 'unformatted';
    const valueRenderOption = VALUE_RENDER_OPTIONS[valueRender];
    const dateRender = obj?.date_render || 'serial_number';
    const dateTimeRenderOption = DATE_RENDER_OPTIONS[dateRender];

    if (!Number.isInteger(headerRow) || headerRow < 1) {
      throw new GoogleSheetsError(`header_row must be a row number of 1 or more; got ${headerRow}`);
    }

    if (!valueRenderOption) {
      throw new GoogleSheetsError(
        `unknown value_render "${valueRender}"; expecting one of: ${Object.keys(VALUE_RENDER_OPTIONS).join(', ')}`
      );
    }

    if (!dateTimeRenderOption) {
      throw new GoogleSheetsError(
        `unknown date_render "${dateRender}"; expecting one of: ${Object.keys(DATE_RENDER_OPTIONS).join(', ')}`
      );
    }

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

      const sheetRange = quoteSheetTitle(sheetTitle);
      // the header names are read as the sheet displays them, whatever the value rendering
      const getHeaders = async (): Promise<string[]> => {
        const headersResponse = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: spreadsheet_id,
          range: `${sheetRange}!${headerRow}:${headerRow}`,
          valueRenderOption: 'FORMATTED_VALUE',
        });
        return headersResponse.data.values?.[0] || [];
      };

      const metadataResponse = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        ranges: [sheetRange],
        includeGridData: false,
      });

      const gridProperties = metadataResponse.data.sheets?.[0]?.properties?.gridProperties;
      // the number of rows below the header row
      const totalRowCount = Math.max((gridProperties?.rowCount || 0) - headerRow, 0);
      const columnCount = gridProperties?.columnCount || 0;
      const lastColumn = toColumnLetter(columnCount);

      if (totalRowCount <= 0 || columnCount === 0) {
        return createEmptyResponse(responseType, totalRowCount, 0);
      }

      if (!search) {
        const startRow = headerRow + offset + 1;
        const endRow = startRow + limit - 1;

        const valuesResponse = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: spreadsheet_id,
          range: `${sheetRange}!A${startRow}:${lastColumn}${endRow}`,
          valueRenderOption,
          dateTimeRenderOption,
        });

        const rows = valuesResponse.data.values || [];

        let headers: string[] = [];
        if (responseType === 'mapped-headers') {
          headers = await getHeaders();
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

      let headers: string[] = [];
      if (search.header || responseType === 'mapped-headers') {
        headers = await getHeaders();

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
        columnLetter = toColumnLetter(columnIndex + 1);
      } else if (search.column) {
        columnLetter = search.column.toUpperCase();
        columnIndex = columnLetterToIndex(columnLetter);
      }

      const rowsToSearch = Math.min(totalRowCount, maxRowsToSearch);
      let startRow, endRow;

      // data rows are numbered from 1 below the header row
      if (searchFromLastRow) {
        startRow = totalRowCount - rowsToSearch + 1;
        if (startRow < 1) startRow = 1;
        endRow = totalRowCount;
      } else {
        startRow = 1;
        endRow = rowsToSearch;
      }

      // the sheet rows
      startRow += headerRow;
      endRow += headerRow;

      const matchingRows: {
        row_index: number;
        values: any[];
      }[] = [];

      for (let chunkStart = startRow; chunkStart <= endRow; chunkStart += MAX_FETCH_SIZE) {
        const chunkEnd = Math.min(chunkStart + MAX_FETCH_SIZE - 1, endRow);

        // the values searched are those returned
        const searchColumnResponse = await sheetsClient.spreadsheets.values.get({
          spreadsheetId: spreadsheet_id,
          range: `${sheetRange}!${columnLetter}${chunkStart}:${columnLetter}${chunkEnd}`,
          valueRenderOption,
          dateTimeRenderOption,
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
          const ranges = matchingIndices.map((rowIndex) => `${sheetRange}!A${rowIndex}:${lastColumn}${rowIndex}`);

          const batchResponse = await sheetsClient.spreadsheets.values.batchGet({
            spreadsheetId: spreadsheet_id,
            ranges: ranges,
            valueRenderOption,
            dateTimeRenderOption,
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
        rows: [],
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
