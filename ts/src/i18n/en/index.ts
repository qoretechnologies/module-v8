import type { BaseTranslation } from '../i18n-types';

const en = {
  common: {},
  apps: {
    _testing: {
      triggers: {
        _testing: {
          options: {
            option1: {
              displayName: 'Option 1',
              shortDesc: 'Option 1 Short Description',
              longDesc: 'Option 1 Long Description',
            },
            option2: {
              displayName: 'Second Option',
              shortDesc: 'Second Option Short Description',
              longDesc: 'Second Option Long Description',
            },
          },
          event_info: {
            desc: 'Event data',
            type: {
              testTriggerInfo: {
                displayName: 'Test Trigger Info',
                shortDesc: 'Test Trigger Info Short Description',
                longDesc: 'Test Trigger Info Long Description',
                type: {
                  testTriggerInfo1: {
                    displayName: 'Test Trigger Info 1',
                    shortDesc: 'Test Trigger Info 1 Short Description',
                    longDesc: 'Test Trigger Info 1 Long Description',
                  },
                },
              },
            },
          },
        },
      },
      actions: {
        test: {
          options: {
            option1: {
              displayName: 'Option 1',
              shortDesc: 'Option 1 Short Description',
              longDesc: 'Option 1 Long Description',
              type: {
                subOption1: {
                  displayName: 'Sub Option 1 of option 1',
                  shortDesc: 'Sub Option 1 Short Description',
                  longDesc: 'Sub Option 1 Long Description',
                },
                subOption2: {
                  displayName: 'Sub Option 2 of option 1',
                  shortDesc: 'Sub Option 2 Short Description',
                  longDesc: 'Sub Option 2 Long Description',
                  type: {
                    subSubOption1: {
                      displayName: 'Sub Sub Option 1',
                      shortDesc: 'Sub Sub Option 1 Short Description',
                      longDesc: 'Sub Sub Option 1 Long Description',
                    },
                  },
                },
              },
            },
            option2: {
              displayName: 'Second Option',
            },
          },
        },
      },
    },
    Notion: {
      displayName: 'Notion',
      shortDesc: 'Collection of actions to interact with Notion API',
      longDesc: 'Collection of actions to interact with Notion API',
    },
    Jira: {
      displayName: 'Jira',
      shortDesc: 'Collection of actions to interact with Jira API',
      longDesc: 'Collection of actions to interact with Jira API',
    },
    Stripe: {
      displayName: 'Stripe',
      shortDesc: 'Collection of actions to interact with Stripe API',
      longDesc: 'Collection of actions to interact with Stripe API',
      actions: {
        GetAccount: {
          displayName: 'Get account details',
          shortDesc: 'Retrieves the details of the account.',
        },
        PostAccountLinks: {
          displayName: 'Create account links',
          shortDesc:
            'Creates a url that the platform can redirect their user to take them through the Connect Onboarding flow.',
        },
        DeleteAccountsAccount: {
          displayName: 'Delete account',
          shortDesc: 'Deletes the specified account.',
        },
        GetAccountsAccount: {
          displayName: 'Retrieve account',
          shortDesc: 'Retrieves the details of an account.',
        },
        PostAccountsAccount: {
          displayName: 'Update account',
          shortDesc:
            'Updates the specified account by setting the values of the parameters passed.',
        },
        GetAccountsAccountExternalAccounts: {
          displayName: 'List external accounts',
          shortDesc: 'Returns a list of external accounts associated with the Stripe account.',
        },
        PostAccountsAccountExternalAccounts: {
          displayName: 'Create external account',
          shortDesc: 'Create an external account for a connected account.',
        },
        PostAccountsAccountLoginLinks: {
          displayName: 'Create login links',
          shortDesc:
            'Creates a short-lived link that can be used to log in to the Stripe Dashboard.',
        },
        GetAccountsAccountPeople: {
          displayName: 'List people',
          shortDesc: 'Returns a list of people associated with the account.',
        },
        PostAccountsAccountPeople: {
          displayName: 'Create person',
          shortDesc: 'Creates a new person.',
        },
        GetBalance: {
          displayName: 'Retrieve balance',
          shortDesc: 'Retrieves the current account balance.',
        },
        GetBalanceHistory: {
          displayName: 'List balance history',
          shortDesc:
            'Returns a list of transactions that have contributed to the Stripe account balance.',
        },
        GetBalanceHistoryId: {
          displayName: 'Retrieve balance history',
          shortDesc: 'Retrieves the details of a balance history item.',
        },
        GetCharges: {
          displayName: 'List charges',
          shortDesc: 'Returns a list of charges you have previously created.',
        },
        PostCharges: {
          displayName: 'Create charge',
          shortDesc: 'Creates a new charge object.',
        },
        GetChargesCharge: {
          displayName: 'Retrieve charge',
          shortDesc: 'Retrieves the details of a charge.',
        },
        PostChargesCharge: {
          displayName: 'Update charge',
          shortDesc: 'Updates the specified charge by setting the values of the parameters passed.',
        },
        GetCustomers: {
          displayName: 'List customers',
          shortDesc: 'Returns a list of your customers.',
        },
        PostCustomers: {
          displayName: 'Create customer',
          shortDesc: 'Creates a new customer object.',
        },
        DeleteCustomersCustomer: {
          displayName: 'Delete customer',
          shortDesc: 'Deletes the specified customer.',
        },
        GetCustomersCustomer: {
          displayName: 'Retrieve customer',
          shortDesc: 'Retrieves the details of an existing customer.',
        },
        PostCustomersCustomer: {
          displayName: 'Update customer',
          shortDesc:
            'Updates the specified customer by setting the values of the parameters passed.',
        },
        GetCustomersCustomerBalanceTransactions: {
          displayName: 'List balance transactions',
          shortDesc:
            'Returns a list of transactions that have contributed to the customers account balance.',
        },
        PostCustomersCustomerBalanceTransactions: {
          displayName: 'Create balance transaction',
          shortDesc: 'Creates a new balance transaction.',
        },
        GetCustomersCustomerSources: {
          displayName: 'List sources',
          shortDesc: 'Returns a list of sources for the customer.',
        },
        PostCustomersCustomerSources: {
          displayName: 'Create source',
          shortDesc: 'Creates a new source object.',
        },
        GetCustomersCustomerSubscriptions: {
          displayName: 'List subscriptions',
          shortDesc: 'Returns a list of subscriptions for a customer.',
        },
        PostCustomersCustomerSubscriptions: {
          displayName: 'Create subscription',
          shortDesc: 'Creates a new subscription on an existing customer.',
        },
        GetInvoices: {
          displayName: 'List invoices',
          shortDesc: 'Returns a list of your invoices.',
        },
        PostInvoices: {
          displayName: 'Create invoice',
          shortDesc: 'Creates a draft invoice for a given customer.',
        },
        DeleteInvoicesInvoice: {
          displayName: 'Delete invoice',
          shortDesc: 'Deletes the specified invoice.',
        },
        GetInvoicesInvoice: {
          displayName: 'Retrieve invoice',
          shortDesc: 'Retrieves the details of an existing invoice.',
        },
        PostInvoicesInvoice: {
          displayName: 'Update invoice',
          shortDesc:
            'Updates the specified invoice by setting the values of the parameters passed.',
        },
        GetPaymentIntents: {
          displayName: 'List payment intents',
          shortDesc: 'Returns a list of payment intents.',
        },
        PostPaymentIntents: {
          displayName: 'Create payment intent',
          shortDesc: 'Creates a new payment intent.',
        },
        GetRefunds: {
          displayName: 'List refunds',
          shortDesc: 'Returns a list of all refunds you’ve previously created.',
        },
        PostRefunds: {
          displayName: 'Create refund',
          shortDesc: 'Creates a new refund object.',
        },
      },
    },
    Github: {
      displayName: 'Github',
      shortDesc: 'Collection of actions to interact with Github API',
      longDesc: 'Collection of actions to interact with Github API',
      triggers: {
        new_repository_issue: {
          displayName: 'New Repository Issue',
          shortDesc: 'Triggers when a new issue is created in a repository',
          longDesc: 'Triggers when a new issue is created in a repository',
          options: {
            repo: {
              longDesc: 'Repository name',
              shortDesc: 'Repository name',
              displayName: 'Repository name',
            },
            owner: {
              longDesc: 'Organization name or user login',
              shortDesc: 'Organization name or user login',
              displayName: 'Repository owner',
            },
          },
          event_info: {
            desc: 'GitHub Issue event data',
            type: {
              action: {
                displayName: 'Action',
                shortDesc: 'Action type',
                longDesc: "The action performed on the issue, such as 'assigned' or 'opened'.",
              },
              issue: {
                displayName: 'Issue',
                shortDesc: 'GitHub issue data',
                longDesc: 'Details of the GitHub issue involved in the event',
                type: {
                  url: {
                    displayName: 'Issue URL',
                    shortDesc: 'URL of the issue',
                    longDesc: 'The URL of the GitHub issue',
                  },
                  number: {
                    displayName: 'Issue Number',
                    shortDesc: 'Issue identifier',
                    longDesc: 'Unique number of the GitHub issue',
                  },
                  title: {
                    displayName: 'Issue Title',
                    shortDesc: 'Title of the issue',
                    longDesc: 'The title of the GitHub issue',
                  },
                  user: {
                    displayName: 'Issue Creator',
                    shortDesc: 'User who created the issue',
                    longDesc: 'Information about the user who created the GitHub issue',
                    type: {
                      login: {
                        displayName: 'User Login',
                        shortDesc: 'GitHub username',
                        longDesc: 'The username of the GitHub user',
                      },
                      id: {
                        displayName: 'User ID',
                        shortDesc: 'User ID',
                        longDesc: 'Unique ID of the GitHub user',
                      },
                      avatar_url: {
                        displayName: 'Avatar URL',
                        shortDesc: 'User avatar',
                        longDesc: "URL to the GitHub user's avatar",
                      },
                      html_url: {
                        displayName: 'Profile URL',
                        shortDesc: 'User profile',
                        longDesc: "URL to the GitHub user's profile",
                      },
                    },
                  },
                },
                labels: {
                  displayName: 'Labels',
                  shortDesc: 'Labels for the issue',
                  longDesc: 'Labels assigned to the GitHub issue',
                  type: {
                    id: {
                      displayName: 'Label ID',
                      shortDesc: 'Label identifier',
                      longDesc: 'Unique identifier for the label',
                    },
                    name: {
                      displayName: 'Label Name',
                      shortDesc: 'Name of the label',
                      longDesc: 'The name of the label',
                    },
                    color: {
                      displayName: 'Label Color',
                      shortDesc: 'Color of the label',
                      longDesc: 'Color code of the label',
                    },
                  },
                },
                state: {
                  displayName: 'State',
                  shortDesc: 'State of the issue',
                  longDesc: "Current state of the issue, such as 'open' or 'closed'",
                },
                assignee: {
                  displayName: 'Assignee',
                  shortDesc: 'User assigned to the issue',
                  longDesc: 'Details of the user assigned to the issue',
                  type: {
                    login: {
                      displayName: 'Assignee Login',
                      shortDesc: 'Assignee username',
                      longDesc: 'The username of the assigned GitHub user',
                    },
                    id: {
                      displayName: 'Assignee ID',
                      shortDesc: 'Assignee ID',
                      longDesc: 'Unique ID of the assignee',
                    },
                    avatar_url: {
                      displayName: 'Assignee Avatar',
                      shortDesc: 'Avatar of the assignee',
                      longDesc: 'URL to the avatar of the assignee',
                    },
                    html_url: {
                      displayName: 'Assignee Profile',
                      shortDesc: 'Profile of the assignee',
                      longDesc: 'URL to the GitHub profile of the assignee',
                    },
                  },
                },
                milestone: {
                  displayName: 'Milestone',
                  shortDesc: 'Issue milestone',
                  longDesc: 'Milestone associated with the GitHub issue',
                  type: {
                    title: {
                      displayName: 'Milestone Title',
                      shortDesc: 'Title of the milestone',
                      longDesc: 'Title of the milestone for the issue',
                    },
                    due_on: {
                      displayName: 'Due Date',
                      shortDesc: 'Milestone due date',
                      longDesc: 'Due date of the milestone',
                    },
                  },
                },
              },
              repository: {
                displayName: 'Repository',
                shortDesc: 'Repository information',
                longDesc: 'Details of the GitHub repository related to the event',
                type: {
                  name: {
                    displayName: 'Repository Name',
                    shortDesc: 'Name of the repository',
                    longDesc: 'Name of the repository',
                  },
                  owner: {
                    displayName: 'Owner',
                    shortDesc: 'Repository owner',
                    longDesc: 'Owner of the repository',
                    type: {
                      login: {
                        displayName: 'Owner Login',
                        shortDesc: 'Owner username',
                        longDesc: 'Username of the repository owner',
                      },
                      id: {
                        displayName: 'Owner ID',
                        shortDesc: 'Owner ID',
                        longDesc: 'Unique ID of the repository owner',
                      },
                    },
                  },
                },
              },
              sender: {
                displayName: 'Sender',
                shortDesc: 'Event sender',
                longDesc: 'User who triggered the webhook event',
                type: {
                  login: {
                    displayName: 'Sender Login',
                    shortDesc: 'Sender username',
                    longDesc: 'Username of the sender',
                  },
                  id: {
                    displayName: 'Sender ID',
                    shortDesc: 'Sender ID',
                    longDesc: 'Unique ID of the sender',
                  },
                  avatar_url: {
                    displayName: 'Sender Avatar',
                    shortDesc: "Sender's avatar",
                    longDesc: "URL to the sender's avatar",
                  },
                  html_url: {
                    displayName: 'Sender Profile',
                    shortDesc: "Sender's profile",
                    longDesc: "URL to the sender's GitHub profile",
                  },
                },
              },
            },
          },
        },
      },
    },
    Asana: {
      displayName: 'Asana',
      shortDesc: 'Collection of actions to interact with Asana API',
      longDesc: 'Collection of actions to interact with Asana API',
    },
    DocusignESignature: {
      displayName: 'Docusign eSignature',
      shortDesc: 'Collection of actions to interact with Esignature API',
      longDesc: 'Collection of actions to interact with Esignature API',
      actions: {
        Brands_GetBrands: {
          displayName: 'Get Brands',
        },
        Brands_PostBrands: {
          displayName: 'Create Brand',
        },
        Brands_DeleteBrands: {
          displayName: 'Delete Brand',
        },
        Envelopes_GetEnvelopes: {
          displayName: 'Get Envelopes',
        },
        Envelopes_PostEnvelopes: {
          displayName: 'Create Envelopes',
        },
        Envelopes_GetEnvelope: {
          displayName: 'Get Envelope',
        },
        Envelopes_PutEnvelope: {
          displayName: 'Update Envelope',
        },
        Documents_GetDocuments: {
          displayName: 'Get Documents',
        },
        Documents_PutDocuments: {
          displayName: 'Update Documents',
        },
        Documents_DeleteDocuments: {
          displayName: 'Delete Documents',
        },
        Documents_GetDocument: {
          displayName: 'Get Document',
        },
        Documents_PutDocument: {
          displayName: 'Update Document',
        },
        Recipients_GetRecipients: {
          displayName: 'Get Recipients',
        },
        Recipients_PutRecipients: {
          displayName: 'Update Recipients',
        },
        Recipients_PostRecipients: {
          displayName: 'Add Recipients',
        },
        Recipients_DeleteRecipients: {
          displayName: 'Delete Recipients',
        },
        Views_PostEnvelopeRecipientView: {
          displayName: 'Create Recipient View',
        },
      },
    },
    Zendesk: {
      displayName: 'Zendesk',
      shortDesc: 'Collection of actions to interact with Zendesk API',
      longDesc: 'Collection of actions to interact with Zendesk API',
      triggers: {
        new_user: {
          displayName: 'New User',
          shortDesc: 'Triggers when a new user is created',
          longDesc: 'Triggers when a new user is created',
          event_info: {
            longDesc: 'Zendesk User Event Data',
            type: {
              account_id: {
                displayName: 'Account ID',
                longDesc: 'ID of the associated account',
                shortDesc: 'Account ID',
              },
              detail: {
                displayName: 'Detail',
                longDesc: 'Detailed user information',
                shortDesc: 'User details',
                type: {
                  created_at: {
                    displayName: 'Created At',
                    longDesc: 'Timestamp of user creation',
                    shortDesc: 'User creation time',
                  },
                  default_group_id: {
                    displayName: 'Default Group ID',
                    longDesc: 'ID of the default group for the user',
                    shortDesc: 'Default group ID',
                  },
                  email: {
                    displayName: 'Email',
                    longDesc: 'Email address of the user',
                    shortDesc: 'User email',
                  },
                  external_id: {
                    displayName: 'External ID',
                    longDesc: 'External identifier for the user',
                    shortDesc: 'User external ID',
                  },
                  id: {
                    displayName: 'User ID',
                    longDesc: 'Unique identifier for the user',
                    shortDesc: 'User ID',
                  },
                  organization_id: {
                    displayName: 'Organization ID',
                    longDesc: 'ID of the organization associated with the user',
                    shortDesc: 'Organization ID',
                  },
                  role: {
                    displayName: 'Role',
                    longDesc: 'Role of the user in the system',
                    shortDesc: 'User role',
                  },
                  updated_at: {
                    displayName: 'Updated At',
                    longDesc: 'Last update timestamp for the user',
                    shortDesc: 'User update time',
                  },
                },
              },
              event: {
                displayName: 'Event',
                longDesc: 'Additional event information',
                shortDesc: 'Event info',
              },
              id: {
                displayName: 'Event ID',
                longDesc: 'Unique identifier for the event',
                shortDesc: 'Event ID',
              },
              subject: {
                displayName: 'Subject',
                longDesc: 'Subject of the event',
                shortDesc: 'Event subject',
              },
              time: {
                displayName: 'Time',
                longDesc: 'Timestamp of the event occurrence',
                shortDesc: 'Event time',
              },
              type: {
                displayName: 'Event Type',
                longDesc: 'Type of the event',
                shortDesc: 'Event type',
              },
              zendesk_event_version: {
                displayName: 'Zendesk Event Version',
                longDesc: 'Version of the Zendesk event format',
                shortDesc: 'Event version',
              },
            },
          },
        },
        new_ticket: {
          displayName: 'New Ticket',
          shortDesc: 'Triggers when a new ticket is created',
          longDesc: 'Triggers when a new ticket is created',
          event_info: {
            longDesc: 'New Ticket event data',
            type: {
              assignee_email: {
                displayName: 'Assignee Email',
                longDesc: 'Email of the assignee',
                shortDesc: 'Assignee email',
              },
              assignee_name: {
                displayName: 'Assignee Name',
                longDesc: 'Name of the assignee',
                shortDesc: 'Assignee name',
              },
              group_name: {
                displayName: 'Group Name',
                longDesc: 'Name of the group handling the ticket',
                shortDesc: 'Group name',
              },
              organization_name: {
                displayName: 'Organization Name',
                longDesc: 'Name of the associated organization',
                shortDesc: 'Organization name',
              },
              requester_email: {
                displayName: 'Requester Email',
                longDesc: 'Email of the requester',
                shortDesc: 'Requester email',
              },
              requester_name: {
                displayName: 'Requester Name',
                longDesc: 'Name of the requester',
                shortDesc: 'Requester name',
              },
              tags: {
                displayName: 'Tags',
                longDesc: 'Tags associated with the ticket',
                shortDesc: 'Ticket tags',
              },
              ticket_description: {
                displayName: 'Ticket Description',
                longDesc: 'Description of the ticket',
                shortDesc: 'Ticket description',
              },
              ticket_id: {
                displayName: 'Ticket ID',
                longDesc: 'Unique identifier for the ticket',
                shortDesc: 'Ticket ID',
              },
              ticket_priority: {
                displayName: 'Ticket Priority',
                longDesc: 'Priority level of the ticket',
                shortDesc: 'Ticket priority',
              },
              ticket_status: {
                displayName: 'Ticket Status',
                longDesc: 'Current status of the ticket',
                shortDesc: 'Ticket status',
              },
              ticket_subject: {
                displayName: 'Ticket Subject',
                longDesc: 'Subject of the ticket',
                shortDesc: 'Ticket subject',
              },
              ticket_type: {
                displayName: 'Ticket Type',
                longDesc: 'Type of the ticket',
                shortDesc: 'Ticket type',
              },
              ticket_url: {
                displayName: 'Ticket URL',
                longDesc: 'URL of the ticket in the system',
                shortDesc: 'Ticket URL',
              },
            },
          },
        },
        new_organization: {
          displayName: 'New Organization',
          shortDesc: 'Triggers when a new organization is created',
          longDesc: 'Triggers when a new organization is created',
          event_info: {
            longDesc: 'Zendesk Organization Event Data',
            type: {
              account_id: {
                displayName: 'Account ID',
                longDesc: 'ID of the associated account',
                shortDesc: 'Account ID',
              },
              detail: {
                displayName: 'Detail',
                longDesc: 'Detailed organization information',
                shortDesc: 'Organization details',
                type: {
                  created_at: {
                    displayName: 'Created At',
                    longDesc: 'Timestamp of organization creation',
                    shortDesc: 'Organization creation time',
                  },
                  external_id: {
                    displayName: 'External ID',
                    longDesc: 'External identifier for the organization',
                    shortDesc: 'Organization external ID',
                  },
                  group_id: {
                    displayName: 'Group ID',
                    longDesc: 'ID of the associated group',
                    shortDesc: 'Group ID',
                  },
                  id: {
                    displayName: 'Organization ID',
                    longDesc: 'Unique identifier for the organization',
                    shortDesc: 'Organization ID',
                  },
                  name: {
                    displayName: 'Name',
                    longDesc: 'Name of the organization',
                    shortDesc: 'Organization name',
                  },
                  shared_comments: {
                    displayName: 'Shared Comments',
                    longDesc: 'Indicates if comments are shared',
                    shortDesc: 'Shared comments',
                  },
                  shared_tickets: {
                    displayName: 'Shared Tickets',
                    longDesc: 'Indicates if tickets are shared',
                    shortDesc: 'Shared tickets',
                  },
                  updated_at: {
                    displayName: 'Updated At',
                    longDesc: 'Last update timestamp for the organization',
                    shortDesc: 'Organization update time',
                  },
                },
              },
              event: {
                displayName: 'Event',
                longDesc: 'Additional event information',
                shortDesc: 'Event info',
              },
              id: {
                displayName: 'Event ID',
                longDesc: 'Unique identifier for the event',
                shortDesc: 'Event ID',
              },
              subject: {
                displayName: 'Subject',
                longDesc: 'Subject of the event',
                shortDesc: 'Event subject',
              },
              time: {
                displayName: 'Time',
                longDesc: 'Timestamp of the event occurrence',
                shortDesc: 'Event time',
              },
              type: {
                displayName: 'Event Type',
                longDesc: 'Type of the event',
                shortDesc: 'Event type',
              },
              zendesk_event_version: {
                displayName: 'Zendesk Event Version',
                longDesc: 'Version of the Zendesk event format',
                shortDesc: 'Event version',
              },
            },
          },
        },
      },
      actions: {
        CreateGroup: {
          options: {
            group: {
              displayName: 'Group',
              shortDesc: 'Group',
              longDesc: 'Group',
              type: {
                name: {
                  displayName: 'Name',
                  shortDesc: 'Group name',
                  longDesc: 'Group name',
                },
                description: {
                  displayName: 'Description',
                  shortDesc: 'Group description',
                  longDesc: 'Group description',
                },
                default: {
                  displayName: 'Default',
                  shortDesc:
                    'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                  longDesc:
                    'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                },
                is_public: {
                  displayName: 'Public',
                  shortDesc: 'If the group should be public. Default is true.',
                  longDesc: 'Group is public',
                },
                user_ids: {
                  displayName: 'User IDs',
                  shortDesc: 'Users to add to the group',
                  longDesc: 'Users to add to the group',
                },
              },
            },
          },
        },
        UpdateGroup: {
          options: {
            group: {
              displayName: 'Group',
              shortDesc: 'Group',
              longDesc: 'Group',
              type: {
                name: {
                  displayName: 'Name',
                  shortDesc: 'Group name',
                  longDesc: 'Group name',
                },
                description: {
                  displayName: 'Description',
                  shortDesc: 'Group description',
                  longDesc: 'Group description',
                },
                default: {
                  displayName: 'Default',
                  shortDesc:
                    'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                  longDesc:
                    'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                },
                is_public: {
                  displayName: 'Public',
                  shortDesc: 'If the group should be public. Default is true.',
                  longDesc: 'Group is public',
                },
                user_ids: {
                  displayName: 'User IDs',
                  shortDesc: 'Users to add to the group',
                  longDesc: 'Users to add to the group',
                },
              },
            },
          },
        },
        CreateUser: {
          options: {
            user: {
              displayName: 'User',
              shortDesc: 'User',
              longDesc: 'User',
              type: {
                name: {
                  displayName: 'Name',
                  shortDesc: 'User name',
                  longDesc: 'User name',
                },
                email: {
                  displayName: 'Email',
                  shortDesc: 'User email',
                  longDesc: 'User email',
                },
                phone: {
                  displayName: 'Phone',
                  shortDesc: 'User phone',
                  longDesc: 'User phone',
                },
                notes: {
                  displayName: 'Notes',
                  shortDesc: 'Notes about the user',
                  longDesc: 'Notes about the user',
                },
                details: {
                  displayName: 'Details',
                  shortDesc: 'Details',
                  longDesc: 'Details',
                },
                role: {
                  displayName: 'Role',
                  shortDesc: 'User role',
                  longDesc: 'User role',
                },
                organization_ids: {
                  displayName: 'Organization IDs',
                  shortDesc: 'Organization IDs',
                  longDesc: 'Organization IDs',
                },
              },
            },
          },
        },
        UpdateUser: {
          options: {
            user: {
              displayName: 'User',
              shortDesc: 'User',
              longDesc: 'User',
              type: {
                name: {
                  displayName: 'Name',
                  shortDesc: 'User name',
                  longDesc: 'User name',
                },
                email: {
                  displayName: 'Email',
                  shortDesc: 'User email',
                  longDesc: 'User email',
                },
                phone: {
                  displayName: 'Phone',
                  shortDesc: 'User phone',
                  longDesc: 'User phone',
                },
                notes: {
                  displayName: 'Notes',
                  shortDesc: 'Notes about the user',
                  longDesc: 'Notes about the user',
                },
                details: {
                  displayName: 'Details',
                  shortDesc: 'Details',
                  longDesc: 'Details',
                },
                role: {
                  displayName: 'Role',
                  shortDesc: 'User role',
                  longDesc: 'User role',
                },
                organization_ids: {
                  displayName: 'Organization IDs',
                  shortDesc: 'Organization IDs',
                  longDesc: 'Organization IDs',
                },
              },
            },
          },
        },
        UpdateOrganization: {
          options: {
            name: {
              displayName: 'Name',
              shortDesc: 'Organization name',
              longDesc: 'Organization name',
            },
            group_id: {
              displayName: 'Group ID',
              shortDesc: 'Group ID',
              longDesc: 'Group ID',
            },
            notes: {
              displayName: 'Notes',
              shortDesc: 'Notes about the organization',
              longDesc: 'Notes about the organization',
            },
            details: {
              displayName: 'Details',
              shortDesc: 'Details',
              longDesc: 'Details',
            },
          },
        },
      },
    },
    hubspot: {
      displayName: 'hubspot',
      shortDesc: 'Collection of actions to interact with hubspot API',
      longDesc: 'Collection of actions to interact with hubspot API',
      actions: {
        users: {
          results: {
            displayName: 'Results',
            shortDesc: 'Results of the action',
            longDesc: 'Results of the action',
          },
          name: {
            displayName: 'Name',
            shortDesc: 'Name of the user',
            longDesc: 'Name of the user',
          },
          id: {
            displayName: 'ID',
            shortDesc: 'ID of the user',
            longDesc: 'ID of the user',
          },
          email: {
            displayName: 'Email',
            shortDesc: 'Email of the user',
            longDesc: 'Email of the user',
          },
          created_at: {
            displayName: 'Created At',
            shortDesc: 'The date and time the user was created',
            longDesc: 'The date and time the user was created',
          },
          updated_at: {
            displayName: 'Updated At',
            shortDesc: 'The date and time the user was last updated',
            longDesc: 'The date and time the user was last updated',
          },
          archived: {
            displayName: 'Archived',
            shortDesc: 'Whether the user is archived',
            longDesc: 'Whether the user is archived',
          },
        },
      },
    },
  },
} satisfies BaseTranslation;

export default en;
