/* eslint-disable max-len */
const AirtableAppEn = {
  displayName: 'Airtable',
  shortDesc: 'Cloud-based database and collaboration platform',
  longDesc:
    'Airtable combines the simplicity of a spreadsheet with the power of a database. Create and manage bases, tables, and records with ease. Perfect for project management, CRM, content planning, and team collaboration.',
  actions: {
    list_records: {
      displayName: 'List Records',
      shortDesc: 'Retrieve records from an Airtable table',
      longDesc:
        'List and filter records from a specified Airtable table with support for sorting, filtering, pagination, and field selection',
      options: {
        base_id: {
          displayName: 'Base ID',
          shortDesc: 'The ID of the Airtable base',
          longDesc: 'Select the Airtable base that contains the table you want to query',
        },
        table_id: {
          displayName: 'Table ID',
          shortDesc: 'The ID of the table to query',
          longDesc: 'Select the specific table within the base from which to retrieve records',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Specific fields to retrieve',
          longDesc:
            'Select which fields to include in the response. If not specified, all fields will be returned',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Number of records per page',
          longDesc: 'Specify how many records to retrieve per page (maximum 100)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Record offset for pagination',
          longDesc: 'Use the offset from a previous response to retrieve the next page of records',
        },
        timezone: {
          displayName: 'Timezone',
          shortDesc: 'Timezone for date formatting',
          longDesc: 'The timezone to use when formatting date and time fields in the response',
        },
        user_locale: {
          displayName: 'User Locale',
          shortDesc: 'Locale for formatting',
          longDesc:
            'The locale to use for formatting numbers, dates, and other locale-specific data',
        },
        sort: {
          displayName: 'Sort',
          shortDesc: 'Sort configuration',
          longDesc: 'Configure how to sort the returned records',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Select the field to use for sorting the records',
              },
              direction: {
                displayName: 'Sort Direction',
                shortDesc: 'Sort order direction',
                longDesc: 'Choose whether to sort in ascending or descending order',
              },
            },
          },
        },
        cell_format: {
          displayName: 'Cell Format',
          shortDesc: 'Format for cell values',
          longDesc: 'Choose how cell values should be formatted in the response',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter configuration',
          longDesc: 'Configure filtering criteria to limit which records are returned',
          type: {
            fields: {
              field: {
                displayName: 'Filter Field',
                shortDesc: 'Field to filter on',
                longDesc: 'Select the field to use for filtering records',
              },
              value: {
                displayName: 'Filter Value',
                shortDesc: 'Value to filter by',
                longDesc: 'The value to compare against when filtering records',
              },
              type: {
                displayName: 'Filter Type',
                shortDesc: 'Type of filter comparison',
                longDesc: 'Choose the type of comparison to perform when filtering',
              },
              formula: {
                displayName: 'Filter Formula',
                shortDesc: 'Custom filter formula',
                longDesc: 'A custom Airtable formula to use for filtering records',
              },
            },
          },
        },
        return_fields_by_field_id: {
          displayName: 'Return Fields by Field ID',
          shortDesc: 'Return field IDs instead of names',
          longDesc:
            'When enabled, field data will be returned using field IDs instead of field names',
        },
        view: {
          displayName: 'View',
          shortDesc: 'Table view to use',
          longDesc: 'Select a specific view from the table to apply its filtering and sorting',
        },
      },
    },
    get_record: {
      displayName: 'Get Record',
      shortDesc: 'Retrieve a specific record from Airtable',
      longDesc: 'Get a single record by its ID from a specified Airtable table',
      options: {
        base_id: {
          displayName: 'Base ID',
          shortDesc: 'The ID of the Airtable base',
          longDesc:
            'Select the Airtable base that contains the table with the record you want to retrieve',
        },
        table_id: {
          displayName: 'Table ID',
          shortDesc: 'The ID of the table',
          longDesc: 'Select the specific table within the base that contains the record',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to retrieve',
          longDesc: 'Select or enter the ID of the specific record you want to retrieve',
        },
      },
    },
    create_record: {
      displayName: 'Create Record',
      shortDesc: 'Create a new record in Airtable',
      longDesc: 'Create a new record in a specified Airtable table with the provided field values',
      options: {
        base_id: {
          displayName: 'Base ID',
          shortDesc: 'The ID of the Airtable base',
          longDesc: 'Select the Airtable base where you want to create the new record',
        },
        table_id: {
          displayName: 'Table ID',
          shortDesc: 'The ID of the table',
          longDesc: 'Select the specific table within the base where the record will be created',
        },
      },
    },
    delete_record: {
      displayName: 'Delete Record',
      shortDesc: 'Delete a record from Airtable',
      longDesc: 'Permanently delete a specific record from an Airtable table',
      options: {
        base_id: {
          displayName: 'Base ID',
          shortDesc: 'The ID of the Airtable base',
          longDesc: 'Select the Airtable base that contains the table with the record to delete',
        },
        table_id: {
          displayName: 'Table ID',
          shortDesc: 'The ID of the table',
          longDesc: 'Select the specific table within the base that contains the record to delete',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to delete',
          longDesc: 'Select or enter the ID of the specific record you want to delete',
        },
      },
    },
    list_bases: {
      displayName: 'List Bases',
      shortDesc: 'List all accessible Airtable bases',
      longDesc:
        'Retrieve a list of all Airtable bases that are accessible with the current authentication',
      options: {
        offset: {
          displayName: 'Offset',
          shortDesc: 'Pagination offset',
          longDesc: 'Use the offset from a previous response to retrieve the next page of bases',
        },
      },
    },
    list_tables: {
      displayName: 'List Tables',
      shortDesc: 'List tables in an Airtable base',
      longDesc: 'Retrieve a list of all tables within a specified Airtable base',
      options: {
        base_id: {
          displayName: 'Base ID',
          shortDesc: 'The ID of the Airtable base',
          longDesc: 'Select the Airtable base for which you want to list all available tables',
        },
      },
    },
  },
  triggers: {
    new_record: {
      displayName: 'New Record',
      shortDesc: 'Triggers when a new record is created in Airtable',
      longDesc:
        'Monitor an Airtable table for newly created records and trigger automation when new records are added',
      options: {
        base_id: {
          displayName: 'Base ID',
          shortDesc: 'The ID of the Airtable base to monitor',
          longDesc:
            'Select the Airtable base that contains the table you want to monitor for new records',
        },
        table_id: {
          displayName: 'Table ID',
          shortDesc: 'The ID of the table to monitor',
          longDesc: 'Select the specific table within the base to monitor for new record creation',
        },
        view: {
          displayName: 'View',
          shortDesc: 'Optional table view to filter records',
          longDesc:
            "Select a specific view from the table to monitor only records that match the view's filtering and sorting criteria",
        },
      },
    },
    updated_record: {
      displayName: 'Updated Record',
      shortDesc: 'Triggers when a record is updated in Airtable',
      longDesc:
        'Monitor an Airtable table for record modifications and trigger automation when existing records are updated',
      options: {
        base_id: {
          displayName: 'Base ID',
          shortDesc: 'The ID of the Airtable base to monitor',
          longDesc:
            'Select the Airtable base that contains the table you want to monitor for record updates',
        },
        table_id: {
          displayName: 'Table ID',
          shortDesc: 'The ID of the table to monitor',
          longDesc: 'Select the specific table within the base to monitor for record modifications',
        },
        view: {
          displayName: 'View',
          shortDesc: 'Optional table view to filter records',
          longDesc:
            "Select a specific view from the table to monitor only records that match the view's filtering and sorting criteria",
        },
      },
    },
  },
};

export default AirtableAppEn;
