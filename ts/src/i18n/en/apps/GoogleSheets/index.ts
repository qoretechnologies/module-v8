/* eslint-disable max-len */
const GoogleSheetsAppEn = {
  displayName: 'Google Sheets',
  shortDesc: 'Connect with Google Sheets to manage your spreadsheets',
  longDesc:
    'Integrate with Google Sheets to create, update, and manage your spreadsheets. This integration allows you to perform actions and respond to events in your Google Sheets account, enabling you to automate data management and reporting workflows.',
  triggers: {
    new_spreadsheet_row: {
      displayName: 'New Spreadsheet Row',
      shortDesc: 'Triggers when a new row is added to a Google Sheet.',
      longDesc:
        'Monitors a specific sheet in a Google Spreadsheet and triggers when new rows are added. The trigger provides the row data with column headers as field names.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet ID',
          shortDesc: 'The ID of the Google Spreadsheet to monitor',
          longDesc:
            'The unique identifier of the Google Spreadsheet that contains the sheet you want to monitor for new rows.',
        },
        sheet_id: {
          displayName: 'Sheet ID',
          shortDesc: 'The ID of the specific sheet to monitor',
          longDesc:
            'The unique identifier of the specific sheet within the spreadsheet that you want to monitor for new rows. The sheet ID can be found in the spreadsheet URL.',
        },
      },
      event_info: {
        desc: 'Information about a newly added row in a Google Sheet',
      },
    },
    new_spreadsheet_sheet: {
      displayName: 'New Spreadsheet Sheet',
      shortDesc: 'Triggers when a new sheet is added to a Google Spreadsheet.',
      longDesc:
        'Monitors a Google Spreadsheet and triggers when new sheets are added. The trigger provides metadata about the newly created sheet including its ID, title, index position, and dimensions.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet ID',
          shortDesc: 'The ID of the Google Spreadsheet to monitor',
          longDesc:
            'The unique identifier of the Google Spreadsheet that you want to monitor for new sheets. The spreadsheet ID can be found in the spreadsheet URL.',
        },
      },
      event_info: {
        desc: 'Information about a newly added sheet in a Google Spreadsheet',
      },
    },
    new_spreadsheet: {
      displayName: 'New Spreadsheet',
      shortDesc: 'Triggers when a new Google Spreadsheet is created.',
      longDesc:
        'Monitors Google Drive for newly created Google Spreadsheets. The trigger provides metadata about the newly created spreadsheet including its ID, name, URL, creation time, and owner information.',
      event_info: {
        desc: 'Information about a newly created Google Spreadsheet',
      },
    },
  },
  actions: {
    search_spreadsheets: {
      displayName: 'Search Spreadsheets',
      shortDesc:
        'Search for Google Sheets spreadsheets with advanced filtering and sorting options.',
      longDesc:
        'Search for Google Sheets spreadsheets in Google Drive using various criteria including filename, folder location, and custom queries. Supports sorting by different fields and directions with pagination.',
      options: {
        filename: {
          displayName: 'Filename',
          shortDesc: 'Name of the spreadsheet to search for',
          longDesc: 'The name or partial name of the Google Sheets spreadsheet to search for.',
        },
        search_type: {
          displayName: 'Search Type',
          shortDesc: 'Type of filename matching',
          longDesc:
            'How to match the filename - either contains the text or exact match. Default is contains.',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Folder to search within',
          longDesc:
            'The Google Drive folder ID to limit the search to. If not specified, searches all accessible folders.',
        },
        order_by: {
          displayName: 'Order By',
          shortDesc: 'Sorting criteria for results',
          longDesc:
            'List of sorting criteria to apply to the search results. Each item specifies a field and direction.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to sort by',
                longDesc:
                  'The field to sort the results by (e.g., name, modifiedTime, createdTime).',
              },
              direction: {
                displayName: 'Direction',
                shortDesc: 'Sort direction',
                longDesc: 'The direction to sort - either ascending (asc) or descending (desc).',
              },
            },
          },
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Maximum number of results to return',
          longDesc:
            'The maximum number of spreadsheets to return in a single request. Default is 100.',
        },
        custom_query: {
          displayName: 'Custom Query',
          shortDesc: 'Additional search criteria',
          longDesc:
            'Custom Google Drive search query to add additional filtering criteria beyond the basic options.',
        },
      },
    },
    find_spreadsheet_rows: {
      displayName: 'Find Spreadsheet Rows',
      shortDesc: 'Search for rows in a Google Sheets spreadsheet that match specific criteria.',
      longDesc:
        'Searches for rows in a Google Sheet that match a specific value in a designated column. Supports searching by column header or letter, pagination, and different response formats.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet ID',
          shortDesc: 'ID of the Google Sheets spreadsheet',
          longDesc:
            'The unique identifier of the Google Sheets spreadsheet to search in. This can be found in the URL of the spreadsheet.',
        },
        sheet_id: {
          displayName: 'Sheet ID',
          shortDesc: 'ID of the specific sheet within the spreadsheet',
          longDesc:
            'The ID of the specific sheet to search within the spreadsheet. Each sheet has a unique ID that can be selected from the available sheets.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of matching rows to return',
          longDesc: 'The maximum number of matching rows to include in the results. Default is 10.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of matching rows to skip',
          longDesc:
            'The number of matching rows to skip before returning results. Used for pagination. Default is 0.',
        },
        search_from_last_row: {
          displayName: 'Search From Last Row',
          shortDesc: 'Start searching from the bottom of the sheet',
          longDesc:
            'When enabled, searches from the bottom of the sheet upward instead of from the top down. Useful for finding the most recent entries in sheets where new data is appended at the bottom.',
        },
        max_rows_to_search: {
          displayName: 'Maximum Rows to Search',
          shortDesc: 'Maximum number of rows to search through',
          longDesc:
            'Limits the total number of rows to search to control performance with large sheets. Default is 5000.',
        },
        response_type: {
          displayName: 'Response Format',
          shortDesc: 'Format of the returned rows',
          longDesc:
            'Determines how the matched rows are formatted in the response. Options include raw values, values mapped to column headers, or values mapped to column letters.',
        },
        search: {
          displayName: 'Search Criteria',
          shortDesc: 'Criteria for finding matching rows',
          longDesc: 'Defines the search criteria to use when looking for matching rows.',
          type: {
            fields: {
              header: {
                displayName: 'Column Header',
                shortDesc: 'Header of the column to search in',
                longDesc:
                  'The header text of the column to search in. Use this or Column Letter, not both.',
              },
              column: {
                displayName: 'Column Letter',
                shortDesc: 'Letter of the column to search in (A, B, C, etc.)',
                longDesc:
                  'The letter designation of the column to search in (e.g., A, B, C). Use this or Column Header, not both.',
              },
              type: {
                displayName: 'Search Type',
                shortDesc: 'Type of search to perform',
                longDesc:
                  'Determines how the search value is matched against the column data. Options include exact match, contains.',
              },
              value: {
                displayName: 'Search Value',
                shortDesc: 'Value to search for',
                longDesc:
                  'The value to look for in the specified column. Rows with this exact value will be returned.',
              },
            },
          },
        },
      },
    },
    search_worksheets: {
      displayName: 'Search Worksheets',
      shortDesc: 'Find worksheets within a Google Spreadsheet by title.',
      longDesc:
        'Searches for worksheets (tabs) within a Google Spreadsheet by their titles. Returns detailed information about matching worksheets including dimensions, position, and visibility. Can be used to find specific worksheets or list all worksheets in a spreadsheet.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet ID',
          shortDesc: 'The ID of the Google Spreadsheet to search within',
          longDesc:
            'The unique identifier of the Google Spreadsheet you want to search for worksheets in. This can be found in the spreadsheet URL.',
        },
        title: {
          displayName: 'Sheet Title',
          shortDesc: 'Title text to search for (case-insensitive)',
          longDesc:
            'Search for worksheets with titles containing this text. Leave empty to list all worksheets in the spreadsheet. The search is case-insensitive by default.',
        },
        exact_match: {
          displayName: 'Exact Match',
          shortDesc: 'Whether to match the title exactly',
          longDesc:
            'If enabled, only worksheets with exactly matching titles will be returned. If disabled (default), worksheets with titles containing the search text will be included in the results.',
        },
      },
    },
    update_spreadsheet_rows: {
      displayName: 'Update Spreadsheet Rows',
      shortDesc: 'Update existing rows in a Google Sheets spreadsheet.',
      longDesc:
        'Updates specific rows in a Google Sheets spreadsheet by their row indices. This action allows you to modify multiple rows in a single operation while preserving the spreadsheet structure.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet ID',
          shortDesc: 'The ID of the Google Sheets spreadsheet.',
          longDesc:
            'The unique identifier of the Google Sheets spreadsheet you want to update rows in. This can be found in the spreadsheet URL.',
        },
        sheet_id: {
          displayName: 'Sheet ID',
          shortDesc: 'The ID of the sheet within the spreadsheet.',
          longDesc:
            'The unique identifier of the specific sheet within the spreadsheet where rows will be updated.',
        },
        rows: {
          displayName: 'Rows to Update',
          shortDesc: 'List of rows with their indices and data to update.',
          longDesc:
            'A list of rows to update, each containing a row index (starting from 2, as row 1 contains headers) and the data to update in that row. The data should match the headers in the spreadsheet.',
          type: {
            fields: {
              row_index: {
                displayName: 'Row Index',
                shortDesc: 'The index of the row to update.',
                longDesc:
                  'The row number to update, starting from 2 (row 1 is reserved for headers). This number must refer to an existing row in the spreadsheet.',
              },
            },
          },
        },
      },
    },
    format_spreadsheet_rows: {
      displayName: 'Format Spreadsheet Rows',
      shortDesc: 'Apply formatting to specific rows in a Google Sheets spreadsheet.',
      longDesc:
        'Apply various formatting options such as colors, text styles, and alignment to specified rows in a Google Sheets spreadsheet. Format multiple rows at once with consistent styling.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet',
          shortDesc: 'The ID of the Google Sheets spreadsheet to format',
          longDesc:
            'The ID of the Google Sheets spreadsheet containing the rows to format. This can be found in the spreadsheet URL.',
        },
        sheet_id: {
          displayName: 'Worksheet',
          shortDesc: 'The ID of the specific worksheet within the spreadsheet',
          longDesc:
            'The ID of the specific worksheet (tab) containing the rows to format. Each worksheet has a unique ID within a spreadsheet.',
        },
        rows: {
          displayName: 'Rows',
          shortDesc: 'List of row numbers to format',
          longDesc:
            'List of row numbers to format (1-based indexing). For example, [1, 2, 5] will format the first, second, and fifth rows.',
        },
        background_color: {
          displayName: 'Background Color',
          shortDesc: 'Background color for the cells',
          longDesc:
            'The background color to apply to the cells in the specified rows. Uses RGB color format.',
        },
        text_color: {
          displayName: 'Text Color',
          shortDesc: 'Color for the text in the cells',
          longDesc:
            'The color to apply to the text in the cells of the specified rows. Uses RGB color format.',
        },
        bold: {
          displayName: 'Bold',
          shortDesc: 'Make text bold',
          longDesc: 'Whether to make the text in the specified rows bold.',
        },
        italic: {
          displayName: 'Italic',
          shortDesc: 'Make text italic',
          longDesc: 'Whether to make the text in the specified rows italic.',
        },
        strikethrough: {
          displayName: 'Strikethrough',
          shortDesc: 'Apply strikethrough to text',
          longDesc: 'Whether to apply strikethrough formatting to the text in the specified rows.',
        },
        underline: {
          displayName: 'Underline',
          shortDesc: 'Underline the text',
          longDesc: 'Whether to underline the text in the specified rows.',
        },
        horizontal_alignment: {
          displayName: 'Horizontal Alignment',
          shortDesc: 'Horizontal alignment of content',
          longDesc:
            'The horizontal alignment to apply to the content in the specified rows (Left, Center, or Right).',
        },
        vertical_alignment: {
          displayName: 'Vertical Alignment',
          shortDesc: 'Vertical alignment of content',
          longDesc:
            'The vertical alignment to apply to the content in the specified rows (Top, Middle, or Bottom).',
        },
        font_size: {
          displayName: 'Font Size',
          shortDesc: 'Text font size in points',
          longDesc: 'The font size in points to apply to the text in the specified rows.',
        },
        wrap_text: {
          displayName: 'Wrap Text',
          shortDesc: 'Whether to wrap text in cells',
          longDesc:
            'If enabled, text will wrap within cells rather than overflowing into adjacent cells.',
        },
      },
    },
    delete_row: {
      displayName: 'Delete Row',
      shortDesc: 'Delete a specific row from a Google Sheets worksheet.',
      longDesc:
        'Completely removes a row from a specified Google Sheets worksheet without leaving an empty space behind. The row indexing starts from 1, matching what you see in the spreadsheet UI.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet',
          shortDesc: 'The Google Sheets spreadsheet containing the row to delete',
          longDesc:
            'The ID of the Google Sheets spreadsheet that contains the worksheet with the row to delete.',
        },
        sheet_id: {
          displayName: 'Worksheet',
          shortDesc: 'The worksheet containing the row to delete',
          longDesc:
            'The ID of the worksheet (tab) within the spreadsheet that contains the row to delete.',
        },
        row_index: {
          displayName: 'Row Index',
          shortDesc: 'The index of the row to delete (starting from 1)',
          longDesc:
            'The position of the row to delete, starting from 1 (not 0). This matches the row numbers you see in the Google Sheets UI. For example, to delete the very first row, use 1.',
        },
      },
    },
    create_worksheet: {
      displayName: 'Create Worksheet',
      shortDesc: 'Create a new worksheet in a Google Sheets spreadsheet with optional headers.',
      longDesc:
        'Creates a new worksheet (tab) in a specified Google Sheets spreadsheet with custom title and optional column headers. Can optionally overwrite an existing worksheet with the same name.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet',
          shortDesc: 'The Google Sheets spreadsheet where the worksheet will be created',
          longDesc: 'The ID of the Google Sheets spreadsheet in which to create the new worksheet.',
        },
        title: {
          displayName: 'Worksheet Title',
          shortDesc: 'Title for the new worksheet',
          longDesc: 'The name that will appear on the tab of the new worksheet.',
        },
        overwrite_existing: {
          displayName: 'Overwrite Existing',
          shortDesc: 'Whether to replace an existing worksheet with the same title',
          longDesc:
            'If true and a worksheet with the same title already exists, the existing worksheet will be deleted and replaced. If false and a duplicate exists, the action will fail.',
        },
        headers: {
          displayName: 'Headers',
          shortDesc: 'Column headers to add to the first row',
          longDesc:
            'A list of column headers that will be added to the first row of the new worksheet and formatted in bold.',
        },
        insert_sheet_index: {
          displayName: 'Sheet Position',
          shortDesc: 'Position where the new worksheet should be placed',
          longDesc:
            'The position (zero-based index) where the new worksheet should be inserted in the spreadsheet. If not specified, the worksheet will be added at the end.',
        },
      },
    },
    create_spreadsheet_column: {
      displayName: 'Create Spreadsheet Column',
      shortDesc: 'Insert a new column into a Google Sheets spreadsheet.',
      longDesc:
        'Inserts a new column at the specified position in a Google Sheets spreadsheet and adds a formatted header at the top of the column.',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet',
          shortDesc: 'The Google Sheets spreadsheet',
          longDesc: 'The ID of the Google Sheets spreadsheet where the column will be created.',
        },
        sheet_id: {
          displayName: 'Sheet',
          shortDesc: 'The sheet within the spreadsheet',
          longDesc:
            'The ID of the specific sheet within the spreadsheet where the column will be added.',
        },
        column_title: {
          displayName: 'Column Title',
          shortDesc: 'The title for the new column',
          longDesc: 'The header text that will appear at the top of the new column.',
        },
        column_index: {
          displayName: 'Column Index',
          shortDesc: 'The position where the column will be inserted',
          longDesc:
            'Zero-based index of the position where the new column should be inserted. For example, 0 means the column will be inserted at the beginning of the sheet, 1 means after the first column, etc.',
        },
      },
    },
    create_spreadsheet: {
      displayName: 'Create Spreadsheet',
      shortDesc:
        'Create a new Google Sheets spreadsheet with optional headers or by copying an existing one.',
      longDesc:
        'Creates a new Google Sheets spreadsheet. You can either create it from scratch with custom headers or copy an existing spreadsheet. When headers are provided, they are formatted as bold with borders and the header row is frozen.',
      options: {
        title: {
          displayName: 'Spreadsheet Title',
          shortDesc: 'The title for the new spreadsheet',
          longDesc: 'The name that will be given to the newly created Google Sheets spreadsheet.',
        },
        source_spreadsheet_id: {
          displayName: 'Source Spreadsheet',
          shortDesc: 'ID of an existing spreadsheet to copy',
          longDesc:
            'Optional. If provided, the new spreadsheet will be created as a copy of this existing spreadsheet. Headers option will be ignored if this is provided.',
        },
        headers: {
          displayName: 'Headers',
          shortDesc: 'Column headers for the new spreadsheet',
          longDesc:
            'Optional. A list of column headers to add to the first row of the new spreadsheet. Headers will be formatted as bold with borders and the header row will be frozen. This option is ignored if a source spreadsheet is provided.',
        },
      },
    },
    add_spreadsheet_rows: {
      displayName: 'Add Rows to Spreadsheet',
      shortDesc: 'Add one or more rows to the end of a Google Sheets table',
      longDesc:
        'Append new rows to an existing Google Sheets table with data mapped to the table headers',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet',
          shortDesc: 'Select the Google Sheets spreadsheet',
          longDesc: 'The Google Sheets spreadsheet where you want to add rows',
        },
        sheet_id: {
          displayName: 'Worksheet',
          shortDesc: 'Select the worksheet within the spreadsheet',
          longDesc: 'The specific worksheet within the spreadsheet where the rows will be added',
        },
        insert_at_start: {
          displayName: 'Insert at Start',
          shortDesc: 'Insert rows at the start of the table',
          longDesc:
            'If selected, new rows will be inserted at the start of the table. If not selected, rows will be appended to the end of the table.',
        },
        rows: {
          displayName: 'Rows to Add',
          shortDesc: 'The data to add as new rows',
          longDesc:
            'Specify the data for each row to add. Values should match the headers in the first row of the sheet. Each row is a set of key-value pairs where keys are column headers and values are the data to insert.',
        },
      },
    },
    copy_worksheet: {
      displayName: 'Copy Worksheet',
      shortDesc: 'Copy a worksheet from one Google Sheets spreadsheet to another',
      longDesc:
        'Create a copy of a worksheet from a source spreadsheet to a destination spreadsheet with optional customization',
      options: {
        source_spreadsheet_id: {
          displayName: 'Source Spreadsheet',
          shortDesc: 'Select the source Google Sheets spreadsheet',
          longDesc: 'The Google Sheets spreadsheet containing the worksheet you want to copy',
        },
        source_sheet_id: {
          displayName: 'Source Worksheet',
          shortDesc: 'Select the worksheet to copy',
          longDesc: 'The specific worksheet within the source spreadsheet that will be copied',
        },
        destination_spreadsheet_id: {
          displayName: 'Destination Spreadsheet',
          shortDesc: 'Select the destination Google Sheets spreadsheet',
          longDesc: 'The Google Sheets spreadsheet where the worksheet will be copied to',
        },
        new_sheet_name: {
          displayName: 'New Worksheet Name',
          shortDesc: 'Optional new name for the copied worksheet',
          longDesc:
            'Specify a custom name for the copied worksheet. If not provided, the original name will be used with "Copy of" prefix',
        },
        insert_sheet_index: {
          displayName: 'Insert Position',
          shortDesc: 'Optional position to insert the new worksheet',
          longDesc:
            'The zero-based index where the new worksheet should be inserted. If not specified, the worksheet is added to the end of the spreadsheet',
        },
      },
    },
    clear_spreadsheet_rows: {
      displayName: 'Clear Spreadsheet Row(s)',
      shortDesc: 'Clear content from specific rows in a Google Sheets spreadsheet',
      longDesc:
        'Remove all data from selected rows in a Google Sheets spreadsheet while preserving formatting',
      options: {
        spreadsheet_id: {
          displayName: 'Spreadsheet',
          shortDesc: 'Select the Google Sheets spreadsheet',
          longDesc: 'The Google Sheets spreadsheet containing the rows to be cleared',
        },
        sheet_id: {
          displayName: 'Sheet',
          shortDesc: 'Select the sheet within the spreadsheet',
          longDesc: 'The specific sheet within the spreadsheet where rows will be cleared',
        },
        rows: {
          displayName: 'Rows to Clear',
          shortDesc: 'The row numbers to clear (1-based)',
          longDesc:
            'Specify which rows to clear. Row numbers start at 1 as seen in the spreadsheet. For example, [1, 3, 5] will clear rows 1, 3, and 5.',
        },
      },
    },
  },
  expressions: {
    'row-ids': {
      displayName: 'Row IDs',
      shortDesc: 'List of row IDs',
      longDesc: 'Provide a list of row IDs to target specific rows in a Google Sheets spreadsheet.',
      args: [
        {
          display_name: 'Row Numbers',
          short_desc: 'List of row numbers to target',
          desc: 'Provide a list of row numbers (1-based index) that you want to update or delete. For example: [1, 5, 10, 23]',
        },
      ],
    },
  },
};

export default GoogleSheetsAppEn;
