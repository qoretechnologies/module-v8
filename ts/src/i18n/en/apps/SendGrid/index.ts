const SendGridAppEn = {
  displayName: 'SendGrid',
  groups: ['Email & Email Marketing'],
  connectionMessage: {
    title: 'API Key Instructions',
    content: `To connect your SendGrid account, you'll need an API key. You can create one in your SendGrid dashboard at https://app.sendgrid.com/settings/api_keys. Ensure your API key has the appropriate permissions for the features you want to use: Mail Send for sending emails, Email Validation for deliverability checks, Suppressions for managing blocks/bounces/unsubscribes, and Marketing for contact management.`,
  },
  shortDesc: 'Connect with SendGrid to send emails, manage contacts, and handle suppressions',
  longDesc:
    'Integrate with Twilio SendGrid for comprehensive email management. Send transactional and marketing emails, manage your contact lists, validate email addresses for deliverability, and maintain your sender reputation by handling suppressions including blocks, bounces, and global unsubscribes. This integration provides full control over your email infrastructure and helps ensure high deliverability rates.',
  actions: {
    // Blocks
    list_blocks: {
      groups: ['Suppressions'],
      displayName: 'List Blocks',
      shortDesc: 'Retrieve a list of blocked email addresses',
      longDesc:
        'Retrieve a list of all email addresses that are currently on your blocks list. Blocked addresses are emails that have been rejected by receiving servers. You can filter by time range and paginate through results.',
      options: {
        startTime: {
          displayName: 'Start Time',
          shortDesc: 'Filter blocks created after this Unix timestamp',
          longDesc:
            'Retrieve blocks that were created after this point in time. Provide the time as a Unix timestamp (seconds since epoch).',
        },
        endTime: {
          displayName: 'End Time',
          shortDesc: 'Filter blocks created before this Unix timestamp',
          longDesc:
            'Retrieve blocks that were created before this point in time. Provide the time as a Unix timestamp (seconds since epoch).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of blocks to return',
          longDesc: 'The maximum number of block records to return. Default is 500.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Starting point in the list of results',
          longDesc: 'The starting point in the list of results for pagination. Default is 0.',
        },
      },
    },
    get_block: {
      groups: ['Suppressions'],
      displayName: 'Get a Block',
      shortDesc: 'Retrieve details of a specific blocked email',
      longDesc:
        'Fetch detailed information about a specific blocked email address, including the reason for the block and when it was added to the list.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'The blocked email address to retrieve',
          longDesc:
            'The email address to retrieve from the blocks list. This should be the exact email address that was blocked.',
        },
      },
    },
    delete_blocks: {
      groups: ['Suppressions'],
      displayName: 'Delete Blocks',
      shortDesc: 'Delete blocked email addresses from your list',
      longDesc:
        'Remove email addresses from your blocks list. You can either delete all blocks at once or specify individual email addresses to remove. Deleting blocks allows those addresses to receive emails again.',
      options: {
        deleteAll: {
          displayName: 'Delete All',
          shortDesc: 'Delete all blocked emails',
          longDesc:
            'Set to true to delete all blocked email addresses from your list. When true, the emails parameter is ignored.',
        },
        emails: {
          displayName: 'Emails',
          shortDesc: 'List of email addresses to delete',
          longDesc:
            'An array of email addresses to remove from the blocks list. Required if Delete All is not set to true.',
        },
      },
    },

    // Bounces
    get_all_bounces: {
      groups: ['Suppressions'],
      displayName: 'Get All Bounces',
      shortDesc: 'Retrieve a list of bounced email addresses',
      longDesc:
        'Retrieve a list of all email addresses that have bounced. Bounces occur when an email cannot be delivered to the recipient. You can filter by time range and paginate through results.',
      options: {
        startTime: {
          displayName: 'Start Time',
          shortDesc: 'Filter bounces created after this Unix timestamp',
          longDesc:
            'Retrieve bounces that were created after this point in time. Provide the time as a Unix timestamp (seconds since epoch).',
        },
        endTime: {
          displayName: 'End Time',
          shortDesc: 'Filter bounces created before this Unix timestamp',
          longDesc:
            'Retrieve bounces that were created before this point in time. Provide the time as a Unix timestamp (seconds since epoch).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of bounces to return',
          longDesc: 'The maximum number of bounce records to return. Default is 500.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Starting point in the list of results',
          longDesc: 'The starting point in the list of results for pagination. Default is 0.',
        },
      },
    },
    delete_bounces: {
      groups: ['Suppressions'],
      displayName: 'Delete Bounces',
      shortDesc: 'Delete bounced email addresses from your list',
      longDesc:
        'Remove email addresses from your bounces list. You can either delete all bounces at once or specify individual email addresses to remove. Deleting bounces allows those addresses to receive emails again.',
      options: {
        deleteAll: {
          displayName: 'Delete All',
          shortDesc: 'Delete all bounced emails',
          longDesc:
            'Set to true to delete all bounced email addresses from your list. When true, the emails parameter is ignored.',
        },
        emails: {
          displayName: 'Emails',
          shortDesc: 'List of email addresses to delete',
          longDesc:
            'An array of email addresses to remove from the bounces list. Required if Delete All is not set to true.',
        },
      },
    },

    // Global Suppressions
    list_global_suppressions: {
      groups: ['Suppressions'],
      displayName: 'List Global Suppressions',
      shortDesc: 'Retrieve a list of globally unsubscribed email addresses',
      longDesc:
        'Retrieve a list of all email addresses that have globally unsubscribed from all of your emails. These addresses will not receive any emails from your account until they are removed from this list.',
      options: {
        startTime: {
          displayName: 'Start Time',
          shortDesc: 'Filter suppressions created after this Unix timestamp',
          longDesc:
            'Retrieve suppressions that were created after this point in time. Provide the time as a Unix timestamp (seconds since epoch).',
        },
        endTime: {
          displayName: 'End Time',
          shortDesc: 'Filter suppressions created before this Unix timestamp',
          longDesc:
            'Retrieve suppressions that were created before this point in time. Provide the time as a Unix timestamp (seconds since epoch).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of suppressions to return',
          longDesc: 'The maximum number of suppression records to return. Default is 500.',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Starting point in the list of results',
          longDesc: 'The starting point in the list of results for pagination. Default is 0.',
        },
      },
    },
    get_global_suppression: {
      groups: ['Suppressions'],
      displayName: 'Get a Global Suppression',
      shortDesc: 'Retrieve details of a specific globally suppressed email',
      longDesc:
        'Check if a specific email address is on the global suppression list and retrieve its details.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'The email address to check',
          longDesc:
            'The email address to look up in the global suppression list. Returns the suppression details if found.',
        },
      },
    },
    add_global_suppressions: {
      groups: ['Suppressions'],
      displayName: 'Add Global Suppressions',
      shortDesc: 'Add email addresses to the global suppression list',
      longDesc:
        'Add one or more email addresses to the global suppression list. These addresses will no longer receive any emails from your account until they are removed from the list.',
      options: {
        emails: {
          displayName: 'Emails',
          shortDesc: 'List of email addresses to add',
          longDesc:
            'An array of email addresses to add to the global suppression list. These addresses will be blocked from receiving all future emails.',
        },
      },
    },
    delete_global_suppression: {
      groups: ['Suppressions'],
      displayName: 'Delete a Global Suppression',
      shortDesc: 'Remove an email address from the global suppression list',
      longDesc:
        'Remove an email address from the global suppression list. This will allow the address to receive emails from your account again.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'The email address to remove',
          longDesc:
            'The email address to remove from the global suppression list. Once removed, this address will be able to receive emails again.',
        },
      },
    },

    // Lists
    create_list: {
      groups: ['Contacts'],
      displayName: 'Create a List',
      shortDesc: 'Create a new contact list',
      longDesc:
        'Create a new recipient list for organizing your contacts. Lists help you segment your audience for targeted marketing campaigns.',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'The name of the new list',
          longDesc:
            'A descriptive name for your contact list. Choose a name that clearly identifies the purpose or audience of the list.',
        },
      },
    },
    get_all_lists: {
      groups: ['Contacts'],
      displayName: 'Get All Lists',
      shortDesc: 'Retrieve all contact lists',
      longDesc:
        'Retrieve all recipient lists in your SendGrid account. Returns list details including name and recipient count.',
      options: {},
    },
    delete_list: {
      groups: ['Contacts'],
      displayName: 'Delete a List',
      shortDesc: 'Delete a contact list',
      longDesc:
        'Delete a recipient list from your SendGrid account. You can optionally delete all contacts within the list as well.',
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'The ID of the list to delete',
          longDesc:
            'The unique identifier of the list you want to delete. Select from your existing lists.',
        },
        deleteContacts: {
          displayName: 'Delete Contacts',
          shortDesc: 'Also delete all contacts in the list',
          longDesc:
            'When set to true, all contacts within the list will also be permanently deleted from your contact database. Use with caution.',
        },
      },
    },
    add_or_update_contact: {
      groups: ['Contacts'],
      displayName: 'Add or Update a Contact',
      shortDesc: 'Add a new contact or update an existing one',
      longDesc:
        'Add a new contact to your SendGrid contact database or update an existing contact if the email already exists. You can also assign the contact to one or more lists.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'The email address of the contact',
          longDesc:
            'The email address for the contact. This is the unique identifier - if a contact with this email exists, it will be updated.',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'The first name of the contact',
          longDesc: "The contact's first name.",
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'The last name of the contact',
          longDesc: "The contact's last name.",
        },
        listIds: {
          displayName: 'List IDs',
          shortDesc: 'Lists to add the contact to',
          longDesc:
            'One or more list IDs to add this contact to. The contact will be added to all specified lists.',
        },
        customFields: {
          displayName: 'Custom Fields',
          shortDesc: 'Additional custom field values',
          longDesc:
            'A JSON object containing custom field names and values. Custom fields must be created in your SendGrid account first.',
        },
      },
    },
    search_contacts: {
      groups: ['Contacts'],
      displayName: 'Search for Contacts',
      shortDesc: 'Search contacts by field value',
      longDesc:
        'Search your contact database for contacts matching a specific field value. You can search by email, name, or any custom field.',
      options: {
        fieldName: {
          displayName: 'Field Name',
          shortDesc: 'The field to search on',
          longDesc:
            'The name of the field to search. Common fields include `email`, `first_name`, `last_name`, or any custom field name.',
        },
        value: {
          displayName: 'Value',
          shortDesc: 'The value to search for',
          longDesc:
            'The value to match against the specified field. Text fields may require URL encoding.',
        },
      },
    },
    delete_contacts: {
      groups: ['Contacts'],
      displayName: 'Delete Contacts',
      shortDesc: 'Permanently delete contacts from your database',
      longDesc:
        'Permanently delete one or more contacts from your SendGrid contact database. This action cannot be undone.',
      options: {
        contactIds: {
          displayName: 'Contact IDs',
          shortDesc: 'The IDs of contacts to delete',
          longDesc:
            'An array of contact IDs to delete. Select from your existing contacts. All selected contacts will be permanently removed.',
        },
      },
    },
    remove_contacts_from_list: {
      groups: ['Contacts'],
      displayName: 'Remove Contacts from List',
      shortDesc: 'Remove contacts from a specific list',
      longDesc:
        'Remove one or more contacts from a specific list without deleting them from your contact database. The contacts will remain in your database but will no longer be associated with the specified list.',
      options: {
        listId: {
          displayName: 'List ID',
          shortDesc: 'The list to remove contacts from',
          longDesc: 'The unique identifier of the list from which you want to remove contacts.',
        },
        contactIds: {
          displayName: 'Contact IDs',
          shortDesc: 'The contacts to remove from the list',
          longDesc:
            'An array of contact IDs to remove from the list. The contacts will remain in your database but will be unlinked from this list.',
        },
      },
    },

    // Email Validation
    validate_email: {
      groups: ['Deliverability'],
      displayName: 'Validate Email',
      shortDesc: 'Validate an email address for deliverability',
      longDesc:
        'Check if an email address is valid and likely to receive emails. Returns a verdict (Valid, Risky, or Invalid) along with detailed checks including domain validity, suspected disposable address detection, and bounce history.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'The email address to validate',
          longDesc:
            'The email address you want to validate. The validation will check syntax, domain records, and historical data.',
        },
        source: {
          displayName: 'Source',
          shortDesc: 'Optional source identifier for tracking',
          longDesc:
            'An optional source string to help you track where the validation request originated from.',
        },
      },
    },

    // Email
    send_email: {
      groups: ['Email'],
      displayName: 'Send Email',
      shortDesc: 'Send an email message',
      longDesc:
        'Send a transactional email to one or more recipients. You can send plain text, HTML, or both. Supports CC, BCC, and custom reply-to addresses.',
      options: {
        toEmail: {
          displayName: 'To Email',
          shortDesc: 'The recipient email address',
          longDesc: 'The email address of the primary recipient.',
        },
        toName: {
          displayName: 'To Name',
          shortDesc: 'The recipient name',
          longDesc: "Optional name of the recipient to personalize the 'To' field.",
        },
        fromEmail: {
          displayName: 'From Email',
          shortDesc: 'The sender email address',
          longDesc:
            'The email address that will appear as the sender. Must be a verified sender in your SendGrid account.',
        },
        fromName: {
          displayName: 'From Name',
          shortDesc: 'The sender name',
          longDesc: "Optional name to display as the sender in the 'From' field.",
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'The email subject line',
          longDesc: 'The subject line of the email.',
        },
        textContent: {
          displayName: 'Text Content',
          shortDesc: 'Plain text content of the email',
          longDesc:
            'The plain text version of the email content. Either text content or HTML content (or both) must be provided.',
        },
        htmlContent: {
          displayName: 'HTML Content',
          shortDesc: 'HTML content of the email',
          longDesc:
            'The HTML version of the email content. Either text content or HTML content (or both) must be provided.',
        },
        replyToEmail: {
          displayName: 'Reply-To Email',
          shortDesc: 'Email address for replies',
          longDesc:
            'Optional email address that recipients should reply to. If not provided, replies will go to the sender address.',
        },
        replyToName: {
          displayName: 'Reply-To Name',
          shortDesc: 'Name for the reply-to address',
          longDesc: 'Optional name to display for the reply-to address.',
        },
        ccEmails: {
          displayName: 'CC Emails',
          shortDesc: 'Carbon copy recipients',
          longDesc: 'An array of email addresses to include as CC recipients.',
        },
        bccEmails: {
          displayName: 'BCC Emails',
          shortDesc: 'Blind carbon copy recipients',
          longDesc: 'An array of email addresses to include as BCC recipients.',
        },
      },
    },

    send_template_email: {
      groups: ['Email'],
      displayName: 'Send Template Email',
      shortDesc: 'Send an email message using a SendGrid template',
      longDesc:
        'Send a transactional email using a predefined SendGrid dynamic template. Customize the email content by providing dynamic template data for personalization.',
      options: {
        toEmail: {
          displayName: 'To Email',
          shortDesc: 'The recipient email address',
          longDesc: 'The email address of the primary recipient.',
        },
        toName: {
          displayName: 'To Name',
          shortDesc: 'The recipient name',
          longDesc: "Optional name of the recipient to personalize the 'To' field.",
        },
        fromEmail: {
          displayName: 'From Email',
          shortDesc: 'The sender email address',
          longDesc:
            'The email address that will appear as the sender. Must be a verified sender in your SendGrid account.',
        },
        fromName: {
          displayName: 'From Name',
          shortDesc: 'The sender name',
          longDesc: "Optional name to display as the sender in the 'From' field.",
        },
        replyToEmail: {
          displayName: 'Reply-To Email',
          shortDesc: 'Email address for replies',
          longDesc:
            'Optional email address that recipients should reply to. If not provided, replies will go to the sender address.',
        },
        replyToName: {
          displayName: 'Reply-To Name',
          shortDesc: 'Name for the reply-to address',
          longDesc: 'Optional name to display for the reply-to address.',
        },
        ccEmails: {
          displayName: 'CC Emails',
          shortDesc: 'Carbon copy recipients',
          longDesc: 'An array of email addresses to include as CC recipients.',
        },
        bccEmails: {
          displayName: 'BCC Emails',
          shortDesc: 'Blind carbon copy recipients',
          longDesc: 'An array of email addresses to include as BCC recipients.',
        },
        templateId: {
          displayName: 'Template ID',
          shortDesc: 'The SendGrid template to use',
          longDesc:
            'Select the dynamic template to use for this email. The template must be created in your SendGrid account.',
        },
        values: {
          displayName: 'Template Values',
          shortDesc: 'Dynamic data for template personalization',
          longDesc:
            'A JSON object containing key-value pairs for dynamic template data. These values will replace the corresponding placeholders in the selected template.',
        },
      },
    },
  },
};

export default SendGridAppEn;
