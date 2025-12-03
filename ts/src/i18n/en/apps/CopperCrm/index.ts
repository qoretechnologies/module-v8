const CopperCrmAppEn = {
  displayName: 'CopperCRM',
  groups: ['CRM & Sales Management'],
  shortDesc:
    'Connect to CopperCRM to manage your sales pipeline, contacts, and customer relationships.',
  longDesc:
    'The CopperCRM integration provides comprehensive access to your CRM data with actions and triggers for managing leads, people, companies, opportunities, and tasks. Built specifically for Google Workspace users, CopperCRM helps you track customer interactions, manage your sales pipeline, and automate your workflow. This integration enables you to create, retrieve, update, delete, and search across all major CopperCRM entities, while triggers keep you informed of new records as they are created in your CRM.',
  actions: {
    create_company: {
      groups: ['Companies'],
      displayName: 'Create Company',
      shortDesc: 'Create a new company in CopperCRM',
      longDesc:
        'Create a new company record in CopperCRM with details like name, address, contact information, and custom fields. Companies represent organizations in your CRM.',
      options: {
        name: {
          displayName: 'Company Name',
          shortDesc: 'The name of the company',
          longDesc: 'The official name of the company you want to create in CopperCRM',
        },
        address: {
          displayName: 'Address',
          shortDesc: 'Company address details',
          longDesc:
            'The physical address of the company including street, city, state, postal code, and country',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address',
                longDesc: 'The street address of the company',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'The city where the company is located',
              },
              state: {
                displayName: 'State',
                shortDesc: 'State or province',
                longDesc: 'The state or province where the company is located',
              },
              postal_code: {
                displayName: 'Postal Code',
                shortDesc: 'ZIP or postal code',
                longDesc: 'The postal code or ZIP code of the company address',
              },
              country: {
                displayName: 'Country',
                shortDesc: 'Country name',
                longDesc: 'The country where the company is located',
              },
            },
          },
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'User assigned to this company',
          longDesc: 'The CopperCRM user who will be assigned to manage this company',
        },
        contact_type_id: {
          displayName: 'Contact Type',
          shortDesc: 'Type of contact relationship',
          longDesc: 'The type of contact relationship this company has with your organization',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Additional notes or description',
          longDesc: 'Additional notes, description, or important details about the company',
        },
        email_domain: {
          displayName: 'Email Domain',
          shortDesc: 'Company email domain',
          longDesc: 'The primary email domain used by the company (e.g., example.com)',
        },
        phone_numbers: {
          displayName: 'Phone Numbers',
          shortDesc: 'Company phone numbers',
          longDesc: 'List of phone numbers associated with the company',
          type: {
            element_type: {
              type: {
                fields: {
                  number: {
                    displayName: 'Phone Number',
                    shortDesc: 'The phone number',
                    longDesc: 'The phone number in any format',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of phone number',
                    longDesc:
                      'The category or type of this phone number (work, mobile, home, or other)',
                  },
                },
              },
            },
          },
        },
        primary_contact_id: {
          displayName: 'Primary Contact',
          shortDesc: 'Main contact person',
          longDesc: 'The primary contact person associated with this company',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media profiles',
          longDesc: 'List of social media profiles for the company',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Social media profile URL',
                    longDesc: 'The full URL to the social media profile',
                  },
                  category: {
                    displayName: 'Platform',
                    shortDesc: 'Social media platform',
                    longDesc:
                      'The social media platform (LinkedIn, Twitter, Facebook, YouTube, Quora, Instagram, Pinterest, or Other)',
                  },
                },
              },
            },
          },
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Company tags',
          longDesc:
            'Tags to categorize and organize the company. You can create new tags or select from existing ones.',
        },
        websites: {
          displayName: 'Websites',
          shortDesc: 'Company websites',
          longDesc: 'List of websites associated with the company',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Website URL',
                    longDesc: 'The full URL of the website',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of website',
                    longDesc: 'The category or purpose of this website (work, personal, or other)',
                  },
                },
              },
            },
          },
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc: 'Custom field values specific to your CopperCRM company configuration',
        },
      },
    },
    create_lead: {
      groups: ['Leads'],
      displayName: 'Create Lead',
      shortDesc: 'Create a new lead in CopperCRM',
      longDesc:
        'Create a new lead record in CopperCRM with contact information and details. Leads represent potential customers who have shown interest in your products or services.',
      options: {
        first_name: {
          displayName: 'First Name',
          shortDesc: "Lead's first name",
          longDesc: 'The first name of the lead',
        },
        last_name: {
          displayName: 'Last Name',
          shortDesc: "Lead's last name",
          longDesc: 'The last name of the lead',
        },
        middle_name: {
          displayName: 'Middle Name',
          shortDesc: "Lead's middle name",
          longDesc: 'The middle name or initial of the lead',
        },
        suffix: {
          displayName: 'Suffix',
          shortDesc: 'Name suffix',
          longDesc: 'Name suffix such as Jr., Sr., III, etc.',
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'User assigned to this lead',
          longDesc: 'The CopperCRM user who will be assigned to manage this lead',
        },
        company_name: {
          displayName: 'Company Name',
          shortDesc: "Lead's company name",
          longDesc: 'The name of the company where the lead works',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Lead tags',
          longDesc:
            'Tags to categorize and organize the lead. You can create new tags or select from existing ones.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Job title',
          longDesc: 'The job title or position of the lead',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Additional notes',
          longDesc: 'Additional notes, description, or important details about the lead',
        },
        websites: {
          displayName: 'Websites',
          shortDesc: 'Associated websites',
          longDesc: 'List of websites associated with the lead',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Website URL',
                    longDesc: 'The full URL of the website',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of website',
                    longDesc: 'The category or purpose of this website (work, personal, or other)',
                  },
                },
              },
            },
          },
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media profiles',
          longDesc: 'List of social media profiles for the lead',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Social media profile URL',
                    longDesc: 'The full URL to the social media profile',
                  },
                  category: {
                    displayName: 'Platform',
                    shortDesc: 'Social media platform',
                    longDesc:
                      'The social media platform (LinkedIn, Twitter, Facebook, YouTube, Quora, Instagram, Pinterest, or Other)',
                  },
                },
              },
            },
          },
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Email address',
          longDesc: 'The email address of the lead',
          type: {
            fields: {
              email: {
                displayName: 'Email Address',
                shortDesc: 'The email address',
                longDesc: 'The email address of the lead',
              },
              category: {
                displayName: 'Category',
                shortDesc: 'Type of email',
                longDesc: 'The category or type of this email (work, personal, or other)',
              },
            },
          },
        },
        phone_numbers: {
          displayName: 'Phone Numbers',
          shortDesc: 'Contact phone numbers',
          longDesc: 'List of phone numbers for the lead',
          type: {
            element_type: {
              type: {
                fields: {
                  number: {
                    displayName: 'Phone Number',
                    shortDesc: 'The phone number',
                    longDesc: 'The phone number in any format',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of phone number',
                    longDesc: 'The category or type of this phone number',
                  },
                },
              },
            },
          },
        },
        address: {
          displayName: 'Address',
          shortDesc: 'Contact address',
          longDesc:
            'The physical address of the lead including street, city, state, postal code, and country',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address',
                longDesc: 'The street address',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'The city where the lead is located',
              },
              state: {
                displayName: 'State',
                shortDesc: 'State or province',
                longDesc: 'The state or province',
              },
              postal_code: {
                displayName: 'Postal Code',
                shortDesc: 'ZIP or postal code',
                longDesc: 'The postal code or ZIP code',
              },
              country: {
                displayName: 'Country',
                shortDesc: 'Country name',
                longDesc: 'The country',
              },
            },
          },
        },
        customer_source_id: {
          displayName: 'Customer Source',
          shortDesc: 'How the lead was acquired',
          longDesc: 'The source or channel through which this lead was acquired',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc: 'Custom field values specific to your CopperCRM lead configuration',
        },
      },
    },
    create_opportunity: {
      groups: ['Opportunities'],
      displayName: 'Create Opportunity',
      shortDesc: 'Create a new opportunity in CopperCRM',
      longDesc:
        'Create a new sales opportunity in CopperCRM with details like value, stage, and associated contacts. Opportunities represent potential deals in your sales pipeline.',
      options: {
        name: {
          displayName: 'Opportunity Name',
          shortDesc: 'Name of the opportunity',
          longDesc: 'A descriptive name for the sales opportunity',
        },
        primary_contact_id: {
          displayName: 'Primary Contact',
          shortDesc: 'Main contact person',
          longDesc: 'The primary contact person associated with this opportunity',
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'User assigned to this opportunity',
          longDesc: 'The CopperCRM user who will be assigned to manage this opportunity',
        },
        close_date: {
          displayName: 'Close Date',
          shortDesc: 'Expected close date',
          longDesc: 'The expected date when this opportunity will be closed or won',
        },
        company_id: {
          displayName: 'Company',
          shortDesc: 'Associated company',
          longDesc: 'The company associated with this opportunity',
        },
        customer_source_id: {
          displayName: 'Customer Source',
          shortDesc: 'How the opportunity was acquired',
          longDesc: 'The source or channel through which this opportunity was acquired',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Additional notes',
          longDesc: 'Additional notes, description, or important details about the opportunity',
        },
        loss_reason_id: {
          displayName: 'Loss Reason',
          shortDesc: 'Reason for losing',
          longDesc: 'The reason why this opportunity was lost (if applicable)',
        },
        monetary_value: {
          displayName: 'Monetary Value',
          shortDesc: 'Deal value',
          longDesc: 'The monetary value of the opportunity in your default currency',
        },
        pipeline_id: {
          displayName: 'Pipeline',
          shortDesc: 'Sales pipeline',
          longDesc: 'The sales pipeline this opportunity belongs to',
        },
        pipeline_stage_id: {
          displayName: 'Pipeline Stage',
          shortDesc: 'Current stage',
          longDesc: 'The current stage of the opportunity in the sales pipeline',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Opportunity priority',
          longDesc: 'The priority level of this opportunity (None, Low, Medium, or High)',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Opportunity status',
          longDesc: 'The current status of the opportunity (Open, Won, Lost, or Abandoned)',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Opportunity tags',
          longDesc:
            'Tags to categorize and organize the opportunity. You can create new tags or select from existing ones.',
        },
        win_probability: {
          displayName: 'Win Probability',
          shortDesc: 'Probability of winning',
          longDesc: 'The estimated probability (0-100) of winning this opportunity',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc: 'Custom field values specific to your CopperCRM opportunity configuration',
        },
      },
    },
    create_person: {
      groups: ['People'],
      displayName: 'Create Person',
      shortDesc: 'Create a new person contact in CopperCRM',
      longDesc:
        'Create a new person contact in CopperCRM with complete contact information. People represent individual contacts in your CRM.',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'Full name of the person',
          longDesc: 'The full name of the person contact',
        },
        prefix: {
          displayName: 'Prefix',
          shortDesc: 'Name prefix',
          longDesc: 'Name prefix such as Mr., Mrs., Dr., etc.',
        },
        first_name: {
          displayName: 'First Name',
          shortDesc: 'First name',
          longDesc: 'The first name of the person',
        },
        middle_name: {
          displayName: 'Middle Name',
          shortDesc: 'Middle name',
          longDesc: 'The middle name or initial of the person',
        },
        last_name: {
          displayName: 'Last Name',
          shortDesc: 'Last name',
          longDesc: 'The last name of the person',
        },
        suffix: {
          displayName: 'Suffix',
          shortDesc: 'Name suffix',
          longDesc: 'Name suffix such as Jr., Sr., III, etc.',
        },
        street: {
          displayName: 'Street',
          shortDesc: 'Street address',
          longDesc: 'The street address of the person',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City name',
          longDesc: 'The city where the person is located',
        },
        state: {
          displayName: 'State',
          shortDesc: 'State or province',
          longDesc: 'The state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'ZIP or postal code',
          longDesc: 'The postal code or ZIP code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country name',
          longDesc: 'The country',
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'User assigned to this person',
          longDesc: 'The CopperCRM user who will be assigned to manage this contact',
        },
        company_id: {
          displayName: 'Company',
          shortDesc: 'Associated company',
          longDesc: 'The company where this person works',
        },
        contact_type_id: {
          displayName: 'Contact Type',
          shortDesc: 'Type of contact relationship',
          longDesc: 'The type of contact relationship this person has with your organization',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Additional notes',
          longDesc: 'Additional notes, description, or important details about the person',
        },
        emails: {
          displayName: 'Email Addresses',
          shortDesc: 'Email addresses',
          longDesc: 'List of email addresses for the person',
          type: {
            element_type: {
              type: {
                fields: {
                  email: {
                    displayName: 'Email Address',
                    shortDesc: 'The email address',
                    longDesc: 'Email address',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of email',
                    longDesc: 'The category or type of this email (work, personal, or other)',
                  },
                },
              },
            },
          },
        },
        phone_numbers: {
          displayName: 'Phone Numbers',
          shortDesc: 'Contact phone numbers',
          longDesc: 'List of phone numbers for the person',
          type: {
            element_type: {
              type: {
                fields: {
                  number: {
                    displayName: 'Phone Number',
                    shortDesc: 'The phone number',
                    longDesc: 'Phone number',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of phone number',
                    longDesc:
                      'The category or type of this phone number (work, mobile, home, or other)',
                  },
                },
              },
            },
          },
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media profiles',
          longDesc: 'List of social media profiles for the person',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Social profile URL',
                    longDesc: 'Social profile URL',
                  },
                  category: {
                    displayName: 'Platform',
                    shortDesc: 'Social media platform',
                    longDesc: 'Social platform',
                  },
                },
              },
            },
          },
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Person tags',
          longDesc:
            'Tags to categorize and organize the person. You can create new tags or select from existing ones.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Job title',
          longDesc: 'The job title or position of the person',
        },
        websites: {
          displayName: 'Websites',
          shortDesc: 'Associated websites',
          longDesc: 'List of websites associated with the person',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Website URL',
                    longDesc: 'Website URL',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of website',
                    longDesc: 'The category or purpose of this website (work, personal, or other)',
                  },
                },
              },
            },
          },
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc: 'Custom field values specific to your CopperCRM person configuration',
        },
      },
    },
    create_task: {
      groups: ['Tasks'],
      displayName: 'Create Task',
      shortDesc: 'Create a new task in CopperCRM',
      longDesc:
        'Create a new task in CopperCRM with details, due dates, and assignments. Tasks help you track action items and follow-ups.',
      options: {
        name: {
          displayName: 'Task Name',
          shortDesc: 'Name of the task',
          longDesc: 'A descriptive name for the task',
        },
        related_resource: {
          displayName: 'Related Resource',
          shortDesc: 'Associated record',
          longDesc:
            'The CRM record (lead, person, company, opportunity, or project) this task is related to',
          type: {
            fields: {
              id: {
                displayName: 'Resource ID',
                shortDesc: 'ID of the related record',
                longDesc: 'The ID of the related CRM record',
              },
              type: {
                displayName: 'Resource Type',
                shortDesc: 'Type of related record',
                longDesc:
                  'The type of CRM record this task is related to (lead, person, company, opportunity, or project)',
              },
            },
          },
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'User assigned to this task',
          longDesc: 'The CopperCRM user who will be assigned to complete this task',
        },
        due_date: {
          displayName: 'Due Date',
          shortDesc: 'When the task is due',
          longDesc: 'The date when this task should be completed',
        },
        reminder_date: {
          displayName: 'Reminder Date',
          shortDesc: 'When to send reminder',
          longDesc: 'The date when a reminder should be sent for this task',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Task priority',
          longDesc: 'The priority level of this task (None, Low, Medium, or High)',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Task status',
          longDesc: 'The current status of the task (Open or Completed)',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Task description',
          longDesc: 'Additional details or description of what needs to be done',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Task tags',
          longDesc:
            'Tags to categorize and organize the task. You can create new tags or select from existing ones.',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc: 'Custom field values specific to your CopperCRM task configuration',
        },
      },
    },
    delete_company: {
      groups: ['Companies'],
      displayName: 'Delete Company',
      shortDesc: 'Delete a company from CopperCRM',
      longDesc: 'Permanently delete a company record from CopperCRM. This action cannot be undone.',
      options: {
        company_id: {
          displayName: 'Company',
          shortDesc: 'Company to delete',
          longDesc: 'Select the company you want to delete from CopperCRM',
        },
      },
    },
    delete_lead: {
      groups: ['Leads'],
      displayName: 'Delete Lead',
      shortDesc: 'Delete a lead from CopperCRM',
      longDesc: 'Permanently delete a lead record from CopperCRM. This action cannot be undone.',
      options: {
        lead_id: {
          displayName: 'Lead',
          shortDesc: 'Lead to delete',
          longDesc: 'Select the lead you want to delete from CopperCRM',
        },
      },
    },
    delete_opportunity: {
      groups: ['Opportunities'],
      displayName: 'Delete Opportunity',
      shortDesc: 'Delete an opportunity from CopperCRM',
      longDesc:
        'Permanently delete an opportunity record from CopperCRM. This action cannot be undone.',
      options: {
        opportunity_id: {
          displayName: 'Opportunity',
          shortDesc: 'Opportunity to delete',
          longDesc: 'Select the opportunity you want to delete from CopperCRM',
        },
      },
    },
    delete_person: {
      groups: ['People'],
      displayName: 'Delete Person',
      shortDesc: 'Delete a person contact from CopperCRM',
      longDesc:
        'Permanently delete a person contact record from CopperCRM. This action cannot be undone.',
      options: {
        person_id: {
          displayName: 'Person',
          shortDesc: 'Person to delete',
          longDesc: 'Select the person contact you want to delete from CopperCRM',
        },
      },
    },
    delete_task: {
      groups: ['Tasks'],
      displayName: 'Delete Task',
      shortDesc: 'Delete a task from CopperCRM',
      longDesc: 'Permanently delete a task from CopperCRM. This action cannot be undone.',
      options: {
        task_id: {
          displayName: 'Task',
          shortDesc: 'Task to delete',
          longDesc: 'Select the task you want to delete from CopperCRM',
        },
      },
    },
    get_company: {
      groups: ['Companies'],
      displayName: 'Get Company',
      shortDesc: 'Retrieve a company from CopperCRM',
      longDesc:
        'Retrieve detailed information about a specific company record from CopperCRM including all fields and custom data.',
      options: {
        company_id: {
          displayName: 'Company',
          shortDesc: 'Company to retrieve',
          longDesc: 'Select the company you want to retrieve from CopperCRM',
        },
      },
    },
    get_lead: {
      groups: ['Leads'],
      displayName: 'Get Lead',
      shortDesc: 'Retrieve a lead from CopperCRM',
      longDesc:
        'Retrieve detailed information about a specific lead record from CopperCRM including all fields and custom data.',
      options: {
        lead_id: {
          displayName: 'Lead',
          shortDesc: 'Lead to retrieve',
          longDesc: 'Select the lead you want to retrieve from CopperCRM',
        },
      },
    },
    get_opportunity: {
      groups: ['Opportunities'],
      displayName: 'Get Opportunity',
      shortDesc: 'Retrieve an opportunity from CopperCRM',
      longDesc:
        'Retrieve detailed information about a specific opportunity record from CopperCRM including all fields and custom data.',
      options: {
        opportunity_id: {
          displayName: 'Opportunity',
          shortDesc: 'Opportunity to retrieve',
          longDesc: 'Select the opportunity you want to retrieve from CopperCRM',
        },
      },
    },
    get_person: {
      groups: ['People'],
      displayName: 'Get Person',
      shortDesc: 'Retrieve a person contact from CopperCRM',
      longDesc:
        'Retrieve detailed information about a specific person contact record from CopperCRM including all fields and custom data.',
      options: {
        person_id: {
          displayName: 'Person',
          shortDesc: 'Person to retrieve',
          longDesc: 'Select the person contact you want to retrieve from CopperCRM',
        },
      },
    },
    get_task: {
      groups: ['Tasks'],
      displayName: 'Get Task',
      shortDesc: 'Retrieve a task from CopperCRM',
      longDesc:
        'Retrieve detailed information about a specific task from CopperCRM including all fields and custom data.',
      options: {
        task_id: {
          displayName: 'Task',
          shortDesc: 'Task to retrieve',
          longDesc: 'Select the task you want to retrieve from CopperCRM',
        },
      },
    },
    search_companies: {
      groups: ['Companies'],
      displayName: 'Search Companies',
      shortDesc: 'Search for companies in CopperCRM',
      longDesc:
        'Search and filter companies in CopperCRM using various criteria including name, location, tags, and custom fields. Returns a list of matching companies.',
      options: {
        ids: {
          displayName: 'Company IDs',
          shortDesc: 'Specific companies to retrieve',
          longDesc: 'List of specific company IDs to retrieve',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Company name to search',
          longDesc: 'Search for companies with names matching this value',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Assigned users',
          longDesc: 'Filter companies by assigned users',
        },
        contact_type_ids: {
          displayName: 'Contact Types',
          shortDesc: 'Contact type filter',
          longDesc: 'Filter companies by contact type',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City location',
          longDesc: 'Filter companies by city',
        },
        state: {
          displayName: 'State',
          shortDesc: 'State or province',
          longDesc: 'Filter companies by state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'ZIP or postal code',
          longDesc: 'Filter companies by postal code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country location',
          longDesc: 'Filter companies by country',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Filter companies that have any of these tags',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media filter',
          longDesc: 'Filter companies by social media profiles',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status',
          longDesc: 'Filter companies by whether they are followed or not',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Filter companies with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Filter companies with no more than this many interactions',
        },
        minimum_inactive_days: {
          displayName: 'Minimum Inactive Days',
          shortDesc: 'Minimum days inactive',
          longDesc: 'Filter companies inactive for at least this many days',
        },
        maximum_inactive_days: {
          displayName: 'Maximum Inactive Days',
          shortDesc: 'Maximum days inactive',
          longDesc: 'Filter companies inactive for no more than this many days',
        },
        minimum_created_date: {
          displayName: 'Created After',
          shortDesc: 'Earliest creation date',
          longDesc: 'Filter companies created on or after this date',
        },
        maximum_created_date: {
          displayName: 'Created Before',
          shortDesc: 'Latest creation date',
          longDesc: 'Filter companies created on or before this date',
        },
        minimum_modified_date: {
          displayName: 'Modified After',
          shortDesc: 'Earliest modification date',
          longDesc: 'Filter companies modified on or after this date',
        },
        maximum_modified_date: {
          displayName: 'Modified Before',
          shortDesc: 'Latest modification date',
          longDesc: 'Filter companies modified on or before this date',
        },
      },
    },
    search_leads: {
      groups: ['Leads'],
      displayName: 'Search Leads',
      shortDesc: 'Search for leads in CopperCRM',
      longDesc:
        'Search and filter leads in CopperCRM using various criteria including name, email, phone, status, and custom fields. Returns a list of matching leads.',
      options: {
        ids: {
          displayName: 'Lead IDs',
          shortDesc: 'Specific leads to retrieve',
          longDesc: 'List of specific lead IDs to retrieve',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Lead name to search',
          longDesc: 'Search for leads with names matching this value',
        },
        phone_number: {
          displayName: 'Phone Number',
          shortDesc: 'Phone number to search',
          longDesc: 'Search for leads with this phone number',
        },
        emails: {
          displayName: 'Email',
          shortDesc: 'Email to search',
          longDesc: 'Search for leads with this email address',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Assigned users',
          longDesc: 'Filter leads by assigned users',
        },
        status_ids: {
          displayName: 'Statuses',
          shortDesc: 'Lead statuses',
          longDesc: 'Filter leads by status',
        },
        customer_source_ids: {
          displayName: 'Customer Sources',
          shortDesc: 'Lead sources',
          longDesc: 'Filter leads by customer source',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City location',
          longDesc: 'Filter leads by city',
        },
        state: {
          displayName: 'State',
          shortDesc: 'State or province',
          longDesc: 'Filter leads by state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'ZIP or postal code',
          longDesc: 'Filter leads by postal code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country location',
          longDesc: 'Filter leads by country',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Filter leads that have any of these tags',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media filter',
          longDesc: 'Filter leads by social media profiles',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status',
          longDesc: 'Filter leads by whether they are followed or not',
        },
        age: {
          displayName: 'Age',
          shortDesc: 'Lead age in days',
          longDesc: 'Filter leads by their age in days',
        },
        minimum_monetary_value: {
          displayName: 'Minimum Value',
          shortDesc: 'Minimum monetary value',
          longDesc: 'Filter leads with at least this monetary value',
        },
        maximum_monetary_value: {
          displayName: 'Maximum Value',
          shortDesc: 'Maximum monetary value',
          longDesc: 'Filter leads with no more than this monetary value',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Filter leads with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Filter leads with no more than this many interactions',
        },
        include_converted_leads: {
          displayName: 'Include Converted Leads',
          shortDesc: 'Include converted leads',
          longDesc: 'Whether to include leads that have been converted to opportunities',
        },
      },
    },
    search_opportunities: {
      groups: ['Opportunities'],
      displayName: 'Search Opportunities',
      shortDesc: 'Search for opportunities in CopperCRM',
      longDesc:
        'Search and filter opportunities in CopperCRM using various criteria including name, pipeline, status, value, and custom fields. Returns a list of matching opportunities.',
      options: {
        ids: {
          displayName: 'Opportunity IDs',
          shortDesc: 'Specific opportunities to retrieve',
          longDesc: 'List of specific opportunity IDs to retrieve',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Opportunity name to search',
          longDesc: 'Search for opportunities with names matching this value',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Assigned users',
          longDesc: 'Filter opportunities by assigned users',
        },
        company_ids: {
          displayName: 'Companies',
          shortDesc: 'Associated companies',
          longDesc: 'Filter opportunities by associated companies',
        },
        customer_source_ids: {
          displayName: 'Customer Sources',
          shortDesc: 'Opportunity sources',
          longDesc: 'Filter opportunities by customer source',
        },
        loss_reason_ids: {
          displayName: 'Loss Reasons',
          shortDesc: 'Reasons for loss',
          longDesc: 'Filter opportunities by loss reason',
        },
        pipeline_ids: {
          displayName: 'Pipelines',
          shortDesc: 'Sales pipelines',
          longDesc: 'Filter opportunities by pipeline',
        },
        pipeline_stage_ids: {
          displayName: 'Pipeline Stages',
          shortDesc: 'Current stages',
          longDesc: 'Filter opportunities by pipeline stage',
        },
        primary_contact_ids: {
          displayName: 'Primary Contacts',
          shortDesc: 'Main contacts',
          longDesc: 'Filter opportunities by primary contact',
        },
        priorities: {
          displayName: 'Priorities',
          shortDesc: 'Priority levels',
          longDesc: 'Filter opportunities by priority level',
        },
        statuses: {
          displayName: 'Statuses',
          shortDesc: 'Opportunity statuses',
          longDesc: 'Filter opportunities by status (Open, Won, Lost, Abandoned)',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Filter opportunities that have any of these tags',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status',
          longDesc: 'Filter opportunities by whether they are followed or not',
        },
        minimum_monetary_value: {
          displayName: 'Minimum Value',
          shortDesc: 'Minimum deal value',
          longDesc: 'Filter opportunities with at least this monetary value',
        },
        maximum_monetary_value: {
          displayName: 'Maximum Value',
          shortDesc: 'Maximum deal value',
          longDesc: 'Filter opportunities with no more than this monetary value',
        },
        minimum_win_probability: {
          displayName: 'Minimum Win Probability',
          shortDesc: 'Minimum win chance',
          longDesc: 'Filter opportunities with at least this win probability',
        },
        maximum_win_probability: {
          displayName: 'Maximum Win Probability',
          shortDesc: 'Maximum win chance',
          longDesc: 'Filter opportunities with no more than this win probability',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Filter opportunities with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Filter opportunities with no more than this many interactions',
        },
        minimum_close_date: {
          displayName: 'Close Date After',
          shortDesc: 'Earliest close date',
          longDesc: 'Filter opportunities with close date on or after this date',
        },
        maximum_close_date: {
          displayName: 'Close Date Before',
          shortDesc: 'Latest close date',
          longDesc: 'Filter opportunities with close date on or before this date',
        },
        minimum_created_date: {
          displayName: 'Created After',
          shortDesc: 'Earliest creation date',
          longDesc: 'Filter opportunities created on or after this date',
        },
        maximum_created_date: {
          displayName: 'Created Before',
          shortDesc: 'Latest creation date',
          longDesc: 'Filter opportunities created on or before this date',
        },
        minimum_modified_date: {
          displayName: 'Modified After',
          shortDesc: 'Earliest modification date',
          longDesc: 'Filter opportunities modified on or after this date',
        },
        maximum_modified_date: {
          displayName: 'Modified Before',
          shortDesc: 'Latest modification date',
          longDesc: 'Filter opportunities modified on or before this date',
        },
        minimum_stage_change_date: {
          displayName: 'Stage Changed After',
          shortDesc: 'Earliest stage change',
          longDesc: 'Filter opportunities with stage changed on or after this date',
        },
        maximum_stage_change_date: {
          displayName: 'Stage Changed Before',
          shortDesc: 'Latest stage change',
          longDesc: 'Filter opportunities with stage changed on or before this date',
        },
      },
    },
    search_people: {
      groups: ['People'],
      displayName: 'Search People',
      shortDesc: 'Search for person contacts in CopperCRM',
      longDesc:
        'Search and filter people in CopperCRM using various criteria including name, email, phone, company, and custom fields. Returns a list of matching person contacts.',
      options: {
        ids: {
          displayName: 'Person IDs',
          shortDesc: 'Specific people to retrieve',
          longDesc: 'List of specific person IDs to retrieve',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Person name to search',
          longDesc: 'Search for people with names matching this value',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Job title to search',
          longDesc: 'Search for people with this job title',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Email to search',
          longDesc: 'Search for people with this email address',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: 'Phone number to search',
          longDesc: 'Search for people with this phone number',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City location',
          longDesc: 'Filter people by city',
        },
        state: {
          displayName: 'State',
          shortDesc: 'State or province',
          longDesc: 'Filter people by state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'ZIP or postal code',
          longDesc: 'Filter people by postal code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country location',
          longDesc: 'Filter people by country',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Assigned users',
          longDesc: 'Filter people by assigned users',
        },
        contact_type_ids: {
          displayName: 'Contact Types',
          shortDesc: 'Contact type filter',
          longDesc: 'Filter people by contact type',
        },
        company_ids: {
          displayName: 'Companies',
          shortDesc: 'Associated companies',
          longDesc: 'Filter people by associated companies',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Filter people that have any of these tags',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media profiles',
          longDesc: 'Filter people by social media profiles',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Filter people with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Filter people with no more than this many interactions',
        },
        minimum_created_date: {
          displayName: 'Created After',
          shortDesc: 'Earliest creation date',
          longDesc: 'Filter people created on or after this date',
        },
        maximum_created_date: {
          displayName: 'Created Before',
          shortDesc: 'Latest creation date',
          longDesc: 'Filter people created on or before this date',
        },
        minimum_modified_date: {
          displayName: 'Modified After',
          shortDesc: 'Earliest modification date',
          longDesc: 'Filter people modified on or after this date',
        },
        maximum_modified_date: {
          displayName: 'Modified Before',
          shortDesc: 'Latest modification date',
          longDesc: 'Filter people modified on or before this date',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'Field to sort results by',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
      },
    },
    search_tasks: {
      groups: ['Tasks'],
      displayName: 'Search Tasks',
      shortDesc: 'Search for tasks in CopperCRM',
      longDesc:
        'Search and filter tasks in CopperCRM using various criteria including assignee, status, priority, due date, and custom fields. Returns a list of matching tasks.',
      options: {
        ids: {
          displayName: 'Task IDs',
          shortDesc: 'Specific tasks to retrieve',
          longDesc: 'List of specific task IDs to retrieve',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Assigned users',
          longDesc: 'Filter tasks by assigned users',
        },
        statuses: {
          displayName: 'Statuses',
          shortDesc: 'Task statuses',
          longDesc: 'Filter tasks by status (Open or Completed)',
        },
        priorities: {
          displayName: 'Priorities',
          shortDesc: 'Priority levels',
          longDesc: 'Filter tasks by priority level',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Filter tasks that have any of these tags',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status',
          longDesc: 'Filter tasks by whether they are followed or not',
        },
        minimum_due_date: {
          displayName: 'Due Date After',
          shortDesc: 'Earliest due date',
          longDesc: 'Filter tasks with due date on or after this date',
        },
        maximum_due_date: {
          displayName: 'Due Date Before',
          shortDesc: 'Latest due date',
          longDesc: 'Filter tasks with due date on or before this date',
        },
        minimum_reminder_date: {
          displayName: 'Reminder After',
          shortDesc: 'Earliest reminder date',
          longDesc: 'Filter tasks with reminder date on or after this date',
        },
        maximum_reminder_date: {
          displayName: 'Reminder Before',
          shortDesc: 'Latest reminder date',
          longDesc: 'Filter tasks with reminder date on or before this date',
        },
        minimum_completed_date: {
          displayName: 'Completed After',
          shortDesc: 'Earliest completion date',
          longDesc: 'Filter tasks completed on or after this date',
        },
        maximum_completed_date: {
          displayName: 'Completed Before',
          shortDesc: 'Latest completion date',
          longDesc: 'Filter tasks completed on or before this date',
        },
        minimum_created_date: {
          displayName: 'Created After',
          shortDesc: 'Earliest creation date',
          longDesc: 'Filter tasks created on or after this date',
        },
        maximum_created_date: {
          displayName: 'Created Before',
          shortDesc: 'Latest creation date',
          longDesc: 'Filter tasks created on or before this date',
        },
        minimum_modified_date: {
          displayName: 'Modified After',
          shortDesc: 'Earliest modification date',
          longDesc: 'Filter tasks modified on or after this date',
        },
        maximum_modified_date: {
          displayName: 'Modified Before',
          shortDesc: 'Latest modification date',
          longDesc: 'Filter tasks modified on or before this date',
        },
      },
    },
    update_company: {
      groups: ['Companies'],
      displayName: 'Update Company',
      shortDesc: 'Update an existing company in CopperCRM',
      longDesc:
        'Update the details of an existing company record in CopperCRM including name, address, contact information, and custom fields.',
      options: {
        company_id: {
          displayName: 'Company',
          shortDesc: 'Company to update',
          longDesc: 'Select the company you want to update',
        },
        name: {
          displayName: 'Company Name',
          shortDesc: 'Updated company name',
          longDesc: 'The new name for the company',
        },
        address: {
          displayName: 'Address',
          shortDesc: 'Updated address',
          longDesc: 'The updated physical address of the company',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address',
                longDesc: 'The street address of the company',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'The city where the company is located',
              },
              state: {
                displayName: 'State',
                shortDesc: 'State or province',
                longDesc: 'The state or province where the company is located',
              },
              postal_code: {
                displayName: 'Postal Code',
                shortDesc: 'ZIP or postal code',
                longDesc: 'The postal code or ZIP code of the company address',
              },
              country: {
                displayName: 'Country',
                shortDesc: 'Country name',
                longDesc: 'The country where the company is located',
              },
            },
          },
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'Updated assignee',
          longDesc: 'The new CopperCRM user to assign to this company',
        },
        contact_type_id: {
          displayName: 'Contact Type',
          shortDesc: 'Updated contact type',
          longDesc: 'The updated type of contact relationship',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Updated notes',
          longDesc: 'Updated notes, description, or important details',
        },
        email_domain: {
          displayName: 'Email Domain',
          shortDesc: 'Updated email domain',
          longDesc: 'The updated primary email domain',
        },
        phone_numbers: {
          displayName: 'Phone Numbers',
          shortDesc: 'Updated phone numbers',
          longDesc: 'Updated list of phone numbers',
          type: {
            element_type: {
              type: {
                fields: {
                  number: {
                    displayName: 'Phone Number',
                    shortDesc: 'The phone number',
                    longDesc: 'The phone number in any format',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of phone number',
                    longDesc: 'The category or type of this phone number',
                  },
                },
              },
            },
          },
        },
        primary_contact_id: {
          displayName: 'Primary Contact',
          shortDesc: 'Updated primary contact',
          longDesc: 'The new primary contact person for this company',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Updated social profiles',
          longDesc: 'Updated list of social media profiles',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Social media profile URL',
                    longDesc: 'The full URL to the social media profile',
                  },
                  category: {
                    displayName: 'Platform',
                    shortDesc: 'Social media platform',
                    longDesc: 'The social media platform',
                  },
                },
              },
            },
          },
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Updated tags',
          longDesc: 'Updated tags to categorize and organize the company',
        },
        websites: {
          displayName: 'Websites',
          shortDesc: 'Updated websites',
          longDesc: 'Updated list of websites',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Website URL',
                    longDesc: 'The full URL of the website',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of website',
                    longDesc: 'The category or purpose of this website',
                  },
                },
              },
            },
          },
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom fields',
          longDesc: 'Updated custom field values',
        },
      },
    },
    update_lead: {
      groups: ['Leads'],
      displayName: 'Update Lead',
      shortDesc: 'Update an existing lead in CopperCRM',
      longDesc:
        'Update the details of an existing lead record in CopperCRM including contact information, status, and custom fields.',
      options: {
        lead_id: {
          displayName: 'Lead',
          shortDesc: 'Lead to update',
          longDesc: 'Select the lead you want to update',
        },
        first_name: {
          displayName: 'First Name',
          shortDesc: 'Updated first name',
          longDesc: 'The updated first name of the lead',
        },
        last_name: {
          displayName: 'Last Name',
          shortDesc: 'Updated last name',
          longDesc: 'The updated last name of the lead',
        },
        middle_name: {
          displayName: 'Middle Name',
          shortDesc: 'Updated middle name',
          longDesc: 'The updated middle name or initial',
        },
        suffix: {
          displayName: 'Suffix',
          shortDesc: 'Updated suffix',
          longDesc: 'Updated name suffix',
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'Updated assignee',
          longDesc: 'The new CopperCRM user to assign to this lead',
        },
        company_name: {
          displayName: 'Company Name',
          shortDesc: 'Updated company name',
          longDesc: 'The updated company name where the lead works',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Updated tags',
          longDesc: 'Updated tags to categorize and organize the lead',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Updated job title',
          longDesc: 'The updated job title or position',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Updated notes',
          longDesc: 'Updated notes, description, or important details',
        },
        websites: {
          displayName: 'Websites',
          shortDesc: 'Updated websites',
          longDesc: 'Updated list of associated websites',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Website URL',
                    longDesc: 'The full URL of the website',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of website',
                    longDesc: 'The category or purpose of this website',
                  },
                },
              },
            },
          },
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Updated social profiles',
          longDesc: 'Updated list of social media profiles',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Social media profile URL',
                    longDesc: 'The full URL to the social media profile',
                  },
                  category: {
                    displayName: 'Platform',
                    shortDesc: 'Social media platform',
                    longDesc: 'The social media platform',
                  },
                },
              },
            },
          },
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Updated email',
          longDesc: 'The updated email address',
          type: {
            fields: {
              email: {
                displayName: 'Email Address',
                shortDesc: 'The email address',
                longDesc: 'The email address of the lead',
              },
              category: {
                displayName: 'Category',
                shortDesc: 'Type of email',
                longDesc: 'The category or type of this email',
              },
            },
          },
        },
        phone_numbers: {
          displayName: 'Phone Numbers',
          shortDesc: 'Updated phone numbers',
          longDesc: 'Updated list of phone numbers',
          type: {
            element_type: {
              type: {
                fields: {
                  number: {
                    displayName: 'Phone Number',
                    shortDesc: 'The phone number',
                    longDesc: 'The phone number in any format',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of phone number',
                    longDesc: 'The category or type of this phone number',
                  },
                },
              },
            },
          },
        },
        address: {
          displayName: 'Address',
          shortDesc: 'Updated address',
          longDesc: 'The updated physical address',
          type: {
            fields: {
              street: {
                displayName: 'Street',
                shortDesc: 'Street address',
                longDesc: 'The street address',
              },
              city: {
                displayName: 'City',
                shortDesc: 'City name',
                longDesc: 'The city',
              },
              state: {
                displayName: 'State',
                shortDesc: 'State or province',
                longDesc: 'The state or province',
              },
              postal_code: {
                displayName: 'Postal Code',
                shortDesc: 'ZIP or postal code',
                longDesc: 'The postal code or ZIP code',
              },
              country: {
                displayName: 'Country',
                shortDesc: 'Country name',
                longDesc: 'The country',
              },
            },
          },
        },
        customer_source_id: {
          displayName: 'Customer Source',
          shortDesc: 'Updated source',
          longDesc: 'The updated source or channel',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom fields',
          longDesc: 'Updated custom field values',
        },
      },
    },
    update_opportunity: {
      groups: ['Opportunities'],
      displayName: 'Update Opportunity',
      shortDesc: 'Update an existing opportunity in CopperCRM',
      longDesc:
        'Update the details of an existing sales opportunity in CopperCRM including value, stage, status, and custom fields.',
      options: {
        opportunity_id: {
          displayName: 'Opportunity',
          shortDesc: 'Opportunity to update',
          longDesc: 'Select the opportunity you want to update',
        },
        name: {
          displayName: 'Opportunity Name',
          shortDesc: 'Updated name',
          longDesc: 'The updated name for the opportunity',
        },
        primary_contact_id: {
          displayName: 'Primary Contact',
          shortDesc: 'Updated primary contact',
          longDesc: 'The updated primary contact person',
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'Updated assignee',
          longDesc: 'The new CopperCRM user to assign to this opportunity',
        },
        close_date: {
          displayName: 'Close Date',
          shortDesc: 'Updated close date',
          longDesc: 'The updated expected close date',
        },
        company_id: {
          displayName: 'Company',
          shortDesc: 'Updated company',
          longDesc: 'The updated associated company',
        },
        customer_source_id: {
          displayName: 'Customer Source',
          shortDesc: 'Updated source',
          longDesc: 'The updated source or channel',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Updated notes',
          longDesc: 'Updated notes, description, or important details',
        },
        loss_reason_id: {
          displayName: 'Loss Reason',
          shortDesc: 'Updated loss reason',
          longDesc: 'The updated reason for losing',
        },
        monetary_value: {
          displayName: 'Monetary Value',
          shortDesc: 'Updated value',
          longDesc: 'The updated monetary value',
        },
        pipeline_id: {
          displayName: 'Pipeline',
          shortDesc: 'Updated pipeline',
          longDesc: 'The updated sales pipeline',
        },
        pipeline_stage_id: {
          displayName: 'Pipeline Stage',
          shortDesc: 'Updated stage',
          longDesc: 'The updated current stage',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Updated priority',
          longDesc: 'The updated priority level',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Updated status',
          longDesc: 'The updated opportunity status',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Updated tags',
          longDesc: 'Updated tags to categorize and organize the opportunity',
        },
        win_probability: {
          displayName: 'Win Probability',
          shortDesc: 'Updated win probability',
          longDesc: 'The updated estimated probability of winning',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom fields',
          longDesc: 'Updated custom field values',
        },
      },
    },
    update_person: {
      groups: ['People'],
      displayName: 'Update Person',
      shortDesc: 'Update an existing person contact in CopperCRM',
      longDesc:
        'Update the details of an existing person contact in CopperCRM including contact information, company, and custom fields.',
      options: {
        person_id: {
          displayName: 'Person',
          shortDesc: 'Person to update',
          longDesc: 'Select the person you want to update',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Updated full name',
          longDesc: 'The updated full name',
        },
        prefix: {
          displayName: 'Prefix',
          shortDesc: 'Updated prefix',
          longDesc: 'Updated name prefix',
        },
        first_name: {
          displayName: 'First Name',
          shortDesc: 'Updated first name',
          longDesc: 'The updated first name',
        },
        middle_name: {
          displayName: 'Middle Name',
          shortDesc: 'Updated middle name',
          longDesc: 'The updated middle name or initial',
        },
        last_name: {
          displayName: 'Last Name',
          shortDesc: 'Updated last name',
          longDesc: 'The updated last name',
        },
        suffix: {
          displayName: 'Suffix',
          shortDesc: 'Updated suffix',
          longDesc: 'Updated name suffix',
        },
        street: {
          displayName: 'Street',
          shortDesc: 'Updated street',
          longDesc: 'The updated street address',
        },
        city: {
          displayName: 'City',
          shortDesc: 'Updated city',
          longDesc: 'The updated city',
        },
        state: {
          displayName: 'State',
          shortDesc: 'Updated state',
          longDesc: 'The updated state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'Updated postal code',
          longDesc: 'The updated postal code or ZIP code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Updated country',
          longDesc: 'The updated country',
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'Updated assignee',
          longDesc: 'The new CopperCRM user to assign to this contact',
        },
        company_id: {
          displayName: 'Company',
          shortDesc: 'Updated company',
          longDesc: 'The updated company where this person works',
        },
        contact_type_id: {
          displayName: 'Contact Type',
          shortDesc: 'Updated contact type',
          longDesc: 'The updated type of contact relationship',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Updated notes',
          longDesc: 'Updated notes, description, or important details',
        },
        emails: {
          displayName: 'Email Addresses',
          shortDesc: 'Updated emails',
          longDesc: 'Updated list of email addresses',
          type: {
            element_type: {
              type: {
                fields: {
                  email: {
                    displayName: 'Email Address',
                    shortDesc: 'The email address',
                    longDesc: 'Email address',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of email',
                    longDesc: 'The category or type of this email',
                  },
                },
              },
            },
          },
        },
        phone_numbers: {
          displayName: 'Phone Numbers',
          shortDesc: 'Updated phone numbers',
          longDesc: 'Updated list of phone numbers',
          type: {
            element_type: {
              type: {
                fields: {
                  number: {
                    displayName: 'Phone Number',
                    shortDesc: 'The phone number',
                    longDesc: 'Phone number',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of phone number',
                    longDesc: 'The category or type of this phone number',
                  },
                },
              },
            },
          },
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Updated social profiles',
          longDesc: 'Updated list of social media profiles',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Social profile URL',
                    longDesc: 'Social profile URL',
                  },
                  category: {
                    displayName: 'Platform',
                    shortDesc: 'Social media platform',
                    longDesc: 'Social platform',
                  },
                },
              },
            },
          },
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Updated tags',
          longDesc: 'Updated tags to categorize and organize the person',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Updated job title',
          longDesc: 'The updated job title or position',
        },
        websites: {
          displayName: 'Websites',
          shortDesc: 'Updated websites',
          longDesc: 'Updated list of associated websites',
          type: {
            element_type: {
              type: {
                fields: {
                  url: {
                    displayName: 'URL',
                    shortDesc: 'Website URL',
                    longDesc: 'Website URL',
                  },
                  category: {
                    displayName: 'Category',
                    shortDesc: 'Type of website',
                    longDesc: 'The category or purpose of this website',
                  },
                },
              },
            },
          },
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom fields',
          longDesc: 'Updated custom field values',
        },
      },
    },
    update_task: {
      groups: ['Tasks'],
      displayName: 'Update Task',
      shortDesc: 'Update an existing task in CopperCRM',
      longDesc:
        'Update the details of an existing task in CopperCRM including name, due dates, status, priority, and custom fields.',
      options: {
        task_id: {
          displayName: 'Task',
          shortDesc: 'Task to update',
          longDesc: 'Select the task you want to update',
        },
        name: {
          displayName: 'Task Name',
          shortDesc: 'Updated name',
          longDesc: 'The updated name for the task',
        },
        related_resource: {
          displayName: 'Related Resource',
          shortDesc: 'Updated related record',
          longDesc: 'The updated CRM record this task is related to',
          type: {
            fields: {
              id: {
                displayName: 'Resource ID',
                shortDesc: 'ID of the related record',
                longDesc: 'The ID of the related CRM record',
              },
              type: {
                displayName: 'Resource Type',
                shortDesc: 'Type of related record',
                longDesc: 'The type of CRM record this task is related to',
              },
            },
          },
        },
        assignee_id: {
          displayName: 'Assignee',
          shortDesc: 'Updated assignee',
          longDesc: 'The new CopperCRM user to assign to this task',
        },
        due_date: {
          displayName: 'Due Date',
          shortDesc: 'Updated due date',
          longDesc: 'The updated date when this task should be completed',
        },
        reminder_date: {
          displayName: 'Reminder Date',
          shortDesc: 'Updated reminder date',
          longDesc: 'The updated date when a reminder should be sent',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Updated priority',
          longDesc: 'The updated priority level',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Updated status',
          longDesc: 'The updated task status',
        },
        details: {
          displayName: 'Details',
          shortDesc: 'Updated description',
          longDesc: 'Updated details or description of what needs to be done',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Updated tags',
          longDesc: 'Updated tags to categorize and organize the task',
        },
        custom_fields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom fields',
          longDesc: 'Updated custom field values',
        },
      },
    },
  },
  triggers: {
    new_company: {
      displayName: 'New Company',
      shortDesc: 'Triggered when a new company is created',
      longDesc:
        'Triggers when a new company is created in CopperCRM. You can filter which companies trigger this event using various criteria like assignee, location, tags, and more.',
      options: {
        ids: {
          displayName: 'Company IDs',
          shortDesc: 'Specific companies to watch',
          longDesc: 'Only trigger for these specific company IDs',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Company name filter',
          longDesc: 'Only trigger for companies with names matching this value',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Filter by assignee',
          longDesc: 'Only trigger for companies assigned to these users',
        },
        contact_type_ids: {
          displayName: 'Contact Types',
          shortDesc: 'Filter by contact type',
          longDesc: 'Only trigger for companies with these contact types',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City filter',
          longDesc: 'Only trigger for companies in this city',
        },
        state: {
          displayName: 'State',
          shortDesc: 'State or province filter',
          longDesc: 'Only trigger for companies in this state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'Postal code filter',
          longDesc: 'Only trigger for companies with this postal code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country filter',
          longDesc: 'Only trigger for companies in this country',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Only trigger for companies that have any of these tags',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media filter',
          longDesc: 'Only trigger for companies with matching social media profiles',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status filter',
          longDesc: 'Only trigger for companies that are followed or not followed',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Only trigger for companies with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Only trigger for companies with no more than this many interactions',
        },
        minimum_inactive_days: {
          displayName: 'Minimum Inactive Days',
          shortDesc: 'Minimum days inactive',
          longDesc: 'Only trigger for companies inactive for at least this many days',
        },
        maximum_inactive_days: {
          displayName: 'Maximum Inactive Days',
          shortDesc: 'Maximum days inactive',
          longDesc: 'Only trigger for companies inactive for no more than this many days',
        },
      },
    },
    new_lead: {
      displayName: 'New Lead',
      shortDesc: 'Triggered when a new lead is created',
      longDesc:
        'Triggers when a new lead is created in CopperCRM. You can filter which leads trigger this event using various criteria like assignee, status, location, and more.',
      options: {
        ids: {
          displayName: 'Lead IDs',
          shortDesc: 'Specific leads to watch',
          longDesc: 'Only trigger for these specific lead IDs',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Lead name filter',
          longDesc: 'Only trigger for leads with names matching this value',
        },
        phone_number: {
          displayName: 'Phone Number',
          shortDesc: 'Phone number filter',
          longDesc: 'Only trigger for leads with this phone number',
        },
        emails: {
          displayName: 'Email',
          shortDesc: 'Email filter',
          longDesc: 'Only trigger for leads with this email address',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Filter by assignee',
          longDesc: 'Only trigger for leads assigned to these users',
        },
        status_ids: {
          displayName: 'Statuses',
          shortDesc: 'Filter by status',
          longDesc: 'Only trigger for leads with these statuses',
        },
        customer_source_ids: {
          displayName: 'Customer Sources',
          shortDesc: 'Filter by source',
          longDesc: 'Only trigger for leads from these customer sources',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City filter',
          longDesc: 'Only trigger for leads in this city',
        },
        state: {
          displayName: 'State',
          shortDesc: 'State or province filter',
          longDesc: 'Only trigger for leads in this state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'Postal code filter',
          longDesc: 'Only trigger for leads with this postal code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country filter',
          longDesc: 'Only trigger for leads in this country',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Only trigger for leads that have any of these tags',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media filter',
          longDesc: 'Only trigger for leads with matching social media profiles',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status filter',
          longDesc: 'Only trigger for leads that are followed or not followed',
        },
        age: {
          displayName: 'Age',
          shortDesc: 'Lead age filter',
          longDesc: 'Only trigger for leads of this age in days',
        },
        minimum_monetary_value: {
          displayName: 'Minimum Value',
          shortDesc: 'Minimum monetary value',
          longDesc: 'Only trigger for leads with at least this monetary value',
        },
        maximum_monetary_value: {
          displayName: 'Maximum Value',
          shortDesc: 'Maximum monetary value',
          longDesc: 'Only trigger for leads with no more than this monetary value',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Only trigger for leads with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Only trigger for leads with no more than this many interactions',
        },
        include_converted_leads: {
          displayName: 'Include Converted Leads',
          shortDesc: 'Include converted leads',
          longDesc: 'Whether to trigger for leads that have been converted to opportunities',
        },
      },
    },
    new_opportunity: {
      displayName: 'New Opportunity',
      shortDesc: 'Triggered when a new opportunity is created',
      longDesc:
        'Triggers when a new opportunity is created in CopperCRM. You can filter which opportunities trigger this event using various criteria like pipeline, stage, status, value, and more.',
      options: {
        ids: {
          displayName: 'Opportunity IDs',
          shortDesc: 'Specific opportunities to watch',
          longDesc: 'Only trigger for these specific opportunity IDs',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Opportunity name filter',
          longDesc: 'Only trigger for opportunities with names matching this value',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Filter by assignee',
          longDesc: 'Only trigger for opportunities assigned to these users',
        },
        company_ids: {
          displayName: 'Companies',
          shortDesc: 'Filter by company',
          longDesc: 'Only trigger for opportunities associated with these companies',
        },
        customer_source_ids: {
          displayName: 'Customer Sources',
          shortDesc: 'Filter by source',
          longDesc: 'Only trigger for opportunities from these customer sources',
        },
        loss_reason_ids: {
          displayName: 'Loss Reasons',
          shortDesc: 'Filter by loss reason',
          longDesc: 'Only trigger for opportunities with these loss reasons',
        },
        pipeline_ids: {
          displayName: 'Pipelines',
          shortDesc: 'Filter by pipeline',
          longDesc: 'Only trigger for opportunities in these pipelines',
        },
        pipeline_stage_ids: {
          displayName: 'Pipeline Stages',
          shortDesc: 'Filter by stage',
          longDesc: 'Only trigger for opportunities in these pipeline stages',
        },
        primary_contact_ids: {
          displayName: 'Primary Contacts',
          shortDesc: 'Filter by primary contact',
          longDesc: 'Only trigger for opportunities with these primary contacts',
        },
        priorities: {
          displayName: 'Priorities',
          shortDesc: 'Filter by priority',
          longDesc: 'Only trigger for opportunities with these priority levels',
        },
        statuses: {
          displayName: 'Statuses',
          shortDesc: 'Filter by status',
          longDesc: 'Only trigger for opportunities with these statuses',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Only trigger for opportunities that have any of these tags',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status filter',
          longDesc: 'Only trigger for opportunities that are followed or not followed',
        },
        minimum_monetary_value: {
          displayName: 'Minimum Value',
          shortDesc: 'Minimum deal value',
          longDesc: 'Only trigger for opportunities with at least this monetary value',
        },
        maximum_monetary_value: {
          displayName: 'Maximum Value',
          shortDesc: 'Maximum deal value',
          longDesc: 'Only trigger for opportunities with no more than this monetary value',
        },
        minimum_win_probability: {
          displayName: 'Minimum Win Probability',
          shortDesc: 'Minimum win chance',
          longDesc: 'Only trigger for opportunities with at least this win probability',
        },
        maximum_win_probability: {
          displayName: 'Maximum Win Probability',
          shortDesc: 'Maximum win chance',
          longDesc: 'Only trigger for opportunities with no more than this win probability',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Only trigger for opportunities with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Only trigger for opportunities with no more than this many interactions',
        },
      },
    },
    new_person: {
      displayName: 'New Person',
      shortDesc: 'Triggered when a new person contact is created',
      longDesc:
        'Triggers when a new person contact is created in CopperCRM. You can filter which people trigger this event using various criteria like assignee, company, location, and more.',
      options: {
        ids: {
          displayName: 'Person IDs',
          shortDesc: 'Specific people to watch',
          longDesc: 'Only trigger for these specific person IDs',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Person name filter',
          longDesc: 'Only trigger for people with names matching this value',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Job title filter',
          longDesc: 'Only trigger for people with this job title',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Email filter',
          longDesc: 'Only trigger for people with this email address',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: 'Phone number filter',
          longDesc: 'Only trigger for people with this phone number',
        },
        city: {
          displayName: 'City',
          shortDesc: 'City filter',
          longDesc: 'Only trigger for people in this city',
        },
        state: {
          displayName: 'State',
          shortDesc: 'State or province filter',
          longDesc: 'Only trigger for people in this state or province',
        },
        postal_code: {
          displayName: 'Postal Code',
          shortDesc: 'Postal code filter',
          longDesc: 'Only trigger for people with this postal code',
        },
        country: {
          displayName: 'Country',
          shortDesc: 'Country filter',
          longDesc: 'Only trigger for people in this country',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Filter by assignee',
          longDesc: 'Only trigger for people assigned to these users',
        },
        contact_type_ids: {
          displayName: 'Contact Types',
          shortDesc: 'Filter by contact type',
          longDesc: 'Only trigger for people with these contact types',
        },
        company_ids: {
          displayName: 'Companies',
          shortDesc: 'Filter by company',
          longDesc: 'Only trigger for people associated with these companies',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Only trigger for people that have any of these tags',
        },
        socials: {
          displayName: 'Social Media',
          shortDesc: 'Social media filter',
          longDesc: 'Only trigger for people with these social media profiles',
        },
        minimum_interaction_count: {
          displayName: 'Minimum Interactions',
          shortDesc: 'Minimum interaction count',
          longDesc: 'Only trigger for people with at least this many interactions',
        },
        maximum_interaction_count: {
          displayName: 'Maximum Interactions',
          shortDesc: 'Maximum interaction count',
          longDesc: 'Only trigger for people with no more than this many interactions',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
      },
    },
    new_task: {
      displayName: 'New Task',
      shortDesc: 'Triggered when a new task is created',
      longDesc:
        'Triggers when a new task is created in CopperCRM. You can filter which tasks trigger this event using various criteria like assignee, status, priority, and more.',
      options: {
        ids: {
          displayName: 'Task IDs',
          shortDesc: 'Specific tasks to watch',
          longDesc: 'Only trigger for these specific task IDs',
        },
        page_number: {
          displayName: 'Page Number',
          shortDesc: 'Which page of results',
          longDesc: 'The page number of results to retrieve for pagination',
        },
        page_size: {
          displayName: 'Page Size',
          shortDesc: 'Results per page',
          longDesc: 'The number of results to return per page',
        },
        sort_by: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to use for sorting the results',
        },
        sort_direction: {
          displayName: 'Sort Direction',
          shortDesc: 'Sort order',
          longDesc: 'The direction to sort results (ascending or descending)',
        },
        assignee_ids: {
          displayName: 'Assignees',
          shortDesc: 'Filter by assignee',
          longDesc: 'Only trigger for tasks assigned to these users',
        },
        statuses: {
          displayName: 'Statuses',
          shortDesc: 'Filter by status',
          longDesc: 'Only trigger for tasks with these statuses',
        },
        priorities: {
          displayName: 'Priorities',
          shortDesc: 'Filter by priority',
          longDesc: 'Only trigger for tasks with these priority levels',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tags',
          longDesc: 'Only trigger for tasks that have any of these tags',
        },
        followed: {
          displayName: 'Followed',
          shortDesc: 'Following status filter',
          longDesc: 'Only trigger for tasks that are followed or not followed',
        },
      },
    },
  },
};

export default CopperCrmAppEn;
