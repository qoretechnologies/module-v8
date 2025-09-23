/* eslint-disable max-len */
const AzureDevOpsAppEn = {
  displayName: 'Azure DevOps',
  shortDesc:
    'Connect to Azure DevOps to automate project management, code repositories, and CI/CD pipelines.',
  longDesc:
    'The Azure DevOps integration provides comprehensive actions and triggers to interact with Azure DevOps Services. Manage work items, repositories, builds, releases, and team projects efficiently. Automate your development workflow by connecting Azure DevOps with other tools and services in your automation pipeline.',
  actions: {
    create_work_item: {
      displayName: 'Create Work Item',
      shortDesc: 'Create a new work item in Azure DevOps',
      longDesc:
        'Create a new work item such as a task, bug, epic, or user story in a specified Azure DevOps project with customizable properties and fields.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The Azure DevOps project where the work item will be created',
          longDesc:
            'Select the target project from your Azure DevOps organization where the new work item should be created.',
        },
        itemType: {
          displayName: 'Work Item Type',
          shortDesc: 'The type of work item to create',
          longDesc:
            'Choose the specific type of work item you want to create, such as Task, Bug, Epic, User Story, or other available types in your project.',
        },
        properties: {
          displayName: 'Work Item Properties',
          shortDesc: 'Fields and values for the work item',
          longDesc:
            'Configure the properties and field values for the work item, including title, description, and other custom fields based on the selected work item type.',
          type: {
            fields: {
              'System.Title': {
                displayName: 'Title',
                shortDesc: 'The title of the work item',
                longDesc: 'A descriptive title that summarizes the work item content.',
              },
              'System.Description': {
                displayName: 'Description',
                shortDesc: 'Detailed description of the work item',
                longDesc:
                  'A comprehensive description explaining the work item requirements, context, and any relevant details.',
              },
            },
          },
        },
      },
    },

    delete_work_item: {
      displayName: 'Delete Work Item',
      shortDesc: 'Delete a work item from Azure DevOps',
      longDesc:
        'Permanently remove a work item from the specified Azure DevOps project. This action cannot be undone.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The Azure DevOps project containing the work item',
          longDesc: 'Select the project where the work item to be deleted is located.',
        },
        id: {
          displayName: 'Work Item ID',
          shortDesc: 'The unique identifier of the work item to delete',
          longDesc:
            'Enter or select the ID of the specific work item you want to permanently delete from the project.',
        },
      },
    },

    get_work_item: {
      displayName: 'Get Work Item',
      shortDesc: 'Retrieve details of a specific work item',
      longDesc:
        'Fetch comprehensive information about a work item including its current state, assigned users, and all field values.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The Azure DevOps project containing the work item',
          longDesc: 'Select the project where the work item is located to retrieve its details.',
        },
        id: {
          displayName: 'Work Item ID',
          shortDesc: 'The unique identifier of the work item',
          longDesc: 'Enter or select the ID of the work item whose details you want to retrieve.',
        },
      },
    },

    list_projects: {
      displayName: 'List Projects',
      shortDesc: 'Get a list of Azure DevOps projects',
      longDesc:
        'Retrieve a list of all accessible projects in your Azure DevOps organization with optional filtering and pagination.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of projects to return',
          longDesc:
            'Set the maximum number of projects to include in the response to control pagination.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of projects to skip',
          longDesc:
            'Specify how many projects to skip from the beginning of the list for pagination purposes.',
        },
        stateFilter: {
          displayName: 'State Filter',
          shortDesc: 'Filter projects by their current state',
          longDesc:
            'Filter the project list based on project state such as active, deleted, or other available states.',
        },
      },
    },

    list_users: {
      displayName: 'List Users',
      shortDesc: 'Get a list of users in the Azure DevOps organization',
      longDesc:
        'Retrieve a list of all users who have access to your Azure DevOps organization with pagination support.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of users to return',
          longDesc:
            'Set the maximum number of users to include in the response for pagination control.',
        },
        continuationToken: {
          displayName: 'Continuation Token',
          shortDesc: 'Token for retrieving the next page of results',
          longDesc:
            'Provide the continuation token from a previous request to get the next set of users in the paginated results.',
        },
      },
    },

    list_work_items: {
      displayName: 'List Work Items',
      shortDesc: 'Get a list of work items from a project',
      longDesc:
        'Retrieve work items from a specified project with filtering options by type, state, title, and pagination support.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The Azure DevOps project to search for work items',
          longDesc: 'Select the project from which you want to retrieve work items.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of work items to return',
          longDesc:
            'Set the maximum number of work items to include in the response for better performance and pagination.',
        },
        itemType: {
          displayName: 'Work Item Type',
          shortDesc: 'Filter by work item type',
          longDesc:
            'Filter the results to include only work items of a specific type such as Task, Bug, Epic, or User Story.',
        },
        state: {
          displayName: 'State',
          shortDesc: 'Filter by work item state',
          longDesc:
            'Filter work items based on their current state such as New, Active, Resolved, or Closed.',
        },
        title: {
          displayName: 'Title Filter',
          shortDesc: 'Filter by work item title',
          longDesc: 'Search for work items that contain the specified text in their title.',
        },
      },
    },

    update_work_item: {
      displayName: 'Update Work Item',
      shortDesc: 'Update an existing work item',
      longDesc:
        'Modify the properties and field values of an existing work item in Azure DevOps with the ability to update any available fields.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The Azure DevOps project containing the work item',
          longDesc: 'Select the project where the work item to be updated is located.',
        },
        itemId: {
          displayName: 'Work Item ID',
          shortDesc: 'The unique identifier of the work item to update',
          longDesc: 'Enter or select the ID of the work item you want to modify.',
        },
        properties: {
          displayName: 'Updated Properties',
          shortDesc: 'New values for work item fields',
          longDesc:
            'Specify the fields and their new values that you want to update in the work item. Available fields depend on the work item type.',
          type: {
            fields: {
              'System.Title': {
                displayName: 'Title',
                shortDesc: 'Updated title for the work item',
                longDesc: 'Provide a new title that better describes the work item content.',
              },
              'System.Description': {
                displayName: 'Description',
                shortDesc: 'Updated description for the work item',
                longDesc:
                  'Provide an updated comprehensive description with new requirements, context, or relevant details.',
              },
            },
          },
        },
      },
    },
  },

  triggers: {
    new_work_item: {
      displayName: 'New Work Item',
      shortDesc: 'Triggers when a new work item is created',
      longDesc:
        'Receive real-time notifications whenever a new work item is created in the specified Azure DevOps project, with optional filtering by work item type.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The Azure DevOps project to monitor',
          longDesc:
            'Select the project where you want to monitor for new work items being created.',
        },
        itemType: {
          displayName: 'Work Item Type Filter',
          shortDesc: 'Filter by specific work item types',
          longDesc:
            'Optionally filter the trigger to only fire for specific types of work items such as Tasks, Bugs, or User Stories.',
        },
      },
    },

    updated_work_item: {
      displayName: 'Updated Work Item',
      shortDesc: 'Triggers when a work item is updated',
      longDesc:
        'Receive real-time notifications whenever a work item is modified in the specified Azure DevOps project, with optional filtering by work item type and changed fields.',
      options: {
        project: {
          displayName: 'Project',
          shortDesc: 'The Azure DevOps project to monitor',
          longDesc: 'Select the project where you want to monitor for work item updates.',
        },
        itemType: {
          displayName: 'Work Item Type Filter',
          shortDesc: 'Filter by specific work item types',
          longDesc:
            'Optionally filter the trigger to only fire for updates to specific types of work items.',
        },
        changedFields: {
          displayName: 'Changed Fields Filter',
          shortDesc: 'Filter by specific field changes',
          longDesc:
            'Optionally specify which field changes should trigger this webhook. Leave empty to trigger on any field change.',
        },
      },
    },
  },
};

export default AzureDevOpsAppEn;
