const BambooHRAppEn = {
  displayName: 'BambooHR',
  groups: ['HR & People Management'],
  shortDesc: 'Connect to BambooHR to manage employee data with powerful automation',
  longDesc:
    'The BambooHR integration provides comprehensive access to your HR operations. Create, read, update, and list employees with dynamic field support. The integration automatically discovers available fields in your BambooHR account, including custom fields, and provides intelligent type handling for dates, lists, and other field types.',
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
  },
};

export default BambooHRAppEn;
