/* eslint-disable max-len */
const GoogleTasksAppEn = {
  displayName: 'Google Tasks',
  shortDesc: 'Connect to Google Tasks API to manage your task lists and tasks efficiently.',
  longDesc:
    'The Google Tasks integration provides comprehensive actions and triggers to interact with the Google Tasks API. Manage task lists, create and update tasks, set due dates, and organize your productivity workflow with seamless automation capabilities.',
  triggers: {
    new_task: {
      displayName: 'New Task',
      shortDesc: 'Triggers when a new task is created in Google Tasks',
      longDesc:
        'Monitors your Google Tasks lists and triggers when a new task is added to the specified task list.',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list to monitor for new tasks',
          longDesc:
            'Select the Google Tasks list that you want to monitor for newly created tasks.',
        },
        includeAssigned: {
          displayName: 'Include Assigned Tasks',
          shortDesc: 'Whether to include tasks assigned to others',
          longDesc:
            'Enable this option to include tasks that have been assigned to other people in the trigger results.',
        },
      },
    },
    new_completed_task: {
      displayName: 'New Completed Task',
      shortDesc: 'Triggers when a task is marked as completed',
      longDesc:
        'Monitors your Google Tasks lists and triggers when any task in the specified list is marked as completed.',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list to monitor for completed tasks',
          longDesc:
            'Select the Google Tasks list that you want to monitor for newly completed tasks.',
        },
        includeAssigned: {
          displayName: 'Include Assigned Tasks',
          shortDesc: 'Whether to include tasks assigned to others',
          longDesc:
            'Enable this option to include tasks that have been assigned to other people in the trigger results.',
        },
      },
    },
  },
  actions: {
    create_task_list: {
      displayName: 'Create Task List',
      shortDesc: 'Create a new task list in Google Tasks',
      longDesc: 'Creates a new task list in your Google Tasks account with the specified title.',
      group: 'Task Lists',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the new task list',
          longDesc:
            'Enter the name/title for the new task list that will be created in Google Tasks.',
        },
      },
    },
    delete_task_list: {
      displayName: 'Delete Task List',
      shortDesc: 'Delete a task list from Google Tasks',
      longDesc:
        'Permanently deletes the specified task list and all tasks within it from your Google Tasks account.',
      group: 'Task Lists',
      options: {
        id: {
          displayName: 'Task List',
          shortDesc: 'The task list to delete',
          longDesc: 'Select the task list that you want to permanently delete from Google Tasks.',
        },
      },
    },
    list_tasks_lists: {
      displayName: 'List Task Lists',
      shortDesc: 'Get all task lists from Google Tasks',
      longDesc:
        'Retrieves a list of all task lists in your Google Tasks account with optional pagination.',
      group: 'Task Lists',
      options: {
        maxResults: {
          displayName: 'Max Results',
          shortDesc: 'Maximum number of task lists to return',
          longDesc:
            'Specify the maximum number of task lists to return in the response. Default is 10.',
        },
        nextPageToken: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Provide the next page token from a previous request to get the next page of results.',
        },
      },
    },
    update_task_list: {
      displayName: 'Update Task List',
      shortDesc: 'Update an existing task list in Google Tasks',
      longDesc: 'Updates the title of an existing task list in your Google Tasks account.',
      group: 'Task Lists',
      options: {
        id: {
          displayName: 'Task List',
          shortDesc: 'The task list to update',
          longDesc: 'Select the task list that you want to update in Google Tasks.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The new title for the task list',
          longDesc: 'Enter the new title/name for the selected task list.',
        },
      },
    },
    clear_completed_tasks: {
      displayName: 'Clear Completed Tasks',
      shortDesc: 'Clear all completed tasks from a task list',
      longDesc:
        'Removes all completed tasks from the specified task list, helping to keep your lists clean and organized.',
      group: 'Tasks',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list to clear completed tasks from',
          longDesc: 'Select the task list from which you want to remove all completed tasks.',
        },
      },
    },
    create_task: {
      displayName: 'Create Task',
      shortDesc: 'Create a new task in Google Tasks',
      longDesc:
        'Creates a new task in the specified task list with optional details like notes, due date, and hierarchical positioning.',
      group: 'Tasks',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list to add the task to',
          longDesc: 'Select the task list where you want to create the new task.',
        },
        parent: {
          displayName: 'Parent Task',
          shortDesc: 'The parent task (to create a subtask)',
          longDesc:
            'Select a parent task if you want to create this task as a subtask under another task.',
        },
        previous: {
          displayName: 'Previous Task',
          shortDesc: 'The task after which this task should be positioned',
          longDesc: 'Select the task after which this new task should be positioned in the list.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The title of the task',
          longDesc: 'Enter the title or main description for the new task.',
        },
        notes: {
          displayName: 'Notes',
          shortDesc: 'Additional notes or description for the task',
          longDesc: 'Add any additional notes, details, or description for the task.',
        },
        due: {
          displayName: 'Due Date',
          shortDesc: 'The due date for the task',
          longDesc: 'Set a due date for when this task should be completed.',
        },
      },
    },
    delete_task: {
      displayName: 'Delete Task',
      shortDesc: 'Delete a task from Google Tasks',
      longDesc: 'Permanently deletes the specified task from the selected task list.',
      group: 'Tasks',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list containing the task',
          longDesc: 'Select the task list that contains the task you want to delete.',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'The task to delete',
          longDesc: 'Select the specific task that you want to permanently delete.',
        },
      },
    },
    get_task: {
      displayName: 'Get Task',
      shortDesc: 'Retrieve details of a specific task',
      longDesc: 'Retrieves detailed information about a specific task from the selected task list.',
      group: 'Tasks',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list containing the task',
          longDesc: 'Select the task list that contains the task you want to retrieve.',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'The task to retrieve',
          longDesc: 'Select the specific task whose details you want to retrieve.',
        },
      },
    },
    list_tasks: {
      displayName: 'List Tasks',
      shortDesc: 'Get all tasks from a task list',
      longDesc:
        'Retrieves a list of tasks from the specified task list with various filtering options like due dates, completion status, and more.',
      group: 'Tasks',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list to get tasks from',
          longDesc: 'Select the task list from which you want to retrieve tasks.',
        },
        completedMax: {
          displayName: 'Completed Max Date',
          shortDesc: 'Upper bound for a task completion date',
          longDesc: 'Only return tasks completed before this date.',
        },
        completedMin: {
          displayName: 'Completed Min Date',
          shortDesc: 'Lower bound for a task completion date',
          longDesc: 'Only return tasks completed after this date.',
        },
        dueMax: {
          displayName: 'Due Max Date',
          shortDesc: 'Upper bound for a task due date',
          longDesc: 'Only return tasks with due dates before this date.',
        },
        dueMin: {
          displayName: 'Due Min Date',
          shortDesc: 'Lower bound for a task due date',
          longDesc: 'Only return tasks with due dates after this date.',
        },
        maxResults: {
          displayName: 'Max Results',
          shortDesc: 'Maximum number of tasks to return',
          longDesc: 'Specify the maximum number of tasks to return in the response.',
        },
        pageToken: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Provide the page token from a previous request to get the next page of results.',
        },
        showCompleted: {
          displayName: 'Show Completed',
          shortDesc: 'Whether to include completed tasks',
          longDesc: 'Enable this option to include completed tasks in the results.',
        },
        showDeleted: {
          displayName: 'Show Deleted',
          shortDesc: 'Whether to include deleted tasks',
          longDesc: 'Enable this option to include deleted tasks in the results.',
        },
        showHidden: {
          displayName: 'Show Hidden',
          shortDesc: 'Whether to include hidden tasks',
          longDesc: 'Enable this option to include hidden tasks in the results.',
        },
        updateMin: {
          displayName: 'Updated Min Date',
          shortDesc: 'Lower bound for a task last modification time',
          longDesc: 'Only return tasks that have been updated after this date.',
        },
        showAssigned: {
          displayName: 'Show Assigned',
          shortDesc: 'Whether to include assigned tasks',
          longDesc: 'Enable this option to include tasks that have been assigned to other people.',
        },
      },
    },
    update_task: {
      displayName: 'Update Task',
      shortDesc: 'Update an existing task in Google Tasks',
      longDesc:
        'Updates the details of an existing task including its title, notes, due date, completion status, and hierarchical positioning.',
      group: 'Tasks',
      options: {
        taskList: {
          displayName: 'Task List',
          shortDesc: 'The task list containing the task',
          longDesc: 'Select the task list that contains the task you want to update.',
        },
        task: {
          displayName: 'Task',
          shortDesc: 'The task to update',
          longDesc: 'Select the specific task that you want to update.',
        },
        parent: {
          displayName: 'Parent Task',
          shortDesc: 'The parent task (to make this a subtask)',
          longDesc:
            'Select a parent task if you want to make this task a subtask under another task.',
        },
        previous: {
          displayName: 'Previous Task',
          shortDesc: 'The task after which this task should be positioned',
          longDesc: 'Select the task after which this task should be positioned in the list.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'The new title of the task',
          longDesc: 'Enter the new title or main description for the task.',
        },
        notes: {
          displayName: 'Notes',
          shortDesc: 'Additional notes or description for the task',
          longDesc: 'Update any additional notes, details, or description for the task.',
        },
        due: {
          displayName: 'Due Date',
          shortDesc: 'The due date for the task',
          longDesc: 'Set or update the due date for when this task should be completed.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The completion status of the task',
          longDesc: 'Set whether the task is incomplete (needs action) or completed.',
        },
      },
    },
  },
};

export default GoogleTasksAppEn;
