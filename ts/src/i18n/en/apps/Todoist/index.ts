/* eslint-disable max-len */
const TodoistAppEn = {
  displayName: 'Todoist',
  groups: ['Project & Task Management'],
  shortDesc: 'Connect to Todoist to automate task and project management workflows.',
  longDesc:
    'The Todoist integration enables you to seamlessly interact with the Todoist API to manage tasks, projects, labels, and comments. Automate your task management workflows, sync project data, and streamline team collaboration with comprehensive actions and triggers.',
  actions: {
    add_comment_to_project: {
      groups: ['Comments'],
      displayName: 'Add Comment to Project',
      shortDesc: 'Add a comment to a Todoist project',
      longDesc:
        'Creates a new comment on a specified Todoist project. Comments can be used to provide updates, notes, or collaborate with team members on project-related discussions.',
      options: {
        content: {
          displayName: 'Comment Content',
          shortDesc: 'The text content of the comment',
          longDesc:
            'The message or note you want to add to the project. Supports Markdown formatting for rich text.',
        },
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The project to comment on',
          longDesc: 'Select the Todoist project where you want to add the comment.',
        },
      },
    },
    add_comment_to_task: {
      groups: ['Comments'],
      displayName: 'Add Comment to Task',
      shortDesc: 'Add a comment to a Todoist task',
      longDesc:
        'Creates a new comment on a specified Todoist task. Use comments to add notes, updates, or collaborate with team members on specific tasks.',
      options: {
        content: {
          displayName: 'Comment Content',
          shortDesc: 'The text content of the comment',
          longDesc:
            'The message or note you want to add to the task. Supports Markdown formatting for rich text.',
        },
        task_id: {
          displayName: 'Task ID',
          shortDesc: 'The task to comment on',
          longDesc: 'Select the Todoist task where you want to add the comment.',
        },
      },
    },
    complete_task: {
      groups: ['Tasks'],
      displayName: 'Complete Task',
      shortDesc: 'Mark a Todoist task as complete',
      longDesc:
        'Closes a task by marking it as completed. This action moves the task to the completed tasks list and updates its status accordingly.',
      options: {
        task_id: {
          displayName: 'Task ID',
          shortDesc: 'The task to complete',
          longDesc: 'Select the Todoist task you want to mark as complete.',
        },
      },
    },
    create_project: {
      groups: ['Projects'],
      displayName: 'Create Project',
      shortDesc: 'Create a new Todoist project',
      longDesc:
        'Creates a new project in Todoist. Projects help you organize related tasks and collaborate with team members.',
      options: {
        name: {
          displayName: 'Project Name',
          shortDesc: 'The name of the project',
          longDesc: 'A descriptive name for your new Todoist project.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Project description',
          longDesc:
            'Optional detailed description explaining the purpose and scope of the project.',
        },
        color: {
          displayName: 'Color',
          shortDesc: 'Project color identifier',
          longDesc: 'The color used to visually identify the project in the Todoist interface.',
        },
        view_style: {
          displayName: 'View Style',
          shortDesc: 'How the project is displayed',
          longDesc:
            'Choose how tasks in this project are displayed: as a list, board (Kanban), or calendar view.',
        },
        is_favorite: {
          displayName: 'Is Favorite',
          shortDesc: 'Mark project as favorite',
          longDesc:
            'When enabled, the project will appear in your favorites section for quick access.',
        },
      },
    },
    create_task: {
      groups: ['Tasks'],
      displayName: 'Create Task',
      shortDesc: 'Create a new Todoist task',
      longDesc:
        'Creates a new task in Todoist. Tasks can be assigned to projects, sections, given labels, priorities, due dates, and more.',
      options: {
        content: {
          displayName: 'Task Content',
          shortDesc: 'The task description',
          longDesc:
            'The main text describing what needs to be done. This is the primary content of the task.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Additional task details',
          longDesc:
            'Optional detailed description or notes about the task. Supports Markdown formatting.',
        },
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The project for this task',
          longDesc:
            'Select which Todoist project this task belongs to. If not specified, the task will be added to your Inbox.',
        },
        assignee_id: {
          displayName: 'Assignee ID',
          shortDesc: 'Person assigned to the task',
          longDesc: 'Assign the task to a specific collaborator in the selected project.',
        },
        section_id: {
          displayName: 'Section ID',
          shortDesc: 'The section within the project',
          longDesc:
            'Organize the task within a specific section of the project for better categorization.',
        },
        order: {
          displayName: 'Order',
          shortDesc: 'Task position in the list',
          longDesc:
            'Specify the position of the task in the project or section. Lower numbers appear first.',
        },
        labels: {
          displayName: 'Labels',
          shortDesc: 'Task labels',
          longDesc:
            'Add one or more labels to categorize and filter the task. Labels help with organization and quick filtering.',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Task priority level',
          longDesc:
            'Set the priority level for the task. Higher priority tasks are displayed with color-coded flags: 1 (urgent), 2 (high), 3 (normal), 4 (low).',
        },
        due_datetime: {
          displayName: 'Due Date',
          shortDesc: 'When the task is due',
          longDesc: 'Set a due date and optionally a time for when the task should be completed.',
        },
        duration: {
          displayName: 'Duration',
          shortDesc: 'Estimated time to complete',
          longDesc:
            'Specify how long you expect the task to take. Used for time tracking and scheduling.',
          type: {
            fields: {
              amount: {
                displayName: 'Amount',
                shortDesc: 'Duration value',
                longDesc: 'The numeric value for the duration.',
              },
              unit: {
                displayName: 'Unit',
                shortDesc: 'Duration unit',
                longDesc: 'The unit of time: minutes or days.',
              },
            },
          },
        },
      },
    },
    delete_task: {
      groups: ['Tasks'],
      displayName: 'Delete Task',
      shortDesc: 'Permanently delete a Todoist task',
      longDesc:
        'Permanently removes a task from Todoist. This action cannot be undone. Use with caution.',
      options: {
        task_id: {
          displayName: 'Task ID',
          shortDesc: 'The task to delete',
          longDesc: 'Select the Todoist task you want to permanently delete.',
        },
      },
    },
    get_project: {
      groups: ['Projects'],
      displayName: 'Get Project',
      shortDesc: 'Retrieve details of a Todoist project',
      longDesc:
        'Fetches detailed information about a specific Todoist project, including its properties, metadata, and settings.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The project to retrieve',
          longDesc: 'Select the Todoist project you want to get details for.',
        },
      },
    },
    get_project_collaborators: {
      groups: ['Projects'],
      displayName: 'Get Project Collaborators',
      shortDesc: 'List collaborators in a project',
      longDesc:
        'Retrieves a list of all collaborators who have access to a specific Todoist project. Useful for managing team assignments and permissions.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'The project to get collaborators for',
          longDesc: 'Select the Todoist project to retrieve the list of collaborators.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Used for pagination. Provide the cursor from a previous response to get the next page of results.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of results',
          longDesc:
            'The maximum number of collaborators to return in a single request. Default is 50.',
        },
      },
    },
    get_task: {
      groups: ['Tasks'],
      displayName: 'Get Task',
      shortDesc: 'Retrieve details of a Todoist task',
      longDesc:
        'Fetches detailed information about a specific Todoist task, including all its properties, labels, due dates, and metadata.',
      options: {
        task_id: {
          displayName: 'Task ID',
          shortDesc: 'The task to retrieve',
          longDesc: 'Select the Todoist task you want to get details for.',
        },
      },
    },
    get_tasks_by_filter: {
      groups: ['Tasks'],
      displayName: 'Get Tasks by Filter',
      shortDesc: 'Search tasks using Todoist filter queries',
      longDesc:
        'Retrieves tasks that match a specific filter query. Todoist filters allow powerful searches using keywords, dates, priorities, labels, and more. See Todoist filter documentation for advanced query syntax.',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Used for pagination. Provide the cursor from a previous response to get the next page of results.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of results',
          longDesc: 'The maximum number of tasks to return in a single request. Default is 50.',
        },
        query: {
          displayName: 'Filter Query',
          shortDesc: 'The filter expression',
          longDesc:
            'The filter query to use, see [documentation](https://www.todoist.com/help/articles/introduction-to-filters-V98wIH) for more details',
        },
      },
    },
    list_labels: {
      groups: ['Labels'],
      displayName: 'List Labels',
      shortDesc: 'Retrieve all Todoist labels',
      longDesc:
        'Fetches a list of all labels in your Todoist account. Labels are used to categorize and filter tasks across projects.',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Used for pagination. Provide the cursor from a previous response to get the next page of results.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of results',
          longDesc: 'The maximum number of labels to return in a single request. Default is 50.',
        },
      },
    },
    list_projects: {
      groups: ['Projects'],
      displayName: 'List Projects',
      shortDesc: 'Retrieve all Todoist projects',
      longDesc:
        'Fetches a list of all projects in your Todoist account, including shared and personal projects. Use this to discover available projects for task organization.',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Used for pagination. Provide the cursor from a previous response to get the next page of results.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of results',
          longDesc: 'The maximum number of projects to return in a single request. Default is 50.',
        },
      },
    },
    list_sections: {
      groups: ['Sections'],
      displayName: 'List Sections',
      shortDesc: 'Retrieve sections from projects',
      longDesc:
        'Fetches a list of sections. Sections are used within projects to organize tasks into logical groups or categories.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'Filter by project',
          longDesc: 'Optionally filter sections to only those within a specific project.',
        },
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Used for pagination. Provide the cursor from a previous response to get the next page of results.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of results',
          longDesc: 'The maximum number of sections to return in a single request. Default is 50.',
        },
      },
    },
    list_tasks: {
      groups: ['Tasks'],
      displayName: 'List Tasks',
      shortDesc: 'Retrieve Todoist tasks',
      longDesc:
        'Fetches a list of tasks with optional filtering by project, section, or label. Use this to retrieve tasks for processing or display.',
      options: {
        cursor: {
          displayName: 'Cursor',
          shortDesc: 'Pagination cursor',
          longDesc:
            'Used for pagination. Provide the cursor from a previous response to get the next page of results.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of results',
          longDesc: 'The maximum number of tasks to return in a single request. Default is 50.',
        },
        ids: {
          displayName: 'Task IDs',
          shortDesc: 'Filter by specific task IDs',
          longDesc: 'Optionally specify a list of task IDs to retrieve only those specific tasks.',
        },
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'Filter by project',
          longDesc: 'Retrieve only tasks from a specific project.',
        },
        section_id: {
          displayName: 'Section ID',
          shortDesc: 'Filter by section',
          longDesc: 'Retrieve only tasks from a specific section within a project.',
        },
        label: {
          displayName: 'Label',
          shortDesc: 'Filter by label',
          longDesc: 'Retrieve only tasks that have a specific label assigned.',
        },
      },
    },
    move_task_to_section: {
      groups: ['Tasks'],
      displayName: 'Move Task to Section',
      shortDesc: 'Move a task to a different section or project',
      longDesc:
        'Moves a task to a different section within the same project, or to a different project entirely. Useful for reorganizing tasks and workflows.',
      options: {
        task_id: {
          displayName: 'Task ID',
          shortDesc: 'The task to move',
          longDesc: 'Select the Todoist task you want to move.',
        },
        section_id: {
          displayName: 'Section ID',
          shortDesc: 'Destination section',
          longDesc:
            'The section where you want to move the task. Either section_id or project_id must be specified.',
        },
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'Destination project',
          longDesc:
            'The project where you want to move the task. Either section_id or project_id must be specified.',
        },
      },
    },
    update_task: {
      groups: ['Tasks'],
      displayName: 'Update Task',
      shortDesc: 'Update an existing Todoist task',
      longDesc:
        'Modifies the properties of an existing Todoist task. You can update content, description, due dates, labels, priority, and more.',
      options: {
        task_id: {
          displayName: 'Task ID',
          shortDesc: 'The task to update',
          longDesc: 'Select the Todoist task you want to modify.',
        },
        content: {
          displayName: 'Task Content',
          shortDesc: 'Updated task description',
          longDesc: 'The new main text describing what needs to be done.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'Updated task details',
          longDesc:
            'New detailed description or notes about the task. Supports Markdown formatting.',
        },
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'Move to different project',
          longDesc: 'Move the task to a different Todoist project.',
        },
        section_id: {
          displayName: 'Section ID',
          shortDesc: 'Move to different section',
          longDesc: 'Move the task to a different section within the project.',
        },
        order: {
          displayName: 'Order',
          shortDesc: 'New task position',
          longDesc: 'Change the position of the task in the project or section.',
        },
        labels: {
          displayName: 'Labels',
          shortDesc: 'Updated task labels',
          longDesc: "Replace the task's labels with a new set of labels.",
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Updated priority level',
          longDesc: 'Change the priority level: 1 (urgent), 2 (high), 3 (normal), 4 (low).',
        },
        due_datetime: {
          displayName: 'Due Date',
          shortDesc: 'Updated due date',
          longDesc: 'Change the due date and optionally the time for the task.',
        },
        duration: {
          displayName: 'Duration',
          shortDesc: 'Updated estimated time',
          longDesc: 'Change how long you expect the task to take.',
          type: {
            fields: {
              amount: {
                displayName: 'Amount',
                shortDesc: 'Duration value',
                longDesc: 'The numeric value for the duration.',
              },
              unit: {
                displayName: 'Unit',
                shortDesc: 'Duration unit',
                longDesc: 'The unit of time: minutes or days.',
              },
            },
          },
        },
      },
    },
  },
  triggers: {
    new_completed_task: {
      displayName: 'New Completed Task',
      shortDesc: 'Triggers when a task is completed in Todoist',
      longDesc:
        'Monitors your Todoist account for newly completed tasks. This trigger fires whenever any task is marked as complete, with optional filtering by project, section, or custom query. Perfect for tracking productivity, logging completions, or triggering follow-up workflows based on task completion.',
      options: {
        project_id: {
          displayName: 'Project ID',
          shortDesc: 'Filter by specific project',
          longDesc:
            'Optionally monitor only completed tasks from a specific Todoist project. If not specified, all completed tasks across all projects will trigger the event.',
        },
        section_id: {
          displayName: 'Section ID',
          shortDesc: 'Filter by specific section',
          longDesc:
            'Optionally monitor only completed tasks from a specific section within a project. This allows you to track completions in specific areas of your workflow.',
        },
        query: {
          displayName: 'Filter Query',
          shortDesc: 'Custom filter expression',
          longDesc:
            'The filter query to use, see [documentation](https://www.todoist.com/help/articles/introduction-to-filters-V98wIH) for more details',
        },
      },
    },
  },
};

export default TodoistAppEn;
