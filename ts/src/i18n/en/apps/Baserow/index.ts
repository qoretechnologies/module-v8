const BaserowAppEn = {
  displayName: 'Baserow',
  groups: ['Spreadsheets & Data Tables', 'Databases & Backend Services'],
  shortDesc:
    'Connect to Baserow to manage your database tables, rows, and files with powerful automation',
  longDesc:
    'The Baserow integration provides comprehensive access to your Baserow database operations. Create, read, update, and delete rows in your tables, upload files, and monitor new entries with real-time triggers. Whether you need to manage data, filter results, or track new records, this integration streamlines your Baserow workflow automation and database management.',
  connectionMessage: {
    title: 'Connect to Baserow',
    content: `To connect to Baserow, you will need your **Baserow URL** and a **Database Token**.

## Getting Your Database Token

1. Log in to your Baserow instance
2. Click on your **profile icon** in the top right corner
3. Select **Settings** from the dropdown menu
4. Navigate to **Database tokens** in the left sidebar
5. Click **Create token**
6. Give your token a descriptive name (e.g., "Qore Integration")
7. Select the **workspace** the token should have access to
8. Configure **table-level permissions** (create, read, update, delete) as needed
9. Click **Create token** and copy the generated token

## Connection Details

### Baserow URL
The base URL of your Baserow instance:
- **Baserow Cloud**: Use \`https://api.baserow.io\`
- **Self-hosted**: Use your instance URL (e.g., \`https://baserow.yourcompany.com\`)

### Database Token
Your database token that grants access to specific workspaces and tables. Tokens are scoped to a single workspace with granular table-level permissions.

**Note:** Database tokens provide more granular control than API tokens. Each token can be restricted to specific operations (create, read, update, delete) on individual tables within a workspace.`,
  },
  actions: {
    create_row: {
      displayName: 'Create Row',
      shortDesc: 'Insert a new row into a Baserow table',
      longDesc:
        'Creates a new record in the specified Baserow table. The action dynamically presents the table schema, allowing you to provide values for each column. Optionally specify a row ID to insert the new row before it. Returns the newly created row with all its data.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table where the row will be inserted',
          longDesc:
            'Select the target Baserow table for inserting the new row. The available fields will be dynamically loaded based on the selected table schema.',
        },
        data: {
          displayName: 'Row Data',
          shortDesc: 'The data to insert into the new row',
          longDesc:
            'Provide values for the table columns. The structure is dynamically generated based on the selected table schema, showing all available columns with their data types and constraints.',
        },
        before_row_id: {
          displayName: 'Before Row ID',
          shortDesc: 'Insert the new row before this row',
          longDesc:
            'Optionally specify a row ID to insert the new row before it in the table order. Leave empty to append the row at the end.',
        },
      },
    },
    delete_row: {
      displayName: 'Delete Row',
      shortDesc: 'Delete a specific row from a Baserow table',
      longDesc:
        'Removes a single row from a Baserow table by its ID. Use with caution as this operation is irreversible and permanently deletes the specified row.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table to delete the row from',
          longDesc:
            'Select the Baserow table from which you want to delete a row. Ensure you have proper permissions for delete operations on this table.',
        },
        row: {
          displayName: 'Row',
          shortDesc: 'The row to delete',
          longDesc:
            'Select the specific row to delete from the table by its ID. This row will be permanently removed.',
        },
      },
    },
    get_table_row: {
      displayName: 'Get Table Row',
      shortDesc: 'Retrieve a specific row from a Baserow table',
      longDesc:
        'Fetches detailed data for a single row in a Baserow table by its ID. Returns all column values for the specified row with dynamically loaded field types.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table to retrieve the row from',
          longDesc:
            'Select the Baserow table from which you want to retrieve a row. The available rows will be loaded based on this selection.',
        },
        row: {
          displayName: 'Row',
          shortDesc: 'The row to retrieve',
          longDesc:
            'Select the specific row to retrieve from the table by its ID. All data for this row will be returned.',
        },
      },
    },
    get_table_fields: {
      displayName: 'Get Table Fields',
      shortDesc: 'Retrieve all field definitions from a Baserow table',
      longDesc:
        'Fetches comprehensive metadata for all fields in a specific Baserow table including field types, order, descriptions, default values, and properties. This action helps you understand the structure and configuration of your database tables.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table to retrieve fields from',
          longDesc:
            'Select the Baserow table whose field definitions you want to fetch. All fields and their configurations will be returned.',
        },
      },
    },
    list_rows: {
      displayName: 'List Rows',
      shortDesc: 'Query and retrieve rows from a Baserow table',
      longDesc:
        'Fetches rows from a Baserow table with support for filtering, sorting, pagination, and search. Returns a list of records matching your query criteria along with total count and pagination information.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table to query',
          longDesc:
            'Select the Baserow table from which you want to retrieve rows. The available columns for filtering and ordering will be loaded based on this selection.',
        },
        page: {
          displayName: 'Page',
          shortDesc: 'Page number for pagination',
          longDesc:
            'Specify which page of results to retrieve. Used in combination with size for pagination through large datasets. Defaults to page 1.',
        },
        size: {
          displayName: 'Size',
          shortDesc: 'Number of rows per page',
          longDesc:
            'Specify the maximum number of rows to retrieve per page. Defaults to 100 rows if not specified.',
        },
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter rows',
          longDesc:
            'Provide a search term to filter rows across all text fields in the table. Only rows containing this term will be returned.',
        },
        order: {
          displayName: 'Order',
          shortDesc: 'Sort the results by a specific field',
          longDesc:
            'Define how to sort the retrieved rows by specifying a field and sort direction (ascending or descending).',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The field to sort by',
                longDesc: 'Select the table field used for sorting the results.',
              },
              direction: {
                displayName: 'Direction',
                shortDesc: 'Sort direction',
                longDesc:
                  'Choose ascending (+) to sort from lowest to highest, or descending (-) to sort from highest to lowest.',
              },
            },
          },
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter rows based on conditions',
          longDesc:
            'Apply multiple filter conditions to retrieve only rows that match specific criteria. Supports various comparison operators and logical combinations.',
          type: {
            fields: {
              filters: {
                displayName: 'Filters',
                shortDesc: 'List of filter conditions',
                longDesc:
                  'Define one or more filter conditions. Each condition specifies a field, operator, and value to match against.',
                type: {
                  element_type: {
                    fields: {
                      type: {
                        displayName: 'Type',
                        shortDesc: 'The comparison operator',
                        longDesc:
                          'Choose the comparison operator for this filter condition (equal, contains, empty, etc.).',
                      },
                      field: {
                        displayName: 'Field',
                        shortDesc: 'The field to filter on',
                        longDesc: 'Select the table field to apply this filter condition to.',
                      },
                      value: {
                        displayName: 'Value',
                        shortDesc: 'The value to compare against',
                        longDesc:
                          'The value to compare the field against using the selected operator.',
                      },
                    },
                  },
                },
              },
              filter_type: {
                displayName: 'Filter Type',
                shortDesc: 'Logical operator for combining filters',
                longDesc:
                  'Choose AND to require all filter conditions to match, or OR to match any filter condition.',
              },
            },
          },
        },
      },
    },
    list_tables: {
      displayName: 'List Tables',
      shortDesc: 'Get all tables in your Baserow database',
      longDesc:
        'Retrieves a list of all tables from your Baserow database with their basic metadata including table IDs, names, order, and associated database IDs.',
    },
    update_row: {
      displayName: 'Update Row',
      shortDesc: 'Update an existing row in a Baserow table',
      longDesc:
        'Updates the values of an existing row in a Baserow table. The action dynamically presents the table schema, allowing you to modify values for each column. Returns the updated row with all its current data.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table containing the row to update',
          longDesc:
            'Select the Baserow table containing the row you want to update. The available fields will be dynamically loaded based on the table schema.',
        },
        row: {
          displayName: 'Row',
          shortDesc: 'The row to update',
          longDesc:
            'Select the specific row to update by its ID. The current values of this row will be modified.',
        },
        data: {
          displayName: 'Row Data',
          shortDesc: 'The new data for the row',
          longDesc:
            'Provide new values for the table columns you want to update. The structure is dynamically generated based on the selected table schema.',
        },
      },
    },
    upload_file: {
      displayName: 'Upload File',
      shortDesc: 'Upload a file to Baserow storage',
      longDesc:
        "Uploads a file to Baserow's file storage system. Returns the uploaded file's metadata including URL, size, MIME type, and generated thumbnails for images. The uploaded file can then be referenced in file fields within your tables.",
      options: {
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc:
            'Select or provide the file to upload to Baserow storage. The file will be stored and available for use in file fields.',
        },
      },
    },
  },
  triggers: {
    new_document: {
      displayName: 'New Row',
      shortDesc: 'Triggers when a new row is added to a Baserow table',
      longDesc:
        'Monitors a Baserow table for new rows and triggers when new records are inserted. Supports optional filtering and search to trigger only for rows matching specific criteria.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table to monitor for new rows',
          longDesc:
            'Select the Baserow table you want to monitor. The trigger will fire whenever new rows are inserted into this table.',
        },
        search: {
          displayName: 'Search',
          shortDesc: 'Optional search term to filter new rows',
          longDesc:
            'Provide a search term to trigger only for new rows that contain this term in any text field. Leave empty to trigger for all new rows.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Optional conditions to filter new rows',
          longDesc:
            'Apply filter conditions to trigger only for new rows matching specific criteria. Leave empty to trigger for all new rows.',
          type: {
            fields: {
              filters: {
                displayName: 'Filters',
                shortDesc: 'List of filter conditions',
                longDesc:
                  'Define one or more filter conditions. Only new rows matching these conditions will trigger the event.',
                type: {
                  element_type: {
                    fields: {
                      type: {
                        displayName: 'Type',
                        shortDesc: 'The comparison operator',
                        longDesc: 'Choose the comparison operator for this filter condition.',
                      },
                      field: {
                        displayName: 'Field',
                        shortDesc: 'The field to filter on',
                        longDesc: 'Select the table field to apply this filter condition to.',
                      },
                      value: {
                        displayName: 'Value',
                        shortDesc: 'The value to match',
                        longDesc:
                          'The value to compare against. Only new rows matching this condition will trigger the event.',
                      },
                    },
                  },
                },
              },
              filter_type: {
                displayName: 'Filter Type',
                shortDesc: 'Logical operator for combining filters',
                longDesc:
                  'Choose AND to require all filter conditions to match, or OR to match any filter condition.',
              },
            },
          },
        },
      },
    },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order By',
      shortDesc: 'Sort results by a specific field',
      longDesc: 'Define the field and direction to sort search results',
      type: {
        fields: {
          column: {
            displayName: 'Column',
            shortDesc: 'The column to sort by',
            longDesc: 'The name of the column to use for sorting results',
          },
          ascending: {
            displayName: 'Ascending',
            shortDesc: 'Sort in ascending order',
            longDesc: 'When enabled, results are sorted in ascending order (A-Z, 0-9)',
          },
        },
      },
    },
  },
  expressions: {
    '&&': {
      displayName: 'and (&&)',
      shortDesc: 'Returns True if all arguments are True',
      longDesc: 'Returns `True` if all arguments are `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '||': {
      displayName: 'or (||)',
      shortDesc: 'Returns True if any argument is True',
      longDesc: 'Returns `True` if any argument is `True` with logic short-circuiting',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression or condition that evaluates to True or False',
        },
      ],
    },
    '==': {
      displayName: 'equal (==)',
      shortDesc: 'Equality comparison',
      longDesc: 'Returns `True` if the field value equals the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '!=': {
      displayName: 'not equal (!=)',
      shortDesc: 'Inequality comparison',
      longDesc: 'Returns `True` if the field value does not equal the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field against',
        },
      ],
    },
    '>': {
      displayName: 'higher than (>)',
      shortDesc: 'Greater than comparison',
      longDesc: 'Returns `True` if the field value is greater than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Number',
          shortDesc: 'Number to compare against',
          longDesc: 'The numeric value to compare the field against',
        },
      ],
    },
    '>=': {
      displayName: 'higher than or equal (>=)',
      shortDesc: 'Greater than or equal comparison',
      longDesc:
        'Returns `True` if the field value is greater than or equal to the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Number',
          shortDesc: 'Number to compare against',
          longDesc: 'The numeric value to compare the field against',
        },
      ],
    },
    '<': {
      displayName: 'lower than (<)',
      shortDesc: 'Less than comparison',
      longDesc: 'Returns `True` if the field value is less than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Number',
          shortDesc: 'Number to compare against',
          longDesc: 'The numeric value to compare the field against',
        },
      ],
    },
    '<=': {
      displayName: 'lower than or equal (<=)',
      shortDesc: 'Less than or equal comparison',
      longDesc: 'Returns `True` if the field value is less than or equal to the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Number',
          shortDesc: 'Number to compare against',
          longDesc: 'The numeric value to compare the field against',
        },
      ],
    },
    contains: {
      displayName: 'contains',
      shortDesc: 'Contains text',
      longDesc: 'Returns `True` if the field contains the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to search for',
          longDesc: 'The text string to search for within the field',
        },
      ],
    },
    'contains-not': {
      displayName: "doesn't contain",
      shortDesc: 'Does not contain text',
      longDesc: 'Returns `True` if the field does not contain the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to exclude',
          longDesc: 'The text string that should not be present in the field',
        },
      ],
    },
    'contains-word': {
      displayName: 'contains word',
      shortDesc: 'Contains whole word',
      longDesc: 'Returns `True` if the field contains the specified word as a complete word',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Word',
          shortDesc: 'Word to search for',
          longDesc: 'The complete word to search for within the field',
        },
      ],
    },
    'doesnt-contain-word': {
      displayName: "doesn't contain word",
      shortDesc: 'Does not contain whole word',
      longDesc:
        'Returns `True` if the field does not contain the specified word as a complete word',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Word',
          shortDesc: 'Word to exclude',
          longDesc: 'The complete word that should not be present in the field',
        },
      ],
    },
    'length-is-lower-than': {
      displayName: 'length is lower than',
      shortDesc: 'Text length is less than',
      longDesc: 'Returns `True` if the length of the text field is less than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to measure',
          longDesc: 'The text field whose length will be measured',
        },
        {
          displayName: 'Length',
          shortDesc: 'Maximum length',
          longDesc: 'The maximum length the field should be less than',
        },
      ],
    },
    empty: {
      displayName: 'is empty',
      shortDesc: 'Field is empty',
      longDesc: 'Returns `True` if the field is empty or has no value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for emptiness',
        },
      ],
    },
    'not-empty': {
      displayName: 'is not empty',
      shortDesc: 'Field is not empty',
      longDesc: 'Returns `True` if the field has a value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for a value',
        },
      ],
    },
    'date-is': {
      displayName: 'date is',
      shortDesc: 'Date equals',
      longDesc: 'Returns `True` if the date field equals the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field to compare',
        },
        {
          displayName: 'Date',
          shortDesc: 'Date to match',
          longDesc: 'The date value to compare against (format: YYYY-MM-DD)',
        },
      ],
    },
    'date-is-not': {
      displayName: 'date is not',
      shortDesc: 'Date does not equal',
      longDesc: 'Returns `True` if the date field does not equal the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field to compare',
        },
        {
          displayName: 'Date',
          shortDesc: 'Date to exclude',
          longDesc: 'The date value that should not match (format: YYYY-MM-DD)',
        },
      ],
    },
    'date-is-before': {
      displayName: 'date is before',
      shortDesc: 'Date is before',
      longDesc: 'Returns `True` if the date field is before the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field to compare',
        },
        {
          displayName: 'Date',
          shortDesc: 'Maximum date',
          longDesc: 'The date that the field should be before (format: YYYY-MM-DD)',
        },
      ],
    },
    'date-is-on-or-before': {
      displayName: 'date is on or before',
      shortDesc: 'Date is on or before',
      longDesc: 'Returns `True` if the date field is on or before the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field to compare',
        },
        {
          displayName: 'Date',
          shortDesc: 'Maximum date',
          longDesc: 'The date that the field should be on or before (format: YYYY-MM-DD)',
        },
      ],
    },
    'date-is-after': {
      displayName: 'date is after',
      shortDesc: 'Date is after',
      longDesc: 'Returns `True` if the date field is after the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field to compare',
        },
        {
          displayName: 'Date',
          shortDesc: 'Minimum date',
          longDesc: 'The date that the field should be after (format: YYYY-MM-DD)',
        },
      ],
    },
    'date-is-on-or-after': {
      displayName: 'date is on or after',
      shortDesc: 'Date is on or after',
      longDesc: 'Returns `True` if the date field is on or after the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field to compare',
        },
        {
          displayName: 'Date',
          shortDesc: 'Minimum date',
          longDesc: 'The date that the field should be on or after (format: YYYY-MM-DD)',
        },
      ],
    },
    'date-is-within': {
      displayName: 'date is within',
      shortDesc: 'Date is within time period',
      longDesc: 'Returns `True` if the date field falls within the specified time period',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
        {
          displayName: 'Period',
          shortDesc: 'Time period',
          longDesc:
            'The time period to check (e.g., "today", "yesterday", "this_week", "last_month")',
        },
      ],
    },
    'date-equals-day-of-month': {
      displayName: 'day of month is',
      shortDesc: 'Day of month equals',
      longDesc: 'Returns `True` if the day of the month equals the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field whose day will be checked',
        },
        {
          displayName: 'Day',
          shortDesc: 'Day number',
          longDesc: 'The day of the month (1-31) to match',
        },
      ],
    },
    boolean: {
      displayName: 'is',
      shortDesc: 'Boolean comparison',
      longDesc: 'Returns `True` if the boolean field equals the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Boolean field to check',
          longDesc: 'The boolean field to compare',
        },
        {
          displayName: 'Value',
          shortDesc: 'Boolean value',
          longDesc: 'The boolean value (true or false) to compare against',
        },
      ],
    },
    'is-even-and-whole': {
      displayName: 'is even and whole',
      shortDesc: 'Number is even and whole',
      longDesc: 'Returns `True` if the number is even and a whole number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to check',
          longDesc: 'The numeric field to check',
        },
        {
          displayName: 'Check',
          shortDesc: 'Check value',
          longDesc: 'Set to true to check if even and whole, false to check if not',
        },
      ],
    },
    'single-select-equal': {
      displayName: 'is',
      shortDesc: 'Single select equals',
      longDesc: 'Returns `True` if the single select field equals the specified option',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Single select field',
          longDesc: 'The single select field to check',
        },
        {
          displayName: 'Option',
          shortDesc: 'Option to match',
          longDesc: 'The select option value to match',
        },
      ],
    },
    'single-select-not-equal': {
      displayName: 'is not',
      shortDesc: 'Single select does not equal',
      longDesc: 'Returns `True` if the single select field does not equal the specified option',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Single select field',
          longDesc: 'The single select field to check',
        },
        {
          displayName: 'Option',
          shortDesc: 'Option to exclude',
          longDesc: 'The select option value to exclude',
        },
      ],
    },
    'single-select-is-any-of': {
      displayName: 'is any of',
      shortDesc: 'Single select is any of',
      longDesc: 'Returns `True` if the single select field matches any of the specified options',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Single select field',
          longDesc: 'The single select field to check',
        },
        {
          displayName: 'Options',
          shortDesc: 'Options list',
          longDesc: 'List of select option values to match against',
        },
      ],
    },
    'single-select-is-none-of': {
      displayName: 'is none of',
      shortDesc: 'Single select is none of',
      longDesc:
        'Returns `True` if the single select field does not match any of the specified options',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Single select field',
          longDesc: 'The single select field to check',
        },
        {
          displayName: 'Options',
          shortDesc: 'Options list',
          longDesc: 'List of select option values to exclude',
        },
      ],
    },
    'multiple-select-has': {
      displayName: 'has any of',
      shortDesc: 'Multiple select contains',
      longDesc: 'Returns `True` if the multiple select field contains the specified option',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Multiple select field',
          longDesc: 'The multiple select field to check',
        },
        {
          displayName: 'Option',
          shortDesc: 'Option to find',
          longDesc: 'The select option value to find in the field',
        },
      ],
    },
    'multiple-select-has-not': {
      displayName: "doesn't have any of",
      shortDesc: 'Multiple select does not contain',
      longDesc: 'Returns `True` if the multiple select field does not contain the specified option',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Multiple select field',
          longDesc: 'The multiple select field to check',
        },
        {
          displayName: 'Option',
          shortDesc: 'Option to exclude',
          longDesc: 'The select option value that should not be in the field',
        },
      ],
    },
    'link-row-has': {
      displayName: 'has',
      shortDesc: 'Link row contains',
      longDesc: 'Returns `True` if the link row field contains the specified linked record',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Link row field',
          longDesc: 'The link row field to check',
        },
        {
          displayName: 'Record ID',
          shortDesc: 'Linked record ID',
          longDesc: 'The ID of the linked record to find',
        },
      ],
    },
    'link-row-has-not': {
      displayName: "doesn't have",
      shortDesc: 'Link row does not contain',
      longDesc: 'Returns `True` if the link row field does not contain the specified linked record',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Link row field',
          longDesc: 'The link row field to check',
        },
        {
          displayName: 'Record ID',
          shortDesc: 'Linked record ID',
          longDesc: 'The ID of the linked record that should not be present',
        },
      ],
    },
    'link-row-contains': {
      displayName: 'contains',
      shortDesc: 'Link row value contains',
      longDesc: 'Returns `True` if any linked record value contains the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Link row field',
          longDesc: 'The link row field to search',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to find',
          longDesc: 'The text to search for in linked record values',
        },
      ],
    },
    'link-row-not-contains': {
      displayName: "doesn't contain",
      shortDesc: 'Link row value does not contain',
      longDesc: 'Returns `True` if no linked record value contains the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Link row field',
          longDesc: 'The link row field to search',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to exclude',
          longDesc: 'The text that should not be in linked record values',
        },
      ],
    },
    'filename-contains': {
      displayName: 'filename contains',
      shortDesc: 'File name contains text',
      longDesc: 'Returns `True` if any file name contains the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'File field',
          longDesc: 'The file field to check',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to find',
          longDesc: 'The text to search for in file names',
        },
      ],
    },
    'has-file-type': {
      displayName: 'has file type',
      shortDesc: 'Has file with type',
      longDesc: 'Returns `True` if the field contains a file with the specified type',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'File field',
          longDesc: 'The file field to check',
        },
        {
          displayName: 'Type',
          shortDesc: 'File type',
          longDesc: 'The file type to check for (e.g., "image", "document")',
        },
      ],
    },
    'files-lower-than': {
      displayName: 'files lower than',
      shortDesc: 'File count is less than',
      longDesc: 'Returns `True` if the number of files is less than the specified count',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'File field',
          longDesc: 'The file field to count',
        },
        {
          displayName: 'Count',
          shortDesc: 'Maximum count',
          longDesc: 'The maximum number of files',
        },
      ],
    },
    'user-is': {
      displayName: 'is',
      shortDesc: 'User equals',
      longDesc: 'Returns `True` if the user field equals the specified user',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'User field',
          longDesc: 'The user field to check',
        },
        {
          displayName: 'User',
          shortDesc: 'User to match',
          longDesc: 'The user identifier to match',
        },
      ],
    },
    'user-is-not': {
      displayName: 'is not',
      shortDesc: 'User does not equal',
      longDesc: 'Returns `True` if the user field does not equal the specified user',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'User field',
          longDesc: 'The user field to check',
        },
        {
          displayName: 'User',
          shortDesc: 'User to exclude',
          longDesc: 'The user identifier to exclude',
        },
      ],
    },
    'multiple-collaborators-has': {
      displayName: 'has',
      shortDesc: 'Has collaborator',
      longDesc: 'Returns `True` if the multiple collaborators field contains the specified user',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Collaborators field',
          longDesc: 'The multiple collaborators field to check',
        },
        {
          displayName: 'User',
          shortDesc: 'User to find',
          longDesc: 'The user identifier to find',
        },
      ],
    },
    'multiple-collaborators-has-not': {
      displayName: "doesn't have",
      shortDesc: 'Does not have collaborator',
      longDesc:
        'Returns `True` if the multiple collaborators field does not contain the specified user',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Collaborators field',
          longDesc: 'The multiple collaborators field to check',
        },
        {
          displayName: 'User',
          shortDesc: 'User to exclude',
          longDesc: 'The user identifier that should not be present',
        },
      ],
    },
    'has-empty-value': {
      displayName: 'has empty value',
      shortDesc: 'Lookup has empty value',
      longDesc: 'Returns `True` if the lookup field has at least one empty value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to check for empty values',
        },
        {
          displayName: 'Subfield',
          shortDesc: 'Subfield to check',
          longDesc: 'The specific subfield within the lookup to check',
        },
      ],
    },
    'has-not-empty-value': {
      displayName: "doesn't have empty value",
      shortDesc: 'Lookup has no empty values',
      longDesc: 'Returns `True` if the lookup field has no empty values',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to check',
        },
        {
          displayName: 'Subfield',
          shortDesc: 'Subfield to check',
          longDesc: 'The specific subfield within the lookup to check',
        },
      ],
    },
    'has-value-equal': {
      displayName: 'has value equal',
      shortDesc: 'Lookup value equals',
      longDesc: 'Returns `True` if the lookup field has a value equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to check',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to match',
          longDesc: 'The value to find in the lookup field',
        },
      ],
    },
    'has-not-value-equal': {
      displayName: "doesn't have value equal",
      shortDesc: 'Lookup value does not equal',
      longDesc:
        'Returns `True` if the lookup field does not have a value equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to check',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to exclude',
          longDesc: 'The value that should not be in the lookup field',
        },
      ],
    },
    'has-value-contains': {
      displayName: 'has value contains',
      shortDesc: 'Lookup value contains',
      longDesc: 'Returns `True` if the lookup field has a value containing the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to search',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to find',
          longDesc: 'The text to search for in lookup values',
        },
      ],
    },
    'has-not-value-contains': {
      displayName: "doesn't have value contains",
      shortDesc: 'Lookup value does not contain',
      longDesc:
        'Returns `True` if the lookup field does not have a value containing the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to search',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to exclude',
          longDesc: 'The text that should not be in lookup values',
        },
      ],
    },
    'has-value-contains-word': {
      displayName: 'has value contains word',
      shortDesc: 'Lookup value contains word',
      longDesc: 'Returns `True` if the lookup field has a value containing the specified word',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to search',
        },
        {
          displayName: 'Word',
          shortDesc: 'Word to find',
          longDesc: 'The complete word to search for in lookup values',
        },
      ],
    },
    'has-not-value-contains-word': {
      displayName: "doesn't have value contains word",
      shortDesc: 'Lookup value does not contain word',
      longDesc:
        'Returns `True` if the lookup field does not have a value containing the specified word',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to search',
        },
        {
          displayName: 'Word',
          shortDesc: 'Word to exclude',
          longDesc: 'The complete word that should not be in lookup values',
        },
      ],
    },
    'has-value-length-is-lower-than': {
      displayName: 'has value length is lower than',
      shortDesc: 'Lookup value length is less than',
      longDesc:
        'Returns `True` if the lookup field has a value with length less than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to measure',
        },
        {
          displayName: 'Length',
          shortDesc: 'Maximum length',
          longDesc: 'The maximum length for lookup values',
        },
      ],
    },
    'has-all-values-equal': {
      displayName: 'has all values equal',
      shortDesc: 'All lookup values equal',
      longDesc: 'Returns `True` if all values in the lookup field equal the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field to check',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to match',
          longDesc: 'The value that all lookup values should equal',
        },
      ],
    },
    'has-any-select-option-equal': {
      displayName: 'has any select option equal',
      shortDesc: 'Lookup has select option',
      longDesc:
        'Returns `True` if the lookup field has any select option equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with select options',
        },
        {
          displayName: 'Option',
          shortDesc: 'Option to find',
          longDesc: 'The select option value to find',
        },
      ],
    },
    'has-none-select-option-equal': {
      displayName: "doesn't have select option equal",
      shortDesc: 'Lookup has no select option',
      longDesc:
        'Returns `True` if the lookup field has no select option equal to the specified value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with select options',
        },
        {
          displayName: 'Option',
          shortDesc: 'Option to exclude',
          longDesc: 'The select option value that should not be present',
        },
      ],
    },
    'has-value-higher': {
      displayName: 'has value higher than',
      shortDesc: 'Lookup value is greater than',
      longDesc:
        'Returns `True` if the lookup field has a numeric value greater than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Minimum value',
          longDesc: 'The number that lookup values should be greater than',
        },
      ],
    },
    'has-not-value-higher': {
      displayName: "doesn't have value higher than",
      shortDesc: 'Lookup value is not greater than',
      longDesc:
        'Returns `True` if the lookup field does not have a numeric value greater than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Maximum value',
          longDesc: 'The number that lookup values should not be greater than',
        },
      ],
    },
    'has-value-higher-or-equal': {
      displayName: 'has value higher than or equal',
      shortDesc: 'Lookup value is greater than or equal',
      longDesc:
        'Returns `True` if the lookup field has a numeric value greater than or equal to the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Minimum value',
          longDesc: 'The number that lookup values should be greater than or equal to',
        },
      ],
    },
    'has-not-value-higher-or-equal': {
      displayName: "doesn't have value higher than or equal",
      shortDesc: 'Lookup value is not greater than or equal',
      longDesc:
        'Returns `True` if the lookup field does not have a numeric value greater than or equal to the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Threshold value',
          longDesc: 'The number that lookup values should not be greater than or equal to',
        },
      ],
    },
    'has-value-lower': {
      displayName: 'has value lower than',
      shortDesc: 'Lookup value is less than',
      longDesc:
        'Returns `True` if the lookup field has a numeric value less than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Maximum value',
          longDesc: 'The number that lookup values should be less than',
        },
      ],
    },
    'has-not-value-lower': {
      displayName: "doesn't have value lower than",
      shortDesc: 'Lookup value is not less than',
      longDesc:
        'Returns `True` if the lookup field does not have a numeric value less than the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Minimum value',
          longDesc: 'The number that lookup values should not be less than',
        },
      ],
    },
    'has-value-lower-or-equal': {
      displayName: 'has value lower than or equal',
      shortDesc: 'Lookup value is less than or equal',
      longDesc:
        'Returns `True` if the lookup field has a numeric value less than or equal to the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Maximum value',
          longDesc: 'The number that lookup values should be less than or equal to',
        },
      ],
    },
    'has-not-value-lower-or-equal': {
      displayName: "doesn't have value lower than or equal",
      shortDesc: 'Lookup value is not less than or equal',
      longDesc:
        'Returns `True` if the lookup field does not have a numeric value less than or equal to the specified number',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with numeric values',
        },
        {
          displayName: 'Number',
          shortDesc: 'Threshold value',
          longDesc: 'The number that lookup values should not be less than or equal to',
        },
      ],
    },
    'has-date-equal': {
      displayName: 'has date equal',
      shortDesc: 'Lookup date equals',
      longDesc: 'Returns `True` if the lookup field has a date equal to the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Date to match',
          longDesc: 'The date that lookup values should equal (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-not-date-equal': {
      displayName: "doesn't have date equal",
      shortDesc: 'Lookup date does not equal',
      longDesc:
        'Returns `True` if the lookup field does not have a date equal to the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Date to exclude',
          longDesc: 'The date that lookup values should not equal (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-date-before': {
      displayName: 'has date before',
      shortDesc: 'Lookup date is before',
      longDesc: 'Returns `True` if the lookup field has a date before the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Maximum date',
          longDesc: 'The date that lookup values should be before (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-not-date-before': {
      displayName: "doesn't have date before",
      shortDesc: 'Lookup date is not before',
      longDesc: 'Returns `True` if the lookup field does not have a date before the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Threshold date',
          longDesc: 'The date that lookup values should not be before (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-date-on-or-before': {
      displayName: 'has date on or before',
      shortDesc: 'Lookup date is on or before',
      longDesc: 'Returns `True` if the lookup field has a date on or before the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Maximum date',
          longDesc: 'The date that lookup values should be on or before (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-not-date-on-or-before': {
      displayName: "doesn't have date on or before",
      shortDesc: 'Lookup date is not on or before',
      longDesc:
        'Returns `True` if the lookup field does not have a date on or before the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Threshold date',
          longDesc: 'The date that lookup values should not be on or before (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-date-after': {
      displayName: 'has date after',
      shortDesc: 'Lookup date is after',
      longDesc: 'Returns `True` if the lookup field has a date after the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Minimum date',
          longDesc: 'The date that lookup values should be after (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-not-date-after': {
      displayName: "doesn't have date after",
      shortDesc: 'Lookup date is not after',
      longDesc: 'Returns `True` if the lookup field does not have a date after the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Threshold date',
          longDesc: 'The date that lookup values should not be after (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-date-on-or-after': {
      displayName: 'has date on or after',
      shortDesc: 'Lookup date is on or after',
      longDesc: 'Returns `True` if the lookup field has a date on or after the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Minimum date',
          longDesc: 'The date that lookup values should be on or after (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-not-date-on-or-after': {
      displayName: "doesn't have date on or after",
      shortDesc: 'Lookup date is not on or after',
      longDesc:
        'Returns `True` if the lookup field does not have a date on or after the specified date',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Date',
          shortDesc: 'Threshold date',
          longDesc: 'The date that lookup values should not be on or after (format: YYYY-MM-DD)',
        },
      ],
    },
    'has-date-within': {
      displayName: 'has date within',
      shortDesc: 'Lookup date is within period',
      longDesc: 'Returns `True` if the lookup field has a date within the specified time period',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Period',
          shortDesc: 'Time period',
          longDesc: 'The time period to check (e.g., "today", "this_week", "last_month")',
        },
      ],
    },
    'has-not-date-within': {
      displayName: "doesn't have date within",
      shortDesc: 'Lookup date is not within period',
      longDesc:
        'Returns `True` if the lookup field does not have a date within the specified time period',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Lookup field',
          longDesc: 'The lookup field with date values',
        },
        {
          displayName: 'Period',
          shortDesc: 'Time period',
          longDesc: 'The time period to exclude (e.g., "today", "this_week", "last_month")',
        },
      ],
    },
  },
};

export default BaserowAppEn;
