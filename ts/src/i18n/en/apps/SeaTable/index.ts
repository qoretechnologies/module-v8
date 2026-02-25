const SeaTableAppEn = {
  displayName: 'SeaTable',
  groups: ['Spreadsheets & Data Tables', 'Databases & Backend Services'],
  shortDesc: 'Connect to SeaTable to manage your database tables and records with powerful automation',
  longDesc:
    'The SeaTable integration provides comprehensive access to your SeaTable database operations. Create, read, update, and delete records in your tables, execute SQL queries, and monitor new entries with real-time triggers. Whether you need to manage data, filter results with SQL, or track new records, this integration streamlines your SeaTable workflow automation and database management.',
  connectionMessage: {
    title: 'Connect to SeaTable',
    content: `To connect to SeaTable, you will need your **SeaTable Server URL** and an **API Token**.

## Getting Your API Token

1. Log in to your SeaTable instance
2. Open the base you want to connect to
3. Click on the **dropdown arrow** next to the base name
4. Select **API Token** from the menu
5. Create a new token with the desired permissions (read or read/write)

For detailed instructions, see the [SeaTable API Token Guide](https://seatable.com/help/create-api-tokens/).

## Connection Details

### SeaTable Server URL
The base URL of your SeaTable instance:
- **SeaTable Cloud**: Use \`https://cloud.seatable.io\`
- **Self-hosted**: Use your instance URL (e.g., \`https://seatable.yourcompany.com\`)

### API Token
Your API token grants access to a specific base. Each token can have read-only or read-write permissions.

**Note:** API tokens are scoped to a single base. If you need to access multiple bases, you'll need to create separate connections for each one.`,
  },
  triggers: {
    new_document: {
      displayName: 'New Row',
      shortDesc: 'Trigger when a new row is added to a SeaTable table',
      longDesc:
        'Monitors a SeaTable table for new rows and triggers when new records are detected. The trigger polls for changes and fires when new rows are found.',
      options: {
        table: {
          displayName: 'Table',
          shortDesc: 'The table to monitor for new rows',
          longDesc:
            'Select the SeaTable table to monitor. The trigger will fire when new rows are added to this table.',
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
          field: {
            displayName: 'Field',
            shortDesc: 'The field to sort by',
            longDesc: 'The name of the field to use for sorting results',
          },
          direction: {
            displayName: 'Direction',
            shortDesc: 'Sort direction',
            longDesc: 'The direction to sort results (ascending or descending)',
          },
        },
      },
    },
  },
  actions: {
    run_sql: {
      displayName: 'Run SQL Query',
      shortDesc: 'Execute a SQL query on the SeaTable base',
      longDesc:
        'Executes a SQL query on your SeaTable base and returns the results. Supports SELECT, INSERT, UPDATE, and DELETE statements. Maximum of 10,000 rows can be returned for SELECT queries.',
      options: {
        sql: {
          displayName: 'SQL Query',
          shortDesc: 'The SQL query to execute',
          longDesc:
            'Enter your SQL query. Use backticks around column names with special characters (e.g., `My Column`). Example: SELECT * FROM `Table1` WHERE `Status` = \'Active\' LIMIT 100',
        },
      },
    },
  },
};

export default SeaTableAppEn;
