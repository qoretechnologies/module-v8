const NocoDBAppEn = {
  displayName: 'NocoDB',
  groups: ['Spreadsheets & Data Tables', 'Databases & Backend Services'],
  shortDesc:
    'Connect to NocoDB to manage your database tables and records with powerful automation',
  longDesc:
    'The NocoDB integration provides comprehensive access to your NocoDB database operations. Create, read, update, and delete records in your tables, and monitor new entries with real-time triggers. Whether you need to manage data, filter results, or track new records, this integration streamlines your NocoDB workflow automation and database management.',
  connectionMessage: {
    title: 'Connect to NocoDB',
    content: `To connect to NocoDB, you will need your **NocoDB URL** and an **API Token**.

## Getting Your API Token

1. Log in to your NocoDB instance
2. Click on your **profile icon** in the top right corner
3. Select **Copy Auth Token** from the dropdown menu
4. Alternatively, go to **Account Settings** → **Tokens** to create a new API token

## Connection Details

### NocoDB URL
The base URL of your NocoDB instance:
- **NocoDB Cloud**: Use \`https://app.nocodb.com\`
- **Self-hosted**: Use your instance URL (e.g., \`https://nocodb.yourcompany.com\`)

### API Token
Your API token that grants access to NocoDB. Tokens can be created in your account settings and provide access to all operations within the authorized workspaces and bases.

**Note:** API tokens provide full access to the workspaces and bases you have permissions for. Ensure you keep your tokens secure and only use them in trusted environments.`,
  },
  triggers: {
    new_document: {
      displayName: 'New Row',
      shortDesc: 'Trigger when a new row is added to a NocoDB table',
      longDesc:
        'Monitors a NocoDB table for new rows and triggers when new records are detected. You can optionally filter which rows trigger the event using a where clause.',
      options: {
        workspaceId: {
          displayName: 'Workspace',
          shortDesc: 'The NocoDB workspace containing the base',
          longDesc: 'Select the NocoDB workspace containing the base with the table you want to monitor.',
        },
        baseId: {
          displayName: 'Base',
          shortDesc: 'The NocoDB base containing the table',
          longDesc: 'Select the NocoDB base (project) containing the table you want to monitor for new rows.',
        },
        table: {
          displayName: 'Table',
          shortDesc: 'The table to monitor for new rows',
          longDesc:
            'Select the NocoDB table to monitor. The trigger will fire when new rows are added to this table.',
        },
        where: {
          displayName: 'Where Filter',
          shortDesc: 'Optional filter for new rows',
          longDesc:
            'Optionally specify a filter using NocoDB where syntax (e.g., "(Status,eq,Active)") to only trigger for rows matching specific criteria.',
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
    count_records: {
      displayName: 'Count Records',
      shortDesc: 'Get the count of records in a table',
      longDesc:
        'Returns the total number of records in a NocoDB table. You can optionally filter the count using a where clause to count only records matching specific criteria.',
      options: {
        workspaceId: {
          displayName: 'Workspace',
          shortDesc: 'The NocoDB workspace containing the base',
          longDesc: 'Select the NocoDB workspace containing the base with the table.',
        },
        baseId: {
          displayName: 'Base',
          shortDesc: 'The NocoDB base containing the table',
          longDesc: 'Select the NocoDB base (project) containing the table.',
        },
        table: {
          displayName: 'Table',
          shortDesc: 'The table to count records from',
          longDesc: 'Select the NocoDB table to count records from.',
        },
        where: {
          displayName: 'Where Filter',
          shortDesc: 'Optional filter to count specific records',
          longDesc:
            'Optionally specify a filter using NocoDB where syntax (e.g., "(Status,eq,Active)") to only count records matching specific criteria.',
        },
      },
    },
    upload_attachment: {
      displayName: 'Upload Attachment',
      shortDesc: 'Upload a file to an attachment field',
      longDesc:
        'Uploads a file to a specific attachment field in a NocoDB record. The file will be stored in NocoDB and associated with the specified record.',
      options: {
        workspaceId: {
          displayName: 'Workspace',
          shortDesc: 'The NocoDB workspace containing the base',
          longDesc: 'Select the NocoDB workspace containing the base with the table.',
        },
        baseId: {
          displayName: 'Base',
          shortDesc: 'The NocoDB base containing the table',
          longDesc: 'Select the NocoDB base (project) containing the table.',
        },
        table: {
          displayName: 'Table',
          shortDesc: 'The table containing the record',
          longDesc: 'Select the NocoDB table containing the record to attach the file to.',
        },
        recordId: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the record to attach the file to',
          longDesc: 'Specify the ID of the record where the file should be uploaded.',
        },
        attachmentField: {
          displayName: 'Attachment Field',
          shortDesc: 'The attachment field to upload to',
          longDesc: 'Select the attachment field in the table where the file will be stored.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc: 'The file to upload to the attachment field. Supports various file types including images, documents, and more.',
        },
      },
    },
    link_records: {
      displayName: 'Link Records',
      shortDesc: 'Create relationships between records',
      longDesc:
        'Links records from another table to a record via a link field. This creates a relationship between the records without affecting existing links.',
      options: {
        workspaceId: {
          displayName: 'Workspace',
          shortDesc: 'The NocoDB workspace containing the base',
          longDesc: 'Select the NocoDB workspace containing the base with the table.',
        },
        baseId: {
          displayName: 'Base',
          shortDesc: 'The NocoDB base containing the table',
          longDesc: 'Select the NocoDB base (project) containing the table.',
        },
        table: {
          displayName: 'Table',
          shortDesc: 'The table containing the source record',
          longDesc: 'Select the NocoDB table containing the record you want to link from.',
        },
        linkField: {
          displayName: 'Link Field',
          shortDesc: 'The link field to use for the relationship',
          longDesc: 'Select the link field (Link to Another Record) that defines the relationship between tables.',
        },
        recordId: {
          displayName: 'Record ID',
          shortDesc: 'The source record ID',
          longDesc: 'Specify the ID of the record in the source table to link from.',
        },
        linkedRecordIds: {
          displayName: 'Records to Link',
          shortDesc: 'IDs of records to link',
          longDesc: 'Provide the IDs of records from the linked table to connect to the source record.',
        },
      },
    },
    unlink_records: {
      displayName: 'Unlink Records',
      shortDesc: 'Remove relationships between records',
      longDesc:
        'Removes the link between records via a link field. This breaks the relationship without deleting any records.',
      options: {
        workspaceId: {
          displayName: 'Workspace',
          shortDesc: 'The NocoDB workspace containing the base',
          longDesc: 'Select the NocoDB workspace containing the base with the table.',
        },
        baseId: {
          displayName: 'Base',
          shortDesc: 'The NocoDB base containing the table',
          longDesc: 'Select the NocoDB base (project) containing the table.',
        },
        table: {
          displayName: 'Table',
          shortDesc: 'The table containing the source record',
          longDesc: 'Select the NocoDB table containing the record you want to unlink from.',
        },
        linkField: {
          displayName: 'Link Field',
          shortDesc: 'The link field with the relationship',
          longDesc: 'Select the link field (Link to Another Record) that defines the relationship to remove.',
        },
        recordId: {
          displayName: 'Record ID',
          shortDesc: 'The source record ID',
          longDesc: 'Specify the ID of the record in the source table to unlink from.',
        },
        linkedRecordIds: {
          displayName: 'Records to Unlink',
          shortDesc: 'IDs of records to unlink',
          longDesc: 'Provide the IDs of records from the linked table to disconnect from the source record.',
        },
      },
    },
    trigger_button: {
      displayName: 'Trigger Button',
      shortDesc: 'Trigger a button action on records',
      longDesc:
        'Programmatically triggers a button action (such as AI generation or webhook) for specified records. Maximum of 25 records can be processed at a time.',
      options: {
        workspaceId: {
          displayName: 'Workspace',
          shortDesc: 'The NocoDB workspace containing the base',
          longDesc: 'Select the NocoDB workspace containing the base with the table.',
        },
        baseId: {
          displayName: 'Base',
          shortDesc: 'The NocoDB base containing the table',
          longDesc: 'Select the NocoDB base (project) containing the table.',
        },
        table: {
          displayName: 'Table',
          shortDesc: 'The table containing the button field',
          longDesc: 'Select the NocoDB table containing the button field to trigger.',
        },
        buttonField: {
          displayName: 'Button Field',
          shortDesc: 'The button field to trigger',
          longDesc: 'Select the button field whose action should be triggered for the specified records.',
        },
        recordIds: {
          displayName: 'Record IDs',
          shortDesc: 'IDs of records to process',
          longDesc: 'Provide the IDs of records to trigger the button action for. Maximum 25 records per request.',
        },
        preview: {
          displayName: 'Preview Mode',
          shortDesc: 'Run in preview mode without saving changes',
          longDesc: 'When enabled, the button action runs in preview mode and changes are not saved. Useful for testing.',
        },
      },
    },
  },
};

export default NocoDBAppEn;
