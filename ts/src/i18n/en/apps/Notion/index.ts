/* eslint-disable max-len */
const NotionAppEn = {
  displayName: 'Notion',
  groups: ['Documents & Documentation', 'Project & Task Management'],
  shortDesc: 'Connect to Notion API to manage pages, databases, comments, and discussions.',
  longDesc:
    'The Notion integration provides comprehensive actions and triggers to interact with the Notion API. Manage pages, databases, comments, discussions, and users. Create, read, update, and monitor changes to your Notion workspace content.',

  triggers: {
    new_database_item: {
      displayName: 'New database item',
      shortDesc: 'Triggers when a new item is created in a Notion database',
      longDesc:
        'This trigger monitors a specific Notion database and fires when a new item (page) is added to it. You can filter items based on property values.',
      options: {
        data_source_id: {
          displayName: 'Database',
          shortDesc: 'The Notion database to monitor',
          longDesc: 'Select the Notion database that you want to monitor for new items',
        },
        filter_properties: {
          displayName: 'Filter properties',
          shortDesc: 'Optional filters to apply to database items',
          longDesc: 'Set property filters to only trigger for items that match specific criteria',
        },
      },
    },
    updated_database_item: {
      displayName: 'Updated database item',
      shortDesc: 'Triggers when a database item is updated in Notion',
      longDesc:
        'This trigger monitors a specific Notion database and fires when an existing item (page) is modified. You can filter items based on property values.',
      options: {
        data_source_id: {
          displayName: 'Database',
          shortDesc: 'The Notion database to monitor',
          longDesc: 'Select the Notion database that you want to monitor for updated items',
        },
        filter_properties: {
          displayName: 'Filter properties',
          shortDesc: 'Optional filters to apply to database items',
          longDesc: 'Set property filters to only trigger for items that match specific criteria',
        },
      },
    },
    updated_page: {
      displayName: 'Updated page',
      shortDesc: 'Triggers when a specific Notion page is updated',
      longDesc:
        'This trigger monitors a specific Notion page and fires when the page is modified. It tracks changes to the page content, properties, or metadata.',
      options: {
        page: {
          displayName: 'Page',
          shortDesc: 'The Notion page to monitor for updates',
          longDesc:
            'Select the specific Notion page you want to monitor for changes. The trigger will fire whenever this page is edited or updated.',
        },
      },
    },
  },

  actions: {
    add_comment_to_discussion: {
      groups: ['Comments'],
      displayName: 'Add comment to discussion',
      shortDesc: 'Add a reply to an existing discussion thread in Notion',
      longDesc:
        'Reply to an existing discussion thread on a Notion page or block. This creates a new comment within the selected discussion.',
      options: {
        discussion_id: {
          displayName: 'Discussion',
          shortDesc: 'The discussion thread to reply to',
          longDesc: 'Select the discussion thread where you want to add your comment',
        },
        text: {
          displayName: 'Comment text',
          shortDesc: 'The text content of your comment',
          longDesc:
            'Enter the text content for your comment. This will be added as a plain text comment to the discussion.',
        },
      },
    },
    add_comment_to_page: {
      groups: ['Comments'],
      displayName: 'Add comment to page',
      shortDesc: 'Add a new comment to a Notion page',
      longDesc:
        'Create a new comment on a Notion page. This starts a new discussion thread on the selected page.',
      options: {
        page_id: {
          displayName: 'Page',
          shortDesc: 'The Notion page to comment on',
          longDesc: 'Select the Notion page where you want to add a comment',
        },
        text: {
          displayName: 'Comment text',
          shortDesc: 'The text content of your comment',
          longDesc:
            'Enter the text content for your comment. This will create a new discussion on the page.',
        },
      },
    },
    append_to_page: {
      groups: ['Pages'],
      displayName: 'Append to page',
      shortDesc: 'Add content to the end of a Notion page',
      longDesc:
        'Append new content blocks to the end of an existing Notion page. The content will be added as new blocks at the bottom of the page.',
      options: {
        page_id: {
          displayName: 'Page',
          shortDesc: 'The Notion page to append to',
          longDesc: 'Select the Notion page where you want to add content',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'The content to append to the page',
          longDesc:
            'Enter the content you want to add to the page. Supports markdown formatting which will be converted to Notion blocks.',
        },
      },
    },
    create_database_item: {
      groups: ['Databases'],
      displayName: 'Create database item',
      shortDesc: 'Create a new item in a Notion database',
      longDesc:
        'Create a new page (item) in a Notion database with specified property values and optional content.',
      options: {
        data_source_id: {
          displayName: 'Database',
          shortDesc: 'The Notion database to create item in',
          longDesc: 'Select the Notion database where you want to create a new item',
        },
        properties: {
          displayName: 'Properties',
          shortDesc: 'Property values for the new database item',
          longDesc:
            'Set the property values for the new database item. Available properties depend on the selected database schema.',
        },
        content: {
          displayName: 'Page content',
          shortDesc: 'Optional content for the database item page',
          longDesc:
            'Add content to the database item page. This will be added as a paragraph block in the page.',
        },
      },
    },
    create_page: {
      groups: ['Pages'],
      displayName: 'Create page',
      shortDesc: 'Create a new page in Notion',
      longDesc:
        'Create a new page as a child of an existing page in Notion with a title and content.',
      options: {
        page: {
          displayName: 'Parent page',
          shortDesc: 'The parent page where the new page will be created',
          longDesc: 'Select the parent page under which the new page will be created',
        },
        title: {
          displayName: 'Page title',
          shortDesc: 'The title of the new page',
          longDesc: 'Enter the title for the new page',
        },
        content: {
          displayName: 'Page content',
          shortDesc: 'The initial content of the new page',
          longDesc:
            'Enter the initial content for the new page. This will be added as paragraph blocks.',
        },
      },
    },
    get_data_source: {
      groups: ['Databases'],
      displayName: 'Get database',
      shortDesc: 'Retrieve information about a Notion database',
      longDesc:
        'Get detailed information about a specific Notion database including its properties, title, description, and metadata.',
      options: {
        data_source_id: {
          displayName: 'Database',
          shortDesc: 'The Notion database to retrieve',
          longDesc: 'Select the Notion database you want to get information about',
        },
      },
    },
    get_database: {
      groups: ['Databases'],
      displayName: 'Get database info',
      shortDesc: 'Retrieve database information by ID',
      longDesc: 'Get detailed information about a Notion database by providing its ID directly.',
      options: {
        database_id: {
          displayName: 'Database ID',
          shortDesc: 'The ID of the Notion database',
          longDesc: 'Enter the ID of the Notion database you want to retrieve information about',
        },
      },
    },
    get_page: {
      groups: ['Pages'],
      displayName: 'Get page',
      shortDesc: 'Retrieve information about a Notion page',
      longDesc:
        'Get detailed information about a specific Notion page including its properties, title, and metadata.',
      options: {
        page_id: {
          displayName: 'Page',
          shortDesc: 'The Notion page to retrieve',
          longDesc: 'Select the Notion page you want to get information about',
        },
      },
    },
    get_user: {
      groups: ['Users'],
      displayName: 'Get user',
      shortDesc: 'Retrieve information about a Notion user',
      longDesc:
        'Get detailed information about a specific Notion user including their name, type, and contact information.',
      options: {
        user_id: {
          displayName: 'User',
          shortDesc: 'The Notion user to retrieve',
          longDesc: 'Select the Notion user you want to get information about',
        },
      },
    },
    list_comments: {
      groups: ['Comments'],
      displayName: 'List comments',
      shortDesc: 'List comments on a Notion page or block',
      longDesc:
        'Retrieve a list of comments on a specific Notion page or block. Returns all unresolved comments with pagination support.',
      options: {
        page_size: {
          displayName: 'Page size',
          shortDesc: 'Number of comments to retrieve per page',
          longDesc: 'Set the number of comments to retrieve in a single request (maximum 100)',
        },
        next_cursor: {
          displayName: 'Next cursor',
          shortDesc: 'Pagination cursor for retrieving next page',
          longDesc: 'Use this cursor to retrieve the next page of comments in a paginated response',
        },
        block_id: {
          displayName: 'Page or block',
          shortDesc: 'The page or block to list comments for',
          longDesc: 'Select the Notion page or block you want to retrieve comments from',
        },
      },
    },
    list_datasource_items: {
      groups: ['Databases'],
      displayName: 'List database items',
      shortDesc: 'List items from a Notion database',
      longDesc:
        'Retrieve a list of items (pages) from a Notion database with filtering and sorting options.',
      options: {
        data_source_id: {
          displayName: 'Database',
          shortDesc: 'The Notion database to list items from',
          longDesc: 'Select the Notion database you want to retrieve items from',
        },
        page_size: {
          displayName: 'Page size',
          shortDesc: 'Number of items to retrieve per page',
          longDesc: 'Set the number of database items to retrieve in a single request',
        },
        next_cursor: {
          displayName: 'Next cursor',
          shortDesc: 'Pagination cursor for retrieving next page',
          longDesc: 'Use this cursor to retrieve the next page of items in a paginated response',
        },
        filter_properties: {
          displayName: 'Filter properties',
          shortDesc: 'Property filters to apply to the results',
          longDesc: 'Set property filters to only return items that match specific criteria',
        },
        sorts: {
          displayName: 'Sort options',
          shortDesc: 'How to sort the returned items',
          longDesc: 'Configure how the database items should be sorted in the response',
          type: {
            element_type: {
              fields: {
                property: {
                  displayName: 'Property',
                  shortDesc: 'Database property to sort by',
                  longDesc: 'The name of the database property to use for sorting',
                },
                timestamp: {
                  displayName: 'Timestamp',
                  shortDesc: 'Timestamp field to sort by',
                  longDesc:
                    'Sort by a timestamp field: created_time or last_edited_time. Use this instead of property for time-based sorting.',
                },
                direction: {
                  displayName: 'Direction',
                  shortDesc: 'Sort direction',
                  longDesc: 'The direction to sort: ascending or descending',
                },
              },
            },
          },
        },
      },
    },
    list_pages: {
      groups: ['Pages'],
      displayName: 'List pages',
      shortDesc: 'Search and list Notion pages',
      longDesc:
        'Search for and retrieve a list of Notion pages with optional query filtering and sorting.',
      options: {
        query: {
          displayName: 'Search query',
          shortDesc: 'Text to search for in page titles and content',
          longDesc:
            'Enter text to search for in page titles and content. Leave empty to retrieve all accessible pages.',
        },
        last_edited: {
          displayName: 'Sort by last edited',
          shortDesc: 'How to sort pages by last edited time',
          longDesc:
            'Choose whether to sort pages by last edited time in ascending or descending order',
        },
        page_size: {
          displayName: 'Page size',
          shortDesc: 'Number of pages to retrieve per request',
          longDesc: 'Set the number of pages to retrieve in a single request',
        },
        next_cursor: {
          displayName: 'Next cursor',
          shortDesc: 'Pagination cursor for retrieving next page',
          longDesc: 'Use this cursor to retrieve the next page of results in a paginated response',
        },
      },
    },
    list_datasources: {
      groups: ['Databases'],
      displayName: 'List databases',
      shortDesc: 'List all Notion databases',
      longDesc:
        'Retrieve a list of all accessible Notion databases in your workspace with optional search filtering.',
      options: {
        query: {
          displayName: 'Search query',
          shortDesc: 'Text to search for in database titles',
          longDesc:
            'Enter text to search for in database titles. Leave empty to retrieve all accessible databases.',
        },
        last_edited: {
          displayName: 'Sort by last edited',
          shortDesc: 'How to sort databases by last edited time',
          longDesc:
            'Choose whether to sort databases by last edited time in ascending or descending order',
        },
      },
    },
    list_users: {
      groups: ['Users'],
      displayName: 'List users',
      shortDesc: 'List users in the Notion workspace',
      longDesc: 'Retrieve a list of all users in the Notion workspace including people and bots.',
      options: {
        page_size: {
          displayName: 'Page size',
          shortDesc: 'Number of users to retrieve per page',
          longDesc: 'Set the number of users to retrieve in a single request',
        },
        next_cursor: {
          displayName: 'Next cursor',
          shortDesc: 'Pagination cursor for retrieving next page',
          longDesc: 'Use this cursor to retrieve the next page of users in a paginated response',
        },
      },
    },
    update_database_item: {
      groups: ['Databases'],
      displayName: 'Update database item',
      shortDesc: 'Update an existing item in a Notion database',
      longDesc: 'Update the property values of an existing item (page) in a Notion database.',
      options: {
        data_source_id: {
          displayName: 'Database',
          shortDesc: 'The Notion database containing the item',
          longDesc: 'Select the Notion database that contains the item you want to update',
        },
        item_id: {
          displayName: 'Database item',
          shortDesc: 'The database item to update',
          longDesc: 'Select the specific database item (page) you want to update',
        },
        properties: {
          displayName: 'Properties',
          shortDesc: 'Property values to update',
          longDesc:
            'Set the new property values for the database item. Only specified properties will be updated.',
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
    contains: {
      displayName: 'contains',
      shortDesc: 'Contains text',
      longDesc: 'Returns `True` if the field contains the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to search',
          longDesc: 'The field to search within',
        },
        {
          displayName: 'Text',
          shortDesc: 'Text to find',
          longDesc: 'The text string to search for',
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
    'is-empty': {
      displayName: 'is empty',
      shortDesc: 'Field is empty',
      longDesc: 'Returns `True` if the field is empty or not set',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Field to check',
          longDesc: 'The field to check for emptiness',
        },
      ],
    },
    'is-not-empty': {
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
    'starts-with': {
      displayName: 'starts with',
      shortDesc: 'Starts with text',
      longDesc: 'Returns `True` if the field starts with the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to check',
          longDesc: 'The text field to check',
        },
        {
          displayName: 'Text',
          shortDesc: 'Starting text',
          longDesc: 'The text that the field should start with',
        },
      ],
    },
    'ends-with': {
      displayName: 'ends with',
      shortDesc: 'Ends with text',
      longDesc: 'Returns `True` if the field ends with the specified text',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Text field to check',
          longDesc: 'The text field to check',
        },
        {
          displayName: 'Text',
          shortDesc: 'Ending text',
          longDesc: 'The text that the field should end with',
        },
      ],
    },
    'next-week': {
      displayName: 'next week',
      shortDesc: 'Date is next week',
      longDesc: 'Returns `True` if the date falls within the next week',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
      ],
    },
    'next-month': {
      displayName: 'next month',
      shortDesc: 'Date is next month',
      longDesc: 'Returns `True` if the date falls within the next month',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
      ],
    },
    'next-year': {
      displayName: 'next year',
      shortDesc: 'Date is next year',
      longDesc: 'Returns `True` if the date falls within the next year',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
      ],
    },
    'past-week': {
      displayName: 'past week',
      shortDesc: 'Date is past week',
      longDesc: 'Returns `True` if the date falls within the past week',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
      ],
    },
    'past-month': {
      displayName: 'past month',
      shortDesc: 'Date is past month',
      longDesc: 'Returns `True` if the date falls within the past month',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
      ],
    },
    'past-year': {
      displayName: 'past year',
      shortDesc: 'Date is past year',
      longDesc: 'Returns `True` if the date falls within the past year',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
      ],
    },
    'this-week': {
      displayName: 'this week',
      shortDesc: 'Date is this week',
      longDesc: 'Returns `True` if the date falls within the current week',
      args: [
        {
          displayName: 'Field',
          shortDesc: 'Date field to check',
          longDesc: 'The date field to check',
        },
      ],
    },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order by',
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
    limit: {
      displayName: 'Limit',
      shortDesc: 'Maximum number of records to return',
      longDesc: 'Set the maximum total number of records to retrieve from the search',
    },
  },
};

export default NotionAppEn;
