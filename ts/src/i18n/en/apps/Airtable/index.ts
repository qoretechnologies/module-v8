/* eslint-disable max-len */
const AirtableAppEn = {
  displayName: 'Airtable',
  groups: ['Spreadsheets & Data Tables', 'Project & Task Management'],
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
  expressions: {
    // ==================== LOGICAL OPERATORS ====================
    '&&': {
      displayName: 'and (&&)',
      shortDesc: 'Returns True if all conditions are True',
      longDesc: 'Logical AND operator that returns True only if all provided conditions evaluate to True',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression that evaluates to True or False',
        },
      ],
    },
    '||': {
      displayName: 'or (||)',
      shortDesc: 'Returns True if any condition is True',
      longDesc: 'Logical OR operator that returns True if at least one of the provided conditions evaluates to True',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression that evaluates to True or False',
        },
      ],
    },
    not: {
      displayName: 'not',
      shortDesc: 'Negates a boolean value',
      longDesc: 'Logical NOT operator that returns True if the condition is False, and False if the condition is True',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to negate',
          longDesc: 'A boolean expression whose value will be inverted',
        },
      ],
    },
    xor: {
      displayName: 'xor',
      shortDesc: 'Returns True if exactly one condition is True',
      longDesc: 'Logical XOR (exclusive OR) operator that returns True if an odd number of conditions are True',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to evaluate',
          longDesc: 'A boolean expression that evaluates to True or False',
        },
      ],
    },

    // ==================== COMPARISON OPERATORS ====================
    '==': {
      displayName: 'equals (==)',
      shortDesc: 'Checks if two values are equal',
      longDesc: 'Compares a field value with a specified value and returns True if they are equal',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field with',
        },
      ],
    },
    '!=': {
      displayName: 'not equals (!=)',
      shortDesc: 'Checks if two values are not equal',
      longDesc: 'Compares a field value with a specified value and returns True if they are different',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to compare',
          longDesc: 'The field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The value to compare the field with',
        },
      ],
    },
    '>': {
      displayName: 'greater than (>)',
      shortDesc: 'Checks if a value is greater than another',
      longDesc: 'Compares a numeric field with a value and returns True if the field is greater',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The numeric value to compare the field with',
        },
      ],
    },
    '>=': {
      displayName: 'greater than or equal (>=)',
      shortDesc: 'Checks if a value is greater than or equal to another',
      longDesc: 'Compares a numeric field with a value and returns True if the field is greater or equal',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The numeric value to compare the field with',
        },
      ],
    },
    '<': {
      displayName: 'less than (<)',
      shortDesc: 'Checks if a value is less than another',
      longDesc: 'Compares a numeric field with a value and returns True if the field is less',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The numeric value to compare the field with',
        },
      ],
    },
    '<=': {
      displayName: 'less than or equal (<=)',
      shortDesc: 'Checks if a value is less than or equal to another',
      longDesc: 'Compares a numeric field with a value and returns True if the field is less or equal',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to compare',
          longDesc: 'The numeric field whose value will be compared',
        },
        {
          displayName: 'Value',
          shortDesc: 'Value to compare against',
          longDesc: 'The numeric value to compare the field with',
        },
      ],
    },

    // ==================== STRING OPERATORS ====================
    contains: {
      displayName: 'contains',
      shortDesc: 'Checks if a field contains a substring',
      longDesc: 'Returns True if the field value contains the specified substring (case-sensitive)',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search in',
          longDesc: 'The text field to search for the substring',
        },
        {
          displayName: 'Substring',
          shortDesc: 'Text to find',
          longDesc: 'The substring to search for within the field',
        },
      ],
    },
    'contains-not': {
      displayName: 'contains not',
      shortDesc: 'Checks if a field does not contain a substring',
      longDesc: 'Returns True if the field value does not contain the specified substring',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search in',
          longDesc: 'The text field to search for the substring',
        },
        {
          displayName: 'Substring',
          shortDesc: 'Text to find',
          longDesc: 'The substring that should not be present in the field',
        },
      ],
    },
    'starts-with': {
      displayName: 'starts with',
      shortDesc: 'Checks if a field starts with a prefix',
      longDesc: 'Returns True if the field value begins with the specified prefix',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to check',
          longDesc: 'The text field to check for the prefix',
        },
        {
          displayName: 'Prefix',
          shortDesc: 'Starting text',
          longDesc: 'The prefix that the field value should start with',
        },
      ],
    },
    'ends-with': {
      displayName: 'ends with',
      shortDesc: 'Checks if a field ends with a suffix',
      longDesc: 'Returns True if the field value ends with the specified suffix',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to check',
          longDesc: 'The text field to check for the suffix',
        },
        {
          displayName: 'Suffix',
          shortDesc: 'Ending text',
          longDesc: 'The suffix that the field value should end with',
        },
      ],
    },
    'regex-match': {
      displayName: 'regex match',
      shortDesc: 'Checks if a field matches a regular expression',
      longDesc: 'Returns True if the field value matches the specified regular expression pattern',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to match',
          longDesc: 'The text field to test against the regular expression',
        },
        {
          displayName: 'Pattern',
          shortDesc: 'Regular expression pattern',
          longDesc: 'The regular expression pattern to match against the field value',
        },
      ],
    },

    // ==================== NULL CHECK OPERATORS ====================
    empty: {
      displayName: 'is empty',
      shortDesc: 'Checks if a field is empty or blank',
      longDesc: 'Returns True if the field has no value, is empty, or is blank',
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
      shortDesc: 'Checks if a field has a value',
      longDesc: 'Returns True if the field has a non-empty, non-blank value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for a value',
        },
      ],
    },

    // ==================== DATE/TIME OPERATORS ====================
    'is-before': {
      displayName: 'is before',
      shortDesc: 'Checks if a date is before another date',
      longDesc: 'Returns True if the field date is earlier than the specified date',
      args: [
        {
          displayName: 'Date Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field whose value will be compared',
        },
        {
          displayName: 'Date',
          shortDesc: 'Date to compare against',
          longDesc: 'The date that the field should be before',
        },
      ],
    },
    'is-after': {
      displayName: 'is after',
      shortDesc: 'Checks if a date is after another date',
      longDesc: 'Returns True if the field date is later than the specified date',
      args: [
        {
          displayName: 'Date Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field whose value will be compared',
        },
        {
          displayName: 'Date',
          shortDesc: 'Date to compare against',
          longDesc: 'The date that the field should be after',
        },
      ],
    },
    'is-same': {
      displayName: 'is same',
      shortDesc: 'Checks if two dates are the same',
      longDesc: 'Returns True if the field date is the same as the specified date',
      args: [
        {
          displayName: 'Date Field',
          shortDesc: 'Date field to compare',
          longDesc: 'The date field whose value will be compared',
        },
        {
          displayName: 'Date',
          shortDesc: 'Date to compare against',
          longDesc: 'The date that the field should match',
        },
      ],
    },

    // ==================== BOOLEAN OPERATORS ====================
    boolean: {
      displayName: 'boolean check',
      shortDesc: 'Checks a boolean field value',
      longDesc: 'Returns True if the boolean field matches the specified value (true or false)',
      args: [
        {
          displayName: 'Boolean Field',
          shortDesc: 'Boolean field to check',
          longDesc: 'The boolean/checkbox field to evaluate',
        },
        {
          displayName: 'Value',
          shortDesc: 'Expected boolean value',
          longDesc: 'The boolean value to compare against (true or false)',
        },
      ],
    },

    // ==================== STRING FUNCTIONS ====================
    find: {
      displayName: 'find',
      shortDesc: 'Finds the position of a substring (case-sensitive)',
      longDesc: 'Returns the position (1-based) of the first occurrence of a substring, or 0 if not found',
      args: [
        {
          displayName: 'Substring',
          shortDesc: 'Text to search for',
          longDesc: 'The substring to find within the field (case-sensitive)',
        },
        {
          displayName: 'Field',
          shortDesc: 'Text field to search in',
          longDesc: 'The text field to search within',
        },
      ],
    },
    search: {
      displayName: 'search',
      shortDesc: 'Finds the position of a substring (case-insensitive)',
      longDesc: 'Returns the position (1-based) of the first occurrence of a substring (case-insensitive), or 0 if not found',
      args: [
        {
          displayName: 'Substring',
          shortDesc: 'Text to search for',
          longDesc: 'The substring to find within the field (case-insensitive)',
        },
        {
          displayName: 'Field',
          shortDesc: 'Text field to search in',
          longDesc: 'The text field to search within',
        },
      ],
    },
    len: {
      displayName: 'length',
      shortDesc: 'Returns the length of a text field',
      longDesc: 'Returns the number of characters in the text field value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to measure',
          longDesc: 'The text field whose length will be returned',
        },
      ],
    },
    lower: {
      displayName: 'lowercase',
      shortDesc: 'Converts text to lowercase',
      longDesc: 'Returns the text field value converted to all lowercase letters',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to convert',
          longDesc: 'The text field to convert to lowercase',
        },
      ],
    },
    upper: {
      displayName: 'uppercase',
      shortDesc: 'Converts text to uppercase',
      longDesc: 'Returns the text field value converted to all uppercase letters',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to convert',
          longDesc: 'The text field to convert to uppercase',
        },
      ],
    },
    trim: {
      displayName: 'trim',
      shortDesc: 'Removes leading and trailing whitespace',
      longDesc: 'Returns the text field value with whitespace removed from the beginning and end',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to trim',
          longDesc: 'The text field to remove whitespace from',
        },
      ],
    },

    // ==================== NUMERIC FUNCTIONS ====================
    abs: {
      displayName: 'absolute value',
      shortDesc: 'Returns the absolute value of a number',
      longDesc: 'Returns the non-negative value of a number (removes the sign)',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field',
          longDesc: 'The numeric field to get the absolute value of',
        },
      ],
    },
    round: {
      displayName: 'round',
      shortDesc: 'Rounds a number to specified decimal places',
      longDesc: 'Rounds a numeric field value to the specified number of decimal places',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field to round',
          longDesc: 'The numeric field whose value will be rounded',
        },
        {
          displayName: 'Precision',
          shortDesc: 'Decimal places',
          longDesc: 'The number of decimal places to round to',
        },
      ],
    },
    floor: {
      displayName: 'floor',
      shortDesc: 'Rounds a number down to the nearest integer',
      longDesc: 'Returns the largest integer less than or equal to the field value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field',
          longDesc: 'The numeric field to round down',
        },
      ],
    },
    ceiling: {
      displayName: 'ceiling',
      shortDesc: 'Rounds a number up to the nearest integer',
      longDesc: 'Returns the smallest integer greater than or equal to the field value',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field',
          longDesc: 'The numeric field to round up',
        },
      ],
    },
    mod: {
      displayName: 'modulo',
      shortDesc: 'Returns the remainder of division',
      longDesc: 'Returns the remainder when dividing the field value by the specified divisor',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Numeric field (dividend)',
          longDesc: 'The numeric field to divide',
        },
        {
          displayName: 'Divisor',
          shortDesc: 'Number to divide by',
          longDesc: 'The number to divide the field value by',
        },
      ],
    },

    // ==================== CONDITIONAL FUNCTIONS ====================
    if: {
      displayName: 'if',
      shortDesc: 'Returns a value based on a condition',
      longDesc: 'Evaluates a condition and returns one value if true, another if false',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition',
          longDesc: 'The condition to evaluate',
        },
        {
          displayName: 'If True',
          shortDesc: 'Value when true',
          longDesc: 'The value to return if the condition is true',
        },
        {
          displayName: 'If False',
          shortDesc: 'Value when false',
          longDesc: 'The value to return if the condition is false',
        },
      ],
    },

    // ==================== AGGREGATE FUNCTIONS ====================
    sum: {
      displayName: 'sum',
      shortDesc: 'Calculates the sum of numeric values',
      longDesc: 'Returns the total sum of all provided numeric values or fields',
      args: [
        {
          displayName: 'Value',
          shortDesc: 'Numeric value or field',
          longDesc: 'A numeric value or field to include in the sum',
        },
      ],
    },
    average: {
      displayName: 'average',
      shortDesc: 'Calculates the average of numeric values',
      longDesc: 'Returns the arithmetic mean of all provided numeric values or fields',
      args: [
        {
          displayName: 'Value',
          shortDesc: 'Numeric value or field',
          longDesc: 'A numeric value or field to include in the average calculation',
        },
      ],
    },
    min: {
      displayName: 'minimum',
      shortDesc: 'Returns the smallest value',
      longDesc: 'Returns the minimum value from all provided numeric values or fields',
      args: [
        {
          displayName: 'Value',
          shortDesc: 'Numeric value or field',
          longDesc: 'A numeric value or field to compare',
        },
      ],
    },
    max: {
      displayName: 'maximum',
      shortDesc: 'Returns the largest value',
      longDesc: 'Returns the maximum value from all provided numeric values or fields',
      args: [
        {
          displayName: 'Value',
          shortDesc: 'Numeric value or field',
          longDesc: 'A numeric value or field to compare',
        },
      ],
    },
    count: {
      displayName: 'count',
      shortDesc: 'Counts the number of numeric values',
      longDesc: 'Returns the count of numeric values (excludes blanks and non-numeric values)',
      args: [
        {
          displayName: 'Value',
          shortDesc: 'Value to count',
          longDesc: 'A value or field to include in the count',
        },
      ],
    },
    counta: {
      displayName: 'count all',
      shortDesc: 'Counts all non-empty values',
      longDesc: 'Returns the count of all non-empty values (includes text, numbers, and other non-blank values)',
      args: [
        {
          displayName: 'Value',
          shortDesc: 'Value to count',
          longDesc: 'A value or field to include in the count',
        },
      ],
    },
  },
};

export default AirtableAppEn;
