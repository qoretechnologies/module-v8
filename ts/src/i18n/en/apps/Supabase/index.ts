/* eslint-disable max-len */
const SupabaseAppEn = {
  displayName: 'Supabase',
  groups: ['Databases & Backend Services'],
  shortDesc:
    'Connect to Supabase to manage your database tables, storage buckets, and real-time data',
  longDesc:
    'The Supabase integration provides comprehensive access to your Supabase backend services. Manage database tables with full CRUD operations, monitor real-time changes with triggers, and handle file storage through buckets. Whether you need to query data, insert records, filter results, or track new entries, this integration streamlines your Supabase workflow automation and backend management.',
  connectionMessage: {
    title: 'Connect to Supabase',
    content: `To connect to Supabase, you will need your **Project ID** (or Project URL) and a **service_role API Key**.

## Finding Your Project ID

1. Log in to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings** (gear icon) → **General**
4. Find your **Reference ID** (this is your Project ID)

Alternatively, your Project URL format is: \`https://<project-id>.supabase.co\`

## Getting Your API Key

1. In your project dashboard, go to **Project Settings** → **API**
2. Find the **Project API keys** section
3. Copy the **service_role** key (labeled "secret")

⚠️ **Important**: Use the \`service_role\` key, NOT the \`anon\` key. The service_role key bypasses Row Level Security (RLS) and has full access to your database.

## Connection Details

### Project ID / Project URL
Either your project's Reference ID or the full project URL:
- Reference ID: \`abcdefghijklmnop\`
- Project URL: \`https://abcdefghijklmnop.supabase.co\`

### API Key (service_role)
The \`service_role\` secret key from your project's API settings. This key:
- Bypasses Row Level Security (RLS)
- Has full access to all database operations
- Should only be used server-side, never in client applications

## API Key Types

| Key Type | Use Case |
|----------|----------|
| \`anon\` (public) | Client-side apps, respects RLS |
| \`service_role\` (secret) | Server-side operations, bypasses RLS |

**Note:** The \`service_role\` key is extremely powerful and should be kept secure. Never expose it in client-side code or public repositories. For this integration, the service_role key is required to perform administrative operations.`,
  },
  actions: {
    get_table: {
      groups: ['Tables'],
      displayName: 'Get Table',
      shortDesc: 'Retrieve detailed schema information about a specific Supabase table',
      longDesc:
        'Fetches comprehensive metadata for a specific table including column definitions, data types, required fields, and descriptions. This action helps you understand the structure of your database tables.',
      options: {
        tableName: {
          displayName: 'Table Name',
          shortDesc: 'The name of the table to retrieve',
          longDesc:
            'Select the Supabase table whose schema information you want to fetch. The table must exist in your Supabase project.',
        },
      },
    },
    list_tables: {
      groups: ['Tables'],
      displayName: 'List Tables',
      shortDesc: 'Get a list of all tables in your Supabase database',
      longDesc:
        'Retrieves all tables from your Supabase database with their basic metadata including column information and descriptions. Optionally include system tables in the results.',
      options: {
        include_system_tables: {
          displayName: 'Include System Tables',
          shortDesc: 'Include internal Supabase system tables in the results',
          longDesc:
            'When enabled, the response will include system tables (those starting with underscore). System tables contain Supabase internal data and are typically hidden from regular queries.',
        },
      },
    },
    create_row: {
      groups: ['Rows'],
      displayName: 'Create Row',
      shortDesc: 'Insert a new row into a Supabase table',
      longDesc:
        'Creates a new record in the specified Supabase table. The action dynamically presents the table schema, allowing you to provide values for each column. Returns the newly created row with all its data.',
      options: {
        tableName: {
          displayName: 'Table Name',
          shortDesc: 'The table where the row will be inserted',
          longDesc:
            'Select the target Supabase table for inserting the new row. The available fields will be dynamically loaded based on the selected table schema.',
        },
        values: {
          displayName: 'Row Values',
          shortDesc: 'The data to insert into the new row',
          longDesc:
            'Provide values for the table columns. The structure is dynamically generated based on the selected table schema, showing all available columns with their data types and constraints.',
        },
      },
    },
    list_rows: {
      groups: ['Rows'],
      displayName: 'List Rows',
      shortDesc: 'Query and retrieve rows from a Supabase table',
      longDesc:
        'Fetches rows from a Supabase table with support for filtering, sorting, pagination, and ordering. Returns a list of records matching your query criteria along with total count information.',
      options: {
        tableName: {
          displayName: 'Table Name',
          shortDesc: 'The table to query',
          longDesc:
            'Select the Supabase table from which you want to retrieve rows. The available columns for filtering and ordering will be loaded based on this selection.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of rows to return',
          longDesc:
            'Specify the maximum number of rows to retrieve in a single query. Useful for pagination and performance optimization. Defaults to 20 if not specified.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of rows to skip',
          longDesc:
            'Skip this many rows before starting to return results. Used in combination with limit for pagination through large datasets.',
        },
        orderBy: {
          displayName: 'Order By',
          shortDesc: 'Sort the results by a specific column',
          longDesc:
            'Define how to sort the retrieved rows by specifying a column and sort direction (ascending or descending).',
          type: {
            fields: {
              column: {
                displayName: 'Column',
                shortDesc: 'The column to sort by',
                longDesc: 'Select the table column used for sorting the results.',
              },
              ascending: {
                displayName: 'Ascending',
                shortDesc: 'Sort in ascending order',
                longDesc:
                  'When enabled, sorts in ascending order (A-Z, 0-9, oldest first). When disabled, sorts in descending order (Z-A, 9-0, newest first).',
              },
            },
          },
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter rows based on a condition',
          longDesc:
            'Apply a filter condition to retrieve only rows that match specific criteria. Supports various comparison operators for flexible querying.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The column to filter on',
                longDesc: 'Select the table column to apply the filter condition to.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc:
                  'Choose the comparison operator for the filter (equals, greater than, contains, etc.).',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to compare against',
                longDesc:
                  'The value to compare the column against using the selected operator. For "in" operator, provide comma-separated values.',
              },
            },
          },
        },
      },
    },
    delete_rows: {
      groups: ['Rows'],
      displayName: 'Delete Rows',
      shortDesc: 'Delete rows from a Supabase table based on a filter',
      longDesc:
        'Removes rows from a Supabase table that match the specified filter criteria. Returns the count of deleted rows and their data. Use with caution as this operation is irreversible.',
      options: {
        tableName: {
          displayName: 'Table Name',
          shortDesc: 'The table to delete rows from',
          longDesc:
            'Select the Supabase table from which you want to delete rows. Ensure you have proper permissions for delete operations on this table.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Condition to identify rows to delete',
          longDesc:
            'Define the filter criteria to identify which rows should be deleted. Only rows matching this condition will be removed from the table.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The column to filter on',
                longDesc: 'Select the table column to use for identifying rows to delete.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'Choose the comparison operator for the delete filter condition.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'The value to match',
                longDesc:
                  'The value to compare against. Rows matching this condition will be deleted.',
              },
            },
          },
        },
      },
    },
    upsert_row: {
      groups: ['Rows'],
      displayName: 'Upsert Row',
      shortDesc: 'Insert a new row or update an existing one',
      longDesc:
        'Performs an upsert operation (insert or update) on a Supabase table. If a row with the specified unique constraint exists, it will be updated; otherwise, a new row is inserted.',
      options: {
        tableName: {
          displayName: 'Table Name',
          shortDesc: 'The table for the upsert operation',
          longDesc:
            'Select the target Supabase table. The available fields will be dynamically loaded based on the table schema.',
        },
        values: {
          displayName: 'Row Values',
          shortDesc: 'The data to upsert',
          longDesc:
            'Provide values for the table columns. If a row with matching unique constraints exists, these values will update it; otherwise, a new row is created.',
        },
        onConflict: {
          displayName: 'On Conflict',
          shortDesc: 'The column(s) used to detect conflicts',
          longDesc:
            "Specify the column or comma-separated list of columns that should be used to detect conflicts. If not specified, uses the table's primary key.",
        },
        ignoreDuplicates: {
          displayName: 'Ignore Duplicates',
          shortDesc: 'Skip the operation if a duplicate exists',
          longDesc:
            'When enabled, if a conflicting row exists, the operation is silently ignored. When disabled (default), conflicting rows are updated with the new values.',
        },
      },
    },
    create_bucket: {
      groups: ['Storage'],
      displayName: 'Create Storage Bucket',
      shortDesc: 'Create a new storage bucket in Supabase',
      longDesc:
        'Creates a new storage bucket in Supabase Storage for organizing and storing files. Configure access permissions, file size limits, and allowed MIME types.',
      options: {
        name: {
          displayName: 'Bucket Name',
          shortDesc: 'The name for the new bucket',
          longDesc:
            'Specify a unique name for the storage bucket. The name must be URL-safe and unique within your Supabase project.',
        },
        public_access: {
          displayName: 'Public Access',
          shortDesc: 'Allow public access to bucket contents',
          longDesc:
            'When enabled, files in this bucket can be accessed publicly without authentication. When disabled (default), files require authentication to access.',
        },
        file_size_limit: {
          displayName: 'File Size Limit',
          shortDesc: 'Maximum file size in bytes',
          longDesc:
            'Set the maximum file size that can be uploaded to this bucket, specified in bytes. Leave empty for no limit.',
        },
        allowed_mime_types: {
          displayName: 'Allowed MIME Types',
          shortDesc: 'List of allowed file MIME types',
          longDesc:
            'Specify which file types can be uploaded to this bucket by providing a list of MIME types (e.g., image/png, application/pdf). Leave empty to allow all file types.',
        },
      },
    },
    list_buckets: {
      groups: ['Storage'],
      displayName: 'List Storage Buckets',
      shortDesc: 'Get all storage buckets in your Supabase project',
      longDesc:
        'Retrieves a list of all storage buckets in your Supabase project with their configurations including access permissions, file size limits, and allowed MIME types.',
    },
    get_bucket: {
      groups: ['Storage'],
      displayName: 'Get Storage Bucket',
      shortDesc: 'Retrieve details of a specific storage bucket',
      longDesc:
        'Fetches detailed information about a specific Supabase storage bucket including its configuration, creation date, access permissions, and file restrictions.',
      options: {
        bucket_id: {
          displayName: 'Bucket ID',
          shortDesc: 'The ID of the bucket to retrieve',
          longDesc:
            'Select the storage bucket whose details you want to fetch from your Supabase project.',
        },
      },
    },
  },
  triggers: {
    new_table_row: {
      displayName: 'New Table Row',
      shortDesc: 'Triggers when a new row is added to a Supabase table',
      longDesc:
        'Monitors a Supabase table for new rows and triggers when new records are inserted. Supports optional filtering to trigger only for rows matching specific criteria.',
      options: {
        tableName: {
          displayName: 'Table Name',
          shortDesc: 'The table to monitor for new rows',
          longDesc:
            'Select the Supabase table you want to monitor. The trigger will fire whenever new rows are inserted into this table.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Optional condition to filter new rows',
          longDesc:
            'Apply a filter to trigger only for new rows matching specific criteria. Leave empty to trigger for all new rows.',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'The column to filter on',
                longDesc: 'Select the table column to apply the filter condition to.',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'The comparison operator',
                longDesc: 'Choose the comparison operator for filtering new rows.',
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
    NOT: {
      displayName: 'not (!)',
      shortDesc: 'Logical negation',
      longDesc: 'Returns the logical negation of the argument',
      args: [
        {
          displayName: 'Condition',
          shortDesc: 'Boolean condition to negate',
          longDesc: 'A boolean expression or condition to negate',
        },
      ],
    },
    '==': {
      displayName: 'equals (==)',
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
      displayName: 'not equals (!=)',
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
      displayName: 'greater than (>)',
      shortDesc: 'Greater than comparison',
      longDesc: 'Returns `True` if the field value is greater than the specified value',
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
    '>=': {
      displayName: 'greater than or equal (>=)',
      shortDesc: 'Greater than or equal comparison',
      longDesc: 'Returns `True` if the field value is greater than or equal to the specified value',
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
    '<': {
      displayName: 'less than (<)',
      shortDesc: 'Less than comparison',
      longDesc: 'Returns `True` if the field value is less than the specified value',
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
    '<=': {
      displayName: 'less than or equal (<=)',
      shortDesc: 'Less than or equal comparison',
      longDesc: 'Returns `True` if the field value is less than or equal to the specified value',
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
    like: {
      displayName: 'like',
      shortDesc: 'Pattern matching (case-sensitive)',
      longDesc: 'Returns `True` if the field matches the pattern with % as wildcard',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to match',
          longDesc: 'The text field to match against the pattern',
        },
        {
          displayName: 'Pattern',
          shortDesc: 'Pattern to match',
          longDesc: 'The pattern to match with (use % as wildcard, e.g., "%example%")',
        },
      ],
    },
    ilike: {
      displayName: 'ilike',
      shortDesc: 'Pattern matching (case-insensitive)',
      longDesc:
        'Returns `True` if the field matches the pattern (case-insensitive) with % as wildcard',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to match',
          longDesc: 'The text field to match against the pattern',
        },
        {
          displayName: 'Pattern',
          shortDesc: 'Pattern to match',
          longDesc:
            'The pattern to match with, case-insensitive (use % as wildcard, e.g., "%example%")',
        },
      ],
    },
    in: {
      displayName: 'in',
      shortDesc: 'In list',
      longDesc: 'Returns `True` if the field value is in the provided list',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Values',
          shortDesc: 'List of values',
          longDesc: 'The list of values to check the field against',
        },
      ],
    },
    contains: {
      displayName: 'contains (@>)',
      shortDesc: 'Array contains elements',
      longDesc: 'Returns `True` if the array field contains all the specified elements',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Array field to check',
          longDesc: 'The array field to check for contained elements',
        },
        {
          displayName: 'Elements',
          shortDesc: 'Elements to find',
          longDesc: 'The list of elements that should be contained in the array',
        },
      ],
    },
  },
};

export default SupabaseAppEn;
