import type { BaseTranslation } from '../i18n-types';
import { AsanaEventInfo } from './asana/event-info';
import { HubspotAssociationsEn } from './hubspot/associations';
import { HubspotTriggerOptionsEn } from './hubspot/trigger-options';
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
    Hubspot: {
      displayName: 'HubSpot',
      shortDesc:
        'Seamlessly connect to the HubSpot API to automate and streamline your CRM processes.',
      longDesc:
        'The HubSpot integration provides a comprehensive collection of actions and triggers to interact with the HubSpot API. Whether you need to manage companies, contacts, deals, or custom objects, this integration simplifies your workflow automation and CRM management.',
      actions: {
        'post-crm-v3-objects-companies-batch-upsert_upsert': {
          displayName: 'Create Or Update Companies',
          shortDesc: 'Create or update multiple companies',
        },
        'get-crm-v3-objects-contacts': {
          displayName: 'List Contacts',
          shortDesc: 'Retrieve a list of contacts',
        },
        'post-crm-v3-objects-contacts': {
          displayName: 'Create Contact',
          shortDesc: 'Create a new contact',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-contacts-search': {
          displayName: 'Search Contacts',
          shortDesc: 'Search for contacts based on specific criteria',
          longDesc: 'Search for contacts based on specific criteria',
        },
        'delete-crm-v3-objects-contacts-contactId': {
          displayName: 'Delete Contact',
          shortDesc: 'Soft delete a selected contact',
        },
        'get-crm-v3-objects-contacts-contactId': {
          displayName: 'Retrieve Contact',
          shortDesc: 'Retrieve a specific contact',
        },
        'patch-crm-v3-objects-contacts-contactId': {
          displayName: 'Update Contact',
          shortDesc: 'Update an existing contact',
        },
        'get-crm-v3-objects-objectType_getPage': {
          displayName: 'List Custom Objects',
          shortDesc: 'Retrieve a list of selected custom objects',
        },
        'post-crm-v3-objects-objectType_create': {
          displayName: 'Create Custom Object',
          shortDesc: 'Create a new custom object of a selected type',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-objectType-batch-upsert': {
          displayName: 'Create Or Update Custom Objects',
        },
        'post-crm-v3-objects-objectType-search_doSearch': {
          displayName: 'Search Custom Objects',
          shortDesc: 'Search for custom objects based on specific criteria',
          longDesc: 'Search for custom objects based on specific criteria',
        },
        'delete-crm-v3-objects-objectType-objectId_archive': {
          displayName: 'Delete Custom Object',
          shortDesc: 'Soft delete a selected custom object',
        },
        'get-crm-v3-objects-objectType-objectId_getById': {
          displayName: 'Retrieve Custom Object',
          shortDesc: 'Retrieve a specific custom object',
        },
        'patch-crm-v3-objects-objectType-objectId_update': {
          displayName: 'Update Custom Object',
          shortDesc: 'Update an existing custom object',
        },
        'get-crm-v3-objects-deals_getPage': {
          displayName: 'List Deals',
          shortDesc: 'Retrieve a list of deals',
        },
        'post-crm-v3-objects-deals_create': {
          displayName: 'Create Deal',
          shortDesc: 'Create a new deal',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-deals-batch-upsert_upsert': {
          displayName: 'Create Or Update Deals',
        },
        'post-crm-v3-objects-deals-search_doSearch': {
          displayName: 'Search Deals',
          shortDesc: 'Search for deals based on specific criteria',
          longDesc: 'Search for deals based on specific criteria',
        },
        'delete-crm-v3-objects-deals-dealId_archive': {
          displayName: 'Delete a Deal',
          shortDesc: 'Soft delete a selected deal',
        },
        'get-crm-v3-objects-deals-dealId_getById': {
          displayName: 'Retrieve Deal',
          shortDesc: 'Retrieve a specific deal',
        },
        'patch-crm-v3-objects-deals-dealId_update': {
          displayName: 'Update Deal',
          shortDesc: 'Update an existing deal',
        },
        'get-crm-v3-objects-leads_getPage': {
          displayName: 'List Leads',
          shortDesc: 'Retrieve a list of leads',
        },
        'post-crm-v3-objects-leads_create': {
          displayName: 'Create Lead',
          shortDesc: 'Create a new lead',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-leads-batch-upsert_upsert': {
          displayName: 'Create Or Update Leads',
        },
        'post-crm-v3-objects-leads-search_doSearch': {
          displayName: 'Search Leads',
          shortDesc: 'Search for leads based on specific criteria',
          longDesc: 'Search for leads based on specific criteria',
        },
        'delete-crm-v3-objects-leads-leadsId_archive': {
          displayName: 'Delete Lead',
          shortDesc: 'Soft delete a selected lead',
        },
        'get-crm-v3-objects-leads-leadsId_getById': {
          displayName: 'Retrieve Lead',
          shortDesc: 'Retrieve a specific lead',
        },
        'patch-crm-v3-objects-leads-leadsId_update': {
          displayName: 'Update Lead',
          shortDesc: 'Update an existing lead',
        },
        'get-crm-v3-objects-products_getPage': {
          displayName: 'List Products',
          shortDesc: 'Retrieve a list of products',
        },
        'post-crm-v3-objects-products_create': {
          displayName: 'Create Product',
          shortDesc: 'Create a new product',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-products-batch-upsert_upsert': {
          displayName: 'Create Or Update Products',
        },
        'post-crm-v3-objects-products-search_doSearch': {
          displayName: 'Search Products',
          shortDesc: 'Search for products based on specific criteria',
          longDesc: 'Search for products based on specific criteria',
        },
        'delete-crm-v3-objects-products-productId_archive': {
          displayName: 'Delete Product',
          shortDesc: 'Soft delete a selected product',
        },
        'get-crm-v3-objects-products-productId_getById': {
          displayName: 'Retrieve Product',
          shortDesc: 'Retrieve a specific product',
        },
        'patch-crm-v3-objects-products-productId_update': {
          displayName: 'Update Product',
          shortDesc: 'Update an existing product',
        },
        'get-crm-v3-objects-tickets_getPage': {
          displayName: 'List Tickets',
          shortDesc: 'Retrieve a list of tickets',
        },
        'post-crm-v3-objects-tickets_create': {
          displayName: 'Create Ticket',
          shortDesc: 'Create a new ticket',
          options: {
            associations: HubspotAssociationsEn,
          },
        },
        'post-crm-v3-objects-tickets-batch-upsert_upsert': {
          displayName: 'Create Or Update Tickets',
        },
        'post-crm-v3-objects-tickets-search_doSearch': {
          displayName: 'Search Tickets',
          shortDesc: 'Search for tickets based on specific criteria',
          longDesc: 'Search for tickets based on specific criteria',
        },
        'delete-crm-v3-objects-tickets-ticketId_archive': {
          displayName: 'Delete Ticket',
          shortDesc: 'Soft delete a selected ticket',
        },
        'get-crm-v3-objects-tickets-ticketId_getById': {
          displayName: 'Retrieve Ticket',
          shortDesc: 'Retrieve a specific ticket',
        },
        'patch-crm-v3-objects-tickets-ticketId_update': {
          displayName: 'Update Ticket',
          shortDesc: 'Update an existing ticket',
        },
        'get-crm-v3-objects-users': {
          displayName: 'List Users',
          shortDesc: 'Retrieve a list of users',
        },
        'post-crm-v3-objects-users-batch-upsert': {
          displayName: 'Create Or Update Users',
        },
        'post-crm-v3-objects-users-search': {
          displayName: 'Search Users',
          shortDesc: 'Search for users based on specific criteria',
          longDesc: 'Search for users based on specific criteria',
        },
        'get-crm-v3-objects-users-userId': {
          displayName: 'Retrieve User',
          shortDesc: 'Retrieve a specific user',
        },
        'patch-crm-v3-objects-users-userId': {
          displayName: 'Update User',
          shortDesc: 'Update an existing user',
        },
      },
      triggers: {
        hubspot_company_created_or_updated_trigger: {
          event_info: {
            desc: 'Company Information',
          },
          displayName: 'Company Created or Updated',
          shortDesc: 'Triggers when a company is added or updated in HubSpot.',
          longDesc:
            'This trigger activates whenever a company record is created or modified in HubSpot, enabling you to automate workflows based on company data changes.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_contact_created_or_updated_trigger: {
          event_info: {
            desc: 'Contact Information',
          },
          displayName: 'Contact Created or Updated',
          shortDesc: 'Triggers when a contact is added or updated in HubSpot.',
          longDesc:
            'Activate workflows whenever a new contact is created or an existing contact is updated within HubSpot. Ideal for managing customer information efficiently.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_custom_object_created_or_updated_trigger: {
          event_info: {
            desc: 'Custom Object Information',
          },
          displayName: 'Custom Object Created or Updated',
          shortDesc: 'Triggers when a custom object is added or updated in HubSpot.',
          longDesc:
            'Use this trigger to capture changes to custom objects in HubSpot, ensuring that updates to custom data structures are processed immediately for automation or integration.',
          options: {
            ...HubspotTriggerOptionsEn,
            object: {
              displayName: 'Object',
              shortDesc: 'The custom object to monitor for changes.',
              longDesc: 'Select the custom object you want to monitor for new or updated records.',
            },
          },
        },
        hubspot_deal_created_or_updated_trigger: {
          event_info: {
            desc: 'Deal Information',
          },
          displayName: 'Deal Created or Updated',
          shortDesc: 'Triggers when a deal is created or updated in HubSpot.',
          longDesc:
            'This trigger fires when a deal is created or modified in HubSpot, allowing you to track sales opportunities and integrate with your sales pipeline automation workflows.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_lead_created_or_updated_trigger: {
          event_info: {
            desc: 'Lead Information',
          },
          displayName: 'Lead Created or Updated',
          shortDesc: 'Triggers when a lead is added or updated in HubSpot.',
          longDesc:
            'Monitor new leads and updates to existing leads in HubSpot with this trigger, enabling efficient lead management and follow-up processes.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_product_created_or_updated_trigger: {
          event_info: {
            desc: 'Product Information',
          },
          displayName: 'Product Created or Updated',
          shortDesc: 'Triggers when a product is added or updated in HubSpot.',
          longDesc:
            'This trigger alerts you to any new or updated products within your HubSpot account, ensuring that your product data remains synchronized with your workflows and external systems.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_ticket_created_or_updated_trigger: {
          event_info: {
            desc: 'Ticket Information',
          },
          displayName: 'Ticket Created or Updated',
          shortDesc: 'Triggers when a support ticket is created or updated in HubSpot.',
          longDesc:
            'Automatically trigger workflows when a support ticket is created or updated in HubSpot, ideal for managing customer support operations and streamlining issue resolution.',
          options: HubspotTriggerOptionsEn,
        },
        hubspot_user_created_or_updated_trigger: {
          event_info: {
            desc: 'User Information',
          },
          displayName: 'User Created or Updated',
          shortDesc: 'Triggers when a user is added or updated in HubSpot.',
          longDesc:
            'This trigger fires upon the creation or update of a user within HubSpot, helping you keep track of user accounts and maintain updated access control for your team.',
          options: HubspotTriggerOptionsEn,
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
          displayName: 'New Record',
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
          displayName: 'New Contact',
          shortDesc: 'Triggers when a new Contact record is created.',
          longDesc:
            'This trigger fires whenever a new Contact record is created in Salesforce. It is ideal for automating workflows such as contact notifications, integrations, or CRM updates.',
          event_info: {
            desc: 'Fires when a new Contact record is created in Salesforce.',
          },
        },
        new_lead_trigger: {
          displayName: 'New Lead',
          shortDesc: 'Triggers when a new Lead record is created.',
          longDesc:
            'This trigger activates whenever a new Lead record is created in Salesforce. It is commonly used for workflows related to lead generation, qualification, or assignment.',
          event_info: {
            desc: 'Fires when a new Lead record is created in Salesforce.',
          },
        },
        updated_record_trigger: {
          displayName: 'Updated Record',
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
      triggers: {
        new_ticket_trigger: {
          displayName: 'New Ticket',
          shortDesc: 'Triggers when a new ticket is created in Freshdesk.',
          longDesc:
            'Fires whenever a new ticket is created in your Freshdesk instance. You can capture details such as subject, description, priority, and more, and use this data in subsequent actions or notifications.',
          options: {
            ticketStatus: {
              displayName: 'Ticket Status Filter',
              shortDesc: 'Filters by ticket status',
              longDesc:
                'Restrict or filter the trigger to only fire for tickets matching a certain status (e.g. Open, Pending, Resolved, etc.).',
            },
            ticketPriority: {
              displayName: 'Ticket Priority Filter',
              shortDesc: 'Filters by ticket priority',
              longDesc:
                'Restrict or filter the trigger to only fire for tickets matching a certain priority (e.g. Low, Medium, High).',
            },
          },
          event_info: {
            desc: 'Structure and types for Freshdesk’s new ticket data payload.',
          },
        },

        new_contact_trigger: {
          displayName: 'New Contact',
          shortDesc: 'Triggers when a new contact is created in Freshdesk.',
          longDesc:
            'Fires whenever a new contact is added to your Freshdesk instance. Capture details such as name, email, phone, and any custom fields associated with the contact.',
          event_info: {
            desc: 'Structure and types for Freshdesk’s new contact data payload.',
          },
        },

        updated_ticket_trigger: {
          displayName: 'Updated Ticket',
          shortDesc: 'Triggers when an existing ticket is updated in Freshdesk.',
          longDesc:
            'Fires whenever an existing ticket is updated with new details in your Freshdesk instance. For example, changes to subject, priority, status, or assigned agent.',
          event_info: {
            desc: 'Structure and types for Freshdesk’s updated ticket data payload.',
          },
        },

        updated_contact_trigger: {
          displayName: 'Updated Contact',
          shortDesc: 'Triggers when an existing contact is updated in Freshdesk.',
          longDesc:
            'Fires whenever an existing contact’s details are updated in your Freshdesk instance. For example, changes to name, phone number, email, or custom fields.',
          event_info: {
            desc: 'Structure and types for Freshdesk’s updated contact data payload.',
          },
        },
      },
    },
    SharePoint: {
      displayName: 'Microsoft SharePoint',
      shortDesc: 'Connect, automate, and manage your SharePoint Online workflows with ease.',
      longDesc:
        'Integrate your Microsoft 365 environment to quickly create, update, and synchronize documents, lists, and other assets—all from one secure, user-friendly app.',
      triggers: {
        'new-row': {
          displayName: 'New Row',
          shortDesc: 'Triggers when a new row is added to a SharePoint list.',
          longDesc:
            'This trigger activates whenever a new row is added to a specified SharePoint list.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the target list resides. This ID ensures that the trigger is activated in the correct SharePoint site.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Specify the List ID of the SharePoint list where the new row will be added.',
            },
          },
        },
      },
      actions: {
        'create-folder': {
          displayName: 'Create Folder',
          shortDesc: 'Create a new folder in a specified SharePoint drive.',
          longDesc:
            'This action creates a new folder within a specified SharePoint document library. Provide the target site, drive, parent folder path, and the desired folder name to organize your files effectively.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the unique Site ID where the folder will be created. This ID is required to target the correct SharePoint site in your Microsoft 365 environment.',
            },
            drive_id: {
              displayName: 'Drive ID',
              shortDesc: 'The unique identifier for the SharePoint drive.',
              longDesc:
                'Specify the Drive ID corresponding to the document library in which the folder will be created.',
            },
            parent_folder: {
              displayName: 'Parent Folder Path',
              shortDesc: 'The path of the existing parent folder.',
              longDesc:
                'Provide the path of the parent folder where the new folder should reside. This helps maintain an organized folder structure within your SharePoint drive.',
            },
            folder_name: {
              displayName: 'Folder Name',
              shortDesc: 'The name for the new folder.',
              longDesc:
                'Enter the desired name for the new folder. This name will be used as the folder title in SharePoint.',
            },
          },
        },
        'create-list-item': {
          displayName: 'Create List Item',
          shortDesc: 'Add a new item to an existing SharePoint list.',
          longDesc:
            'This action creates a new item within a specified SharePoint list. Provide the Site ID and List ID to target the correct list, and include the necessary fields to populate the item data.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where your target list resides. This ID ensures that the action is executed in the correct SharePoint environment.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Specify the List ID of the SharePoint list to which the new item will be added.',
            },
          },
        },
        'create-list': {
          displayName: 'Create List',
          shortDesc: 'Generate a new list within a SharePoint site.',
          longDesc:
            'This action creates a new SharePoint list. Provide the Site ID, a name for the list, and a description if needed. This is ideal for setting up new data repositories in your SharePoint site.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the new list should be created, ensuring the list is added to the correct SharePoint site.',
            },
            list_name: {
              displayName: 'List Name',
              shortDesc: 'The name of the new list.',
              longDesc:
                'Provide a name for your new list. This name will be visible to users and used to identify the list within SharePoint.',
            },
            list_description: {
              displayName: 'List Description',
              shortDesc: 'A brief description of the list.',
              longDesc:
                'Enter a description for the new list to provide context about its purpose and contents. This helps users understand what the list is used for.',
            },
          },
        },
        'delete-list-item': {
          displayName: 'Delete List Item',
          shortDesc: 'Remove an item from a SharePoint list.',
          longDesc:
            'This action deletes a specific item from a SharePoint list. Provide the Site ID, List ID, and the Item ID of the list item to be removed. Use this action with caution, as deleted items cannot be easily recovered.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the list is hosted, ensuring the deletion is performed in the correct SharePoint environment.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Specify the List ID of the target SharePoint list from which the item will be deleted.',
            },
            item_id: {
              displayName: 'Item ID',
              shortDesc: 'The unique identifier for the list item.',
              longDesc:
                'Provide the Item ID of the list item that you want to delete. This ensures that the correct item is removed from the list.',
            },
          },
        },
        'search-list-item': {
          displayName: 'Search List Item',
          shortDesc: 'Search for items in a SharePoint list by title.',
          longDesc:
            'This action searches for list items within a specified SharePoint list that match a provided title or search term. Use this action to quickly locate specific items based on their Title field.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the list is located, ensuring the search is conducted in the correct SharePoint site.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc: 'Provide the List ID of the SharePoint list to be searched.',
            },
            search_value: {
              displayName: 'Search Value',
              shortDesc: 'The search term to filter list items.',
              longDesc:
                'Enter the text value to search for within the list items, particularly in the Title field. This value is used to filter and return matching items.',
            },
          },
        },
        'update-list-item': {
          displayName: 'Update List Item',
          shortDesc: 'Modify an existing item in a SharePoint list.',
          longDesc:
            'This action updates the fields of an existing list item in a SharePoint list. Provide the Site ID, List ID, and Item ID to locate the item, along with the new field values that should be applied.',
          options: {
            site_id: {
              displayName: 'Site ID',
              shortDesc: 'The unique identifier for the SharePoint site.',
              longDesc:
                'Enter the Site ID where the list is hosted. This identifies the correct SharePoint site in your Microsoft 365 environment.',
            },
            list_id: {
              displayName: 'List ID',
              shortDesc: 'The unique identifier for the SharePoint list.',
              longDesc:
                'Provide the List ID of the target SharePoint list that contains the item you wish to update.',
            },
            item_id: {
              displayName: 'Item ID',
              shortDesc: 'The unique identifier for the list item.',
              longDesc:
                'Specify the Item ID of the list item that you want to update. This ensures that the correct item is modified.',
            },
          },
        },
      },
    },
    Outlook: {
      displayName: 'Microsoft Outlook',
      shortDesc: 'Get access to your calendar events, contacts, and emails in Microsoft Outlook.',
      longDesc:
        'Microsoft Outlook is a personal information manager software system from Microsoft, available as a part of the Microsoft Office suite. Primarily an email application, it also includes a calendar, task manager, contact manager, note taking, journal, and web browsing. Connect your Outlook account to create and manage contacts, calendar events, and send emails.',
      actions: {
        'create-contact': {
          displayName: 'Create Contact',
          shortDesc: 'Create a new contact in your Outlook contacts.',
          longDesc:
            'Create a new contact with details such as name, email, phone numbers, and job information in your Microsoft Outlook contacts.',
          options: {
            givenName: {
              displayName: 'First Name',
              shortDesc: "The contact's first name.",
              longDesc: 'Enter the first name or given name of the contact.',
            },
            surname: {
              displayName: 'Last Name',
              shortDesc: "The contact's last name.",
              longDesc: 'Enter the last name or surname of the contact.',
            },
            emailAddresses: {
              displayName: 'Email Addresses',
              shortDesc: 'Email addresses for the contact.',
              longDesc: 'Enter one or more email addresses for the contact.',
              type: {
                element_type: {
                  fields: {
                    address: {
                      displayName: 'Email Address',
                      shortDesc: 'The email address of the contact.',
                      longDesc: 'Enter a valid email address for the contact.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: 'The display name for this email address.',
                      longDesc: 'Enter how you want the name to appear for this email address.',
                    },
                  },
                },
              },
            },
            businessPhones: {
              displayName: 'Business Phones',
              shortDesc: 'Business phone numbers for the contact.',
              longDesc: 'Enter one or more business phone numbers for the contact.',
            },
            mobilePhone: {
              displayName: 'Mobile Phone',
              shortDesc: "The contact's mobile phone number.",
              longDesc: 'Enter the mobile or cell phone number for the contact.',
            },
            jobTitle: {
              displayName: 'Job Title',
              shortDesc: "The contact's job title.",
              longDesc: 'Enter the professional title or role of the contact.',
            },
            companyName: {
              displayName: 'Company Name',
              shortDesc: "The name of the contact's company.",
              longDesc: 'Enter the organization or company where the contact works.',
            },
            department: {
              displayName: 'Department',
              shortDesc: "The contact's department.",
              longDesc:
                'Enter the department or division within the company where the contact works.',
            },
            officeLocation: {
              displayName: 'Office Location',
              shortDesc: "The contact's office location.",
              longDesc: 'Enter the physical location or office where the contact works.',
            },
            businessAddress: {
              displayName: 'Business Address',
              shortDesc: "The contact's business address.",
              longDesc: 'Enter the full business address details for the contact.',
              type: {
                fields: {
                  street: {
                    displayName: 'Street',
                    shortDesc: 'Street address.',
                    longDesc: 'Enter the street address including building number and street name.',
                  },
                  city: {
                    displayName: 'City',
                    shortDesc: 'City name.',
                    longDesc: 'Enter the city or town for the business address.',
                  },
                  state: {
                    displayName: 'State/Province',
                    shortDesc: 'State or province.',
                    longDesc: 'Enter the state, province, or region for the business address.',
                  },
                  countryOrRegion: {
                    displayName: 'Country/Region',
                    shortDesc: 'Country or region.',
                    longDesc: 'Enter the country or region for the business address.',
                  },
                  postalCode: {
                    displayName: 'Postal Code',
                    shortDesc: 'Postal or zip code.',
                    longDesc: 'Enter the postal code or zip code for the business address.',
                  },
                },
              },
            },
          },
        },
        'update-contact': {
          displayName: 'Update Contact',
          shortDesc: 'Update an existing contact in your Outlook contacts.',
          longDesc:
            'Modify details of an existing contact in your Microsoft Outlook contacts, such as name, email, phone numbers, or job information.',
          options: {
            contactId: {
              displayName: 'Contact ID',
              shortDesc: 'The unique identifier for the contact.',
              longDesc: 'Select the unique identifier of the contact you want to update.',
            },
            givenName: {
              displayName: 'First Name',
              shortDesc: "The contact's first name.",
              longDesc: 'Update the first name or given name of the contact.',
            },
            surname: {
              displayName: 'Last Name',
              shortDesc: "The contact's last name.",
              longDesc: 'Update the last name or surname of the contact.',
            },
            emailAddresses: {
              displayName: 'Email Addresses',
              shortDesc: 'Email addresses for the contact.',
              longDesc: 'Update one or more email addresses for the contact.',
              type: {
                element_type: {
                  fields: {
                    address: {
                      displayName: 'Email Address',
                      shortDesc: 'The email address of the contact.',
                      longDesc: 'Enter a valid email address for the contact.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: 'The display name for this email address.',
                      longDesc: 'Enter how you want the name to appear for this email address.',
                    },
                  },
                },
              },
            },
            businessPhones: {
              displayName: 'Business Phones',
              shortDesc: 'Business phone numbers for the contact.',
              longDesc: 'Update one or more business phone numbers for the contact.',
            },
            mobilePhone: {
              displayName: 'Mobile Phone',
              shortDesc: "The contact's mobile phone number.",
              longDesc: 'Update the mobile or cell phone number for the contact.',
            },
            jobTitle: {
              displayName: 'Job Title',
              shortDesc: "The contact's job title.",
              longDesc: 'Update the professional title or role of the contact.',
            },
            companyName: {
              displayName: 'Company Name',
              shortDesc: "The name of the contact's company.",
              longDesc: 'Update the organization or company where the contact works.',
            },
            department: {
              displayName: 'Department',
              shortDesc: "The contact's department.",
              longDesc:
                'Update the department or division within the company where the contact works.',
            },
            officeLocation: {
              displayName: 'Office Location',
              shortDesc: "The contact's office location.",
              longDesc: 'Update the physical location or office where the contact works.',
            },
            businessAddress: {
              displayName: 'Business Address',
              shortDesc: "The contact's business address.",
              longDesc: 'Update the full business address details for the contact.',
              type: {
                fields: {
                  street: {
                    displayName: 'Street',
                    shortDesc: 'Street address.',
                    longDesc:
                      'Update the street address including building number and street name.',
                  },
                  city: {
                    displayName: 'City',
                    shortDesc: 'City name.',
                    longDesc: 'Update the city or town for the business address.',
                  },
                  state: {
                    displayName: 'State/Province',
                    shortDesc: 'State or province.',
                    longDesc: 'Update the state, province, or region for the business address.',
                  },
                  countryOrRegion: {
                    displayName: 'Country/Region',
                    shortDesc: 'Country or region.',
                    longDesc: 'Update the country or region for the business address.',
                  },
                  postalCode: {
                    displayName: 'Postal Code',
                    shortDesc: 'Postal or zip code.',
                    longDesc: 'Update the postal code or zip code for the business address.',
                  },
                },
              },
            },
          },
        },
        'delete-contact': {
          displayName: 'Delete Contact',
          shortDesc: 'Delete a contact from your Outlook contacts.',
          longDesc: 'Permanently remove a contact from your Microsoft Outlook contacts.',
          options: {
            contactId: {
              displayName: 'Contact ID',
              shortDesc: 'The unique identifier for the contact.',
              longDesc: 'Select the unique identifier of the contact to be deleted.',
            },
          },
        },
        'create-event': {
          displayName: 'Create Event',
          shortDesc: 'Create a new event in your Outlook calendar.',
          longDesc:
            'Create a new event or meeting in your Microsoft Outlook calendar with details such as title, start and end times, location, and attendees.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar where the event will be created.',
              longDesc: 'Select the calendar where you want to create the new event.',
            },
            title: {
              displayName: 'Title',
              shortDesc: 'The title or subject of the event.',
              longDesc: 'Enter a title or subject for the event that will appear in your calendar.',
            },
            start: {
              displayName: 'Start Time',
              shortDesc: 'When the event begins.',
              longDesc: 'Enter the date and time when the event will start.',
            },
            timezone: {
              displayName: 'Time Zone',
              shortDesc: 'The time zone for the event times.',
              longDesc:
                'Select the time zone that applies to the start and end times of the event.',
            },
            end: {
              displayName: 'End Time',
              shortDesc: 'When the event ends.',
              longDesc:
                'Enter the date and time when the event will end. If not specified, defaults to 1 hour after start time.',
            },
            location: {
              displayName: 'Location',
              shortDesc: 'Where the event will take place.',
              longDesc: 'Enter the physical location or virtual meeting place for the event.',
            },
            attendees: {
              displayName: 'Attendees',
              shortDesc: 'People invited to the event.',
              longDesc: 'Add one or more attendees to invite to the event.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "The attendee's email address.",
                      longDesc: 'Enter the email address of the person you want to invite.',
                    },
                    type: {
                      displayName: 'Attendee Type',
                      shortDesc: 'Required or optional attendee.',
                      longDesc: 'Specify whether this person is a required or optional attendee.',
                    },
                  },
                },
              },
            },
            body: {
              displayName: 'Body',
              shortDesc: 'The body content of the event.',
              longDesc:
                'Enter the description or details of the event that attendees will see in the invitation.',
            },
            bodyContentType: {
              displayName: 'Body Content Type',
              shortDesc: 'Format of the body content.',
              longDesc: 'Select whether the body content is plain text or HTML formatted.',
            },
            isOnlineMeeting: {
              displayName: 'Online Meeting',
              shortDesc: 'Whether this is an online meeting.',
              longDesc:
                'Enable this option to make this event an online meeting and generate a meeting link.',
            },
          },
        },
        'delete-event': {
          displayName: 'Delete Event',
          shortDesc: 'Delete an event from your Outlook calendar.',
          longDesc: 'Permanently remove an event or meeting from your Microsoft Outlook calendar.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar containing the event.',
              longDesc: 'Select the calendar that contains the event you want to delete.',
            },
            eventId: {
              displayName: 'Event ID',
              shortDesc: 'The unique identifier for the event.',
              longDesc: 'Select the unique identifier of the event to be deleted.',
            },
          },
        },
        'list-contacts': {
          displayName: 'List Contacts',
          shortDesc: 'Retrieve a list of contacts from your Outlook contacts.',
          longDesc:
            'Get a list of contacts from your Microsoft Outlook contacts with optional filtering and limit.',
          options: {
            limit: {
              displayName: 'Limit',
              shortDesc: 'The maximum number of contacts to retrieve.',
              longDesc:
                'Specify the maximum number of contacts to retrieve from the Outlook account.',
            },
            filter: {
              displayName: 'Filter',
              shortDesc: 'Filter contacts by name or email.',
              longDesc:
                'Enter text to filter contacts by name or email address. Only contacts matching the filter will be returned.',
            },
          },
        },
        'list-events': {
          displayName: 'List Events',
          shortDesc: 'Retrieve a list of events from your Outlook calendar.',
          longDesc:
            'Get a list of events from your Microsoft Outlook calendar with optional filtering by date range and limit.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar to retrieve events from.',
              longDesc: 'Select the calendar from which you want to retrieve events.',
            },
            startDateTime: {
              displayName: 'Start Date and Time',
              shortDesc: 'The start date and time for filtering events.',
              longDesc:
                'Enter a date and time to retrieve events that start on or after this time.',
            },
            endDateTime: {
              displayName: 'End Date and Time',
              shortDesc: 'The end date and time for filtering events.',
              longDesc: 'Enter a date and time to retrieve events that end on or before this time.',
            },
            limit: {
              displayName: 'Limit',
              shortDesc: 'The maximum number of events to retrieve.',
              longDesc:
                'Specify the maximum number of events to retrieve from the Outlook calendar.',
            },
          },
        },
        'send-email': {
          displayName: 'Send Email',
          shortDesc: 'Send an email from your Outlook account.',
          longDesc:
            'Compose and send an email message from your Microsoft Outlook account to one or more recipients.',
          options: {
            toRecipients: {
              displayName: 'To Recipients',
              shortDesc: 'The primary recipients of the email.',
              longDesc:
                'Enter one or more email addresses for the primary recipients of the email.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "Recipient's email address.",
                      longDesc: 'Enter the email address of the recipient.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: "Recipient's display name.",
                      longDesc: 'Optionally enter a display name for the recipient.',
                    },
                  },
                },
              },
            },
            ccRecipients: {
              displayName: 'CC Recipients',
              shortDesc: 'The carbon copy recipients of the email.',
              longDesc:
                'Optionally enter one or more email addresses for recipients to be copied on the email.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "CC recipient's email address.",
                      longDesc: 'Enter the email address of the CC recipient.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: "CC recipient's display name.",
                      longDesc: 'Optionally enter a display name for the CC recipient.',
                    },
                  },
                },
              },
            },
            bccRecipients: {
              displayName: 'BCC Recipients',
              shortDesc: 'The blind carbon copy recipients of the email.',
              longDesc:
                'Optionally enter one or more email addresses for recipients to be blind copied on the email.',
              type: {
                element_type: {
                  fields: {
                    emailAddress: {
                      displayName: 'Email Address',
                      shortDesc: "BCC recipient's email address.",
                      longDesc: 'Enter the email address of the BCC recipient.',
                    },
                    name: {
                      displayName: 'Display Name',
                      shortDesc: "BCC recipient's display name.",
                      longDesc: 'Optionally enter a display name for the BCC recipient.',
                    },
                  },
                },
              },
            },
            subject: {
              displayName: 'Subject',
              shortDesc: 'The subject line of the email.',
              longDesc: "Enter the subject line that will appear in the recipient's inbox.",
            },
            body: {
              displayName: 'Body',
              shortDesc: 'The content of the email.',
              longDesc: 'Enter the main message content of the email.',
            },
            bodyContentType: {
              displayName: 'Body Content Type',
              shortDesc: 'Format of the email body.',
              longDesc: 'Select whether the email body is plain text or HTML formatted.',
            },
            saveToSentItems: {
              displayName: 'Save to Sent Items',
              shortDesc: 'Whether to save a copy in Sent Items.',
              longDesc: 'Choose whether to save a copy of the email in your Sent Items folder.',
            },
          },
        },
      },
      triggers: {
        'new-contact': {
          displayName: 'New Contact',
          shortDesc: 'Triggered when a new contact is created in Outlook.',
          longDesc:
            'This trigger is activated whenever a new contact is added to your Microsoft Outlook contacts.',
        },
        'new-email': {
          displayName: 'New Email',
          shortDesc: 'Triggered when a new email is received in Outlook.',
          longDesc:
            'This trigger is activated whenever a new email message is received in your Microsoft Outlook inbox.',
        },
        'new-event': {
          displayName: 'New Event',
          shortDesc: 'Triggered when a new event is created in an Outlook calendar.',
          longDesc:
            'This trigger is activated whenever a new event or meeting is created in your Microsoft Outlook calendar.',
          options: {
            calendarId: {
              displayName: 'Calendar ID',
              shortDesc: 'The calendar to monitor for new events.',
              longDesc:
                'Optionally select a specific calendar to monitor. If not specified, all calendars will be monitored.',
            },
          },
        },
      },
    },
    Teams: {
      displayName: 'Microsoft Teams',
      shortDesc: 'Collaborate with your team using channels, meetings, and messages',
      longDesc:
        'Microsoft Teams is a collaboration platform that enables messaging, file sharing, video meetings, and app integration within your organization.',
      actions: {
        'create-channel': {
          displayName: 'Create Channel',
          shortDesc: 'Create a new channel in a team',
          longDesc:
            'Create a new channel within a specified team where members can collaborate through conversations, files, and integrated apps.',
          options: {
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Unique identifier for the team',
              longDesc:
                'The unique identifier (GUID) for the team where the new channel will be created.',
            },
            displayName: {
              displayName: 'Channel Name',
              shortDesc: 'Name of the new channel',
              longDesc:
                'The display name for the new channel. Must be unique within the team and between 1-50 characters.',
            },
            description: {
              displayName: 'Description',
              shortDesc: 'Description of the channel purpose',
              longDesc:
                'Optional description explaining the purpose or topic of the channel. Limited to 1024 characters.',
            },
            membershipType: {
              displayName: 'Membership Type',
              shortDesc: 'Channel privacy setting',
              longDesc:
                'Defines the privacy level of the channel. Options include "standard" (visible to all team members) or "private" (visible only to specific members).',
            },
          },
        },
        'create-meeting': {
          displayName: 'Create Meeting',
          shortDesc: 'Schedule a new Teams meeting',
          longDesc:
            'Schedule a new meeting in Microsoft Teams with specified participants, time, location, and other meeting details.',
          options: {
            subject: {
              displayName: 'Subject',
              shortDesc: 'Meeting title',
              longDesc:
                'The title or subject of the meeting that will appear in calendar invitations and the meeting list.',
            },
            startDateTime: {
              displayName: 'Start Time',
              shortDesc: 'Meeting start date and time',
              longDesc:
                'The date and time when the meeting begins in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            endDateTime: {
              displayName: 'End Time',
              shortDesc: 'Meeting end date and time',
              longDesc:
                'The date and time when the meeting ends in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc:
                'Optional team identifier if the meeting is associated with a specific team.',
            },
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Associated channel identifier',
              longDesc:
                'Optional channel identifier if the meeting is associated with a specific channel within a team.',
            },
            content: {
              displayName: 'Meeting Content',
              shortDesc: 'Meeting agenda or notes',
              longDesc:
                'Optional text describing the meeting agenda, preparation materials, or other relevant information.',
            },
            location: {
              displayName: 'Location',
              shortDesc: 'Physical or virtual meeting location',
              longDesc:
                'The physical location where the meeting will take place, or a custom virtual location description.',
            },
            attendees: {
              displayName: 'Attendees',
              shortDesc: 'Meeting participants',
              longDesc:
                'List of email addresses or user IDs for people who should be invited to the meeting.',
            },
            isOnlineMeeting: {
              displayName: 'Online Meeting',
              shortDesc: 'Enable Teams online meeting features',
              longDesc:
                'When set to true, creates a Teams online meeting with video conferencing capabilities and a join link.',
            },
            timeZone: {
              displayName: 'Time Zone',
              shortDesc: 'Meeting time zone',
              longDesc:
                'The time zone for the meeting start and end times, such as "Pacific Standard Time" or "UTC".',
            },
          },
        },
        'delete-meeting': {
          displayName: 'Delete Meeting',
          shortDesc: 'Cancel an existing meeting',
          longDesc:
            "Permanently cancels and removes a scheduled meeting from all participants' calendars.",
          options: {
            meetingId: {
              displayName: 'Meeting ID',
              shortDesc: 'Unique meeting identifier',
              longDesc: 'The unique identifier (GUID) of the meeting to be canceled.',
            },
            meetingSource: {
              displayName: 'Meeting Source',
              shortDesc: 'Origin of the meeting',
              longDesc: 'Specifies where the meeting was created, such as "private" or "team".',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc: 'The team identifier if the meeting is associated with a specific team.',
            },
          },
        },
        'send-channel-message': {
          displayName: 'Send Channel Message',
          shortDesc: 'Post a message to a team channel',
          longDesc:
            'Send a new message to a specific channel within a team that all channel members can view and respond to.',
          options: {
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Target channel identifier',
              longDesc: 'The unique identifier of the channel where the message will be posted.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Team identifier',
              longDesc: 'The unique identifier of the team containing the target channel.',
            },
            message: {
              displayName: 'Message',
              shortDesc: 'Message content',
              longDesc: 'The text content of the message to be posted in the channel.',
            },
            contentType: {
              displayName: 'Content Type',
              shortDesc: 'Format of the message content',
              longDesc:
                'Specifies the format of the message content, such as "text" for plain text or "html" for formatted content.',
            },
          },
        },
        'send-chat-message': {
          displayName: 'Send Chat Message',
          shortDesc: 'Send a message to a chat conversation',
          longDesc:
            'Send a new message to a direct chat or group chat conversation outside of a team channel.',
          options: {
            chatId: {
              displayName: 'Chat ID',
              shortDesc: 'Target chat identifier',
              longDesc:
                'The unique identifier of the direct chat or group chat where the message will be sent.',
            },
            message: {
              displayName: 'Message',
              shortDesc: 'Message content',
              longDesc: 'The text content of the message to be sent in the chat.',
            },
            contentType: {
              displayName: 'Content Type',
              shortDesc: 'Format of the message content',
              longDesc:
                'Specifies the format of the message content, such as "text" for plain text or "html" for formatted content.',
            },
          },
        },
        'update-channel': {
          displayName: 'Update Channel',
          shortDesc: 'Modify an existing channel',
          longDesc: 'Update the properties or membership of an existing channel within a team.',
          options: {
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Target channel identifier',
              longDesc: 'The unique identifier of the channel to be updated.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Team identifier',
              longDesc: 'The unique identifier of the team containing the channel to be updated.',
            },
            displayName: {
              displayName: 'Channel Name',
              shortDesc: 'New channel name',
              longDesc:
                'The new display name for the channel. Must be unique within the team and between 1-50 characters.',
            },
            description: {
              displayName: 'Description',
              shortDesc: 'New channel description',
              longDesc:
                'Updated description explaining the purpose or topic of the channel. Limited to 1024 characters.',
            },
            addMembers: {
              displayName: 'Add Members',
              shortDesc: 'Users to add to the channel',
              longDesc:
                'List of user IDs to add as members to the channel. Only applicable for private channels.',
            },
            removeMembers: {
              displayName: 'Remove Members',
              shortDesc: 'Users to remove from the channel',
              longDesc:
                'List of user IDs to remove from the channel membership. Only applicable for private channels.',
            },
          },
        },
        'update-meeting': {
          displayName: 'Update Meeting',
          shortDesc: 'Modify an existing meeting',
          longDesc:
            'Update the details of a scheduled meeting, such as time, location, attendees, or other properties.',
          options: {
            meetingId: {
              displayName: 'Meeting ID',
              shortDesc: 'Target meeting identifier',
              longDesc: 'The unique identifier of the meeting to be updated.',
            },
            subject: {
              displayName: 'Subject',
              shortDesc: 'Updated meeting title',
              longDesc:
                'The new title or subject of the meeting that will appear in calendar invitations and the meeting list.',
            },
            startDateTime: {
              displayName: 'Start Time',
              shortDesc: 'Updated meeting start time',
              longDesc:
                'The new date and time when the meeting begins in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            endDateTime: {
              displayName: 'End Time',
              shortDesc: 'Updated meeting end time',
              longDesc:
                'The new date and time when the meeting ends in ISO 8601 format (YYYY-MM-DDTHH:MM:SS).',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc:
                'Updated team identifier if the meeting is associated with a specific team.',
            },
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Associated channel identifier',
              longDesc:
                'Updated channel identifier if the meeting is associated with a specific channel within a team.',
            },
            content: {
              displayName: 'Meeting Content',
              shortDesc: 'Updated meeting agenda or notes',
              longDesc:
                'Updated text describing the meeting agenda, preparation materials, or other relevant information.',
            },
            location: {
              displayName: 'Location',
              shortDesc: 'Updated meeting location',
              longDesc:
                'The new physical location where the meeting will take place, or a custom virtual location description.',
            },
            attendees: {
              displayName: 'Attendees',
              shortDesc: 'Updated meeting participants',
              longDesc:
                'Updated list of email addresses or user IDs for people who should be invited to the meeting.',
            },
            isOnlineMeeting: {
              displayName: 'Online Meeting',
              shortDesc: 'Enable/disable Teams online meeting features',
              longDesc:
                'When set to true, ensures the meeting has Teams online meeting capabilities with video conferencing and a join link.',
            },
            timeZone: {
              displayName: 'Time Zone',
              shortDesc: 'Updated meeting time zone',
              longDesc:
                'The new time zone for the meeting start and end times, such as "Pacific Standard Time" or "UTC".',
            },
          },
        },
      },
      triggers: {
        'new-channel-message': {
          displayName: 'New Channel Message',
          shortDesc: 'Trigger when a message is posted in a channel',
          longDesc:
            'This trigger fires when a new message is posted in a specified channel within a team.',
          options: {
            channelId: {
              displayName: 'Channel ID',
              shortDesc: 'Channel to monitor for messages',
              longDesc: 'The unique identifier of the channel to monitor for new messages.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Team identifier',
              longDesc: 'The unique identifier of the team containing the channel to monitor.',
            },
          },
        },
        'new-chat-message': {
          displayName: 'New Chat Message',
          shortDesc: 'Trigger when a message is sent in a chat',
          longDesc:
            'This trigger fires when a new message is sent in a direct chat or group chat conversation.',
          options: {
            chatId: {
              displayName: 'Chat ID',
              shortDesc: 'Chat to monitor for messages',
              longDesc:
                'The unique identifier of the direct chat or group chat to monitor for new messages.',
            },
          },
        },
        'new-meeting': {
          displayName: 'New Meeting',
          shortDesc: 'Trigger when a meeting is created',
          longDesc:
            'This trigger fires when a new meeting is scheduled that matches the specified criteria.',
          options: {
            meetingSource: {
              displayName: 'Meeting Source',
              shortDesc: 'Origin of the meeting',
              longDesc:
                'Specifies which type of meetings to monitor, such as "private" or "team" meetings.',
            },
            teamId: {
              displayName: 'Team ID',
              shortDesc: 'Associated team identifier',
              longDesc:
                'Optional filter to only trigger for meetings associated with a specific team.',
            },
          },
        },
      },
    },
    Serenity: {
      displayName: 'Serenity',
      shortDesc:
        'Create conversations, execute agents and manage interactions with Serenity AI Hub.',
      longDesc:
        'Enterprise AI ecosystem that enables businesses to create, manage, and scale AI agents effortlessly, enhancing productivity and innovation across various processes.',
      actions: {
        'create-conversation': {
          displayName: 'Create Conversation',
          shortDesc: 'Create a conversation with a conversation agent',
          longDesc:
            'Creates a conversation with the given agent code. This is required before executing an agent.',
          options: {
            agentCode: {
              displayName: 'Agent Code',
              shortDesc: 'The code of the agent to create a conversation with',
              longDesc: 'The code of the agent to create a conversation with',
            },
            userIdentifier: {
              displayName: 'User Identifier',
              shortDesc: 'Used to uniquely identify a user in a conversation. ',
              longDesc:
                'It helps maintain context across interactions. For example, you might use `"userIdentifier": "landing-page-user"` to track a specific user session.',
            },
            inputParameters: {
              displayName: 'Input Parameters',
              shortDesc: 'An array of key-value pairs for additional context.',
              longDesc: 'An array of key-value pairs for additional context.',
              type: {
                fields: {
                  key: {
                    displayName: 'Key',
                    shortDesc: 'The key of the parameter',
                    longDesc: 'The key of the parameter',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'The value of the parameter',
                    longDesc: 'The value of the parameter',
                  },
                },
              },
            },
          },
        },
        'execute-agent': {
          displayName: 'Execute Agent',
          shortDesc: 'Executes an agent with the given code.',
          longDesc: 'Executes an agent with the given code.',
          options: {
            agentCode: {
              displayName: 'Agent Code',
              shortDesc:
                'Used to identify and execute a specific agent within the Serenity* AI Hub',
              longDesc: 'Used to identify and execute a specific agent within the Serenity* AI Hub',
            },
            culture: {
              displayName: 'Culture',
              shortDesc: 'Use this param to override the culture of the response.',
              longDesc: 'Use this param to override the culture of the response.',
            },
            userLanguage: {
              displayName: 'User Language',
              shortDesc: 'The preferred language of the response',
              longDesc: 'The preferred language of the response',
            },
            params: {
              displayName: 'Params',
              shortDesc: 'An array of key-value pairs for execution context.',
              longDesc: 'An array of key-value pairs for execution context.',
              type: {
                fields: {
                  key: {
                    displayName: 'Key',
                    shortDesc: 'The key of the parameter',
                    longDesc: 'The key of the parameter',
                  },
                  value: {
                    displayName: 'Value',
                    shortDesc: 'The value of the parameter',
                    longDesc: 'The value of the parameter',
                  },
                },
              },
            },
            volatileKnowledgeIds: {
              displayName: 'Volatile Knowledge IDs',
              shortDesc:
                'Unique identifiers (UUIDs) used to retrieve specific pieces of volatile knowledge in the Serenity* AI Hub',
              longDesc:
                'Unique identifiers (UUIDs) used to retrieve specific pieces of volatile knowledge in the Serenity* AI Hub',
            },
          },
        },
        'execute-conversation': {
          displayName: 'Execute Conversation',
          shortDesc: 'Send a message to a chat with agent',
          longDesc: 'Send a message to a chat with agent',
          options: {
            agentCode: {
              displayName: 'Agent Code',
              shortDesc: 'The agent to check for conversations with',
              longDesc: 'The agent to check for conversations with',
            },
            conversationId: {
              displayName: 'Conversation ID',
              shortDesc: 'The conversation to send the message to',
              longDesc: 'The conversation to send the message to',
            },
            userLanguage: {
              displayName: 'User Language',
              shortDesc: 'The preferred language of the response',
              longDesc: 'The preferred language of the response',
            },
            message: {
              displayName: 'Message',
              shortDesc: 'Message to send to the agent',
              longDesc: 'Message to send to the agent',
            },
            culture: {
              displayName: 'Culture',
              shortDesc: 'Use this param to override the culture of the response.',
              longDesc: 'Use this param to override the culture of the response. ',
            },
          },
        },
      },
      triggers: {
        'new-conversation-message': {
          displayName: 'New Conversation Message',
          shortDesc: 'Triggered when a new message is posted in a conversation.',
          longDesc: 'This trigger activates when a new message is posted in a conversation.',
          options: {
            conversationId: {
              displayName: 'Conversation ID',
              shortDesc: 'The unique identifier for the conversation.',
              longDesc:
                'Enter the Conversation ID to specify the conversation where you want to monitor new messages.',
            },
            agentCode: {
              displayName: 'Agent ID',
              shortDesc: 'The unique identifier for the agent.',
              longDesc: 'Agent ID to check for available conversations from',
            },
            sender: {
              displayName: 'Sender',
              shortDesc: 'Filter the messages by the sender.',
              longDesc: 'Choose the sender the messages should be filtered by.',
            },
          },
        },
      },
    },
    Pipedrive: {
      displayName: 'Pipedrive',
      shortDesc: 'Manage your sales pipeline and customer relationships with Pipedrive.',
      longDesc:
        'Pipedrive is a sales management tool designed to help small sales teams manage intricate or lengthy sales processes.',
      triggers: {
        pipedrive_activity_trigger: {
          displayName: 'Activity Action',
          shortDesc: 'Triggers when an action is performed on an activity',
          longDesc:
            'This trigger activates when a selected action is performed on an activity in Pipedrive. Actions include creating, updating, deleting an activity or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_deal_trigger: {
          displayName: 'Deal Action',
          shortDesc: 'Triggers when an action is performed on a deal',
          longDesc:
            'This trigger activates when a selected action is performed on a deal in Pipedrive. Actions include creating, updating, deleting a deal or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_lead_trigger: {
          displayName: 'Lead Action',
          shortDesc: 'Triggers when an action is performed on a lead',
          longDesc:
            'This trigger activates when a selected action is performed on a lead in Pipedrive. Actions include creating, updating, deleting a lead or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_note_trigger: {
          displayName: 'Note Action',
          shortDesc: 'Triggers when an action is performed on a note',
          longDesc:
            'This trigger activates when a selected action is performed on a note in Pipedrive. Actions include creating, updating, deleting a note or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_organization_trigger: {
          displayName: 'Organization Action',
          shortDesc: 'Triggers when an action is performed on an organization',
          longDesc:
            'This trigger activates when a selected action is performed on an organization in Pipedrive. Actions include creating, updating, deleting an organization or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_person_trigger: {
          displayName: 'Person Action',
          shortDesc: 'Triggers when an action is performed on a person',
          longDesc:
            'This trigger activates when a selected action is performed on a person in Pipedrive. Actions include creating, updating, deleting a person or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
        pipedrive_user_trigger: {
          displayName: 'User Action',
          shortDesc: 'Triggers when an action is performed on a user',
          longDesc:
            'This trigger activates when a selected action is performed on a user in Pipedrive. Actions include creating, updating, deleting a user or any change.',
          options: {
            action: {
              displayName: 'Action',
              shortDesc: 'Select the action that triggers the flow',
              longDesc:
                'Select the action that triggers the flow. Choose from: create, update, delete, or any change.',
            },
          },
        },
      },
    },
  },
} satisfies BaseTranslation;

export default en;
