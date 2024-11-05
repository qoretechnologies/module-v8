import type { BaseTranslation } from '../i18n-types';

const en = {
  common: {},
  apps: {
    _testing: {
      actions: {
        test: {
          option1: {
            displayName: 'Option 1',
            shortDesc: 'Option 1 Short Description',
            longDesc: 'Option 1 Long Description',
          },
          option2: {
            displayName: 'Second Option',
          },
          sub_option1: {
            displayName: 'Sub Option 1 of Option 2',
          },
          sub_sub_option1: {
            longDesc: 'Generated description',
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
      actions: {
        create_ticket: {
          displayName: 'Create Ticket',
          shortDesc: 'Create a new ticket',
          longDesc: 'Create a new ticket',
        },
        users: {
          get_user: {
            displayName: 'Get User',
            shortDesc: 'Get user by ID',
            longDesc: 'Get user by ID',
          },
          user_id: {
            displayName: 'User ID',
            shortDesc: 'User ID',
            longDesc: 'User ID',
          },
          items: {
            displayName: 'Items',
            shortDesc: 'Items',
            longDesc: 'Items',
          },
          users: {
            displayName: 'Users',
            shortDesc: 'Users',
            longDesc: 'Users',
            id: {
              displayName: 'ID',
              shortDesc: 'ID',
              longDesc: 'ID',
            },
            name: {
              displayName: 'Name',
              shortDesc: 'Name',
              longDesc: 'Name',
            },
          },
          active: {
            displayName: 'Active',
            shortDesc: 'Active',
            longDesc: 'Active',
          },
          name: {
            displayName: 'Name',
            shortDesc: 'Name',
            longDesc: 'Name',
          },
          custom_role_id: {
            displayName: 'Custom Role ID',
            shortDesc: 'Custom Role ID',
            longDesc: 'Custom Role ID',
          },
          email: {
            displayName: 'Email',
            shortDesc: 'Email',
            longDesc: 'Email',
          },
          organization: {
            displayName: 'Organization',
            shortDesc: 'Organization',
            longDesc: 'Organization',
          },
          role: {
            displayName: 'Role',
            shortDesc: 'Role',
            longDesc: 'Role',
          },
          role_type: {
            displayName: 'Role Type',
            shortDesc: 'Role Type',
            longDesc: 'Role Type',
          },
          organization_id: {
            displayName: 'Organization ID',
            shortDesc: 'Organization ID',
            longDesc: 'Organization ID',
          },
        },
        attachments: {
          content_type: {
            displayName: 'Content Type',
            shortDesc: 'Content Type',
            longDesc: 'Content Type',
          },
          content_url: {
            displayName: 'Content URL',
            shortDesc: 'Content URL',
            longDesc: 'Content URL',
          },
          deleted: {
            displayName: 'Deleted',
            shortDesc: 'Deleted',
            longDesc: 'Deleted',
          },
          file_name: {
            displayName: 'File Name',
            shortDesc: 'File Name',
            longDesc: 'File Name',
          },
          height: {
            displayName: 'Height',
            shortDesc: 'Height',
            longDesc: 'Height',
          },
          id: {
            displayName: 'ID',
            shortDesc: 'ID',
            longDesc: 'ID',
          },
          inline: {
            displayName: 'Inline',
            shortDesc: 'Inline',
            longDesc: 'Inline',
          },
          size: {
            displayName: 'Size',
            shortDesc: 'Size',
            longDesc: 'Size',
          },
          thumbnails: {
            displayName: 'Thumbnails',
            shortDesc: 'Thumbnails',
            longDesc: 'Thumbnails',
          },
          url: {
            displayName: 'URL',
            shortDesc: 'URL',
            longDesc: 'URL',
          },
          width: {
            displayName: 'Width',
            shortDesc: 'Width',
            longDesc: 'Width',
          },
          mapped_content_url: {
            displayName: 'Mapped Content URL',
            shortDesc: 'Mapped Content URL',
            longDesc: 'Mapped Content URL',
          },
          upload: {
            displayName: 'Upload',
            shortDesc: 'Upload an attachment',
            longDesc: 'Upload an attachment',
          },
          token: {
            displayName: 'Zendesk Token',
            shortDesc: 'Zendesk API token',
            longDesc: 'Zendesk API token',
          },
        },
        tickets: {
          ticket: {
            displayName: 'Ticket Object',
            shortDesc: 'The information of a ticket',
            longDesc: 'The information of a ticket',
          },
          comment: {
            displayName: 'Comment',
            shortDesc: 'Comment on a ticket',
            longDesc: 'Comment on a ticket',
          },
          body: {
            displayName: 'Ticket Body',
            shortDesc: 'Body of the ticket',
            longDesc: 'Body of the ticket',
          },
          subject: {
            displayName: 'Subject',
            shortDesc: 'Subject of a ticket',
            longDesc: 'Subject of a ticket',
          },
          priority: {
            displayName: 'Priority',
            shortDesc: 'Priority of a ticket',
            longDesc: 'Priority of a ticket',
          },
          create_ticket: {
            displayName: 'Create Ticket',
            shortDesc: 'Create a new ticket',
            longDesc: 'Create a new ticket',
          },
          update_ticket: {
            displayName: 'Update Ticket',
            shortDesc: 'Update a ticket',
            longDesc: 'Update a ticket',
          },
          get_ticket: {
            displayName: 'Get Ticket',
            shortDesc: 'Get a ticket',
            longDesc: 'Get a ticket',
          },
          ticket_id: {
            displayName: 'Ticket ID',
            shortDesc: 'Ticket ID',
            longDesc: 'Ticket ID',
          },
          created_at: {
            displayName: 'Created At',
            shortDesc: 'The date and time the ticket was created',
            longDesc: 'The date and time the ticket was created',
          },
          name: {
            displayName: 'Name',
            shortDesc: 'The ticket’s name',
            longDesc: 'The ticket’s name',
          },
          collaborator_ids: {
            displayName: 'Collaborator IDs',
            shortDesc: 'IDs of the ticket’s collaborators',
            longDesc: 'IDs of the ticket’s collaborators',
          },
          assignee_id: {
            displayName: 'Assignee ID',
            shortDesc: 'The ID of the ticket’s assignee',
            longDesc: 'The ID of the ticket’s assignee',
          },
          custom_fields: {
            displayName: 'Custom Fields',
            shortDesc: 'Custom fields of the ticket',
            longDesc: 'Custom fields of the ticket',
          },
          fields: {
            displayName: 'Fields',
            shortDesc: 'Fields of the ticket',
            longDesc: 'Fields of the ticket',
          },
          custom_status_id: {
            displayName: 'Custom Status ID',
            shortDesc: 'The ID of the ticket’s custom status',
            longDesc: 'The ID of the ticket’s custom status',
          },
          description: {
            displayName: 'Description',
            shortDesc: 'The ticket’s description',
            longDesc: 'The ticket’s description',
          },
          url: {
            displayName: 'URL',
            shortDesc: 'The ticket’s URL',
            longDesc: 'The ticket’s URL',
          },
          due_at: {
            displayName: 'Due At',
            shortDesc: 'The date and time the ticket is due',
            longDesc: 'The date and time the ticket is due',
          },
          email_cc_ids: {
            displayName: 'Email CC IDs',
            shortDesc: 'IDs of the ticket’s email CCs',
            longDesc: 'IDs of the ticket’s email CCs',
          },
          forum_topic_id: {
            displayName: 'Forum Topic ID',
            shortDesc: 'The ID of the ticket’s forum topic',
            longDesc: 'The ID of the ticket’s forum topic',
          },
          ticket_form_id: {
            displayName: 'Ticket Form ID',
            shortDesc: 'The ID of the ticket’s form',
            longDesc: 'The ID of the ticket’s form',
          },
          brand_id: {
            displayName: 'Brand ID',
            shortDesc: 'The ID of the ticket’s brand',
            longDesc: 'The ID of the ticket’s brand',
          },
          allow_channelback: {
            displayName: 'Allow Channelback',
            shortDesc: 'Whether the ticket allows channelback',
            longDesc: 'Whether the ticket allows channelback',
          },
          allow_attachments: {
            displayName: 'Allow Attachments',
            shortDesc: 'Whether the ticket allows attachments',
            longDesc: 'Whether the ticket allows attachments',
          },
          external_id: {
            displayName: 'External ID',
            shortDesc: 'The ticket’s external ID',
            longDesc: 'The ticket’s external ID',
          },
          follower_ids: {
            displayName: 'Follower IDs',
            shortDesc: 'IDs of the ticket’s followers',
            longDesc: 'IDs of the ticket’s followers',
          },
          followup_ids: {
            displayName: 'Followup IDs',
            shortDesc: 'IDs of the ticket’s followups',
            longDesc: 'IDs of the ticket’s followups',
          },
          from_messaging_channel: {
            displayName: 'From Messaging Channel',
            shortDesc: 'Whether the ticket was created from a messaging channel',
            longDesc: 'Whether the ticket was created from a messaging channel',
          },
          group_id: {
            displayName: 'Group ID',
            shortDesc: 'The ID of the ticket’s group',
            longDesc: 'The ID of the ticket’s group',
          },
          generated_timestamp: {
            displayName: 'Generated Timestamp',
            shortDesc: 'The timestamp of the ticket generation',
            longDesc: 'The timestamp of the ticket generation',
          },
          has_incidents: {
            displayName: 'Group ID',
            shortDesc: 'The ID of the ticket’s group',
            longDesc: 'The ID of the ticket’s group',
          },
          id: {
            displayName: 'ID',
            shortDesc: 'The ticket’s ID',
            longDesc: 'The ticket’s ID',
          },
          is_public: {
            displayName: 'Is Public',
            shortDesc: 'Whether the ticket is public',
            longDesc: 'Whether the ticket is public',
          },
          organization_id: {
            displayName: 'Organization ID',
            shortDesc: 'The ID of the ticket’s organization',
            longDesc: 'The ID of the ticket’s organization',
          },
          portal_id: {
            displayName: 'Portal ID',
            shortDesc: 'The ID of the ticket’s portal',
            longDesc: 'The ID of the ticket’s portal',
          },
          problem_id: {
            displayName: 'Problem ID',
            shortDesc: 'The ID of the ticket’s problem',
            longDesc: 'The ID of the ticket’s problem',
          },
          raw_subject: {
            displayName: 'Raw Subject',
            shortDesc: 'The raw subject of the ticket',
            longDesc: 'The raw subject of the ticket',
          },
          recipient: {
            displayName: 'Recipient',
            shortDesc: 'The ticket’s recipient',
            longDesc: 'The ticket’s recipient',
          },
          requester_id: {
            displayName: 'Requester ID',
            shortDesc: 'The ID of the ticket’s requester',
            longDesc: 'The ID of the ticket’s requester',
          },
          sharing_agreement_ids: {
            displayName: 'Sharing Agreement IDs',
            shortDesc: 'IDs of the ticket’s sharing agreements',
            longDesc: 'IDs of the ticket’s sharing agreements',
          },
          status: {
            displayName: 'Status',
            shortDesc: 'The ticket’s status',
            longDesc: 'The ticket’s status',
          },
          submitter_id: {
            displayName: 'Submitter ID',
            shortDesc: 'The ID of the ticket’s submitter',
            longDesc: 'The ID of the ticket’s submitter',
          },
          tags: {
            displayName: 'Tags',
            shortDesc: 'The ticket’s tags',
            longDesc: 'The ticket’s tags',
          },
          type: {
            displayName: 'Type',
            shortDesc: 'The ticket’s type',
            longDesc: 'The ticket’s type',
          },
          updated_at: {
            displayName: 'Updated At',
            shortDesc: 'The date and time the ticket was last updated',
            longDesc: 'The date and time the ticket was last updated',
          },
          satisfaction_rating: {
            displayName: 'Satisfaction Rating',
            shortDesc: 'Satisfaction rating of the ticket',
            longDesc: 'Satisfaction rating of the ticket',
            score: {
              displayName: 'Score',
              shortDesc: 'Score of the satisfaction rating',
              longDesc: 'Score of the satisfaction rating',
            },
            comment: {
              displayName: 'Comment',
              shortDesc: 'Comment of the satisfaction rating',
              longDesc: 'Comment of the satisfaction rating',
            },
            id: {
              displayName: 'ID',
              shortDesc: 'ID of the satisfaction rating',
              longDesc: 'ID of the satisfaction rating',
            },
            created_at: {
              displayName: 'Created At',
              shortDesc: 'The date and time the satisfaction rating was created',
              longDesc: 'The date and time the satisfaction rating was created',
            },
            updated_at: {
              displayName: 'Updated At',
              shortDesc: 'The date and time the satisfaction rating was last updated',
              longDesc: 'The date and time the satisfaction rating was last updated',
            },
          },
          via: {
            displayName: 'Via',
            shortDesc: 'Channel through which the ticket was created',
            longDesc: 'Channel through which the ticket was created',
            channel: {
              displayName: 'Channel',
              shortDesc: 'Channel of the ticket',
              longDesc: 'Channel of the ticket',
            },
          },
          count: {
            displayName: 'Count',
            shortDesc: 'Count of tickets',
            longDesc: 'Count of tickets',
          },
          audit: {
            displayName: 'Audit',
            shortDesc: 'Audit of tickets',
            longDesc: 'Audit of tickets',
          },
          events: {
            displayName: 'Events',
            shortDesc: 'Events of tickets',
            longDesc: 'Events of tickets',
          },
          tickets: {
            displayName: 'Tickets',
            shortDesc: 'Tickets',
            longDesc: 'Tickets',
          },
          next_page: {
            displayName: 'Next Page',
            shortDesc: 'Next page of tickets',
            longDesc: 'Next page of tickets',
          },
          previous_page: {
            displayName: 'Previous Page',
            shortDesc: 'Previous page of tickets',
            longDesc: 'Previous page of tickets',
          },
        },
        groups: {
          created_at: {
            displayName: 'Created At',
            shortDesc: 'The date and time the group was created',
            longDesc: 'The date and time the group was created',
          },
          default: {
            displayName: 'Default',
            shortDesc: 'Whether the group is default',
            longDesc: 'Whether the group is default',
          },
          description: {
            displayName: 'Description',
            shortDesc: 'The group’s description',
            longDesc: 'The group’s description',
          },
          id: {
            displayName: 'ID',
            shortDesc: 'The group’s ID',
            longDesc: 'The group’s ID',
          },
          name: {
            displayName: 'Name',
            shortDesc: 'The group’s name',
            longDesc: 'The group’s name',
          },
          updated_at: {
            displayName: 'Updated At',
            shortDesc: 'The date and time the group was last updated',
            longDesc: 'The date and time the group was last updated',
          },
          count: {
            displayName: 'Count',
            shortDesc: 'Count of groups',
            longDesc: 'Count of groups',
          },
          deleted: {
            displayName: 'Deleted',
            shortDesc: 'Whether the group is deleted',
            longDesc: 'Whether the group is deleted',
          },
          is_public: {
            displayName: 'Is Public',
            shortDesc: 'Whether the group is public',
            longDesc: 'Whether the group is public',
          },
          url: {
            displayName: 'URL',
            shortDesc: 'The group’s URL',
            longDesc: 'The group’s URL',
          },
          groups: {
            displayName: 'Groups',
            shortDesc: 'Groups',
            longDesc: 'Groups',
          },
          users: {
            displayName: 'Users',
            shortDesc: 'Users',
            longDesc: 'Users',
          },
          next_page: {
            displayName: 'Next Page',
            shortDesc: 'Next page of groups',
            longDesc: 'Next page of groups',
          },
          previoud_page: {
            displayName: 'Previous Page',
            shortDesc: 'Previous page of groups',
            longDesc: 'Previous page of groups',
          },
        },
        organizations: {
          displayName: 'Organizations',
          shortDesc: 'Organizations',
          longDesc: 'Organizations',
          count: {
            displayName: 'Count',
            shortDesc: 'Count of organizations',
            longDesc: 'Count of organizations',
          },
          next_page: {
            displayName: 'Next Page',
            shortDesc: 'Next page of organizations',
            longDesc: 'Next page of organizations',
          },
          created_at: {
            displayName: 'Created At',
            shortDesc: 'The date and time the organization was created',
            longDesc: 'The date and time the organization was created',
          },
          details: {
            displayName: 'Details',
            shortDesc: 'Details of the organization',
            longDesc: 'Details of the organization',
          },
          domain_names: {
            displayName: 'Domain Names',
            shortDesc: 'Domain names of the organization',
            longDesc: 'Domain names of the organization',
          },
          external_id: {
            displayName: 'External ID',
            shortDesc: 'The organization’s external ID',
            longDesc: 'The organization’s external ID',
          },
          group_id: {
            displayName: 'Group ID',
            shortDesc: 'The ID of the organization’s group',
            longDesc: 'The ID of the organization’s group',
          },
          id: {
            displayName: 'ID',
            shortDesc: 'The organization’s ID',
            longDesc: 'The organization’s ID',
          },
          name: {
            displayName: 'Name',
            shortDesc: 'The organization’s name',
            longDesc: 'The organization’s name',
          },
          notes: {
            displayName: 'Notes',
            shortDesc: 'Notes of the organization',
            longDesc: 'Notes of the organization',
          },
          organization_fields: {
            displayName: 'Organization Fields',
            shortDesc: 'Organization fields',
            longDesc: 'Organization fields',
            datepudding: {
              displayName: 'DatePudding',
              shortDesc: 'DatePudding of the organization',
              longDesc: 'DatePudding of the organization',
            },
            org_field_1: {
              displayName: 'Org Field 1',
              shortDesc: 'Organization field 1',
              longDesc: 'Organization field 1',
            },
            org_field_2: {
              displayName: 'Org Field 2',
              shortDesc: 'Organization field 2',
              longDesc: 'Organization field 2',
            },
          },
          shared_comments: {
            displayName: 'Shared Comments',
            shortDesc: 'Whether the organization has shared comments',
            longDesc: 'Whether the organization has shared comments',
          },
          shared_tickets: {
            displayName: 'Shared Tickets',
            shortDesc: 'Whether the organization has shared tickets',
            longDesc: 'Whether the organization has shared tickets',
          },
          tags: {
            displayName: 'Tags',
            shortDesc: 'The organization’s tags',
            longDesc: 'The organization’s tags',
          },
          updated_at: {
            displayName: 'Updated At',
            shortDesc: 'The date and time the organization was last updated',
            longDesc: 'The date and time the organization was last updated',
          },
          url: {
            displayName: 'URL',
            shortDesc: 'The organization’s URL',
            longDesc: 'The organization’s URL',
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
