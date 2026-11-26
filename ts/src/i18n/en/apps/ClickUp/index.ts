/* eslint-disable max-len */
const ClickUpAppEn = {
  displayName: 'ClickUp',
  groups: ['Project & Task Management'],
  shortDesc:
    'ClickUp is a productivity platform that allows teams to manage tasks, projects, and workflows in one place.',
  longDesc: `ClickUp is a comprehensive productivity platform designed to help teams streamline their workflows, manage tasks, and collaborate effectively. It offers a wide range of features including task management, time tracking, goal setting, and document sharing, all within a customizable interface. ClickUp aims to enhance team productivity by providing tools that adapt to various work styles and project requirements.`,
  actions: {
    list_lists: {
      groups: ['Lists'],
      displayName: 'List lists',
      shortDesc: 'List ClickUp lists within a folder',
      longDesc:
        'Retrieve all lists contained within a specific ClickUp folder with optional archived filtering',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the folder',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the folder',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Target folder',
          longDesc: 'The ClickUp folder to retrieve lists from',
        },
        archived: {
          displayName: 'Include archived',
          shortDesc: 'Include archived lists',
          longDesc: 'Whether to include archived lists in the results',
        },
      },
    },
    get_folder: {
      groups: ['Folders'],
      displayName: 'Get folder',
      shortDesc: 'Retrieve ClickUp folder details',
      longDesc:
        'Fetch comprehensive information about a specific ClickUp folder including contained lists and statuses',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the folder',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the folder',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Target folder',
          longDesc: 'The ClickUp folder to retrieve information for',
        },
      },
    },
    get_lists: {
      groups: ['Lists'],
      displayName: 'Get list',
      shortDesc: 'Retrieve ClickUp list details',
      longDesc:
        'Fetch comprehensive information about a specific ClickUp list including status configurations and metadata',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the list',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the list',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'ClickUp folder',
          longDesc: 'The ClickUp folder containing the list',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'The ClickUp list to retrieve information for',
        },
      },
    },
    list_folders: {
      groups: ['Folders'],
      displayName: 'List folders',
      shortDesc: 'List ClickUp folders within a space',
      longDesc:
        'Retrieve all folders contained within a specific ClickUp space with optional archived filtering',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the space',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'Target space',
          longDesc: 'The ClickUp space to retrieve folders from',
        },
        archived: {
          displayName: 'Include archived',
          shortDesc: 'Include archived folders',
          longDesc: 'Whether to include archived folders in the results',
        },
      },
    },
    create_task_comment: {
      groups: ['Tasks'],
      displayName: 'Add task comment',
      shortDesc: 'Add a comment to a ClickUp task',
      longDesc:
        'Create a new comment on a specific ClickUp task with optional assignee and group assignee notifications',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace where the task is located',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space where the task is located',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'ClickUp folder',
          longDesc: 'The ClickUp folder where the task is located',
        },
        list: {
          displayName: 'List',
          shortDesc: 'ClickUp list',
          longDesc: 'The ClickUp list where the task is located',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'Target task',
          longDesc: 'The ClickUp task to add the comment to',
        },
        comment_text: {
          displayName: 'Comment text',
          shortDesc: 'Content of the comment',
          longDesc: 'The text content of the comment to be added to the task',
        },
        notify_all: {
          displayName: 'Notify all',
          shortDesc: 'Notify all task members',
          longDesc: 'Whether to notify all task members about the new comment',
        },
        assignee: {
          displayName: 'Assignee',
          shortDesc: 'Comment assignee',
          longDesc: 'User to assign the comment to',
        },
        group_assignee: {
          displayName: 'Group assignee',
          shortDesc: 'Group to assign comment to',
          longDesc: 'Group to assign the comment to',
        },
      },
    },
    create_document: {
      groups: ['Documents'],
      displayName: 'Create document',
      shortDesc: 'Create a new ClickUp document',
      longDesc:
        'Create a new document in ClickUp with customizable name, parent location, and visibility settings',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace where the document will be created',
        },
        name: {
          displayName: 'Document name',
          shortDesc: 'Name of the document',
          longDesc: 'The name/title for the new document',
        },
        parent: {
          displayName: 'Parent location',
          shortDesc: 'Parent container',
          longDesc:
            'The parent container (space, folder, list, etc.) where the document will be placed',
          type: {
            fields: {
              id: {
                displayName: 'Parent ID',
                shortDesc: 'ID of parent container',
                longDesc: 'The unique identifier of the parent container',
              },
              type: {
                displayName: 'Parent type',
                shortDesc: 'Type of parent container',
                longDesc:
                  'The type of parent container (4=Space, 5=Folder, 6=List, 7=Everything, 12=Workspace)',
              },
            },
          },
        },
        visibility: {
          displayName: 'Visibility',
          shortDesc: 'Document visibility',
          longDesc: 'Whether the document should be public or private',
        },
        create_page: {
          displayName: 'Create page',
          shortDesc: 'Create initial page',
          longDesc: 'Whether to create an initial page within the document',
        },
      },
    },
    create_document_page: {
      groups: ['Documents'],
      displayName: 'Create document page',
      shortDesc: 'Create a page within a ClickUp document',
      longDesc:
        'Add a new page to an existing ClickUp document with content and formatting options',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the document',
        },
        document: {
          displayName: 'Document',
          shortDesc: 'Target document',
          longDesc: 'The ClickUp document to add the page to',
        },
        name: {
          displayName: 'Page name',
          shortDesc: 'Name of the page',
          longDesc: 'The title/name for the new page',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'Page content',
          longDesc: 'The content to include in the new page',
        },
        sub_title: {
          displayName: 'Subtitle',
          shortDesc: 'Page subtitle',
          longDesc: 'An optional subtitle for the page',
        },
        content_format: {
          displayName: 'Content format',
          shortDesc: 'Format of the content',
          longDesc: 'The format of the page content (Markdown or Plain Text)',
        },
      },
    },
    create_folder: {
      groups: ['Folders'],
      displayName: 'Create folder',
      shortDesc: 'Create a new ClickUp folder',
      longDesc: 'Create a new folder within a ClickUp space to organize lists and tasks',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace where the folder will be created',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'Parent space',
          longDesc: 'The ClickUp space where the folder will be created',
        },
        name: {
          displayName: 'Folder name',
          shortDesc: 'Name of the folder',
          longDesc: 'The name for the new folder',
        },
      },
    },
    create_list: {
      groups: ['Lists'],
      displayName: 'Create list',
      shortDesc: 'Create a new ClickUp list',
      longDesc:
        'Create a new list within a ClickUp folder with optional content, assignee, and due date',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace where the list will be created',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the folder',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Parent folder',
          longDesc: 'The ClickUp folder where the list will be created',
        },
        name: {
          displayName: 'List name',
          shortDesc: 'Name of the list',
          longDesc: 'The name for the new list',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'List description',
          longDesc: 'Optional description or content for the list',
        },
        assignee: {
          displayName: 'Assignee',
          shortDesc: 'List assignee',
          longDesc: 'User to assign the list to',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'List priority',
          longDesc: 'Priority level for the list',
        },
        due_date: {
          displayName: 'Due date',
          shortDesc: 'List due date',
          longDesc: 'Due date for the list',
        },
        markdown_content: {
          displayName: 'Markdown content',
          shortDesc: 'Markdown description',
          longDesc: 'Description content in Markdown format',
        },
      },
    },
    create_task: {
      groups: ['Tasks'],
      displayName: 'Create task',
      shortDesc: 'Create a new ClickUp task',
      longDesc:
        'Create a new task in ClickUp with comprehensive options for assignees, dates, priority, and custom fields',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace where the task will be created',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the list',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'ClickUp folder',
          longDesc: 'The ClickUp folder containing the list',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'The ClickUp list where the task will be created',
        },
        name: {
          displayName: 'Task name',
          shortDesc: 'Name of the task',
          longDesc: 'The title/name for the new task',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Task description',
          longDesc: 'Detailed description of the task',
        },
        assignees: {
          displayName: 'Assignees',
          shortDesc: 'Task assignees',
          longDesc: 'Users to assign the task to',
        },
        archived: {
          displayName: 'Archived',
          shortDesc: 'Archive task',
          longDesc: 'Whether to create the task in an archived state',
        },
        group_assignees: {
          displayName: 'Group assignees',
          shortDesc: 'Group assignees',
          longDesc: 'Groups to assign the task to',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Task tags',
          longDesc: 'Tags to apply to the task for organization',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Task priority',
          longDesc: 'Priority level for the task',
        },
        due_date: {
          displayName: 'Due date',
          shortDesc: 'Task due date',
          longDesc: 'When the task is due',
        },
        start_date: {
          displayName: 'Start date',
          shortDesc: 'Task start date',
          longDesc: 'When work on the task should begin',
        },
        time_estimate: {
          displayName: 'Time estimate',
          shortDesc: 'Estimated time',
          longDesc: 'Estimated time required to complete the task (in minutes)',
        },
        points: {
          displayName: 'Points',
          shortDesc: 'Task points',
          longDesc: 'Point value assigned to the task',
        },
        notify_all: {
          displayName: 'Notify all',
          shortDesc: 'Notify team members',
          longDesc: 'Whether to notify all relevant team members about the new task',
        },
        parent: {
          displayName: 'Parent task',
          shortDesc: 'Parent task',
          longDesc: 'Parent task to create this as a subtask',
        },
        markdown_content: {
          displayName: 'Markdown content',
          shortDesc: 'Markdown description',
          longDesc: 'Task description in Markdown format',
        },
        links_to: {
          displayName: 'Links to',
          shortDesc: 'Linked task',
          longDesc: 'Task to create a link relationship with',
        },
        check_required_custom_fields: {
          displayName: 'Check required custom fields',
          shortDesc: 'Validate custom fields',
          longDesc: 'Whether to validate that all required custom fields are provided',
        },
        custom_fields: {
          displayName: 'Custom fields',
          shortDesc: 'Custom field values',
          longDesc: 'Values for custom fields defined in the workspace',
          type: {
            element_type: {
              fields: {
                id: {
                  displayName: 'Field ID',
                  shortDesc: 'Custom field identifier',
                  longDesc: 'The unique identifier of the custom field',
                },
                value: {
                  displayName: 'Field value',
                  shortDesc: 'Custom field value',
                  longDesc: 'The value to set for this custom field',
                },
              },
            },
          },
        },
        custom_item_id: {
          displayName: 'Custom item ID',
          shortDesc: 'Task type ID',
          longDesc: 'Custom task type identifier',
        },
      },
    },
    delete_task: {
      groups: ['Tasks'],
      displayName: 'Delete task',
      shortDesc: 'Delete a ClickUp task',
      longDesc: 'Permanently delete a specific ClickUp task from your workspace',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the task',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the task',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'ClickUp folder',
          longDesc: 'The ClickUp folder containing the task',
        },
        list: {
          displayName: 'List',
          shortDesc: 'ClickUp list',
          longDesc: 'The ClickUp list containing the task',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'Task to delete',
          longDesc: 'The ClickUp task to be deleted',
        },
      },
    },
    get_document: {
      groups: ['Documents'],
      displayName: 'Get document',
      shortDesc: 'Retrieve a ClickUp document',
      longDesc: 'Fetch details and content of a specific ClickUp document',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the document',
        },
        document: {
          displayName: 'Document',
          shortDesc: 'Target document',
          longDesc: 'The ClickUp document to retrieve',
        },
      },
    },
    get_task: {
      groups: ['Tasks'],
      displayName: 'Get task',
      shortDesc: 'Retrieve a ClickUp task',
      longDesc:
        'Fetch comprehensive details of a specific ClickUp task including custom fields and attachments',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the task',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the task',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'ClickUp folder',
          longDesc: 'The ClickUp folder containing the task',
        },
        list: {
          displayName: 'List',
          shortDesc: 'ClickUp list',
          longDesc: 'The ClickUp list containing the task',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'Target task',
          longDesc: 'The ClickUp task to retrieve',
        },
        include_markdown_description: {
          displayName: 'Include markdown description',
          shortDesc: 'Include markdown format',
          longDesc: 'Whether to include the task description in Markdown format',
        },
        subtasks: {
          displayName: 'Include subtasks',
          shortDesc: 'Include subtasks',
          longDesc: 'Whether to include subtasks in the response',
        },
      },
    },
    get_workspace: {
      groups: ['Workspaces'],
      displayName: 'Get workspace',
      shortDesc: 'Retrieve ClickUp workspace details',
      longDesc:
        'Fetch comprehensive information about a ClickUp workspace including members and roles',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'Target workspace',
          longDesc: 'The ClickUp workspace to retrieve information for',
        },
      },
    },
    list_channels: {
      groups: ['Channels'],
      shortDesc: 'List ClickUp chat channels',
      longDesc: 'Retrieve a list of chat channels in a ClickUp workspace with filtering options',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace to list channels from',
        },
        description_format: {
          displayName: 'Description format',
          shortDesc: 'Format for descriptions',
          longDesc: 'The format to return channel descriptions in',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc: 'Pagination cursor for fetching additional results',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum results',
          longDesc: 'Maximum number of channels to return',
        },
        is_follower: {
          displayName: 'Is follower',
          shortDesc: 'Filter by follower status',
          longDesc: 'Whether to filter channels by follower status',
        },
        include_hidden: {
          displayName: 'Include hidden',
          shortDesc: 'Include hidden channels',
          longDesc: 'Whether to include hidden channels in the results',
        },
        room_types: {
          displayName: 'Room types',
          shortDesc: 'Channel types to include',
          longDesc: 'Types of channels to include in the results',
        },
      },
    },
    list_custom_fields: {
      groups: ['Workspaces'],
      displayName: 'List custom fields',
      shortDesc: 'List ClickUp custom fields',
      longDesc: 'Retrieve all custom fields defined in a ClickUp workspace',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace to list custom fields from',
        },
      },
    },
    list_documents: {
      groups: ['Documents'],
      displayName: 'List documents',
      shortDesc: 'List ClickUp documents',
      longDesc:
        'Retrieve a list of documents in a ClickUp workspace with filtering and pagination options',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace to list documents from',
        },
        creator: {
          displayName: 'Creator',
          shortDesc: 'Document creator',
          longDesc: 'Filter documents by creator',
        },
        deleted: {
          displayName: 'Deleted',
          shortDesc: 'Include deleted documents',
          longDesc: 'Whether to include deleted documents',
        },
        archived: {
          displayName: 'Archived',
          shortDesc: 'Include archived documents',
          longDesc: 'Whether to include archived documents',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum results',
          longDesc: 'Maximum number of documents to return',
        },
        next_cursor: {
          displayName: 'Next cursor',
          shortDesc: 'Pagination cursor',
          longDesc: 'Cursor for fetching the next page of results',
        },
        parent_id: {
          displayName: 'Parent ID',
          shortDesc: 'Parent container ID',
          longDesc: 'ID of the parent container to filter documents by',
        },
        parent_type: {
          displayName: 'Parent type',
          shortDesc: 'Parent container type',
          longDesc: 'Type of parent container to filter documents by',
        },
      },
    },
    list_groups: {
      groups: ['Groups'],
      displayName: 'List groups',
      shortDesc: 'List ClickUp groups',
      longDesc: 'Retrieve groups from a ClickUp workspace with optional filtering',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace to list groups from',
        },
        group_ids: {
          displayName: 'Group IDs',
          shortDesc: 'Specific group IDs',
          longDesc: 'Specific group IDs to retrieve (comma-separated)',
        },
      },
    },
    list_tasks: {
      groups: ['Tasks'],
      displayName: 'List tasks',
      shortDesc: 'List ClickUp tasks',
      longDesc:
        'Retrieve tasks from a ClickUp list with comprehensive filtering and sorting options',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the list',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the list',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'ClickUp folder',
          longDesc: 'The ClickUp folder containing the list',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Target list',
          longDesc: 'The ClickUp list to retrieve tasks from',
        },
        archived: {
          displayName: 'Archived',
          shortDesc: 'Include archived tasks',
          longDesc: 'Whether to include archived tasks',
        },
        include_markdown_description: {
          displayName: 'Include markdown description',
          shortDesc: 'Include markdown format',
          longDesc: 'Whether to include task descriptions in Markdown format',
        },
        page: {
          displayName: 'Page',
          shortDesc: 'Page number',
          longDesc: 'Page number for pagination',
        },
        order_by: {
          displayName: 'Order by',
          shortDesc: 'Sort field',
          longDesc: 'Field to sort tasks by',
        },
        reverse: {
          displayName: 'Reverse',
          shortDesc: 'Reverse sort order',
          longDesc: 'Whether to reverse the sort order',
        },
        subtasks: {
          displayName: 'Include subtasks',
          shortDesc: 'Include subtasks',
          longDesc: 'Whether to include subtasks in the results',
        },
        include_closed: {
          displayName: 'Include closed',
          shortDesc: 'Include closed tasks',
          longDesc: 'Whether to include closed/completed tasks',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Task statuses',
          longDesc: 'Specific task statuses to filter by',
        },
      },
    },
    list_workspaces: {
      groups: ['Workspaces'],
      displayName: 'List workspaces',
      shortDesc: 'List ClickUp workspaces',
      longDesc: 'Retrieve all ClickUp workspaces accessible to the authenticated user',
    },
    send_channel_message: {
      groups: ['Channels'],
      displayName: 'Send channel message',
      shortDesc: 'Send a message to a ClickUp channel',
      longDesc:
        'Send a message or post to a ClickUp chat channel with optional assignees and followers',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the channel',
        },
        channel: {
          displayName: 'Channel',
          shortDesc: 'Target channel',
          longDesc: 'The ClickUp channel to send the message to',
        },
        assignee: {
          displayName: 'Assignee',
          shortDesc: 'Message assignee',
          longDesc: 'User to assign the message to',
        },
        group_assignee: {
          displayName: 'Group assignee',
          shortDesc: 'Group assignee',
          longDesc: 'Group to assign the message to',
        },
        type: {
          displayName: 'Message type',
          shortDesc: 'Type of message',
          longDesc: 'Whether to send as a message or post',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'Message content',
          longDesc: 'The content of the message to send',
        },
        followers: {
          displayName: 'Followers',
          shortDesc: 'Message followers',
          longDesc: 'Users to add as followers of the message',
        },
        content_format: {
          displayName: 'Content format',
          shortDesc: 'Message format',
          longDesc: 'The format of the message content',
        },
      },
    },
    update_task: {
      groups: ['Tasks'],
      displayName: 'Update task',
      shortDesc: 'Update a ClickUp task',
      longDesc:
        'Update an existing ClickUp task with new information, assignees, dates, and custom fields',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace',
          longDesc: 'The ClickUp workspace containing the task',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'ClickUp space',
          longDesc: 'The ClickUp space containing the task',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'ClickUp folder',
          longDesc: 'The ClickUp folder containing the task',
        },
        list: {
          displayName: 'List',
          shortDesc: 'ClickUp list',
          longDesc: 'The ClickUp list containing the task',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'Target task',
          longDesc: 'The ClickUp task to update',
        },
        name: {
          displayName: 'Task name',
          shortDesc: 'New task name',
          longDesc: 'Updated name/title for the task',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'New task description',
          longDesc: 'Updated description for the task',
        },
        assignees: {
          displayName: 'Assignees',
          shortDesc: 'Task assignees',
          longDesc: 'Users to assign the task to (will be added to existing assignees)',
        },
        archived: {
          displayName: 'Archived',
          shortDesc: 'Archive task',
          longDesc: 'Whether to archive the task',
        },
        group_assignees: {
          displayName: 'Group assignees',
          shortDesc: 'Group assignees',
          longDesc: 'Groups to assign the task to (will be added to existing group assignees)',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Task priority',
          longDesc: 'Updated priority level for the task',
        },
        due_date: {
          displayName: 'Due date',
          shortDesc: 'New due date',
          longDesc: 'Updated due date for the task',
        },
        start_date: {
          displayName: 'Start date',
          shortDesc: 'New start date',
          longDesc: 'Updated start date for the task',
        },
        time_estimate: {
          displayName: 'Time estimate',
          shortDesc: 'Updated time estimate',
          longDesc: 'Updated estimated time required to complete the task (in minutes)',
        },
        points: {
          displayName: 'Points',
          shortDesc: 'Task points',
          longDesc: 'Updated point value for the task',
        },
        notify_all: {
          displayName: 'Notify all',
          shortDesc: 'Notify team members',
          longDesc: 'Whether to notify all relevant team members about the task update',
        },
        parent: {
          displayName: 'Parent task',
          shortDesc: 'Parent task',
          longDesc: 'Updated parent task to make this a subtask',
        },
        markdown_content: {
          displayName: 'Markdown content',
          shortDesc: 'Markdown description',
          longDesc: 'Updated task description in Markdown format',
        },
        links_to: {
          displayName: 'Links to',
          shortDesc: 'Linked task',
          longDesc: 'Task to create or update a link relationship with',
        },
        check_required_custom_fields: {
          displayName: 'Check required custom fields',
          shortDesc: 'Validate custom fields',
          longDesc: 'Whether to validate that all required custom fields are provided',
        },
        custom_fields: {
          displayName: 'Custom fields',
          shortDesc: 'Custom field values',
          longDesc: 'Updated values for custom fields',
          type: {
            element_type: {
              fields: {
                id: {
                  displayName: 'Field ID',
                  shortDesc: 'Custom field identifier',
                  longDesc: 'The unique identifier of the custom field',
                },
                value: {
                  displayName: 'Field value',
                  shortDesc: 'Custom field value',
                  longDesc: 'The updated value for this custom field',
                },
              },
            },
          },
        },
        custom_item_id: {
          displayName: 'Custom item ID',
          shortDesc: 'Task type ID',
          longDesc: 'Updated custom task type identifier',
        },
      },
    },
  },
  triggers: {
    new_folder: {
      displayName: 'New folder',
      shortDesc: 'Triggers when a new folder is created',
      longDesc:
        'Webhook trigger that fires when a new folder is created in the specified ClickUp workspace',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace to monitor',
          longDesc: 'The ClickUp workspace to monitor for new folder creation events',
        },
      },
    },
    new_list: {
      displayName: 'New list',
      shortDesc: 'Triggers when a new list is created',
      longDesc:
        'Webhook trigger that fires when a new list is created in the specified ClickUp workspace',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace to monitor',
          longDesc: 'The ClickUp workspace to monitor for new list creation events',
        },
      },
    },
    new_task: {
      displayName: 'New task',
      shortDesc: 'Triggers when a new task is created',
      longDesc:
        'Webhook trigger that fires when a new task is created in the specified ClickUp workspace',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace to monitor',
          longDesc: 'The ClickUp workspace to monitor for new task creation events',
        },
      },
    },
    new_task_comment: {
      displayName: 'New task comment',
      shortDesc: 'Triggers when a comment is added to a task',
      longDesc:
        'Webhook trigger that fires when a new comment is posted to a task, with optional filtering by space, folder, list, or specific task',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace to monitor',
          longDesc: 'The ClickUp workspace to monitor for task comment events',
        },
        space: {
          displayName: 'Space',
          shortDesc: 'Filter by space',
          longDesc: 'Optional: Only trigger for comments in tasks within this specific space',
        },
        folder: {
          displayName: 'Folder',
          shortDesc: 'Filter by folder',
          longDesc: 'Optional: Only trigger for comments in tasks within this specific folder',
        },
        list: {
          displayName: 'List',
          shortDesc: 'Filter by list',
          longDesc: 'Optional: Only trigger for comments in tasks within this specific list',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'Filter by specific task',
          longDesc: 'Optional: Only trigger for comments on this specific task',
        },
      },
    },
    task_time_tracked_updated: {
      displayName: 'Task time tracked updated',
      shortDesc: 'Triggers when time tracking is updated on a task',
      longDesc:
        'Webhook trigger that fires when time tracking information is added, updated, or modified on any task in the specified workspace',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace to monitor',
          longDesc: 'The ClickUp workspace to monitor for time tracking updates on tasks',
        },
      },
    },
    task_updated: {
      displayName: 'Task updated',
      shortDesc: 'Triggers when a task is updated',
      longDesc:
        'Webhook trigger that fires when any task is modified or updated in the specified ClickUp workspace, including changes to assignees, status, custom fields, and other task properties',
      options: {
        workspace: {
          displayName: 'Workspace',
          shortDesc: 'ClickUp workspace to monitor',
          longDesc: 'The ClickUp workspace to monitor for task update events',
        },
      },
    },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order by',
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
  expressions: {
    '&&': {
      displayName: 'And',
      shortDesc: 'Logical AND operator',
      longDesc: 'Combines multiple conditions where all must be true',
    },
    '||': {
      displayName: 'Or',
      shortDesc: 'Logical OR operator',
      longDesc: 'Combines multiple conditions where at least one must be true',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches records where the field equals the specified value',
    },
    '!=': {
      displayName: 'Not equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches records where the field does not equal the specified value',
    },
    '>': {
      displayName: 'Greater than',
      shortDesc: 'Field is greater than value',
      longDesc: 'Matches records where the field value is greater than the specified value',
    },
    '>=': {
      displayName: 'Greater than or equal',
      shortDesc: 'Field is greater than or equal to value',
      longDesc: 'Matches records where the field value is greater than or equal to the specified value',
    },
    '<': {
      displayName: 'Less than',
      shortDesc: 'Field is less than value',
      longDesc: 'Matches records where the field value is less than the specified value',
    },
    '<=': {
      displayName: 'Less than or equal',
      shortDesc: 'Field is less than or equal to value',
      longDesc: 'Matches records where the field value is less than or equal to the specified value',
    },
    'is-set': {
      displayName: 'Is set',
      shortDesc: 'Field has a value',
      longDesc: 'Matches records where the field has a value (is not empty)',
    },
    'is-not-set': {
      displayName: 'Is not set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches records where the field has no value (is empty)',
    },
    'any-of': {
      displayName: 'Any of',
      shortDesc: 'Field contains any of the specified values',
      longDesc: 'Matches records where the field contains at least one of the specified values',
    },
    'all-of': {
      displayName: 'All of',
      shortDesc: 'Field contains all of the specified values',
      longDesc: 'Matches records where the field contains all of the specified values',
    },
    range: {
      displayName: 'Range',
      shortDesc: 'Field is between two values',
      longDesc: 'Matches records where the field value is between the specified low and high values',
    },
  },
};

export default ClickUpAppEn;
