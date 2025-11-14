/* eslint-disable max-len */
const ZohoCrmAppEn = {
  displayName: 'Zoho CRM',
  shortDesc:
    'Connect to Zoho CRM to automate customer relationship management across all global data centers.',
  longDesc:
    'The Zoho CRM integration provides comprehensive actions and triggers to interact with the Zoho CRM API across all seven global data centers (US, AU, EU, IN, CN, JP, CA). Manage modules, records, users, and roles efficiently while automating your CRM workflows with support for custom modules, bulk operations, and real-time triggers.',
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
      shortDesc: 'Contains text pattern',
      longDesc: 'Returns `True` if the field value contains the specified text pattern',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Pattern',
          shortDesc: 'Text pattern to search for',
          longDesc: 'The text pattern to search for within the field',
        },
      ],
    },
    'not-like': {
      displayName: 'not like',
      shortDesc: 'Does not contain text pattern',
      longDesc: 'Returns `True` if the field value does not contain the specified text pattern',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to search',
          longDesc: 'The text field to search within',
        },
        {
          displayName: 'Pattern',
          shortDesc: 'Text pattern to exclude',
          longDesc: 'The text pattern that should not be present in the field',
        },
      ],
    },
    in: {
      displayName: 'in',
      shortDesc: 'Value is in list',
      longDesc: 'Returns `True` if the field value matches any value in the provided list',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Values',
          shortDesc: 'List of values to match',
          longDesc: 'List of values to compare against',
        },
      ],
    },
    'not-in': {
      displayName: 'not in',
      shortDesc: 'Value is not in list',
      longDesc: 'Returns `True` if the field value does not match any value in the provided list',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Values',
          shortDesc: 'List of values to exclude',
          longDesc: 'List of values that should not match',
        },
      ],
    },
    between: {
      displayName: 'between',
      shortDesc: 'Value is between two values',
      longDesc: 'Returns `True` if the field value is between two specified values (inclusive)',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Lower bound',
          shortDesc: 'Minimum value',
          longDesc: 'The minimum value (inclusive)',
        },
        {
          displayName: 'Upper bound',
          shortDesc: 'Maximum value',
          longDesc: 'The maximum value (inclusive)',
        },
      ],
    },
    'not-between': {
      displayName: 'not between',
      shortDesc: 'Value is not between two values',
      longDesc: 'Returns `True` if the field value is not between two specified values',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field whose value will be checked',
        },
        {
          displayName: 'Lower bound',
          shortDesc: 'Minimum value to exclude',
          longDesc: 'The lower boundary for exclusion',
        },
        {
          displayName: 'Upper bound',
          shortDesc: 'Maximum value to exclude',
          longDesc: 'The upper boundary for exclusion',
        },
      ],
    },
    'is-null': {
      displayName: 'is null',
      shortDesc: 'Field is null',
      longDesc: 'Returns `True` if the field value is null or empty',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for null value',
        },
      ],
    },
    'is-not-null': {
      displayName: 'is not null',
      shortDesc: 'Field is not null',
      longDesc: 'Returns `True` if the field value is not null or empty',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for non-null value',
        },
      ],
    },
  },
  triggers: {
    new_record: {
      displayName: 'New Record',
      shortDesc: 'Triggers when a new record is created in a Zoho CRM module',
      longDesc:
        'Monitors a specified Zoho CRM module for newly created records and fires when a new record is detected. The trigger polls for records sorted by Created Time in descending order. You can optionally filter records by phone, email, keywords, or specific field values to only trigger for records matching your criteria.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module to monitor for new records',
          longDesc:
            'Select the Zoho CRM module (such as Leads, Contacts, Deals, Accounts, or custom modules) where you want to monitor for newly created records. Use the module API name as returned by the Modules Metadata API.',
        },
        phone: {
          displayName: 'Phone Filter',
          shortDesc: 'Filter records by phone number',
          longDesc:
            'Optional phone number to search for in records. When specified, only records containing this phone number will trigger the event. This uses the Zoho CRM search API to find matching records.',
        },
        email: {
          displayName: 'Email Filter',
          shortDesc: 'Filter records by email address',
          longDesc:
            'Optional email address to search for in records. When specified, only records containing this email address will trigger the event. This uses the Zoho CRM search API to find matching records.',
        },
        word: {
          displayName: 'Keyword Search',
          shortDesc: 'Filter records by keyword',
          longDesc:
            'Optional keyword to search for across all searchable fields in records. When specified, only records containing this keyword will trigger the event. This uses the Zoho CRM search API to perform a comprehensive text search.',
        },
        field_filter: {
          displayName: 'Field Filters',
          shortDesc: 'Filter records by specific field values',
          longDesc:
            'Optional list of field-value pairs to create search criteria. When specified, only records where ALL specified fields match their corresponding values will trigger the event. Uses the "equals" operator for each field comparison.',
          type: {
            fields: {
              field: {
                displayName: 'Field Name',
                shortDesc: 'The API name of the field to filter on',
                longDesc:
                  'Select or enter the field API name from the module. Available field names can be retrieved using the Fields Metadata API. The field must be searchable to be used in filtering.',
              },
              value: {
                displayName: 'Field Value',
                shortDesc: 'The value that the field must equal',
                longDesc:
                  'Enter the exact value that the field must equal for the record to match. The comparison uses the "equals" operator, so the field value must match this value exactly.',
              },
            },
          },
        },
      },
    },
  },
  actions: {
    create_record: {
      displayName: 'Create Record',
      shortDesc: 'Create a new record in a Zoho CRM module',
      longDesc:
        'Creates a new record in the specified Zoho CRM module with the provided field values. Returns the record ID along with timestamps for creation and modification. The Created_By and Modified_By fields contain the user information who created the record. Supports all standard and custom modules except Documents and Projects.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module where the record will be created',
          longDesc:
            'Select the target Zoho CRM module (such as Leads, Contacts, Deals, Accounts, Products, Vendors, or custom modules) where you want to create the new record. Use the Modules API to get the list of available modules and their API names.',
        },
        properties: {
          displayName: 'Record Properties',
          shortDesc: 'Field values for the new record',
          longDesc:
            'Provide the field values for the new record as key-value pairs where keys are field API names. Available fields and their types are dynamically loaded based on the selected module. Required fields must be included, and field values must match their expected data types (text, number, date, picklist, lookup, etc.).',
        },
      },
    },
    update_record: {
      displayName: 'Update Record',
      shortDesc: 'Update an existing record in a Zoho CRM module',
      longDesc:
        'Updates an existing record in the specified Zoho CRM module with the provided field values. Returns the record ID along with updated timestamps for modification. Only the fields you specify will be updated; other fields will remain unchanged. The record must exist and the user must have update permissions for the module.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module containing the record',
          longDesc:
            'Select the Zoho CRM module (such as Leads, Contacts, Deals, Accounts, or custom modules) that contains the record you want to update. The module must support API operations and the user must have appropriate permissions.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The unique identifier of the record to update',
          longDesc:
            'Enter or select the unique record ID of the record you want to update. Record IDs can be retrieved using the Get Records API or from webhook notifications. The record must exist in the specified module.',
        },
        properties: {
          displayName: 'Updated Properties',
          shortDesc: 'Field values to update on the record',
          longDesc:
            'Provide the field values you want to update as key-value pairs where keys are field API names. Only include the fields you want to change; unspecified fields will retain their current values. Field values must match their expected data types and validation rules.',
        },
      },
    },
    delete_record: {
      displayName: 'Delete Record',
      shortDesc: 'Delete a record from a Zoho CRM module',
      longDesc:
        'Permanently deletes a specific record from the specified Zoho CRM module using its unique record ID. If the module has the Recycle Bin feature enabled, the deleted record will be moved to the Recycle Bin and can be restored. Otherwise, the deletion is permanent. The user must have delete permissions for the module.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module containing the record',
          longDesc:
            'Select the Zoho CRM module (such as Leads, Contacts, Deals, Accounts, or custom modules) that contains the record you want to delete. The module must support API operations and the user must have delete permissions.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The unique identifier of the record to delete',
          longDesc:
            'Enter or select the unique record ID of the record you want to delete. Record IDs can be retrieved using the Get Records API. Deleting a record that has already been deleted will result in an error.',
        },
      },
    },
    get_record: {
      displayName: 'Get Record',
      shortDesc: 'Retrieve a single record from a Zoho CRM module',
      longDesc:
        'Fetches detailed information about a specific record from the specified Zoho CRM module using its unique record ID. Returns all field values for the record including standard fields (Created_Time, Modified_Time, Created_By, Modified_By) and custom fields. Subform data, multi-select lookup fields, and multi-user lookup fields are also included in the response.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module containing the record',
          longDesc:
            'Select the Zoho CRM module (such as Leads, Contacts, Deals, Accounts, or custom modules) that contains the record you want to retrieve. The module must support API operations and the user must have read permissions.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The unique identifier of the record to retrieve',
          longDesc:
            'Enter or select the unique record ID of the record you want to fetch. Record IDs can be obtained from the Get Records API, search results, or webhook notifications. The record must exist in the specified module.',
        },
      },
    },
    list_records: {
      displayName: 'List Records',
      shortDesc: 'Retrieve multiple records from a Zoho CRM module',
      longDesc:
        'Fetches a list of records from the specified Zoho CRM module with support for field selection, pagination, sorting, and filtering. You can specify which fields to return (maximum 50 field API names), sort records by a field in ascending or descending order, and navigate through pages using tokens. Returns both the records data and pagination tokens for retrieving subsequent pages.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module to retrieve records from',
          longDesc:
            'Select the Zoho CRM module (such as Leads, Contacts, Deals, Accounts, or custom modules) from which you want to retrieve records. The module must support API operations and the user must have read permissions.',
        },
        fields: {
          displayName: 'Fields to Return',
          shortDesc: 'Specify which fields to include in the response',
          longDesc:
            'Select the field API names you want to retrieve for each record. You can include a maximum of 50 field API names. Use the Fields Metadata API to get the list of available fields. By default, only the ID field is returned. Add fields like Last_Name, Email, Created_Time, or custom field names as needed.',
        },
        per_page: {
          displayName: 'Records Per Page',
          shortDesc: 'Number of records to return per page',
          longDesc:
            'Specify how many records to return in a single API request. Valid values are 1 to 200. The default value is 20. Use this parameter along with page_token for pagination through large result sets.',
        },
        page_token: {
          displayName: 'Page Token',
          shortDesc: 'Token for retrieving the next page of results',
          longDesc:
            'Use the next_page_token value from a previous response to retrieve the next page of records. Leave this empty for the first page. The page_token is bound to the parameters used in the request, so do not change other parameters when using a token.',
        },
        ids: {
          displayName: 'Record IDs',
          shortDesc: 'Filter by specific record IDs',
          longDesc:
            'Optional list of specific record IDs to retrieve. When provided, only records with these IDs will be returned. This is useful for fetching a specific set of records rather than paginating through all records.',
        },
        sort: {
          displayName: 'Sort Configuration',
          shortDesc: 'Configure how to sort the returned records',
          longDesc:
            'Specify how records should be sorted in the response. You can sort by fields like id, Created_Time, or Modified_Time in either ascending (oldest first) or descending (newest first) order.',
          type: {
            fields: {
              sort_by: {
                displayName: 'Sort By Field',
                shortDesc: 'The field to use for sorting records',
                longDesc:
                  'Select or enter the field API name to sort records by. Common options include id, Created_Time, and Modified_Time. You can also use custom field API names that support sorting.',
              },
              order: {
                displayName: 'Sort Order',
                shortDesc: 'Sort in ascending or descending order',
                longDesc:
                  'Choose whether to sort records in ascending order (asc - oldest first) or descending order (desc - newest first). The default value is descending.',
              },
            },
          },
        },
      },
    },
    list_modules: {
      displayName: 'List Modules',
      shortDesc: 'Retrieve all available modules in Zoho CRM',
      longDesc:
        'Fetches metadata for all modules in your Zoho CRM organization, including both standard modules (Leads, Contacts, Deals, Accounts, etc.) and custom modules. Returns comprehensive details including module permissions, API names, display labels, and capabilities like whether the module is creatable, editable, deletable, or supports features like global search and quick create.',
      options: {
        status: {
          displayName: 'Module Status Filter',
          shortDesc: 'Filter modules by their status',
          longDesc:
            'Optional filter to retrieve only modules with specific statuses. Options include: visible (active modules shown in the UI), user_hidden (modules hidden by users), system_hidden (modules hidden by the system), and scheduled_for_deletion (modules marked for deletion). When not specified, all modules are returned.',
        },
      },
    },
    list_fields: {
      displayName: 'List Module Fields',
      shortDesc: 'Retrieve field metadata for a Zoho CRM module',
      longDesc:
        'Fetches comprehensive metadata about all fields in a specific Zoho CRM module including field types, labels, API names, data types, validation rules, picklist values, lookup configurations, and permissions. This information is essential for understanding module structure, building dynamic forms, or validating data before creating or updating records.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module to retrieve fields from',
          longDesc:
            'Select the Zoho CRM module whose field metadata you want to retrieve. The API returns detailed information about all fields including standard fields (system-defined) and custom fields (user-defined) in the module.',
        },
      },
    },
    list_users: {
      displayName: 'List Users',
      shortDesc: 'Retrieve users from your Zoho CRM organization',
      longDesc:
        'Fetches a list of users in your Zoho CRM organization with support for pagination and filtering by user type. Returns comprehensive user information including name, email, role, profile, timezone, locale settings, customization preferences, and account status. Use the type parameter to filter users based on their profile and status.',
      options: {
        per_page: {
          displayName: 'Users Per Page',
          shortDesc: 'Number of users to return per page',
          longDesc:
            'Specify how many users to return in a single API request. Valid values are 1 to 200. The default value is 20. Use this parameter along with the page parameter for pagination through large result sets.',
        },
        page: {
          displayName: 'Page Number',
          shortDesc: 'The page number for pagination',
          longDesc:
            'Specify which page of results to retrieve, starting from 1 for the first page. Use this parameter along with per_page to navigate through multiple pages of user data.',
        },
        type: {
          displayName: 'User Type Filter',
          shortDesc: 'Filter users by type or status',
          longDesc:
            'Optional filter to retrieve specific categories of users. Options include: AllUsers (both active and inactive), ActiveUsers (only active users), DeactiveUsers (deactivated users), ConfirmedUsers (users who confirmed their accounts), NotConfirmedUsers (unconfirmed users), DeletedUsers (deleted users), ActiveConfirmedUsers (active and confirmed), AdminUsers (users with Administrator privileges), ActiveConfirmedAdmins (active confirmed administrators), and CurrentUser (the currently authenticated CRM user).',
        },
      },
    },
    list_tags: {
      displayName: 'List Tags',
      shortDesc: 'Retrieve tags available in a Zoho CRM module',
      longDesc:
        'Fetches all tags that have been created for a specific Zoho CRM module. Tags are labels used to categorize and organize records within a module for easier searching and filtering. Each tag includes its name, ID, color code, and metadata about when it was created and modified. You can add a maximum of 100 tags per module and 10 tags per record.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module to retrieve tags from',
          longDesc:
            'Select the Zoho CRM module (such as Leads, Contacts, Deals, or custom modules) whose tags you want to retrieve. Each module maintains its own set of tags.',
        },
        my_tags: {
          displayName: 'My Tags Only',
          shortDesc: 'Retrieve only tags created by you',
          longDesc:
            'When set to true, only tags created by the current user will be returned. When set to false or not specified, all tags in the module will be returned regardless of who created them.',
        },
      },
    },
    add_tags_to_records: {
      displayName: 'Add Tags to Records',
      shortDesc: 'Add tags to one or more records in a module',
      longDesc:
        'Adds one or more tags to specified records in a Zoho CRM module. Tags are labels that help categorize and organize records for easier management, filtering, and searching. You can add up to 10 tags per record and a maximum of 100 tags can exist per module. Returns the count of successfully tagged records and locked records that could not be tagged.',
      options: {
        module: {
          displayName: 'Module',
          shortDesc: 'The Zoho CRM module containing the records',
          longDesc:
            'Select the Zoho CRM module (such as Leads, Contacts, Deals, Accounts, or custom modules) that contains the records you want to tag. Tags are module-specific and must exist in the module before they can be added to records.',
        },
        tags: {
          displayName: 'Tags to Add',
          shortDesc: 'List of tags to add to the records',
          longDesc:
            'Specify the tags you want to add to the records. Each tag should include an ID and name. The tag ID takes precedence over the name if both are provided. You can optionally include a color_code (hex value). Use the List Tags action to retrieve available tags and their IDs.',
          type: {
            element_type: {
              type: {
                fields: {
                  id: {
                    displayName: 'Tag ID',
                    shortDesc: 'The unique identifier of the tag',
                    longDesc:
                      'The unique ID of an existing tag in the module. This ID takes precedence over the name field. Use the List Tags action to retrieve tag IDs. The tag must already exist in the module.',
                  },
                  name: {
                    displayName: 'Tag Name',
                    shortDesc: 'The display name of the tag',
                    longDesc:
                      'The display name of the tag. When both ID and name are provided, the ID takes precedence. If only the name is provided, the system will look up the tag by name.',
                  },
                  color_code: {
                    displayName: 'Color Code',
                    shortDesc: 'Optional hexadecimal color code for the tag',
                    longDesc:
                      'Optional hexadecimal color code for visual identification of the tag (e.g., #F17574, #57B1FD). The allowed color codes are predefined in Zoho CRM. If not specified or set to null, the tag will use its default color.',
                  },
                },
              },
            },
          },
        },
        records: {
          displayName: 'Record IDs',
          shortDesc: 'IDs of the records to tag',
          longDesc:
            'List of unique record IDs to which you want to add tags. You can specify a maximum of 500 record IDs per API call. Use the Get Records API or search API to retrieve valid record IDs.',
        },
        over_write: {
          displayName: 'Overwrite Existing Tags',
          shortDesc: 'Replace all existing tags on the records',
          longDesc:
            'When set to true, replaces all existing tags on the specified records with the new tags. When set to false (default), adds the new tags while keeping existing tags. Use this option carefully as setting it to true will remove all current tags.',
        },
      },
    },
  },
};

export default ZohoCrmAppEn;
