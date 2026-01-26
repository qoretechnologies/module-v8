/* eslint-disable max-len */
const CraftAppEn = {
  groups: ['Documents & Documentation', 'Project & Task Management'],
  displayName: 'Craft',
  shortDesc: 'Connect to Craft to manage documents, collections, tasks, and blocks seamlessly.',
  longDesc: `
    The Craft integration provides comprehensive actions and triggers to interact with the Craft API. Manage your documents, collections, tasks, and blocks with powerful automation capabilities for your note-taking and document management workflows.\n\n
    ## API Configuration Requirements\n\n
    ### For Tasks and Daily Notes Actions\n\n
    To use **List Tasks**, **Create Task**, **Update Task**, **Delete Tasks**, and **Get Daily Note Blocks** actions, you must create the **Daily notes & Tasks** API in the **Imagine** tab within Craft.\n\n

    ### For All Other Actions\n
    To use **Documents**, **Collections**, and **Blocks** actions, you need to connect **Selected Documents** in your Craft API configuration.
  `,
  connectionMessage: {
    title: 'Connect to Craft',
    content: `To connect to Craft, you will need to create an **API connection** in the Craft app.

## Creating Your API Connection

1. Open the **Craft** app on your Mac or iOS device
2. Navigate to the **Imagine** tab (AI features section)
3. Click **Add Your First API Connection** or **+ Add API**
4. Choose the type of API you want to create:
   - **Daily notes & Tasks**: For task management and daily note operations
   - **Selected Documents**: For document, collection, and block operations
5. Follow the prompts to configure your API connection
6. Copy the generated **API URL** and **Token** (if provided)

## Connection Details

### API URL
The URL provided by Craft for your API connection. This URL is specific to your account and the type of API you created.

### API Token (Optional)
Some API configurations may include a token for additional authentication. If provided, include it in your connection settings.

## API Types and Capabilities

### Daily Notes & Tasks API
Required for:
- List Tasks, Create Task, Update Task, Delete Tasks
- Get Daily Note Blocks

### Selected Documents API
Required for:
- Documents: List Documents
- Collections: List Collections, Create/Update/Delete Collection Items
- Blocks: List Blocks, Insert Block, Delete Blocks

**Note:** You may need to create multiple API connections if you want to use both task-related actions and document-related actions. Each API type provides access to different sets of functionality.`,
  },
  triggers: {
    new_collection_item: {
      displayName: 'New Collection Item',
      shortDesc: 'Triggers when a new item is added to a collection',
      longDesc:
        'This trigger activates when a new item is created in the specified Craft collection, allowing you to automate workflows based on new collection entries.',
      options: {
        collectionId: {
          displayName: 'Collection',
          shortDesc: 'The collection to monitor for new items',
          longDesc:
            'Select the Craft collection you want to monitor for new items. When a new item is added to this collection, the trigger will fire.',
        },
        maxDepth: {
          displayName: 'Maximum Depth',
          shortDesc: 'Maximum depth for nested content retrieval',
          longDesc:
            'The maximum depth of nested content to fetch for each collection item. Default is -1 (all descendants). With a depth of 0, only the item properties are fetched without nested content.',
        },
      },
    },
  },

  actions: {
    // Daily Note Blocks
    get_blocks: {
      groups: ['Daily Note Blocks (Daily Tasks & Notes API)'],
      displayName: 'Get Daily Note Blocks',
      shortDesc: 'Retrieve blocks from a daily note',
      longDesc:
        'Fetch all blocks from a Craft daily note for a specific date. You can retrieve blocks from today, yesterday, tomorrow, or any custom date, with control over the depth and metadata of the returned content.',
      options: {
        date: {
          displayName: 'Date',
          shortDesc: 'Specific date for the daily note',
          longDesc:
            'Select a specific date to retrieve the daily note blocks. If not provided, you can use the "Day" option to select relative dates like today, yesterday, or tomorrow.',
        },
        day: {
          displayName: 'Day',
          shortDesc: 'Relative day selector',
          longDesc:
            'Choose a relative day option such as today, yesterday, or tomorrow to retrieve the corresponding daily note blocks.',
        },
        maxDepth: {
          displayName: 'Maximum Depth',
          shortDesc: 'Maximum depth for nested blocks',
          longDesc:
            'Specify the maximum depth for retrieving nested blocks. Use -1 for unlimited depth, or provide a positive number to limit how deep the nested block structure should be retrieved.',
        },
        fetchMetadata: {
          displayName: 'Fetch Metadata',
          shortDesc: 'Include metadata in the response',
          longDesc:
            'Enable this option to include additional metadata such as creation date, last modified date, and author information for each block in the response.',
        },
      },
    },

    // Documents
    list_documents: {
      groups: ['Documents (Selected Documents API)'],
      displayName: 'List Documents',
      shortDesc: 'Retrieve all documents',
      longDesc:
        'Get a list of all documents in your Craft workspace. This includes document IDs, titles, and their deletion status, providing a complete overview of your document library.',
      options: {},
    },

    // Collections
    list_collections: {
      groups: ['Collections (Selected Documents API)'],
      displayName: 'List Collections',
      shortDesc: 'Retrieve all collections',
      longDesc:
        'Get a list of all collections in your Craft workspace. You can optionally filter collections by specific documents using include or exclude modes.',
      options: {
        documentIds: {
          displayName: 'Document IDs',
          shortDesc: 'Filter collections by documents',
          longDesc:
            'The document IDs to filter. If not provided, collections in all documents will be listed.',
        },
        documentFilterMode: {
          displayName: 'Document Filter Mode',
          shortDesc: 'How to filter by documents',
          longDesc:
            'Choose whether to include or exclude collections based on the provided document IDs. Select "Include" to only show collections from the specified documents, or "Exclude" to hide collections from those documents.',
        },
      },
    },

    create_collection_item: {
      groups: ['Collections (Selected Documents API)'],
      displayName: 'Create Collection Item',
      shortDesc: 'Add a new item to a collection',
      longDesc:
        'Create a new item in a Craft collection with a title and optional custom properties. This allows you to programmatically add entries to your structured collections.',
      options: {
        collectionId: {
          displayName: 'Collection',
          shortDesc: 'The collection to add the item to',
          longDesc:
            'Select the Craft collection where you want to create the new item. The collection must exist before you can add items to it.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Title of the new collection item',
          longDesc:
            'Provide a title for the new collection item. This is the main identifier for the item within the collection.',
        },
        properties: {
          displayName: 'Properties',
          shortDesc: 'Custom properties for the item',
          longDesc:
            'Add custom properties to the collection item. The available properties are dynamically determined based on the schema of the selected collection.',
        },
      },
    },

    delete_collection_items: {
      groups: ['Collections (Selected Documents API)'],
      displayName: 'Delete Collection Items',
      shortDesc: 'Remove items from a collection',
      longDesc:
        'Delete one or more items from a Craft collection by providing their IDs. This action permanently removes the specified items from the collection.',
      options: {
        collectionId: {
          displayName: 'Collection',
          shortDesc: 'The collection containing the items',
          longDesc: 'Select the Craft collection that contains the items you want to delete.',
        },
        itemIds: {
          displayName: 'Item IDs',
          shortDesc: 'IDs of items to delete',
          longDesc:
            'Provide a list of item IDs that you want to remove from the collection. You can select multiple items to delete in a single operation.',
        },
      },
    },

    update_collection_item: {
      groups: ['Collections (Selected Documents API)'],
      displayName: 'Update Collection Item',
      shortDesc: 'Modify an existing collection item',
      longDesc:
        'Update the title and properties of an existing item in a Craft collection. You can modify any custom properties that are part of the collection schema.',
      options: {
        collectionId: {
          displayName: 'Collection',
          shortDesc: 'The collection containing the item',
          longDesc: 'Select the Craft collection that contains the item you want to update.',
        },
        itemId: {
          displayName: 'Item',
          shortDesc: 'The item to update',
          longDesc:
            'Select the specific collection item you want to modify. The available items are dynamically populated based on the selected collection.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'New title for the item',
          longDesc:
            'Provide a new title for the collection item. Leave empty to keep the existing title unchanged.',
        },
        properties: {
          displayName: 'Properties',
          shortDesc: 'Updated properties for the item',
          longDesc:
            'Update the custom properties of the collection item. Only the properties you specify will be updated; others will remain unchanged.',
        },
      },
    },

    list_collection_items: {
      groups: ['Collections (Selected Documents API)'],
      displayName: 'List Collection Items',
      shortDesc: 'Retrieve all items in a collection',
      longDesc:
        'Get a list of all items in a specific Craft collection, including their IDs, titles, properties, and content blocks. You can control the depth of nested content retrieval.',
      options: {
        collectionId: {
          displayName: 'Collection',
          shortDesc: 'The collection to retrieve items from',
          longDesc:
            'Select the Craft collection whose items you want to list. All items in the collection will be returned.',
        },
        maxDepth: {
          displayName: 'Maximum Depth',
          shortDesc: 'Maximum depth for nested content',
          longDesc:
            'The maximum depth of nested content to fetch for each collection item. Default is -1 (all descendants). With a depth of 0, only the item properties are fetched without nested content.',
        },
      },
    },

    // Blocks
    list_blocks: {
      groups: ['Blocks (Selected Documents API)'],
      displayName: 'List Blocks',
      shortDesc: 'Retrieve blocks from a document',
      longDesc:
        'Fetch all blocks from a specific Craft document or page. This allows you to access the structured content of your documents, including nested blocks, with control over depth and metadata.',
      options: {
        id: {
          displayName: 'Document/Page ID',
          shortDesc: 'The document or page to retrieve blocks from',
          longDesc:
            'The ID of the page block to fetch. Required for multi-document operations. Accepts IDs for documents, pages and blocks.',
        },
        maxDepth: {
          displayName: 'Maximum Depth',
          shortDesc: 'Maximum depth for nested blocks',
          longDesc:
            'Specify the maximum depth for retrieving nested blocks. Use -1 for unlimited depth, or provide a positive number to limit the nesting level.',
        },
        fetchMetadata: {
          displayName: 'Fetch Metadata',
          shortDesc: 'Include metadata in the response',
          longDesc: `Whether to fetch metadata (comments, createdBy, lastModifiedBy, lastModifiedAt, createdAt) for the blocks.`,
        },
        getMarkdownString: {
          displayName: 'Get Markdown String',
          shortDesc: 'Retrieve the markdown string representation of blocks',
          longDesc: 'Whether to retrieve the markdown string representation of the blocks.',
        },
      },
    },

    insert_block: {
      groups: ['Blocks (Selected Documents API)'],
      displayName: 'Insert Block',
      shortDesc: 'Add a new block to a document',
      longDesc:
        'Insert a new block with markdown content into a Craft document. You can specify whether to insert the block at the start or end of the target page.',
      options: {
        markdown: {
          displayName: 'Markdown Content',
          shortDesc: 'The markdown content for the block',
          longDesc: `
          The Markdown content to insert. Separate each paragraph and heading with two newlines. Separate each list item with one newline. The first item in any list cannot be empty. Craft-specific tokens are HTML tags.:\n\n

          - <callout> for callouts. Can be used to wrap multiple paragraphs/images/etc.\n
          - <caption> for caption text style. Can be used to wrap a paragraph.\n
          - <highlight color=''> for highlights - color is optional. Can only be used inline.
          `,
        },
        position: {
          displayName: 'Position',
          shortDesc: 'Where to insert the block',
          longDesc: 'Specify the position where the block should be inserted within the document.',
          type: {
            fields: {
              position: {
                displayName: 'Insert Position',
                shortDesc: 'Insert at start or end',
                longDesc:
                  'Choose whether to insert the block at the start or end of the target page.',
              },
              pageId: {
                displayName: 'Page ID',
                shortDesc: 'The page to insert into',
                longDesc:
                  'ID of the block to insert children into. Required for multi-document operations. Only page, text, and card type blocks can be parent blocks. Text blocks are auto-converted to page type when they receive children. Collection items are implicitly pages.',
              },
            },
          },
        },
      },
    },

    delete_blocks: {
      groups: ['Blocks (Selected Documents API)'],
      displayName: 'Delete Blocks',
      shortDesc: 'Remove blocks from a document',
      longDesc:
        'Delete one or more blocks from a Craft document by providing their block IDs. This action permanently removes the specified blocks.',
      options: {
        blockIds: {
          displayName: 'Block IDs',
          shortDesc: 'IDs of blocks to delete',
          longDesc:
            'Provide a list of block IDs that you want to remove from the document. You can delete multiple blocks in a single operation.',
        },
      },
    },

    // Tasks
    list_tasks: {
      groups: ['Tasks (Daily Tasks & Notes API)'],
      displayName: 'List Tasks',
      shortDesc: 'Retrieve tasks based on scope',
      longDesc:
        'Get a list of tasks from your Craft workspace filtered by scope. You can retrieve active tasks, upcoming tasks, inbox tasks, or tasks from your logbook.',
      options: {
        scope: {
          displayName: 'Scope',
          shortDesc: 'Filter tasks by scope',
          longDesc: `Filter tasks by scope: - 'active': Active tasks from inbox and other documents (tasks due before now that are not completed/cancelled) - 'upcoming': Upcoming tasks from inbox and other documents (tasks scheduled after now) - 'inbox': Only tasks in the task inbox - 'logbook': Only tasks in the task logbook (completed and cancelled tasks)`,
        },
      },
    },

    create_task: {
      groups: ['Tasks (Daily Tasks & Notes API)'],
      displayName: 'Create Task',
      shortDesc: 'Add a new task',
      longDesc:
        'Create a new task in Craft with markdown content, optional task information (state, schedule, deadline), and a location (inbox or daily note).',
      options: {
        markdown: {
          displayName: 'Task Content',
          shortDesc: 'The markdown content for the task',
          longDesc: "The task content in markdown format. This will be the task's text.",
        },
        taskInfo: {
          displayName: 'Task Information',
          shortDesc: 'Additional task details',
          longDesc: 'Optional task metadata including state, schedule date, and deadline date',
          type: {
            fields: {
              state: {
                displayName: 'State',
                shortDesc: 'Current state of the task',
                longDesc:
                  'Set the initial state of the task: To Do (pending), Done (completed), or Canceled (abandoned).',
              },
              scheduleDate: {
                displayName: 'Schedule Date',
                shortDesc: 'When the task is scheduled',
                longDesc:
                  "Planned execution date of the task. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'",
              },
              deadlineDate: {
                displayName: 'Deadline Date',
                shortDesc: 'When the task is due',
                longDesc:
                  "Due date of the task. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'",
              },
            },
          },
        },
        location: {
          displayName: 'Location',
          shortDesc: 'Where to create the task',
          longDesc: 'Where to create the task: in the task inbox or a specific daily note',
          type: {
            fields: {
              type: {
                displayName: 'Location Type',
                shortDesc: 'Type of location',
                longDesc:
                  'Choose whether to create the task in your inbox (for unscheduled tasks) or in a daily note (for a specific date).',
              },
              date: {
                displayName: 'Date',
                shortDesc: 'Date for daily note',
                longDesc:
                  "The daily note date where the task is located. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'. Defaults to 'today' if not provided.",
              },
            },
          },
        },
      },
    },

    update_task: {
      groups: ['Tasks (Daily Tasks & Notes API)'],
      displayName: 'Update Task',
      shortDesc: 'Modify an existing task',
      longDesc:
        'Update an existing task in Craft by changing its markdown content, state, schedule date, or deadline date.',
      options: {
        id: {
          displayName: 'Task',
          shortDesc: 'The task to update',
          longDesc:
            'Select the task you want to modify. Only active tasks are available for selection.',
        },
        markdown: {
          displayName: 'Task Content',
          shortDesc: 'Updated markdown content',
          longDesc:
            'Provide new markdown-formatted content for the task. Leave empty to keep the existing content.',
        },
        state: {
          displayName: 'State',
          shortDesc: 'Updated task state',
          longDesc:
            'Change the state of the task to To Do, Done, or Canceled. Leave empty to keep the current state.',
        },
        scheduleDate: {
          displayName: 'Schedule Date',
          shortDesc: 'Updated schedule date',
          longDesc:
            "Updated planned execution date. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'. Leave empty to keep the existing schedule.",
        },
        deadlineDate: {
          displayName: 'Deadline Date',
          shortDesc: 'Updated deadline date',
          longDesc:
            "Updated due date of the task. Accepts ISO format YYYY-MM-DD or relative dates: 'today', 'tomorrow', 'yesterday'. Leave empty to keep the existing deadline.",
        },
      },
    },

    delete_tasks: {
      groups: ['Tasks (Daily Tasks & Notes API)'],
      displayName: 'Delete Tasks',
      shortDesc: 'Remove tasks',
      longDesc:
        'Delete one or more tasks from your Craft workspace by providing their task IDs. This action permanently removes the specified tasks.',
      options: {
        ids: {
          displayName: 'Task IDs',
          shortDesc: 'IDs of tasks to delete',
          longDesc:
            'Provide a list of task IDs that you want to remove. You can delete multiple tasks in a single operation.',
        },
      },
    },
  },
};

export default CraftAppEn;
