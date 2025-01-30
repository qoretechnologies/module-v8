import type { BaseTranslation } from '../i18n-types';
import { AsanaEventInfo } from './asana/event-info';
import { StripeTriggerOptionsEn } from './stripe/trigger-options';

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
      shortDesc: 'Collection of actions to interact with the Notion API',
      longDesc: 'Collection of actions to interact with the Notion API',
      triggers: {
        new_database_item: {
          displayName: 'New Database Item',
          shortDesc: 'Triggers when a new item is added to a database',
          longDesc: 'Triggers when a new item is added to a database',
          options: {
            databaseId: {
              displayName: 'Database ID',
              shortDesc: 'The ID of the database to watch for new items',
              longDesc: 'The ID of the database to watch for new items',
            },
          },
          event_info: {
            desc: 'Notion New Database Item Event Info',
          },
        },
        updated_database_item: {
          displayName: 'Updated Database Item',
          shortDesc: 'Triggers when an item in a database is updated',
          longDesc: 'Triggers when an item in a database is updated',
          options: {
            databaseId: {
              displayName: 'Database ID',
              shortDesc: 'The ID of the database to watch for updates',
              longDesc: 'The ID of the database to watch for updates',
            },
          },
          event_info: {
            desc: 'Notion Updated Database Item Event Info',
          },
        },
        updated_page: {
          displayName: 'Updated Page',
          shortDesc: 'Triggers when a page is updated',
          longDesc: 'Triggers when a page is updated',
          options: {
            pageId: {
              displayName: 'Page ID',
              shortDesc: 'The ID of the page to watch for updates',
              longDesc: 'The ID of the page to watch for updates',
            },
          },
          event_info: {
            desc: 'Notion Page Updated Event Info',
          },
        },
      },
    },
    Jira: {
      displayName: 'Jira',
      shortDesc: 'Collection of actions to interact with the Jira API',
      longDesc: 'Collection of actions to interact with the Jira API',
      triggers: {
        issue_created: {
          displayName: 'New Issue',
          shortDesc: 'Triggers when a new issue is created',
          longDesc: 'Triggers when a new issue is created',
          options: {
            project: {
              displayName: 'Project',
              shortDesc: 'The project to watch for new issues',
              longDesc: 'The project to watch for new issues',
            },
          },
        },
        issue_updated: {
          displayName: 'Updated Issue',
          shortDesc: 'Triggers when an issue is updated',
          longDesc: 'Triggers when an issue is updated',
          options: {
            project: {
              displayName: 'Project',
              shortDesc: 'The project to watch for updated issues',
              longDesc: 'The project to watch for updated issues',
            },
          },
        },
        project_created: {
          displayName: 'New Project',
          shortDesc: 'Triggers when a new project is created',
          longDesc: 'Triggers when a new project is created',
        },
      },
    },
    Stripe: {
      displayName: 'Stripe',
      shortDesc: 'Collection of actions to interact with the Stripe API',
      longDesc: 'Collection of actions to interact with the Stripe API',
      triggers: {
        charge_dispute_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'New Charge Dispute',
          shortDesc: 'Triggers when a dispute is created for a previously made charge.',
          longDesc:
            'This trigger fires whenever a customer initiates a dispute (also known as a chargeback) against a completed charge. You can use this to respond promptly, provide evidence, or communicate with the customer regarding the disputed charge.',
          event_info: {
            desc: 'Provides details about the newly created dispute, including the reason, amount, and any relevant metadata.',
          },
        },
        charge_refunded: {
          options: StripeTriggerOptionsEn,
          displayName: 'Charge Refunded',
          shortDesc: 'Triggers when an existing charge is fully or partially refunded.',
          longDesc:
            'This trigger fires whenever you issue a refund to a customer for a previously successful charge. It includes information about the refunded amount, the original charge details, and the refund reason.',
          event_info: {
            desc: 'Contains refund details, including the refunded amount, the source charge, and the timestamp of the refund.',
          },
        },
        charge_succeeded: {
          options: StripeTriggerOptionsEn,
          displayName: 'Charge Succeeded',
          shortDesc: 'Triggers when a new charge is successfully completed.',
          longDesc:
            'This trigger fires whenever a payment charge is successfully processed, typically following a card payment or another supported payment method. Use this event to fulfill orders, send confirmations, or update your internal records.',
          event_info: {
            desc: 'Includes details about the successful charge, such as the amount, payment method, and associated customer or order data.',
          },
        },
        checkout_session_completed: {
          options: StripeTriggerOptionsEn,
          displayName: 'Checkout Session Completed',
          shortDesc:
            'Triggers when a Stripe Checkout session is finalized and the payment is successful.',
          longDesc:
            "This trigger fires after a customer completes the entire Stripe Checkout flow, including any required payment steps. It's ideal for finalizing orders, sending receipts, and granting access to purchased products or services.",
          event_info: {
            desc: 'Provides information about the completed checkout session, including the purchased items, total amount, and customer details.',
          },
        },
        customer_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Customer Created',
          shortDesc: 'Triggers when a new customer record is added to your Stripe account.',
          longDesc:
            'This trigger fires whenever a new customer is created, either through your website, the Stripe dashboard, or via the API. You can use this event to start onboarding processes, welcome emails, or custom CRM integrations.',
          event_info: {
            desc: 'Contains details of the newly created customer, such as their email address, billing information, and associated metadata.',
          },
        },
        invoice_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Invoice Created',
          shortDesc: 'Triggers when a new invoice is generated.',
          longDesc:
            "This trigger fires whenever an invoice is created, either automatically as part of a recurring billing cycle or manually. It's useful for sending invoice notifications, updating financial systems, or automating payment reminders.",
          event_info: {
            desc: 'Provides the full invoice object, including line items, amounts due, currency, and related customer information.',
          },
        },
        invoice_payment_failed: {
          options: StripeTriggerOptionsEn,
          displayName: 'Invoice Payment Failed',
          shortDesc: 'Triggers when an attempt to pay an invoice fails.',
          longDesc:
            'This trigger fires whenever Stripe attempts to charge a customer for an invoice and the payment is declined or otherwise fails. Use it to send payment failure notices, prompt customers to update their payment methods, or pause services until payment is resolved.',
          event_info: {
            desc: 'Includes details about the failed payment attempt, such as the invoice amount, payment method, and the reason for failure.',
          },
        },

        payment_intent_failed: {
          options: StripeTriggerOptionsEn,
          displayName: 'Payment Intent Failed',
          shortDesc: 'Triggers when a Payment Intent cannot be completed successfully.',
          longDesc:
            'This event fires when a Payment Intent—created to handle dynamic payment flows—ultimately fails, for example, due to insufficient funds, authentication failures, or timeouts. Use this to notify customers of payment issues or prompt them to try another payment method.',
          event_info: {
            desc: 'Includes details about the failed Payment Intent, such as the amount, currency, payment method attempts, and the reason for failure.',
          },
        },
        payment_intent_succeeded: {
          options: StripeTriggerOptionsEn,
          displayName: 'Payment Intent Succeeded',
          shortDesc: 'Triggers when a Payment Intent successfully completes, confirming payment.',
          longDesc:
            'This trigger fires when a Payment Intent transitions to a successful state, indicating that funds are captured or confirmed. Use it to fulfill orders, update your internal systems, or send customers confirmation messages.',
          event_info: {
            desc: 'Provides comprehensive details about the successful Payment Intent, including payment amount, method, customer details, and associated metadata.',
          },
        },
        payment_link_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Payment Link Created',
          shortDesc: 'Triggers when a new Payment Link is created.',
          longDesc:
            'This trigger fires whenever you create a Payment Link, which provides a hosted payment page that customers can use to pay for a product or service. You can use this event to track link creation, automate sharing, or log link details in your CRM.',
          event_info: {
            desc: 'Contains information about the new Payment Link, including URL, product details, and associated pricing configurations.',
          },
        },
        subscription_canceled: {
          options: StripeTriggerOptionsEn,
          displayName: 'Subscription Canceled',
          shortDesc: 'Triggers when an active subscription is canceled.',
          longDesc:
            'This event fires whenever a subscription is canceled, whether by the customer, via API, or due to an automatic cancellation (e.g., payment failures). Use it to adjust service access, send account closure notices, or offer re-subscription incentives.',
          event_info: {
            desc: 'Provides details about the canceled subscription, such as the cancellation reason, effective end date, and any prorated refunds.',
          },
        },
        subscription_created: {
          options: StripeTriggerOptionsEn,
          displayName: 'Subscription Created',
          shortDesc: 'Triggers when a new subscription is successfully created.',
          longDesc:
            'This event fires whenever a customer starts a new subscription, either by signing up for a plan or adding a subscription product. Use it to onboard new subscribers, grant access to services, or send a welcome message.',
          event_info: {
            desc: 'Includes details about the newly created subscription, including plan information, start date, and billing cycle details.',
          },
        },
        subscription_updated: {
          options: StripeTriggerOptionsEn,
          displayName: 'Subscription Updated',
          shortDesc: 'Triggers when a subscription’s details change.',
          longDesc:
            'This event fires whenever a subscription’s parameters are updated. For example, a change in the billing cycle, swapping a plan, adding or removing products, or modifying payment settings. Use it to keep your internal records accurate, send notifications about plan changes, or adjust service access levels.',
          event_info: {
            desc: 'Provides the updated subscription object, highlighting changes such as plan modifications, trial adjustments, or updated billing details.',
          },
        },
      },
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
      shortDesc: 'Collection of actions to interact with the Github API',
      longDesc: 'Collection of actions to interact with the Github API',
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
        new_repository_branch: {
          displayName: 'New Repository Branch',
          shortDesc: 'Triggers when a new branch is created in a repository',
          longDesc: 'Triggers when a new branch is created in a repository',
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
        },
        new_commit_comment: {
          displayName: 'New Commit Comment',
          shortDesc: 'Triggers when a new comment is added to a commit',
          longDesc: 'Triggers when a new comment is added to a commit',
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
        },
        new_commit: {
          displayName: 'New Commit',
          shortDesc: 'Triggers when a new commit is pushed to a repository',
          longDesc: 'Triggers when a new commit is pushed to a repository',
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
        },
        new_pull_request: {
          displayName: 'New Pull Request',
          shortDesc: 'Triggers when a new pull request is opened',
          longDesc: 'Triggers when a new pull request is opened',
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
        },
        new_release: {
          displayName: 'New Release',
          shortDesc: 'Triggers when a new release is published',
          longDesc: 'Triggers when a new release is published',
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
        },
        new_review_request: {
          displayName: 'New Review Request',
          shortDesc: 'Triggers when a new review is requested',
          longDesc: 'Triggers when a new review is requested',
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
        },
      },
    },
    Asana: {
      displayName: 'Asana',
      shortDesc: 'Collection of actions to interact with the Asana API',
      longDesc: 'Collection of actions to interact with the Asana API',
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
            task: {
              displayName: 'Task ID',
              shortDesc: 'The task to look for subtasks in',
              longDesc: 'The task to look for subtasks in',
            },
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
      shortDesc: 'Collection of actions to interact with the Docusign eSignature API',
      longDesc: 'Collection of actions to interact with the Docusign eSignature API',
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
      triggers: {
        envelope_status_updated: {
          displayName: 'Envelope Status Updated',
          shortDesc: `Triggers whenever a DocuSign envelope's status or properties are updated, including events like it being sent, delivered, signed, completed, declined, voided, corrected, purged, or deleted.`,
          longDesc:
            'This trigger activates whenever there’s a change in a DocuSign envelope’s lifecycle. It listens for a variety of updates, such as when an envelope is sent to recipients, delivered, signed, completed, or declined. It also includes administrative events like envelopes being resent, corrected, purged, deleted, discarded, newly created, or removed. By setting up this trigger, you can stay informed of envelope progress and status changes, enabling timely follow-ups, record-keeping, or other automated actions in your workflow.',
          options: {
            accountId: {
              displayName: 'Default Account ID',
              shortDesc: 'The default account ID set when the connection is authorized',
              longDesc: 'The default account ID set when the connection is authorized',
            },
          },
          event_info: {
            desc: 'DocuSign envelope status update event data',
          },
        },
        template_updated: {
          displayName: 'Template Updated',
          shortDesc: `Triggers whenever a new DocuSign template is created, updated or deleted, allowing you to take immediate action in response to the new template.`,
          options: {
            accountId: {
              displayName: 'Default Account ID',
              shortDesc: 'The default account ID set when the connection is authorized',
              longDesc: 'The default account ID set when the connection is authorized',
            },
          },
          event_info: {
            desc: 'DocuSign template update event data',
          },
        },
      },
    },
    Zendesk: {
      displayName: 'Zendesk',
      shortDesc: 'Collection of actions to interact with the Zendesk API',
      longDesc: 'Collection of actions to interact with the Zendesk API',
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
      shortDesc: 'Collection of actions to interact with the Hubspot API',
      longDesc: 'Collection of actions to interact with the Hubspot API',
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
    Dropbox: {
      displayName: 'Dropbox',
      shortDesc:
        'A cloud storage service that lets you save files online and sync them to your devices.',
      longDesc:
        'Dropbox is a cloud-based file storage solution that allows users to store and share files and folders with others across the internet using file synchronization. It offers features like file sharing, collaboration, and access from multiple devices.',
      triggers: {
        new_file_in_folder: {
          displayName: 'New File in Folder',
          shortDesc: 'Triggers when a new file is added to a specified folder.',
          longDesc: 'This trigger fires every time a new file is saved in the folder you specify.',
          options: {
            folder: {
              displayName: 'Folder Path',
              shortDesc: 'The path to the folder to monitor for new files.',
              longDesc: 'Specify the path to the folder you want to monitor for new files. ',
            },
          },
        },
      },
    },
    NetSuite: {
      displayName: 'NetSuite',
      shortDesc: 'A comprehensive suite of cloud-based business management solutions.',
      longDesc:
        'NetSuite offers a unified platform for ERP, CRM, e-commerce, and more, enabling businesses to manage all key operations in a single system.',
      triggers: {
        new_record: {
          displayName: 'New Record',
          shortDesc: 'Triggers when a new record is created',
          longDesc: 'Triggers when a new record is created',
          options: {
            recordType: {
              displayName: 'Record Type',
              shortDesc: 'The type of record to monitor',
              longDesc: 'The type of record to monitor',
            },
          },
        },
      },
      actions: {
        suite_ql: {
          displayName: 'SuiteQL',
          shortDesc: 'Run a SuiteQL query',
          longDesc: 'Run a SuiteQL query',
          options: {
            query: {
              displayName: 'Query',
              shortDesc: 'The SuiteQL query to run',
              longDesc: 'The SuiteQL query to run',
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'The maximum number of records to return',
              longDesc: 'The maximum number of records to return',
            },
            offset: {
              displayName: 'Offset',
              shortDesc: 'The number of records to skip',
              longDesc: 'The number of records to skip',
            },
            response_type: {
              fields: {
                links: {
                  display_name: 'Links',
                  short_desc: 'Links',
                  desc: 'Links',
                },
                count: {
                  display_name: 'Count',
                  short_desc: 'The number of results',
                  desc: 'The number of results',
                },
                hasMore: {
                  display_name: 'Has More',
                  short_desc: 'Whether there are more results',
                  desc: 'Whether there are more results',
                },
                items: {
                  display_name: 'Items',
                  short_desc: 'The items',
                  desc: 'The items',
                },
              },
            },
          },
        },
        account_get: {
          displayName: 'Get List of Accounts',
          shortDesc: 'Retrieve a list of accounts.',
          longDesc: 'Fetches a list of accounts based on specified filters.',
        },
        account_post: {
          displayName: 'Create Account',
          shortDesc: 'Creates a new account.',
          longDesc: 'Allows the user to create a new account record in NetSuite.',
        },
        account_id_get: {
          displayName: 'Get Account',
          shortDesc: 'Retrieve details of a specific account.',
          longDesc: 'Fetches detailed information of a single account by its ID.',
        },
        account_id_patch: {
          displayName: 'Update Account',
          shortDesc: 'Updates an existing account.',
          longDesc: 'Allows the user to update details of a specific account by its ID.',
        },
        account_id_delete: {
          displayName: 'Delete Account',
          shortDesc: 'Deletes a specific account.',
          longDesc: 'Removes an account record from NetSuite based on its ID.',
        },
        customer_get: {
          displayName: 'Get List of Customers',
          shortDesc: 'Retrieve a list of customers.',
          longDesc: 'Fetches a list of customers based on specified filters.',
        },
        customer_post: {
          displayName: 'Create Customer',
          shortDesc: 'Creates a new customer.',
          longDesc: 'Allows the user to create a new customer record in NetSuite.',
        },
        customer_id_get: {
          displayName: 'Get Customer',
          shortDesc: 'Retrieve details of a specific customer.',
          longDesc: 'Fetches detailed information of a single customer by its ID.',
        },
        customer_id_patch: {
          displayName: 'Update Customer',
          shortDesc: 'Updates an existing customer.',
          longDesc: 'Allows the user to update details of a specific customer by its ID.',
        },
        customer_id_delete: {
          displayName: 'Delete Customer',
          shortDesc: 'Deletes a specific customer.',
          longDesc: 'Removes a customer record from NetSuite based on its ID.',
        },
        invoice_get: {
          displayName: 'Get List of Invoices',
          shortDesc: 'Retrieve a list of invoices.',
          longDesc: 'Fetches a list of invoices based on specified filters.',
        },
        invoice_post: {
          displayName: 'Create Invoice',
          shortDesc: 'Creates a new invoice.',
          longDesc: 'Allows the user to create a new invoice record in NetSuite.',
        },
        invoice_id_get: {
          displayName: 'Get Invoice',
          shortDesc: 'Retrieve details of a specific invoice.',
          longDesc: 'Fetches detailed information of a single invoice by its ID.',
        },
        invoice_id_patch: {
          displayName: 'Update Invoice',
          shortDesc: 'Updates an existing invoice.',
          longDesc: 'Allows the user to update details of a specific invoice by its ID.',
        },
        invoice_id_delete: {
          displayName: 'Delete Invoice',
          shortDesc: 'Deletes a specific invoice.',
          longDesc: 'Removes an invoice record from NetSuite based on its ID.',
        },
        journalEntry_get: {
          displayName: 'Get List of Journal Entries',
          shortDesc: 'Retrieve a list of journal entries.',
          longDesc: 'Fetches a list of journal entries based on specified filters.',
        },
        journalEntry_post: {
          displayName: 'Create Journal Entry',
          shortDesc: 'Creates a new journal entry.',
          longDesc: 'Allows the user to create a new journal entry record in NetSuite.',
        },
        journalEntry_id_get: {
          displayName: 'Get Journal Entry',
          shortDesc: 'Retrieve details of a specific journal entry.',
          longDesc: 'Fetches detailed information of a single journal entry by its ID.',
        },
        journal_entry_id_patch: {
          displayName: 'Update Journal Entry',
          shortDesc: 'Updates an existing journal entry.',
          longDesc: 'Allows the user to update details of a specific journal entry by its ID.',
        },
        journalEntry_id_delete: {
          displayName: 'Delete Journal Entry',
          shortDesc: 'Deletes a specific journal entry.',
          longDesc: 'Removes a journal entry record from NetSuite based on its ID.',
        },
        purchaseOrder_get: {
          displayName: 'Get List of Purchase Orders',
          shortDesc: 'Retrieve a list of purchase orders.',
          longDesc: 'Fetches a list of purchase orders based on specified filters.',
        },
        purchase_order_post: {
          displayName: 'Create Purchase Order',
          shortDesc: 'Creates a new purchase order.',
          longDesc: 'Allows the user to create a new purchase order record in NetSuite.',
        },
        purchaseOrder_id_get: {
          displayName: 'Get Purchase Order',
          shortDesc: 'Retrieve details of a specific purchase order.',
          longDesc: 'Fetches detailed information of a single purchase order by its ID.',
        },
        purchaseOrder_id_patch: {
          displayName: 'Update Purchase Order',
          shortDesc: 'Updates an existing purchase order.',
          longDesc: 'Allows the user to update details of a specific purchase order by its ID.',
        },
        purchaseOrder_id_delete: {
          displayName: 'Delete Purchase Order',
          shortDesc: 'Deletes a specific purchase order.',
          longDesc: 'Removes a purchase order record from NetSuite based on its ID.',
        },
        salesOrder_get: {
          displayName: 'Get List of Sales Orders',
          shortDesc: 'Retrieve a list of sales orders.',
          longDesc: 'Fetches a list of sales orders based on specified filters.',
        },
        salesOrder_post: {
          displayName: 'Create Sales Order',
          shortDesc: 'Creates a new sales order.',
          longDesc: 'Allows the user to create a new sales order record in NetSuite.',
        },
        salesOrder_id_get: {
          displayName: 'Get Sales Order',
          shortDesc: 'Retrieve details of a specific sales order.',
          longDesc: 'Fetches detailed information of a single sales order by its ID.',
        },
        salesOrder_id_patch: {
          displayName: 'Update Sales Order',
          shortDesc: 'Updates an existing sales order.',
          longDesc: 'Allows the user to update details of a specific sales order by its ID.',
        },
        salesOrder_id_delete: {
          displayName: 'Delete Sales Order',
          shortDesc: 'Deletes a specific sales order.',
          longDesc: 'Removes a sales order record from NetSuite based on its ID.',
        },
        vendor_get: {
          displayName: 'Get List of Vendors',
          shortDesc: 'Retrieve a list of vendors.',
          longDesc: 'Fetches a list of vendors based on specified filters.',
        },
        vendor_post: {
          displayName: 'Create Vendor',
          shortDesc: 'Creates a new vendor.',
          longDesc: 'Allows the user to create a new vendor record in NetSuite.',
        },
        vendor_id_get: {
          displayName: 'Get Vendor',
          shortDesc: 'Retrieve details of a specific vendor.',
          longDesc: 'Fetches detailed information of a single vendor by its ID.',
        },
        vendor_id_patch: {
          displayName: 'Update Vendor',
          shortDesc: 'Updates an existing vendor.',
          longDesc: 'Allows the user to update details of a specific vendor by its ID.',
        },
        vendor_id_delete: {
          displayName: 'Delete Vendor',
          shortDesc: 'Deletes a specific vendor.',
          longDesc: 'Removes a vendor record from NetSuite based on its ID.',
        },
      },
    },
    Salesforce: {
      triggers: {
        new_record_trigger: {
          displayName: 'New Record Trigger',
          shortDesc: 'Triggers when a new record is created in the specified object.',
          longDesc:
            'This trigger fires whenever a new record is created in a specified Salesforce object. You can configure the object type to target specific record types, such as Leads, Contacts, or custom objects. It is useful for automating workflows triggered by record creation.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Salesforce object to monitor for new records.',
              longDesc:
                'Select the Salesforce object (e.g., Lead, Account, Contact) where this trigger will monitor for newly created records.',
            },
          },
          event_info: {
            desc: 'Fires when a new record is created in the specified Salesforce object.',
          },
        },
        new_contact_trigger: {
          displayName: 'New Contact Trigger',
          shortDesc: 'Triggers when a new Contact record is created.',
          longDesc:
            'This trigger fires whenever a new Contact record is created in Salesforce. It is ideal for automating workflows such as contact notifications, integrations, or CRM updates.',
          event_info: {
            desc: 'Fires when a new Contact record is created in Salesforce.',
          },
        },
        new_lead_trigger: {
          displayName: 'New Lead Trigger',
          shortDesc: 'Triggers when a new Lead record is created.',
          longDesc:
            'This trigger activates whenever a new Lead record is created in Salesforce. It is commonly used for workflows related to lead generation, qualification, or assignment.',
          event_info: {
            desc: 'Fires when a new Lead record is created in Salesforce.',
          },
        },
        updated_record_trigger: {
          displayName: 'Updated Record Trigger',
          shortDesc: 'Triggers when an existing record is updated.',
          longDesc:
            'This trigger fires whenever an existing record in a specified Salesforce object is updated. It is useful for workflows that depend on changes to specific fields or records, such as updating downstream systems or notifying users of record changes.',
          options: {
            object: {
              displayName: 'Object Type',
              shortDesc: 'The Salesforce object to monitor for updates.',
              longDesc:
                'Specify the Salesforce object (e.g., Opportunity, Contact, or custom objects) where this trigger will monitor for record updates.',
            },
          },
          event_info: {
            desc: 'Fires when a record in the specified Salesforce object is updated.',
          },
        },
      },
    },
    Freshdesk: {
      displayName: 'Freshdesk',
      shortDesc: 'Cloud-based customer support software',
      longDesc:
        'Freshdesk is a cloud-based customer support platform that was founded with the mission of enabling companies of all sizes to provide great customer service. Our goal is simple: make it easy for brands to talk to their customers and make it easy for users to get in touch with businesses.',
    },
  },
} satisfies BaseTranslation;

export default en;
