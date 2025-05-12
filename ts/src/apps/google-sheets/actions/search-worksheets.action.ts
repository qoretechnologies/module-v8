import { EQoreAppActionCode, QoreAppCreator, TQoreOptions } from '@qoretechnologies/ts-toolkit';
import { getQoreContextRequiredValues } from '../../../global/helpers';
import { GOOGLE_SHEETS_APP_NAME, GoogleSheetsError } from '../constants';
import { createGoogleSheetsClient } from '../helpers/constants';
import { getGoogleDriveFileIdAllowedValues } from '../helpers/get-drive-file-id-allowed-values';

const options = {
  spreadsheet_id: {
    required: true,
    type: 'string',
    allowed_values_creatable: true,
    get_allowed_values: getGoogleDriveFileIdAllowedValues,
  },
  title: {
    required: false,
    type: 'string',
  },
  exact_match: {
    required: false,
    type: 'boolean',
    default_value: false,
  },
} satisfies TQoreOptions;

const searchWorksheets = QoreAppCreator.createLocalizedAction<typeof options>({
  app: GOOGLE_SHEETS_APP_NAME,
  action: 'search_worksheets',
  action_code: EQoreAppActionCode.ACTION,
  options,
  api_function: async (obj, _opts, context) => {
    const { token, spreadsheet_id } = getQoreContextRequiredValues<{
      token: string;
      spreadsheet_id: string;
    }>({
      context: { ...context, opts: obj },
      optionFields: ['spreadsheet_id'],
      connectionFields: ['token'],
      ErrorClass: GoogleSheetsError,
    });

    const title = obj?.title || '';
    const exactMatch = obj?.exact_match || false;

    try {
      const sheetsClient = createGoogleSheetsClient(token);

      const response = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheet_id,
        fields: 'sheets.properties,properties.title',
      });

      if (!response.data || !response.data.sheets) {
        throw new GoogleSheetsError('Unable to retrieve spreadsheet information');
      }

      const spreadsheetTitle = response.data.properties?.title || 'Untitled Spreadsheet';
      const allSheets = response.data.sheets || [];

      let matchingSheets = allSheets;

      if (title) {
        if (exactMatch) {
          matchingSheets = allSheets.filter(
            (sheet) => sheet.properties?.title?.toLowerCase() === title.toLowerCase()
          );
        } else {
          matchingSheets = allSheets.filter((sheet) =>
            sheet.properties?.title?.toLowerCase().includes(title.toLowerCase())
          );
        }
      }

      const worksheets = matchingSheets.map((sheet) => ({
        sheet_id: sheet.properties?.sheetId,
        title: sheet.properties?.title,
        index: sheet.properties?.index,
        row_count: sheet.properties?.gridProperties?.rowCount,
        column_count: sheet.properties?.gridProperties?.columnCount,
        frozen_row_count: sheet.properties?.gridProperties?.frozenRowCount,
        frozen_column_count: sheet.properties?.gridProperties?.frozenColumnCount,
        is_hidden: sheet.properties?.hidden || false,
        is_tab_color_set: !!sheet.properties?.tabColor,
        tab_color: sheet.properties?.tabColor || null,
      }));

      return {
        spreadsheet_id,
        spreadsheet_title: spreadsheetTitle,
        total_sheets: allSheets.length,
        matching_sheets: worksheets.length,
        worksheets,
      };
    } catch (error) {
      if (error instanceof GoogleSheetsError) {
        throw error;
      }
      throw new GoogleSheetsError(`Failed to search worksheets: ${error.message || error}`);
    }
  },
  response_type: {
    type: 'hash',
    fields: {
      spreadsheet_id: {
        type: 'string',
        display_name: 'Spreadsheet ID',
        short_desc: 'The ID of the spreadsheet',
      },
      spreadsheet_title: {
        type: 'string',
        display_name: 'Spreadsheet Title',
        short_desc: 'The title of the spreadsheet',
      },
      total_sheets: {
        type: 'integer',
        display_name: 'Total Sheets',
        short_desc: 'The total number of sheets in the spreadsheet',
      },
      matching_sheets: {
        type: 'integer',
        display_name: 'Matching Sheets',
        short_desc: 'The number of sheets matching the search criteria',
      },
      worksheets: {
        type: {
          type: 'list',
          element_type: {
            type: 'hash',
            fields: {
              sheet_id: {
                type: 'string',
                display_name: 'Sheet ID',
                short_desc: 'The unique identifier of the sheet',
              },
              title: {
                type: 'string',
                display_name: 'Title',
                short_desc: 'The title of the sheet',
              },
              index: {
                type: 'integer',
                display_name: 'Index',
                short_desc: 'The position of the sheet within the spreadsheet (0-based)',
              },
              row_count: {
                type: 'integer',
                display_name: 'Row Count',
                short_desc: 'The number of rows in the sheet',
              },
              column_count: {
                type: 'integer',
                display_name: 'Column Count',
                short_desc: 'The number of columns in the sheet',
              },
              frozen_row_count: {
                type: 'integer',
                display_name: 'Frozen Row Count',
                short_desc: 'The number of frozen rows in the sheet',
              },
              frozen_column_count: {
                type: 'integer',
                display_name: 'Frozen Column Count',
                short_desc: 'The number of frozen columns in the sheet',
              },
              is_hidden: {
                type: 'boolean',
                display_name: 'Is Hidden',
                short_desc: 'Whether the sheet is hidden',
              },
              is_tab_color_set: {
                type: 'boolean',
                display_name: 'Has Tab Color',
                short_desc: 'Whether the sheet has a tab color set',
              },
              tab_color: {
                type: {
                  type: 'hash',
                  fields: {
                    red: { type: 'number' },
                    green: { type: 'number' },
                    blue: { type: 'number' },
                  },
                },
                display_name: 'Tab Color',
                short_desc: 'The RGB color of the sheet tab',
              },
            },
          },
        },
        display_name: 'Worksheets',
        short_desc: 'The list of worksheets matching the search criteria',
      },
    },
  },
});

export default searchWorksheets;
