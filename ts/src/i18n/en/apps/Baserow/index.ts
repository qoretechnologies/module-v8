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
};

export default BaserowAppEn;
