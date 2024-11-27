import type { BaseTranslation } from '../i18n-types';
import { AsanaEventInfo } from './asana/event-info';

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
              fields: {
                testTriggerInfo: {
                  displayName: 'Test Trigger Info',
                  shortDesc: 'Test Trigger Info Short Description',
                  longDesc: 'Test Trigger Info Long Description',
                  type: {
                    fields: {
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
                fields: {
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
                      fields: {
                        subSubOption1: {
                          displayName: 'Sub Sub Option 1',
                          shortDesc: 'Sub Sub Option 1 Short Description',
                          longDesc: 'Sub Sub Option 1 Long Description',
                        },
                      },
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
            desc: 'GitHub Issue Event Data',
            type: {
              fields: {
                action: {
                  displayName: 'Action',
                  shortDesc: 'Action type',
                  longDesc: 'Type of action performed on the issue (e.g., opened, closed)',
                },
                issue: {
                  displayName: 'Issue',
                  shortDesc: 'Issue details',
                  longDesc: 'Details of the issue created',
                  type: {
                    fields: {
                      url: {
                        displayName: 'Issue URL',
                        shortDesc: 'URL of the issue',
                        longDesc: 'The API URL for the specific issue',
                      },
                      number: {
                        displayName: 'Issue Number',
                        shortDesc: 'Number of the issue',
                        longDesc: 'Unique number identifier for the issue',
                      },
                      title: {
                        displayName: 'Issue Title',
                        shortDesc: 'Title of the issue',
                        longDesc: 'The title or subject of the issue',
                      },
                      user: {
                        displayName: 'User',
                        shortDesc: 'Issue creator',
                        longDesc: 'Details of the user who created the issue',
                        type: {
                          fields: {
                            login: {
                              displayName: 'Login',
                              shortDesc: 'Username',
                              longDesc: 'GitHub username of the user',
                            },
                            id: {
                              displayName: 'User ID',
                              shortDesc: 'GitHub user ID',
                              longDesc: 'Unique identifier for the GitHub user',
                            },
                            avatar_url: {
                              displayName: 'Avatar URL',
                              shortDesc: 'User avatar URL',
                              longDesc: "URL of the user's avatar image",
                            },
                            html_url: {
                              displayName: 'Profile URL',
                              shortDesc: 'User profile URL',
                              longDesc: 'Link to the GitHub profile of the user',
                            },
                          },
                        },
                      },
                      labels: {
                        displayName: 'Labels',
                        shortDesc: 'Issue labels',
                        longDesc: 'List of labels associated with the issue',
                      },
                      state: {
                        displayName: 'State',
                        shortDesc: 'Issue state',
                        longDesc: 'Current state of the issue (e.g., open, closed)',
                      },
                      locked: {
                        displayName: 'Locked',
                        shortDesc: 'Issue lock status',
                        longDesc: 'Whether the issue is locked for editing',
                      },
                      assignee: {
                        displayName: 'Assignee',
                        shortDesc: 'Assigned user',
                        longDesc: 'Details of the user assigned to the issue',
                        type: {
                          fields: {
                            login: {
                              displayName: 'Login',
                              shortDesc: 'Username',
                              longDesc: 'GitHub username of the assignee',
                            },
                            id: {
                              displayName: 'User ID',
                              shortDesc: 'GitHub user ID',
                              longDesc: 'Unique identifier for the GitHub user',
                            },
                            avatar_url: {
                              displayName: 'Avatar URL',
                              shortDesc: 'User avatar URL',
                              longDesc: "URL of the user's avatar image",
                            },
                            html_url: {
                              displayName: 'Profile URL',
                              shortDesc: 'User profile URL',
                              longDesc: 'Link to the GitHub profile of the assignee',
                            },
                          },
                        },
                      },
                      milestone: {
                        displayName: 'Milestone',
                        shortDesc: 'Milestone details',
                        longDesc: 'Details of the milestone associated with the issue',
                        type: {
                          fields: {
                            url: {
                              displayName: 'Milestone URL',
                              shortDesc: 'Milestone API URL',
                              longDesc: 'The API URL for the milestone',
                            },
                            html_url: {
                              displayName: 'Milestone HTML URL',
                              shortDesc: 'Milestone webpage URL',
                              longDesc: "URL of the milestone's webpage",
                            },
                            labels_url: {
                              displayName: 'Labels URL',
                              shortDesc: 'Labels API URL',
                              longDesc: "API URL for milestone's labels",
                            },
                            id: {
                              displayName: 'Milestone ID',
                              shortDesc: 'Milestone identifier',
                              longDesc: 'Unique identifier for the milestone',
                            },
                            number: {
                              displayName: 'Milestone Number',
                              shortDesc: 'Milestone number',
                              longDesc: 'Unique number for the milestone',
                            },
                            title: {
                              displayName: 'Milestone Title',
                              shortDesc: 'Title of the milestone',
                              longDesc: 'The title of the associated milestone',
                            },
                            description: {
                              displayName: 'Milestone Description',
                              shortDesc: 'Milestone details',
                              longDesc: 'A description of the milestone',
                            },
                            creator: {
                              displayName: 'Creator',
                              shortDesc: 'Milestone creator',
                              longDesc: 'Details of the user who created the milestone',
                              type: {
                                fields: {
                                  login: {
                                    displayName: 'Login',
                                    shortDesc: 'Username',
                                    longDesc: 'GitHub username of the creator',
                                  },
                                  id: {
                                    displayName: 'User ID',
                                    shortDesc: 'GitHub user ID',
                                    longDesc: 'Unique identifier for the creator',
                                  },
                                  avatar_url: {
                                    displayName: 'Avatar URL',
                                    shortDesc: 'User avatar URL',
                                    longDesc: "URL of the creator's avatar image",
                                  },
                                  html_url: {
                                    displayName: 'Profile URL',
                                    shortDesc: 'User profile URL',
                                    longDesc: "Link to the creator's GitHub profile",
                                  },
                                },
                              },
                            },
                            open_issues: {
                              displayName: 'Open Issues',
                              shortDesc: 'Count of open issues',
                              longDesc: 'The number of open issues in this milestone',
                            },
                            closed_issues: {
                              displayName: 'Closed Issues',
                              shortDesc: 'Count of closed issues',
                              longDesc: 'The number of closed issues in this milestone',
                            },
                            state: {
                              displayName: 'State',
                              shortDesc: 'Milestone state',
                              longDesc: 'Current state of the milestone (e.g., open, closed)',
                            },
                            created_at: {
                              displayName: 'Created At',
                              shortDesc: 'Creation time',
                              longDesc: 'Timestamp when the milestone was created',
                            },
                            updated_at: {
                              displayName: 'Updated At',
                              shortDesc: 'Update time',
                              longDesc: 'Timestamp when the milestone was last updated',
                            },
                            due_on: {
                              displayName: 'Due Date',
                              shortDesc: 'Milestone due date',
                              longDesc: 'Date by which the milestone is expected to be completed',
                            },
                            closed_at: {
                              displayName: 'Closed At',
                              shortDesc: 'Closure time',
                              longDesc: 'Timestamp when the milestone was closed',
                            },
                          },
                        },
                      },
                      comments: {
                        displayName: 'Comments Count',
                        shortDesc: 'Number of comments',
                        longDesc: 'Total number of comments on the issue',
                      },
                      created_at: {
                        displayName: 'Created At',
                        shortDesc: 'Issue creation time',
                        longDesc: 'The timestamp when the issue was created',
                      },
                      updated_at: {
                        displayName: 'Updated At',
                        shortDesc: 'Issue update time',
                        longDesc: 'The timestamp when the issue was last updated',
                      },
                      closed_at: {
                        displayName: 'Closed At',
                        shortDesc: 'Issue closure time',
                        longDesc: 'The timestamp when the issue was closed (if applicable)',
                      },
                      body: {
                        displayName: 'Body',
                        shortDesc: 'Issue description',
                        longDesc: 'The detailed description of the issue',
                      },
                    },
                  },
                },
                repository: {
                  displayName: 'Repository',
                  shortDesc: 'Repository details',
                  longDesc: 'Details of the repository where the issue resides',
                  type: {
                    fields: {
                      id: {
                        displayName: 'Repository ID',
                        shortDesc: 'Unique ID',
                        longDesc: 'Unique identifier for the repository',
                      },
                      name: {
                        displayName: 'Repository Name',
                        shortDesc: 'Name of the repository',
                        longDesc: 'The name of the GitHub repository',
                      },
                      private: {
                        displayName: 'Private',
                        shortDesc: 'Privacy status',
                        longDesc: 'Whether the repository is private',
                      },
                      owner: {
                        displayName: 'Owner',
                        shortDesc: 'Repository owner',
                        longDesc: 'Details of the user or organization that owns the repository',
                        type: {
                          fields: {
                            login: {
                              displayName: 'Login',
                              shortDesc: 'Username',
                              longDesc: 'GitHub username of the owner',
                            },
                            id: {
                              displayName: 'Owner ID',
                              shortDesc: 'Unique ID',
                              longDesc: 'Unique identifier for the repository owner',
                            },
                            avatar_url: {
                              displayName: 'Avatar URL',
                              shortDesc: 'Avatar link',
                              longDesc: "URL of the owner's avatar image",
                            },
                            html_url: {
                              displayName: 'Profile URL',
                              shortDesc: 'Profile link',
                              longDesc: "Link to the owner's GitHub profile",
                            },
                          },
                        },
                      },
                    },
                  },
                },
                sender: {
                  displayName: 'Sender',
                  shortDesc: 'Event sender',
                  longDesc: 'Details of the sender who triggered the event',
                  type: {
                    fields: {
                      login: {
                        displayName: 'Login',
                        shortDesc: 'Username',
                        longDesc: 'GitHub username of the sender',
                      },
                      id: {
                        displayName: 'Sender ID',
                        shortDesc: 'Unique ID',
                        longDesc: 'Unique identifier for the sender',
                      },
                      html_url: {
                        displayName: 'Profile URL',
                        shortDesc: 'Profile link',
                        longDesc: "Link to the sender's GitHub profile",
                      },
                      avatar_url: {
                        displayName: 'Avatar URL',
                        shortDesc: 'Avatar link',
                        longDesc: "URL of the sender's avatar image",
                      },
                    },
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
      triggers: {
        task_completed: {
          displayName: 'Task Completed',
          shortDesc: 'Triggered when a task within a project is marked as completed.',
          longDesc: 'Triggered when a task within a project is marked as completed.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
          },
          event_info: AsanaEventInfo,
        },
        attachment_added: {
          displayName: 'Attachment Added',
          shortDesc: 'Triggered when an attachment is added to any task within a project.',
          longDesc: 'Triggered when an attachment is added to any task within a project.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
          },
          event_info: AsanaEventInfo,
        },
        subtask_completed: {
          displayName: 'Subtask Completed',
          shortDesc: 'Triggered when a subtask is marked as completed.',
          longDesc: 'Triggered when a subtask is marked as completed.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
          },
          task: {
            displayName: 'Task ID',
            shortDesc: 'The task to look for subtasks in',
            longDesc: 'The task to look for subtasks in',
          },
          event_info: AsanaEventInfo,
        },
        project_task_added: {
          displayName: 'Project Task Added',
          shortDesc: 'Triggered when a new task is added to a project.',
          longDesc: 'Triggered when a new task is added to a project.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
          },
          event_info: AsanaEventInfo,
        },
        project_added: {
          displayName: 'Project Added',
          shortDesc: 'Triggered when a new project is added to a workspace.',
          longDesc: 'Triggered when a new project is added to a workspace.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_comment_added: {
          displayName: 'Task Comment Added',
          shortDesc: 'Triggered when a new comment is added to a specific task.',
          longDesc: 'Triggered when a new comment is added to a specific task.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
            task: {
              displayName: 'Task ID',
              shortDesc: 'The task to look for comments in',
              longDesc: 'The task to look for comments in',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_story_added: {
          displayName: 'Task Story Added',
          shortDesc: 'Triggered when a new story (e.g., a comment or update) is added to a task.',
          longDesc: 'Triggered when a new story (e.g., a comment or update) is added to a task.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
            task: {
              displayName: 'Task ID',
              shortDesc: 'The task to look for stories in',
              longDesc: 'The task to look for stories in',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_subtask_added: {
          displayName: 'Task Subtask Added',
          shortDesc: 'Triggered when a new subtask is added to a specific task.',
          longDesc: 'Triggered when a new subtask is added to a specific task.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
            task: {
              displayName: 'Task ID',
              shortDesc: 'The task to look for subtasks in',
              longDesc: 'The task to look for subtasks in',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_tag_added: {
          displayName: 'Task Tag Added',
          shortDesc: 'Triggered when a tag is added to a specific task.',
          longDesc: 'Triggered when a tag is added to a specific task.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
            task: {
              displayName: 'Task ID',
              shortDesc: 'The task to look for tags in',
              longDesc: 'The task to look for tags in',
            },
          },
          event_info: AsanaEventInfo,
        },
        team_added: {
          displayName: 'Team Added',
          shortDesc: 'Triggered when a new team is created in a workspace.',
          longDesc: 'Triggered when a new team is created in a workspace.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get teams from',
              longDesc: 'The workspace to get teams from',
            },
          },
          event_info: AsanaEventInfo,
        },
        user_added: {
          displayName: 'User Added',
          shortDesc: 'Triggered when a new user joins a workspace.',
          longDesc: 'Triggered when a new user joins a workspace.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get users from',
              longDesc: 'The workspace to get users from',
            },
          },
          event_info: AsanaEventInfo,
        },
        tag_created: {
          displayName: 'Tag Created',
          shortDesc: 'Triggered when a new tag is created in a workspace.',
          longDesc: 'Triggered when a new tag is created in a workspace.',
          options: {
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get tags from',
              longDesc: 'The workspace to get tags from',
            },
          },
          event_info: AsanaEventInfo,
        },
        task_moved_to_section: {
          displayName: 'Task Moved to Section',
          shortDesc: 'Triggered when a task is moved to a different section within a project.',
          longDesc: 'Triggered when a task is moved to a different section within a project.',
          options: {
            project: {
              displayName: 'Project ID',
              shortDesc: 'The project to look for tasks in',
              longDesc: 'The project to look for tasks in',
            },
            workspace: {
              displayName: 'Workspace ID',
              shortDesc: 'The workspace to get projects from',
              longDesc: 'The workspace to get projects from',
            },
          },
          event_info: AsanaEventInfo,
        },
      },
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
            desc: 'Zendesk User Event Data',
            type: {
              fields: {
                account_id: {
                  displayName: 'Account ID',
                  shortDesc: 'Account ID',
                  longDesc: 'ID of the associated account',
                },
                detail: {
                  displayName: 'Detail',
                  shortDesc: 'User details',
                  longDesc: 'Detailed user information',
                  type: {
                    fields: {
                      created_at: {
                        displayName: 'Created At',
                        shortDesc: 'User creation time',
                        longDesc: 'Timestamp of user creation',
                      },
                      default_group_id: {
                        displayName: 'Default Group ID',
                        shortDesc: 'Default group ID',
                        longDesc: 'ID of the default group for the user',
                      },
                      email: {
                        displayName: 'Email',
                        shortDesc: 'User email',
                        longDesc: 'Email address of the user',
                      },
                      external_id: {
                        displayName: 'External ID',
                        shortDesc: 'User external ID',
                        longDesc: 'External identifier for the user',
                      },
                      id: {
                        displayName: 'User ID',
                        shortDesc: 'User ID',
                        longDesc: 'Unique identifier for the user',
                      },
                      organization_id: {
                        displayName: 'Organization ID',
                        shortDesc: 'Organization ID',
                        longDesc: 'ID of the organization associated with the user',
                      },
                      role: {
                        displayName: 'Role',
                        shortDesc: 'User role',
                        longDesc: 'Role of the user in the system',
                      },
                      updated_at: {
                        displayName: 'Updated At',
                        shortDesc: 'User update time',
                        longDesc: 'Last update timestamp for the user',
                      },
                    },
                  },
                },
                event: {
                  displayName: 'Event',
                  shortDesc: 'Event info',
                  longDesc: 'Additional event information',
                },
                id: {
                  displayName: 'Event ID',
                  shortDesc: 'Event ID',
                  longDesc: 'Unique identifier for the event',
                },
                subject: {
                  displayName: 'Subject',
                  shortDesc: 'Event subject',
                  longDesc: 'Subject of the event',
                },
                time: {
                  displayName: 'Time',
                  shortDesc: 'Event time',
                  longDesc: 'Timestamp of the event occurrence',
                },
                type: {
                  displayName: 'Event Type',
                  shortDesc: 'Event type',
                  longDesc: 'Type of the event',
                },
                zendesk_event_version: {
                  displayName: 'Zendesk Event Version',
                  shortDesc: 'Event version',
                  longDesc: 'Version of the Zendesk event format',
                },
              },
            },
          },
        },
        new_ticket: {
          displayName: 'New Ticket',
          shortDesc: 'Triggers when a new ticket is created',
          longDesc: 'Triggers when a new ticket is created',
          event_info: {
            desc: 'New Ticket Event Data',
            type: {
              fields: {
                assignee_email: {
                  displayName: 'Assignee Email',
                  shortDesc: 'Assignee email',
                  longDesc: 'Email of the assignee',
                },
                assignee_name: {
                  displayName: 'Assignee Name',
                  shortDesc: 'Assignee name',
                  longDesc: 'Name of the assignee',
                },
                group_name: {
                  displayName: 'Group Name',
                  shortDesc: 'Group name',
                  longDesc: 'Name of the group handling the ticket',
                },
                organization_name: {
                  displayName: 'Organization Name',
                  shortDesc: 'Organization name',
                  longDesc: 'Name of the associated organization',
                },
                requester_email: {
                  displayName: 'Requester Email',
                  shortDesc: 'Requester email',
                  longDesc: 'Email of the requester',
                },
                requester_name: {
                  displayName: 'Requester Name',
                  shortDesc: 'Requester name',
                  longDesc: 'Name of the requester',
                },
                tags: {
                  displayName: 'Tags',
                  shortDesc: 'Ticket tags',
                  longDesc: 'Tags associated with the ticket',
                },
                ticket_description: {
                  displayName: 'Ticket Description',
                  shortDesc: 'Ticket description',
                  longDesc: 'Description of the ticket',
                },
                ticket_id: {
                  displayName: 'Ticket ID',
                  shortDesc: 'Ticket ID',
                  longDesc: 'Unique identifier for the ticket',
                },
                ticket_priority: {
                  displayName: 'Ticket Priority',
                  shortDesc: 'Ticket priority',
                  longDesc: 'Priority level of the ticket',
                },
                ticket_status: {
                  displayName: 'Ticket Status',
                  shortDesc: 'Ticket status',
                  longDesc: 'Current status of the ticket',
                },
                ticket_subject: {
                  displayName: 'Ticket Subject',
                  shortDesc: 'Ticket subject',
                  longDesc: 'Subject of the ticket',
                },
                ticket_type: {
                  displayName: 'Ticket Type',
                  shortDesc: 'Ticket type',
                  longDesc: 'Type of the ticket',
                },
                ticket_url: {
                  displayName: 'Ticket URL',
                  shortDesc: 'Ticket URL',
                  longDesc: 'URL of the ticket in the system',
                },
              },
            },
          },
        },
        new_organization: {
          displayName: 'New Organization',
          shortDesc: 'Triggers when a new organization is created',
          longDesc: 'Triggers when a new organization is created',
          event_info: {
            desc: 'Zendesk Organization Event Data',
            type: {
              fields: {
                account_id: {
                  displayName: 'Account ID',
                  shortDesc: 'Account ID',
                  longDesc: 'ID of the associated account',
                },
                detail: {
                  displayName: 'Detail',
                  shortDesc: 'Organization details',
                  longDesc: 'Detailed organization information',
                  type: {
                    fields: {
                      created_at: {
                        displayName: 'Created At',
                        shortDesc: 'Organization creation time',
                        longDesc: 'Timestamp of organization creation',
                      },
                      external_id: {
                        displayName: 'External ID',
                        shortDesc: 'Organization external ID',
                        longDesc: 'External identifier for the organization',
                      },
                      group_id: {
                        displayName: 'Group ID',
                        shortDesc: 'Group ID',
                        longDesc: 'ID of the associated group',
                      },
                      id: {
                        displayName: 'Organization ID',
                        shortDesc: 'Organization ID',
                        longDesc: 'Unique identifier for the organization',
                      },
                      name: {
                        displayName: 'Name',
                        shortDesc: 'Organization name',
                        longDesc: 'Name of the organization',
                      },
                      shared_comments: {
                        displayName: 'Shared Comments',
                        shortDesc: 'Shared comments',
                        longDesc: 'Indicates if comments are shared',
                      },
                      shared_tickets: {
                        displayName: 'Shared Tickets',
                        shortDesc: 'Shared tickets',
                        longDesc: 'Indicates if tickets are shared',
                      },
                      updated_at: {
                        displayName: 'Updated At',
                        shortDesc: 'Organization update time',
                        longDesc: 'Last update timestamp for the organization',
                      },
                    },
                  },
                },
                event: {
                  displayName: 'Event',
                  shortDesc: 'Event info',
                  longDesc: 'Additional event information',
                },
                id: {
                  displayName: 'Event ID',
                  shortDesc: 'Event ID',
                  longDesc: 'Unique identifier for the event',
                },
                subject: {
                  displayName: 'Subject',
                  shortDesc: 'Event subject',
                  longDesc: 'Subject of the event',
                },
                time: {
                  displayName: 'Time',
                  shortDesc: 'Event time',
                  longDesc: 'Timestamp of the event occurrence',
                },
                type: {
                  displayName: 'Event Type',
                  shortDesc: 'Event type',
                  longDesc: 'Type of the event',
                },
                zendesk_event_version: {
                  displayName: 'Zendesk Event Version',
                  shortDesc: 'Event version',
                  longDesc: 'Version of the Zendesk event format',
                },
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
                fields: {
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
                    shortDesc: 'Default group assignment for team members in Zendesk.',
                    longDesc:
                      'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                  },
                  is_public: {
                    displayName: 'Public',
                    shortDesc: 'Public group visibility',
                    longDesc: 'Indicates if the group should be public. Default is true.',
                  },
                  user_ids: {
                    displayName: 'User IDs',
                    shortDesc: 'Users to add to the group',
                    longDesc: 'List of user IDs to be added to the group',
                  },
                },
              },
            },
          },
        },
        UpdateGroup: {
          options: {
            group_id: {
              displayName: 'Group ID',
              shortDesc: 'Group ID',
              longDesc: 'Group ID',
            },
            group: {
              displayName: 'Group',
              shortDesc: 'Group information',
              longDesc: 'Details about the group settings in Zendesk',
              type: {
                fields: {
                  name: {
                    displayName: 'Name',
                    shortDesc: 'Group name',
                    longDesc: 'The name of the group',
                  },
                  description: {
                    displayName: 'Description',
                    shortDesc: 'Group description',
                    longDesc: 'A description of the group',
                  },
                  default: {
                    displayName: 'Default',
                    shortDesc: 'Default group assignment',
                    longDesc:
                      'Team members will automatically be assigned to this group when they’re added to Zendesk. There can only be one default group.',
                  },
                  is_public: {
                    displayName: 'Public',
                    shortDesc: 'Public group visibility',
                    longDesc: 'Indicates whether the group should be public. Default is true.',
                  },
                  user_ids: {
                    displayName: 'User IDs',
                    shortDesc: 'List of user IDs',
                    longDesc: 'The IDs of users to be added to the group',
                  },
                },
              },
            },
          },
        },
        CreateUser: {
          options: {
            user: {
              displayName: 'User',
              shortDesc: 'User information',
              longDesc: 'Details about the user in Zendesk',
              type: {
                fields: {
                  name: {
                    displayName: 'Name',
                    shortDesc: "User's name",
                    longDesc: 'The full name of the user',
                  },
                  email: {
                    displayName: 'Email',
                    shortDesc: "User's email address",
                    longDesc: 'The email address associated with the user',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: "User's phone number",
                    longDesc: 'The phone number associated with the user',
                  },
                  notes: {
                    displayName: 'Notes',
                    shortDesc: 'User notes',
                    longDesc: 'Additional notes or comments about the user',
                  },
                  details: {
                    displayName: 'Details',
                    shortDesc: 'Additional details',
                    longDesc: 'Detailed information about the user',
                  },
                  role: {
                    displayName: 'Role',
                    shortDesc: 'User role',
                    longDesc: 'The role assigned to the user in the system',
                  },
                  organization_ids: {
                    displayName: 'Organization IDs',
                    shortDesc: 'List of organization IDs',
                    longDesc: 'The IDs of the organizations the user is associated with',
                  },
                },
              },
            },
          },
        },
        UpdateUser: {
          options: {
            user: {
              displayName: 'User',
              shortDesc: 'User information',
              longDesc: 'Details about the user in the Zendesk system',
              type: {
                fields: {
                  name: {
                    displayName: 'Name',
                    shortDesc: "User's name",
                    longDesc: 'The full name of the user',
                  },
                  email: {
                    displayName: 'Email',
                    shortDesc: "User's email address",
                    longDesc: 'The email address associated with the user',
                  },
                  phone: {
                    displayName: 'Phone',
                    shortDesc: "User's phone number",
                    longDesc: 'The phone number associated with the user',
                  },
                  notes: {
                    displayName: 'Notes',
                    shortDesc: 'User notes',
                    longDesc: 'Additional notes or comments about the user',
                  },
                  details: {
                    displayName: 'Details',
                    shortDesc: 'Additional details',
                    longDesc: 'Additional detailed information about the user',
                  },
                  role: {
                    displayName: 'Role',
                    shortDesc: 'User role',
                    longDesc: 'The role assigned to the user within the system',
                  },
                  organization_ids: {
                    displayName: 'Organization IDs',
                    shortDesc: 'List of organization IDs',
                    longDesc: 'The IDs of the organizations the user is associated with',
                  },
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
