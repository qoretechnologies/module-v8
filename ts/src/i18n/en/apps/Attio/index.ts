

const AttioAppEn = {
  displayName: 'Attio',
  shortDesc: 'Connect with Attio to manage your contacts and data',
  longDesc:
    'Integrate with Attio to manage your contacts, companies, and data. This integration allows you to perform actions and respond to events in your Attio workspace, enabling you to automate workflows and enhance your productivity.',
  triggers: {
    list_entry_created: {
      displayName: 'New List Entry Created',
      shortDesc: 'Triggers when a new entry is created in an Attio list.',
      longDesc:
        'This trigger fires whenever a new entry is created in a specified Attio list. It provides details about the created entry including its ID, parent object, and the actor who created it.',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The Attio list to monitor for new entries',
          longDesc: 'The API slug of the Attio list to monitor for new entries.',
        },
      },
    },
    list_entry_updated: {
      displayName: 'List Entry Updated',
      shortDesc: 'Triggers when an entry is updated in an Attio list.',
      longDesc:
        'This trigger fires whenever an entry is updated in a specified Attio list. It provides details about the updated entry including its ID, parent object, the actor who made the update, and the specific changes that were made.',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The Attio list to monitor for updated entries',
          longDesc: 'The API slug of the Attio list to monitor for updated entries.',
        },
      },
    },
    list_entry_deleted: {
      displayName: 'List Entry Deleted',
      shortDesc: 'Triggers when an entry is deleted from an Attio list.',
      longDesc:
        'This trigger fires whenever an entry is deleted from a specified Attio list. It provides details about the deleted entry including its ID, parent object, and the actor who performed the deletion.',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The Attio list to monitor for deleted entries',
          longDesc: 'The API slug of the Attio list to monitor for deleted entries.',
        },
      },
    },
    object_record_created: {
      displayName: 'New Object Record Created',
      shortDesc: 'Triggers when a new record is created for an Attio object.',
      longDesc:
        'This trigger fires whenever a new record is created for a specified Attio object. It provides details about the created record including its ID, object type, and the actor who created it.',
      options: {
        object: {
          displayName: 'Object Type',
          shortDesc: 'The Attio object to monitor for new records',
          longDesc: 'The API slug of the Attio object type to monitor for new records.',
        },
      },
    },
    object_record_updated: {
      displayName: 'Object Record Updated',
      shortDesc: 'Triggers when a record is updated for an Attio object.',
      longDesc:
        'This trigger fires whenever a record is updated for a specified Attio object. It provides details about the updated record including its ID, object type, the actor who made the update, and the specific changes that were made.',
      options: {
        object: {
          displayName: 'Object Type',
          shortDesc: 'The Attio object to monitor for updated records',
          longDesc: 'The API slug of the Attio object type to monitor for updated records.',
        },
      },
    },
    object_record_deleted: {
      displayName: 'Object Record Deleted',
      shortDesc: 'Triggers when a record is deleted from an Attio object.',
      longDesc:
        'This trigger fires whenever a record is deleted from a specified Attio object. It provides details about the deleted record including its ID, object type, and the actor who performed the deletion.',
      options: {
        object: {
          displayName: 'Object Type',
          shortDesc: 'The Attio object to monitor for deleted records',
          longDesc: 'The API slug of the Attio object type to monitor for deleted records.',
        },
      },
    },
    task_created: {
      displayName: 'New Task Created',
      shortDesc: 'Triggers when a new task is created in Attio.',
      longDesc:
        'This trigger fires whenever a new task is created in your Attio workspace. It provides details about the created task including its ID, title, description, assignees, due date, and the actor who created it.',
    },
  },
  actions: {
    create_note: {
      displayName: 'Create Note',
      shortDesc: 'Creates a new note attached to a specific record in Attio.',
      longDesc:
        'This action creates a new note and attaches it to a specific record within an Attio object. Notes can be written in plain text or markdown format and include a title and content body. They serve as a way to document important information about records in your workspace.',
      options: {
        parent_object: {
          displayName: 'Parent Object',
          shortDesc: 'The object that contains the record to attach the note to',
          longDesc:
            'Select the Attio object that contains the record you want to attach this note to. This defines which object type the note will be associated with.',
        },
        parent_record_id: {
          displayName: 'Parent Record ID',
          shortDesc: 'The specific record to attach the note to',
          longDesc:
            'Select the specific record within the parent object that this note should be attached to. Available options will be based on the parent object you selected.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the note',
          longDesc:
            'Provide a title for the note. This will appear as the heading when viewing the note in Attio.',
        },
        format: {
          displayName: 'Format',
          shortDesc: 'The text format to use for the note content',
          longDesc:
            'Choose whether the note content should be treated as plain text or markdown. Markdown allows for rich text formatting including headers, lists, links, and more.',
        },
        content: {
          displayName: 'Content',
          shortDesc: 'The main body text of the note',
          longDesc:
            'Enter the content for your note. This can be formatted according to the selected format type (plain text or markdown).',
        },
      },
    },
    create_task: {
      displayName: 'Create Task',
      shortDesc: 'Creates a new task in Attio with specified details.',
      longDesc:
        'This action creates a new task in Attio with content, deadline, completion status, and optional assignees. You can set the task content, specify a deadline date, mark it as completed or not, and assign it to one or more workspace members.',
      options: {
        content: {
          displayName: 'Task Content',
          shortDesc: 'The content or description of the task',
          longDesc:
            'Enter the content or description for the task. This will be the main text describing what needs to be done.',
        },
        deadline_at: {
          displayName: 'Deadline',
          shortDesc: 'The deadline date for the task',
          longDesc:
            'Specify the date and time by which the task should be completed. This will be displayed in the task details and can be used for sorting and filtering tasks.',
        },
        is_completed: {
          displayName: 'Completed',
          shortDesc: 'Whether the task is already completed',
          longDesc:
            'Specify whether the task should be marked as completed when created. Default is false (task is not completed).',
        },
        assignees: {
          displayName: 'Assignees',
          shortDesc: 'Workspace members to assign the task to',
          longDesc:
            'Select one or more workspace members who will be assigned to this task. These members will be responsible for completing the task and will receive notifications about it.',
        },
      },
    },
    get_tasks: {
      displayName: 'List Tasks',
      shortDesc: 'Retrieves a list of tasks from Attio with filtering options.',
      longDesc:
        'This action retrieves a list of tasks from Attio with various filtering, sorting, and pagination options. You can filter tasks by linked records, completion status, and assignee, as well as control the order and number of results returned.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of tasks to return',
          longDesc:
            'Specify the maximum number of tasks to return in a single request. Default is 10.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of tasks to skip',
          longDesc:
            'Specify the number of tasks to skip before starting to return results. Useful for pagination. Default is 0.',
        },
        linked_object: {
          displayName: 'Linked Object',
          shortDesc: 'Filter tasks by linked object type',
          longDesc:
            'Filter tasks to only include those linked to a specific object type in Attio. When selected, you can further refine by specifying a particular record.',
        },
        linked_record_id: {
          displayName: 'Linked Record ID',
          shortDesc: 'Filter tasks by specific linked record',
          longDesc:
            'Filter tasks to only include those linked to a specific record in the selected linked object. This option is only available after selecting a linked object.',
        },
        is_completed: {
          displayName: 'Completed',
          shortDesc: 'Filter by completion status',
          longDesc:
            'Filter tasks based on whether they are completed or not. Default is false (shows incomplete tasks).',
        },
        sort: {
          displayName: 'Sort Order',
          shortDesc: 'Order of returned tasks',
          longDesc:
            "Specify the order in which tasks should be returned. 'Oldest First' sorts by creation date ascending, 'Newest First' sorts by creation date descending.",
        },
        assignee: {
          displayName: 'Assignee',
          shortDesc: 'Filter tasks by assignee',
          longDesc: 'Filter tasks to only include those assigned to a specific workspace member.',
        },
      },
    },
    get_notes: {
      displayName: 'Get Notes',
      shortDesc: 'Retrieves Notes from Attio.',
      longDesc: 'Retrieve Notes from your Attio workspace. ',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of notes to return',
          longDesc:
            'The maximum number of notes to return. Default is 50. You can specify a value between 1 and 100.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of notes to skip',
          longDesc:
            'The number of notes to skip before starting to return results. Used for pagination. Default is 0.',
        },
        parent_object: {
          displayName: 'Parent Object',
          shortDesc: 'The parent object type',
          longDesc:
            'The type of the parent object that this note is linked to. This is required to filter notes by their parent object.',
        },
        parent_record_id: {
          displayName: 'Parent Record ID',
          shortDesc: 'ID of the parent record',
          longDesc:
            'The unique identifier of the parent record to which this note is linked. This is required to filter notes by their parent record.',
        },
      },
    },
    get_task: {
      displayName: 'Get Task',
      shortDesc: 'Retrieves a specific task from Attio by its ID.',
      longDesc:
        'This action retrieves a single task from Attio using its unique task ID. The response includes all task details such as content, completion status, deadline, linked records, assignees, and creation information.',
      options: {
        task_id: {
          displayName: 'Task ID',
          shortDesc: 'The ID of the specific task to retrieve',
          longDesc:
            'Specify the unique identifier of the task you want to retrieve. The available task IDs will be loaded based on your previous object selection.',
        },
      },
    },
    get_object_record: {
      displayName: 'Get Single Object Record',
      shortDesc: 'Retrieves a specific record from an Attio object.',
      longDesc:
        'This action retrieves a single record from an Attio object by its record ID. You must specify both the object and the specific record ID you want to retrieve. This provides detailed information about the record including all its attributes and values.',
      options: {
        object: {
          displayName: 'Object',
          shortDesc: 'The Attio object to retrieve the record from',
          longDesc:
            'Select the Attio object that contains the record you want to retrieve. This is required to identify which object to search in.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'The ID of the specific record to retrieve',
          longDesc:
            "Specify the unique identifier of the record you want to retrieve. This ID is specific to the object you've selected and will load available records based on your object selection.",
        },
      },
    },
    get_list_entry: {
      displayName: 'Get Single List Entry',
      shortDesc: 'Retrieves a specific entry from an Attio list.',
      longDesc:
        'This action retrieves a single entry from an Attio list by its entry ID. You must specify both the list and the specific entry ID you want to retrieve. This provides detailed information about the entry including all its attributes and values.',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The Attio list to retrieve the entry from',
          longDesc:
            'Select the Attio list that contains the entry you want to retrieve. This is required to identify which list to search in.',
        },
        entry_id: {
          displayName: 'Entry ID',
          shortDesc: 'The ID of the specific entry to retrieve',
          longDesc:
            "Specify the unique identifier of the entry you want to retrieve. This ID is specific to the list you've selected and will load available entries based on your list selection.",
        },
      },
    },
    find_list_entries: {
      displayName: 'Find List Entries',
      shortDesc: 'Search for entries in an Attio list with filtering and sorting options.',
      longDesc:
        'Queries entries from a specific Attio list with support for filtering by attribute values, sorting by attributes, and pagination. Returns a list of entries matching the specified criteria.',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The Attio list to search',
          longDesc: 'The API slug of the Attio list to search entries in.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of entries to return',
          longDesc: 'The maximum number of entries to return. Default is 50.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of entries to skip',
          longDesc:
            'The number of entries to skip before starting to return results. Used for pagination. Default is 0.',
        },
        sort_attribute: {
          displayName: 'Sort Attribute',
          shortDesc: 'Attribute to sort by',
          longDesc: 'The attribute to sort the results by. Default is "created_at".',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort direction',
          longDesc:
            'The direction to sort the results. Can be either ascending or descending. Default is ascending.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria',
          longDesc: 'Filter criteria to apply to the query.',
          type: {
            fields: {
              attribute: {
                displayName: 'Attribute',
                shortDesc: 'Attribute to filter by',
                longDesc: 'The attribute to filter by.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Filter value',
                longDesc: 'The value to filter by.',
              },
            },
          },
        },
      },
    },
    update_list_entry: {
      displayName: 'Update List Entry',
      shortDesc: 'Update an existing entry in an Attio list.',
      longDesc:
        'Updates the attribute values of an existing entry in a specified Attio list. Requires the list identifier, entry ID, and the attribute values to update.',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The Attio list containing the entry',
          longDesc: 'The API slug of the Attio list containing the entry to update.',
        },
        entry_id: {
          displayName: 'Entry ID',
          shortDesc: 'ID of the entry to update',
          longDesc: 'The unique identifier of the list entry to update.',
        },
        attributes: {
          displayName: 'Attributes',
          shortDesc: 'Values to update',
          longDesc: 'A hash of attribute names and their new values to update in the list entry.',
        },
      },
    },
    create_list_entry: {
      displayName: 'Create List Entry',
      shortDesc: 'Create a new entry in an Attio list.',
      longDesc:
        'Creates a new entry in a specified Attio list. Requires the list identifier, parent object reference, and attribute values to populate the entry.',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The Attio list to create entry in',
          longDesc: 'The API slug of the Attio list where the new entry will be created.',
        },
        parent_object: {
          displayName: 'Parent Object',
          shortDesc: 'The parent object type',
          longDesc: 'The type of the parent object that this list entry belongs to.',
        },
        parent_record_id: {
          displayName: 'Parent Record ID',
          shortDesc: 'ID of the parent record',
          longDesc:
            'The unique identifier of the parent record to which this list entry will be linked.',
        },
        attributes: {
          displayName: 'Attributes',
          shortDesc: 'Values for list entry attributes',
          longDesc: 'A hash of attribute names and their values to populate in the new list entry.',
        },
      },
    },
    update_object_record: {
      displayName: 'Update Object Record',
      shortDesc: 'Update an existing record in an Attio object.',
      longDesc:
        'Updates the values of an existing record in a specified Attio object. Requires the object type, record ID, and the attribute values to update.',
      options: {
        object: {
          displayName: 'Object Type',
          shortDesc: 'The Attio object to update',
          longDesc: 'The API slug of the Attio object type containing the record to update.',
        },
        record_id: {
          displayName: 'Record ID',
          shortDesc: 'ID of the record to update',
          longDesc: 'The unique identifier of the record to update.',
        },
        attributes: {
          displayName: 'Attributes',
          shortDesc: 'Values to update',
          longDesc: 'A hash of attribute names and their new values to update in the record.',
        },
      },
    },
    find_object_records: {
      displayName: 'Find Object Records',
      shortDesc: 'Search for records in an Attio object with filtering and sorting options.',
      longDesc:
        'Queries records from a specific Attio object with support for filtering by attribute values, sorting by attributes, and pagination. Returns a list of records matching the specified criteria.',
      options: {
        object: {
          displayName: 'Object Type',
          shortDesc: 'The Attio object to search',
          longDesc: 'The API slug of the Attio object type to search in.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of records to return',
          longDesc: 'The maximum number of records to return. Default is 50.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of records to skip',
          longDesc:
            'The number of records to skip before starting to return results. Used for pagination. Default is 0.',
        },
        sort_attribute: {
          displayName: 'Sort Attribute',
          shortDesc: 'Attribute to sort by',
          longDesc: 'The attribute to sort the results by. Default is "created_at".',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort direction',
          longDesc:
            'The direction to sort the results. Can be either ascending or descending. Default is ascending.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter criteria',
          longDesc: 'Filter criteria to apply to the query.',
          type: {
            fields: {
              attribute: {
                displayName: 'Attribute',
                shortDesc: 'Attribute to filter by',
                longDesc: 'The attribute to filter by.',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Filter value',
                longDesc: 'The value to filter by.',
              },
            },
          },
        },
      },
    },
    create_object_record: {
      displayName: 'Create Object Record',
      shortDesc: 'Create a new record in a specified object',
      longDesc:
        'Create a new record in a specified object within your Attio workspace. This action allows you to define the object type and the attributes for the new record.',
      options: {
        object: {
          displayName: 'Object',
          shortDesc: 'Select the object type',
          longDesc:
            'Choose the object type in which you want to create a new record. This can be a custom object or a standard object in your Attio workspace.',
        },
        attributes: {
          displayName: 'Attributes',
          shortDesc: 'Define the attributes for the new record',
          longDesc:
            'Specify the attributes and their values for the new record. The attributes must match the schema of the selected object type.',
        },
      },
    },
  },
};

export default AttioAppEn;
