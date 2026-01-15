const BambooHRAppEn = {
  displayName: 'BambooHR',
  groups: ['HR & People Management'],
  shortDesc: 'Connect to BambooHR to manage employee data with powerful automation',
  longDesc:
    'The BambooHR integration provides comprehensive access to your HR operations. Create, read, update, and list employees with dynamic field support. The integration automatically discovers available fields in your BambooHR account, including custom fields, and provides intelligent type handling for dates, lists, and other field types.',
  connectionMessage: {
    title: 'Connect to BambooHR',
    content: `To connect your BambooHR account, you'll need your **API Key** and **Company Domain**.

1. Log in to BambooHR as an administrator
2. Click your profile picture in the upper right corner and select "API Keys"
3. Click "Add New Key", give it a name, and copy the generated API key
4. Your company domain is the subdomain in your BambooHR URL (e.g., if you access BambooHR at \`yourcompany.bamboohr.com\`, your domain is \`yourcompany\`)`,
  },
  actions: {
    get_employee: {
      displayName: 'Get Employee',
      shortDesc: 'Retrieve a single employee by ID',
      longDesc:
        'Fetches detailed data for a single employee in BambooHR by their ID. Returns all requested fields with dynamically loaded field types. You can specify which fields to retrieve or fetch all available fields.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'The ID of the employee to retrieve',
          longDesc:
            'Enter the unique identifier of the employee you want to fetch. Use 0 to retrieve the employee associated with your API key.',
        },
        fields: {
          displayName: 'Fields',
          shortDesc: 'Specific fields to retrieve',
          longDesc:
            'Select which fields to retrieve for the employee. Leave empty to retrieve all available fields (up to 400 fields).',
        },
      },
    },
    create_employee: {
      displayName: 'Create Employee',
      shortDesc: 'Create a new employee in BambooHR',
      longDesc:
        'Creates a new employee record in BambooHR. At minimum, firstName and lastName are required. The action dynamically presents all available fields based on your BambooHR configuration, including custom fields.',
      options: {
        employee_data: {
          displayName: 'Employee Data',
          shortDesc: 'The data for the new employee',
          longDesc:
            'Provide values for the employee fields. The available fields are dynamically loaded from your BambooHR account and include both standard and custom fields. firstName and lastName are required.',
        },
      },
    },
    update_employee: {
      displayName: 'Update Employee',
      shortDesc: 'Update an existing employee in BambooHR',
      longDesc:
        'Updates an existing employee record in BambooHR. The action dynamically presents all available fields based on your BambooHR configuration. Only provide the fields you want to update.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'The ID of the employee to update',
          longDesc: 'Enter the unique identifier of the employee you want to update.',
        },
        employee_data: {
          displayName: 'Employee Data',
          shortDesc: 'The data to update',
          longDesc:
            'Provide new values for the employee fields you want to update. The available fields are dynamically loaded from your BambooHR account.',
        },
      },
    },
    list_employees: {
      displayName: 'List Employees',
      shortDesc: 'Retrieve a list of all employees',
      longDesc:
        'Fetches a list of all employees from BambooHR. You can specify which fields to retrieve for each employee. Uses the custom report endpoint for efficient bulk retrieval.',
      options: {
        fields: {
          displayName: 'Fields',
          shortDesc: 'Specific fields to retrieve for each employee',
          longDesc:
            'Select which fields to retrieve for each employee. Leave empty to retrieve a default set of common fields (id, name, email, department, job title).',
        },
      },
    },
    // Time Off Actions
    get_whos_out: {
      displayName: "Get Who's Out",
      shortDesc: 'Get a summary of employees who are out',
      longDesc:
        "Retrieves a list of employees who are out (vacation, sick leave, etc.) and company holidays for a given date range. If no dates are specified, returns the current day plus the next 14 days.",
      options: {
        start_date: {
          displayName: 'Start Date',
          shortDesc: 'Start of the date range',
          longDesc: 'The start date for the query. Defaults to today if not specified.',
        },
        end_date: {
          displayName: 'End Date',
          shortDesc: 'End of the date range',
          longDesc:
            'The end date for the query. Defaults to 14 days from the start date if not specified.',
        },
      },
    },
    search_time_off_requests: {
      displayName: 'Search Time Off Requests',
      shortDesc: 'Search and filter time off requests',
      longDesc:
        'Searches time off requests in BambooHR with various filters. Returns requests matching the specified criteria including date range, employee, status, and time off type.',
      options: {
        start_date: {
          displayName: 'Start Date',
          shortDesc: 'Filter by start date',
          longDesc: 'Only show time off requests on or after this date.',
        },
        end_date: {
          displayName: 'End Date',
          shortDesc: 'Filter by end date',
          longDesc: 'Only show time off requests on or before this date.',
        },
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'Filter by employee',
          longDesc: 'Limit results to a specific employee by their ID.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by request status',
          longDesc:
            'Filter by one or more statuses: approved, denied, requested, canceled, superceded.',
        },
        type: {
          displayName: 'Time Off Type',
          shortDesc: 'Filter by time off type',
          longDesc: 'Filter by one or more time off types configured in your BambooHR account.',
        },
      },
    },
    // Employee File Actions
    get_all_employee_files: {
      displayName: 'Get All Employee Files',
      shortDesc: 'List all files for an employee',
      longDesc:
        'Retrieves all files associated with a specific employee, organized by category. Returns file metadata including name, size, upload date, and sharing status.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'The employee to get files for',
          longDesc: 'The ID of the employee whose files you want to retrieve.',
        },
      },
    },
    download_employee_file: {
      displayName: 'Download Employee File',
      shortDesc: 'Download an employee file',
      longDesc:
        'Downloads a specific file from an employee record. Returns the file content as base64-encoded binary along with the MIME type.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'The employee who owns the file',
          longDesc: 'The ID of the employee whose file you want to download.',
        },
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The file to download',
          longDesc: 'The ID of the file to download.',
        },
      },
    },
    upload_employee_file: {
      displayName: 'Upload Employee File',
      shortDesc: 'Upload a file to an employee',
      longDesc:
        'Uploads a new file to an employee record in BambooHR. The file will be placed in the specified category.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'The employee to upload the file to',
          longDesc: 'The ID of the employee to associate the file with.',
        },
        category: {
          displayName: 'Category',
          shortDesc: 'File category',
          longDesc: 'The category to place the file in. Categories are configured in BambooHR.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc: 'The file to upload. Must include name, MIME type, and base64-encoded content.',
        },
        share_with_employee: {
          displayName: 'Share with Employee',
          shortDesc: 'Make file visible to employee',
          longDesc: 'Whether to make this file visible to the employee in their self-service portal.',
        },
      },
    },
    update_employee_file: {
      displayName: 'Update Employee File',
      shortDesc: 'Update employee file metadata',
      longDesc:
        'Updates the metadata for an existing employee file, such as name, category, or sharing settings.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'The employee who owns the file',
          longDesc: 'The ID of the employee whose file you want to update.',
        },
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The file to update',
          longDesc: 'The ID of the file to update.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'New file name',
          longDesc: 'The new name for the file.',
        },
        category: {
          displayName: 'Category',
          shortDesc: 'New category',
          longDesc: 'Move the file to a different category.',
        },
        share_with_employee: {
          displayName: 'Share with Employee',
          shortDesc: 'Update sharing setting',
          longDesc: 'Whether to make this file visible to the employee.',
        },
      },
    },
    delete_employee_file: {
      displayName: 'Delete Employee File',
      shortDesc: 'Delete an employee file',
      longDesc: 'Permanently deletes a file from an employee record. This action cannot be undone.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'The employee who owns the file',
          longDesc: 'The ID of the employee whose file you want to delete.',
        },
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The file to delete',
          longDesc: 'The ID of the file to delete.',
        },
      },
    },
    // Company File Actions
    get_all_company_files: {
      displayName: 'Get All Company Files',
      shortDesc: 'List all company files',
      longDesc:
        'Retrieves all company files organized by category. Returns file metadata including name, size, upload date, and sharing status.',
      options: {},
    },
    download_company_file: {
      displayName: 'Download Company File',
      shortDesc: 'Download a company file',
      longDesc:
        'Downloads a specific company file. Returns the file content as base64-encoded binary along with the MIME type.',
      options: {
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The file to download',
          longDesc: 'The ID of the company file to download.',
        },
      },
    },
    upload_company_file: {
      displayName: 'Upload Company File',
      shortDesc: 'Upload a company file',
      longDesc:
        'Uploads a new file to the company files in BambooHR. The file will be placed in the specified category.',
      options: {
        category: {
          displayName: 'Category',
          shortDesc: 'File category',
          longDesc: 'The category to place the file in. Categories are configured in BambooHR.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc: 'The file to upload. Must include name, MIME type, and base64-encoded content.',
        },
        share_with_employees: {
          displayName: 'Share with Employees',
          shortDesc: 'Make file visible to employees',
          longDesc: 'Whether to make this file visible to all employees.',
        },
      },
    },
    update_company_file: {
      displayName: 'Update Company File',
      shortDesc: 'Update company file metadata',
      longDesc:
        'Updates the metadata for an existing company file, such as name, category, or sharing settings.',
      options: {
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The file to update',
          longDesc: 'The ID of the company file to update.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'New file name',
          longDesc: 'The new name for the file.',
        },
        category: {
          displayName: 'Category',
          shortDesc: 'New category',
          longDesc: 'Move the file to a different category.',
        },
        share_with_employees: {
          displayName: 'Share with Employees',
          shortDesc: 'Update sharing setting',
          longDesc: 'Whether to make this file visible to all employees.',
        },
      },
    },
    delete_company_file: {
      displayName: 'Delete Company File',
      shortDesc: 'Delete a company file',
      longDesc: 'Permanently deletes a company file. This action cannot be undone.',
      options: {
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The file to delete',
          longDesc: 'The ID of the company file to delete.',
        },
      },
    },
  },
  triggers: {
    new_time_off_request: {
      displayName: 'New Time Off Request',
      shortDesc: 'Triggers when a new time off request is submitted',
      longDesc:
        'Fires when a new time off request is created in BambooHR with status "requested". Useful for building approval workflows or notifications.',
      options: {
        employee_id: {
          displayName: 'Employee ID',
          shortDesc: 'Filter by employee',
          longDesc: 'Only trigger for time off requests from a specific employee.',
        },
      },
    },
    new_time_off: {
      displayName: 'New Time Off',
      shortDesc: 'Triggers when new approved time off appears',
      longDesc:
        "Fires when a new approved time off entry appears in the Who's Out list. This includes both employee time off and company holidays.",
      options: {},
    },
    new_employee: {
      displayName: 'New Employee',
      shortDesc: 'Triggers when a new employee is created',
      longDesc:
        'Fires when a new active employee is added to BambooHR. Returns basic employee information including name, email, department, and job title.',
      options: {},
    },
  },
};

export default BambooHRAppEn;
