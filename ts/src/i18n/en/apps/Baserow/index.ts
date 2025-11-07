/* eslint-disable max-len */
const BaserowAppEn = {
  displayName: 'Baserow',
  shortDesc:
    'Connect to Baserow to manage your database tables, rows, and files with powerful automation',
  longDesc:
    'The Baserow integration provides comprehensive access to your Baserow database operations. Create, read, update, and delete rows in your tables, upload files, and monitor new entries with real-time triggers. Whether you need to manage data, filter results, or track new records, this integration streamlines your Baserow workflow automation and database management.',
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
                    type: {
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
                    type: {
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
  expressions: {
    '&&': {
      displayName: 'and (&&)',
      shortDesc: 'Returns True if all arguments are True',
      longDesc: 'Returns `True` if all arguments are `True` with logic short-circuiting',
    },
    '||': {
      displayName: 'or (||)',
      shortDesc: 'Returns True if any argument is True',
      longDesc: 'Returns `True` if any argument is `True` with logic short-circuiting',
    },
    '==': {
      displayName: 'equal (==)',
      shortDesc: 'Equality comparison',
      longDesc: 'Returns `True` if the field equals the value',
    },
    '!=': {
      displayName: 'not equal (!=)',
      shortDesc: 'Inequality comparison',
      longDesc: 'Returns `True` if the field does not equal the value',
    },
    '>': {
      displayName: 'higher than (>)',
      shortDesc: 'Greater than comparison',
      longDesc: 'Returns `True` if the field is greater than the value',
    },
    '>=': {
      displayName: 'higher than or equal (>=)',
      shortDesc: 'Greater than or equal comparison',
      longDesc: 'Returns `True` if the field is greater than or equal to the value',
    },
    '<': {
      displayName: 'lower than (<)',
      shortDesc: 'Less than comparison',
      longDesc: 'Returns `True` if the field is less than the value',
    },
    '<=': {
      displayName: 'lower than or equal (<=)',
      shortDesc: 'Less than or equal comparison',
      longDesc: 'Returns `True` if the field is less than or equal to the value',
    },
    contains: {
      displayName: 'contains',
      shortDesc: 'Contains text',
      longDesc: 'Returns `True` if the field contains the specified text',
    },
    contains_not: {
      displayName: "doesn't contain",
      shortDesc: 'Does not contain text',
      longDesc: 'Returns `True` if the field does not contain the specified text',
    },
    contains_word: {
      displayName: 'contains word',
      shortDesc: 'Contains word',
      longDesc: 'Returns `True` if the field contains the specified word',
    },
    doesnt_contain_word: {
      displayName: "doesn't contain word",
      shortDesc: 'Does not contain word',
      longDesc: 'Returns `True` if the field does not contain the specified word',
    },
    length_is_lower_than: {
      displayName: 'length is lower than',
      shortDesc: 'Length is less than',
      longDesc: 'Returns `True` if the field length is less than the specified value',
    },
    empty: {
      displayName: 'is empty',
      shortDesc: 'Field is empty',
      longDesc: 'Returns `True` if the field is empty or not set',
    },
    not_empty: {
      displayName: 'is not empty',
      shortDesc: 'Field is not empty',
      longDesc: 'Returns `True` if the field has a value',
    },
    date_is: {
      displayName: 'date is',
      shortDesc: 'Date equals value',
      longDesc: 'Returns `True` if the date field equals the specified date',
    },
    date_is_not: {
      displayName: 'date is not',
      shortDesc: 'Date does not equal value',
      longDesc: 'Returns `True` if the date field does not equal the specified date',
    },
    date_is_before: {
      displayName: 'date is before',
      shortDesc: 'Date is before value',
      longDesc: 'Returns `True` if the date field is before the specified date',
    },
    date_is_on_or_before: {
      displayName: 'date is on or before',
      shortDesc: 'Date is on or before value',
      longDesc: 'Returns `True` if the date field is on or before the specified date',
    },
    date_is_after: {
      displayName: 'date is after',
      shortDesc: 'Date is after value',
      longDesc: 'Returns `True` if the date field is after the specified date',
    },
    date_is_on_or_after: {
      displayName: 'date is on or after',
      shortDesc: 'Date is on or after value',
      longDesc: 'Returns `True` if the date field is on or after the specified date',
    },
    date_is_within: {
      displayName: 'date is within',
      shortDesc: 'Date is within range',
      longDesc: 'Returns `True` if the date field is within the specified range',
    },
    date_equals_day_of_month: {
      displayName: 'day of month is',
      shortDesc: 'Day of month equals value',
      longDesc: 'Returns `True` if the day of month equals the specified value',
    },
    boolean: {
      displayName: 'is',
      shortDesc: 'Boolean comparison',
      longDesc: 'Returns `True` if the boolean field matches the specified value',
    },
    is_even_and_whole: {
      displayName: 'is even and whole',
      shortDesc: 'Number is even and whole',
      longDesc: 'Returns `True` if the number is even and a whole number',
    },
    single_select_equal: {
      displayName: 'is',
      shortDesc: 'Single select equals',
      longDesc: 'Returns `True` if the single select field equals the specified option',
    },
    single_select_not_equal: {
      displayName: 'is not',
      shortDesc: 'Single select does not equal',
      longDesc: 'Returns `True` if the single select field does not equal the specified option',
    },
    single_select_is_any_of: {
      displayName: 'is any of',
      shortDesc: 'Single select is any of',
      longDesc: 'Returns `True` if the single select field is any of the specified options',
    },
    single_select_is_none_of: {
      displayName: 'is none of',
      shortDesc: 'Single select is none of',
      longDesc: 'Returns `True` if the single select field is none of the specified options',
    },
    multiple_select_has: {
      displayName: 'has any of',
      shortDesc: 'Multiple select has value',
      longDesc: 'Returns `True` if the multiple select field contains the specified value',
    },
    multiple_select_has_not: {
      displayName: "doesn't have any of",
      shortDesc: 'Multiple select does not have value',
      longDesc: 'Returns `True` if the multiple select field does not contain the specified value',
    },
    link_row_has: {
      displayName: 'has',
      shortDesc: 'Link row has value',
      longDesc: 'Returns `True` if the link row field contains the specified value',
    },
    link_row_has_not: {
      displayName: "doesn't have",
      shortDesc: 'Link row does not have value',
      longDesc: 'Returns `True` if the link row field does not contain the specified value',
    },
    link_row_contains: {
      displayName: 'contains',
      shortDesc: 'Link row contains text',
      longDesc: 'Returns `True` if the link row field contains the specified text',
    },
    link_row_not_contains: {
      displayName: "doesn't contain",
      shortDesc: 'Link row does not contain text',
      longDesc: 'Returns `True` if the link row field does not contain the specified text',
    },
    filename_contains: {
      displayName: 'filename contains',
      shortDesc: 'Filename contains text',
      longDesc: 'Returns `True` if the filename contains the specified text',
    },
    has_file_type: {
      displayName: 'has file type',
      shortDesc: 'Has file type',
      longDesc: 'Returns `True` if the file field has the specified file type',
    },
    files_lower_than: {
      displayName: 'files lower than',
      shortDesc: 'Number of files is less than',
      longDesc: 'Returns `True` if the number of files is less than the specified value',
    },
    user_is: {
      displayName: 'is',
      shortDesc: 'User equals',
      longDesc: 'Returns `True` if the user field equals the specified user',
    },
    user_is_not: {
      displayName: 'is not',
      shortDesc: 'User does not equal',
      longDesc: 'Returns `True` if the user field does not equal the specified user',
    },
    multiple_collaborators_has: {
      displayName: 'has',
      shortDesc: 'Collaborators has user',
      longDesc: 'Returns `True` if the collaborators field contains the specified user',
    },
    multiple_collaborators_has_not: {
      displayName: "doesn't have",
      shortDesc: 'Collaborators does not have user',
      longDesc: 'Returns `True` if the collaborators field does not contain the specified user',
    },
    has_empty_value: {
      displayName: 'has empty value',
      shortDesc: 'Has empty value',
      longDesc: 'Returns `True` if the lookup field has an empty value',
    },
    has_not_empty_value: {
      displayName: "doesn't have empty value",
      shortDesc: 'Does not have empty value',
      longDesc: 'Returns `True` if the lookup field does not have an empty value',
    },
    has_value_equal: {
      displayName: 'has value equal',
      shortDesc: 'Has value equal to',
      longDesc: 'Returns `True` if the lookup field has a value equal to the specified value',
    },
    has_not_value_equal: {
      displayName: "doesn't have value equal",
      shortDesc: 'Does not have value equal to',
      longDesc:
        'Returns `True` if the lookup field does not have a value equal to the specified value',
    },
    has_value_contains: {
      displayName: 'has value contains',
      shortDesc: 'Has value containing text',
      longDesc: 'Returns `True` if the lookup field has a value containing the specified text',
    },
    has_not_value_contains: {
      displayName: "doesn't have value contains",
      shortDesc: 'Does not have value containing text',
      longDesc:
        'Returns `True` if the lookup field does not have a value containing the specified text',
    },
    has_value_contains_word: {
      displayName: 'has value contains word',
      shortDesc: 'Has value containing word',
      longDesc: 'Returns `True` if the lookup field has a value containing the specified word',
    },
    has_not_value_contains_word: {
      displayName: "doesn't have value contains word",
      shortDesc: 'Does not have value containing word',
      longDesc:
        'Returns `True` if the lookup field does not have a value containing the specified word',
    },
    has_value_length_is_lower_than: {
      displayName: 'has value length is lower than',
      shortDesc: 'Has value with length less than',
      longDesc:
        'Returns `True` if the lookup field has a value with length less than the specified value',
    },
    has_all_values_equal: {
      displayName: 'has all values equal',
      shortDesc: 'All values equal',
      longDesc: 'Returns `True` if all values in the lookup field equal the specified value',
    },
    has_any_select_option_equal: {
      displayName: 'has any select option equal',
      shortDesc: 'Has any select option equal',
      longDesc:
        'Returns `True` if the lookup field has any select option equal to the specified value',
    },
    has_none_select_option_equal: {
      displayName: "doesn't have select option equal",
      shortDesc: 'Does not have select option equal',
      longDesc:
        'Returns `True` if the lookup field does not have any select option equal to the specified value',
    },
    has_value_higher: {
      displayName: 'has value higher than',
      shortDesc: 'Has value greater than',
      longDesc: 'Returns `True` if the lookup field has a value greater than the specified value',
    },
    has_not_value_higher: {
      displayName: "doesn't have value higher than",
      shortDesc: 'Does not have value greater than',
      longDesc:
        'Returns `True` if the lookup field does not have a value greater than the specified value',
    },
    has_value_higher_or_equal: {
      displayName: 'has value higher than or equal',
      shortDesc: 'Has value greater than or equal to',
      longDesc:
        'Returns `True` if the lookup field has a value greater than or equal to the specified value',
    },
    has_not_value_higher_or_equal: {
      displayName: "doesn't have value higher than or equal",
      shortDesc: 'Does not have value greater than or equal to',
      longDesc:
        'Returns `True` if the lookup field does not have a value greater than or equal to the specified value',
    },
    has_value_lower: {
      displayName: 'has value lower than',
      shortDesc: 'Has value less than',
      longDesc: 'Returns `True` if the lookup field has a value less than the specified value',
    },
    has_not_value_lower: {
      displayName: "doesn't have value lower than",
      shortDesc: 'Does not have value less than',
      longDesc:
        'Returns `True` if the lookup field does not have a value less than the specified value',
    },
    has_value_lower_or_equal: {
      displayName: 'has value lower than or equal',
      shortDesc: 'Has value less than or equal to',
      longDesc:
        'Returns `True` if the lookup field has a value less than or equal to the specified value',
    },
    has_not_value_lower_or_equal: {
      displayName: "doesn't have value lower than or equal",
      shortDesc: 'Does not have value less than or equal to',
      longDesc:
        'Returns `True` if the lookup field does not have a value less than or equal to the specified value',
    },
    has_date_equal: {
      displayName: 'has date equal',
      shortDesc: 'Has date equal to',
      longDesc: 'Returns `True` if the lookup field has a date equal to the specified date',
    },
    has_not_date_equal: {
      displayName: "doesn't have date equal",
      shortDesc: 'Does not have date equal to',
      longDesc:
        'Returns `True` if the lookup field does not have a date equal to the specified date',
    },
    has_date_before: {
      displayName: 'has date before',
      shortDesc: 'Has date before',
      longDesc: 'Returns `True` if the lookup field has a date before the specified date',
    },
    has_not_date_before: {
      displayName: "doesn't have date before",
      shortDesc: 'Does not have date before',
      longDesc: 'Returns `True` if the lookup field does not have a date before the specified date',
    },
    has_date_on_or_before: {
      displayName: 'has date on or before',
      shortDesc: 'Has date on or before',
      longDesc: 'Returns `True` if the lookup field has a date on or before the specified date',
    },
    has_not_date_on_or_before: {
      displayName: "doesn't have date on or before",
      shortDesc: 'Does not have date on or before',
      longDesc:
        'Returns `True` if the lookup field does not have a date on or before the specified date',
    },
    has_date_after: {
      displayName: 'has date after',
      shortDesc: 'Has date after',
      longDesc: 'Returns `True` if the lookup field has a date after the specified date',
    },
    has_not_date_after: {
      displayName: "doesn't have date after",
      shortDesc: 'Does not have date after',
      longDesc: 'Returns `True` if the lookup field does not have a date after the specified date',
    },
    has_date_on_or_after: {
      displayName: 'has date on or after',
      shortDesc: 'Has date on or after',
      longDesc: 'Returns `True` if the lookup field has a date on or after the specified date',
    },
    has_not_date_on_or_after: {
      displayName: "doesn't have date on or after",
      shortDesc: 'Does not have date on or after',
      longDesc:
        'Returns `True` if the lookup field does not have a date on or after the specified date',
    },
    has_date_within: {
      displayName: 'has date within',
      shortDesc: 'Has date within range',
      longDesc: 'Returns `True` if the lookup field has a date within the specified range',
    },
    has_not_date_within: {
      displayName: "doesn't have date within",
      shortDesc: 'Does not have date within range',
      longDesc:
        'Returns `True` if the lookup field does not have a date within the specified range',
    },
  },
};

export default BaserowAppEn;
