/* eslint-disable max-len */
const BrowseAiAppEn = {
  displayName: 'Browse AI',
  groups: ['Web Scraping & Automation'],
  shortDesc: 'Web scraping and data extraction automation platform',
  longDesc: `Connect your Browse AI account to automate web scraping and data extraction workflows. Create custom robots to monitor websites, extract structured data, track changes, and collect information from any website without coding. Set up automated data collection schedules, receive alerts on website changes, and integrate extracted data directly into your Qore workflows.`,
  connectionMessage: {
    title: 'Connect to Browse AI',
    content: `To connect your Browse AI account, you will need your **API Key**.

## Getting Your API Key

1. Sign in to your [Browse AI dashboard](https://www.browse.ai/dashboard/)
2. Click on your profile icon or account settings
3. Navigate to the **API** tab
4. Click **Create API Key** or copy your existing API key
5. Give your API key a descriptive name if creating a new one

## Connection Details

### API Key
Your Browse AI API key that authenticates requests to the Browse AI service. This key allows you to manage robots, run tasks, and retrieve extracted data programmatically.

**Note:** Keep your API key secure and never share it publicly. You can manage and revoke API keys from your Browse AI dashboard at any time.`,
  },
  actions: {
    get_robot: {
      displayName: 'Get Robot',
      shortDesc: 'Retrieve details of a specific Browse AI robot',
      longDesc:
        'Fetches comprehensive information about a Browse AI robot, including its configuration, input parameters, and metadata',
      options: {
        id: {
          displayName: 'Robot ID',
          shortDesc: 'The unique identifier of the robot',
          longDesc: 'Select the robot you want to retrieve information for',
        },
      },
    },
    list_robots: {
      displayName: 'List Robots',
      shortDesc: 'Get a list of all Browse AI robots',
      longDesc:
        'Retrieves a complete list of all robots available in your Browse AI account, including their basic information and configuration details',
    },
    list_tasks: {
      displayName: 'List Tasks',
      shortDesc: 'Get a list of tasks for a specific robot',
      longDesc:
        'Retrieves a filtered list of tasks executed by a specific Browse AI robot, with options to filter by status, date range, and sorting preferences',
      options: {
        robot: {
          displayName: 'Robot',
          shortDesc: 'The robot to list tasks for',
          longDesc: 'Select the robot whose tasks you want to retrieve',
        },
        page: {
          displayName: 'Page Number',
          shortDesc: 'The page number for pagination',
          longDesc: 'Specify which page of results to retrieve (starts from 1)',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of tasks per page',
          longDesc: 'Specify how many tasks to return per page (default: 10)',
        },
        status: {
          displayName: 'Task Status',
          shortDesc: 'Filter tasks by their execution status',
          longDesc:
            'Filter the results to only include tasks with a specific status (failed, successful, or in-progress)',
        },
        sort: {
          displayName: 'Sort Options',
          shortDesc: 'How to sort the task results',
          longDesc: 'Configure the sorting order for the returned tasks',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'Choose which field to use for sorting the tasks',
              },
              order: {
                displayName: 'Sort Order',
                shortDesc: 'Ascending or descending order',
                longDesc: 'Choose whether to sort in ascending or descending order',
              },
            },
          },
        },
        includeRetried: {
          displayName: 'Include Retried Tasks',
          shortDesc: 'Whether to include retried tasks in results',
          longDesc: 'Set to true to include tasks that have been retried in the results',
        },
        fromDate: {
          displayName: 'From Date',
          shortDesc: 'Start date for filtering tasks',
          longDesc: 'Filter tasks created on or after this date',
        },
        toDate: {
          displayName: 'To Date',
          shortDesc: 'End date for filtering tasks',
          longDesc: 'Filter tasks created on or before this date',
        },
      },
    },
    run_task: {
      displayName: 'Run Task',
      shortDesc: 'Execute a Browse AI robot task',
      longDesc:
        'Runs a single task using the specified Browse AI robot with the provided input parameters',
      options: {
        robot: {
          displayName: 'Robot',
          shortDesc: 'The robot to execute',
          longDesc: 'Select the robot you want to run a task with',
        },
      },
    },
    run_bulk_task: {
      displayName: 'Run Bulk Task',
      shortDesc: 'Execute multiple tasks in bulk',
      longDesc:
        'Runs multiple tasks in bulk using the specified Browse AI robot with different sets of input parameters',
      options: {
        title: {
          displayName: 'Bulk Run Title',
          shortDesc: 'A descriptive title for the bulk run',
          longDesc: 'Provide a meaningful title to identify this bulk task execution',
        },
        robot: {
          displayName: 'Robot',
          shortDesc: 'The robot to execute',
          longDesc: 'Select the robot you want to use for the bulk task execution',
        },
        inputParameters: {
          displayName: 'Input Parameters',
          shortDesc: 'List of parameter sets for each task',
          longDesc:
            'Provide a list of input parameter sets, where each set will be used to run one task',
        },
      },
    },
  },
  triggers: {
    new_task: {
      displayName: 'New Task',
      shortDesc: 'Triggers when a Browse AI task event occurs',
      longDesc:
        'Monitors Browse AI robot tasks and triggers when specific task events occur, such as task completion, data capture changes, or errors',
      options: {
        robot: {
          displayName: 'Robot',
          shortDesc: 'The robot to monitor for task events',
          longDesc: 'Select the Browse AI robot whose task events you want to monitor',
        },
        eventType: {
          displayName: 'Event Type',
          shortDesc: 'The type of task event to monitor',
          longDesc: 'Choose which specific task event should trigger this workflow',
        },
      },
    },
  },
};
export default BrowseAiAppEn;
