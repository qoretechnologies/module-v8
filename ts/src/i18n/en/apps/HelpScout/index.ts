const HelpScoutAppEn = {
  displayName: 'Help Scout',
  groups: ['Customer Support'],
  connectionMessage: {
    title: 'OAuth Connection',
    content:
      'Help Scout uses OAuth 2.0 for authentication. You will be redirected to Help Scout to authorize access to your account.',
  },
  shortDesc: 'Connect with Help Scout to manage customer conversations and support tickets',
  longDesc:
    'Integrate with Help Scout to manage customer support conversations, create and update customers, send replies, and track support interactions. This integration enables you to automate support workflows, respond to customers, and maintain customer relationships through Help Scout.',
  actions: {
    add_note: {
      groups: ['Conversations'],
      displayName: 'Add Note to Conversation',
      shortDesc: 'Add an internal note to a conversation',
      longDesc:
        'Add an internal note to an existing conversation in Help Scout. Notes are only visible to your team members and are not sent to the customer. Use notes to document internal discussions, research, or context about a customer issue.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to add the note to',
          longDesc:
            'Select or enter the ID of the conversation where you want to add the note. You can search for conversations by number or subject.',
        },
        text: {
          displayName: 'Note Text',
          shortDesc: 'The content of the note',
          longDesc:
            'The text content of the internal note. This can include HTML formatting. The note will only be visible to your team members.',
        },
        user: {
          displayName: 'User',
          shortDesc: 'The user adding the note',
          longDesc:
            'The Help Scout user who is adding the note. If not specified, defaults to the authenticated user.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Change the conversation status',
          longDesc:
            'Optionally change the conversation status when adding the note. Options include active, closed, open, pending, or spam.',
        },
      },
    },
    create_conversation: {
      groups: ['Conversations'],
      displayName: 'Create Conversation',
      shortDesc: 'Create a new conversation',
      longDesc:
        'Create a new conversation in Help Scout. A conversation represents an email thread or support ticket with a customer. You must specify the mailbox, customer, and initial message content.',
      options: {
        subject: {
          displayName: 'Subject',
          shortDesc: 'The conversation subject line',
          longDesc:
            'The subject line for the conversation. This will be visible to the customer in email communications.',
        },
        mailboxId: {
          displayName: 'Mailbox',
          shortDesc: 'The mailbox to create the conversation in',
          longDesc:
            'Select the Help Scout mailbox (inbox) where this conversation should be created. Each mailbox typically corresponds to a different support email address or team.',
        },
        type: {
          displayName: 'Type',
          shortDesc: 'The conversation type',
          longDesc:
            'The type of conversation: email (standard email thread), phone (phone call record), or chat (live chat conversation).',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The initial conversation status',
          longDesc:
            'The initial status of the conversation. Active means the conversation needs attention, closed means it is resolved, and pending means waiting for customer response.',
        },
        customerId: {
          displayName: 'Customer ID',
          shortDesc: 'The ID of an existing customer',
          longDesc:
            'Select an existing customer from Help Scout. Either Customer ID or Customer Email must be provided.',
        },
        customerEmail: {
          displayName: 'Customer Email',
          shortDesc: 'The email address of the customer',
          longDesc:
            'The email address of the customer. If the customer does not exist, they will be created. Either Customer ID or Customer Email must be provided.',
        },
        threadType: {
          displayName: 'Thread Type',
          shortDesc: 'The type of the initial thread',
          longDesc:
            'The type of the first message in the conversation. Customer means the message is from the customer, reply means it is from your team, and note is an internal note.',
        },
        threadText: {
          displayName: 'Thread Text',
          shortDesc: 'The content of the initial message',
          longDesc:
            'The text content of the first message in the conversation. This can include HTML formatting.',
        },
        assignTo: {
          displayName: 'Assign To',
          shortDesc: 'Assign the conversation to a user',
          longDesc:
            'Optionally assign the conversation to a specific Help Scout user. If not specified, the conversation will be unassigned or follow your mailbox routing rules.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags to add to the conversation',
          longDesc:
            'A list of tag names to add to the conversation. Tags help organize and categorize conversations for easier filtering and reporting.',
        },
        autoReply: {
          displayName: 'Auto Reply',
          shortDesc: 'Enable auto-reply for this conversation',
          longDesc:
            'When set to true, Help Scout will send an auto-reply to the customer if one is configured for the mailbox. Set to false to prevent auto-replies.',
        },
      },
    },
    create_customer: {
      groups: ['Customers'],
      displayName: 'Create Customer',
      shortDesc: 'Create a new customer',
      longDesc:
        'Create a new customer profile in Help Scout. Customers represent the people who contact your support team. You can store their contact information, company details, and other relevant data.',
      options: {
        firstName: {
          displayName: 'First Name',
          shortDesc: 'The customer first name',
          longDesc: 'The first name of the customer. Maximum 40 characters.',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'The customer last name',
          longDesc: 'The last name of the customer. Maximum 40 characters.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'The customer email address',
          longDesc:
            'The primary email address for the customer. This is used to identify the customer when they send emails to your support address.',
        },
        emailType: {
          displayName: 'Email Type',
          shortDesc: 'The type of email address',
          longDesc:
            'Categorize the email address type: work (business email), home (personal email), or other.',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: 'The customer phone number',
          longDesc: 'The phone number for the customer.',
        },
        phoneType: {
          displayName: 'Phone Type',
          shortDesc: 'The type of phone number',
          longDesc:
            'Categorize the phone number type: work, home, mobile, fax, pager, or other.',
        },
        jobTitle: {
          displayName: 'Job Title',
          shortDesc: 'The customer job title',
          longDesc: 'The job title or position of the customer. Maximum 60 characters.',
        },
        organizationId: {
          displayName: 'Organization',
          shortDesc: 'The customer company or organization',
          longDesc: 'The company or organization the customer belongs to.',
        },
        location: {
          displayName: 'Location',
          shortDesc: 'The customer location',
          longDesc: 'The geographic location of the customer. Maximum 60 characters.',
        },
        background: {
          displayName: 'Background',
          shortDesc: 'Background notes about the customer',
          longDesc:
            'Internal notes or background information about the customer. Maximum 200 characters. This is only visible to your team.',
        },
        gender: {
          displayName: 'Gender',
          shortDesc: 'The customer gender',
          longDesc: 'The gender of the customer: male, female, or unknown.',
        },
        age: {
          displayName: 'Age',
          shortDesc: 'The customer age',
          longDesc: 'The age of the customer as a string.',
        },
      },
    },
    update_customer: {
      groups: ['Customers'],
      displayName: 'Update Customer',
      shortDesc: 'Update an existing customer',
      longDesc:
        'Update the profile information of an existing customer in Help Scout. You can modify their name, contact details, organization, and other profile fields.',
      options: {
        customerId: {
          displayName: 'Customer',
          shortDesc: 'The customer to update',
          longDesc: 'Select the customer whose profile you want to update.',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'The new first name',
          longDesc: 'Update the first name of the customer. Maximum 40 characters.',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'The new last name',
          longDesc: 'Update the last name of the customer. Maximum 40 characters.',
        },
        jobTitle: {
          displayName: 'Job Title',
          shortDesc: 'The new job title',
          longDesc: 'Update the job title of the customer. Maximum 60 characters.',
        },
        organization: {
          displayName: 'Organization',
          shortDesc: 'The new organization',
          longDesc: 'Update the company or organization of the customer.',
        },
        location: {
          displayName: 'Location',
          shortDesc: 'The new location',
          longDesc: 'Update the geographic location of the customer. Maximum 60 characters.',
        },
        background: {
          displayName: 'Background',
          shortDesc: 'The new background notes',
          longDesc: 'Update the internal background notes about the customer. Maximum 200 characters.',
        },
        gender: {
          displayName: 'Gender',
          shortDesc: 'The new gender',
          longDesc: 'Update the gender of the customer: male, female, or unknown.',
        },
        age: {
          displayName: 'Age',
          shortDesc: 'The new age',
          longDesc: 'Update the age of the customer.',
        },
      },
    },
    send_reply: {
      groups: ['Conversations'],
      displayName: 'Send Reply',
      shortDesc: 'Send a reply to a conversation',
      longDesc:
        'Send a reply to an existing conversation in Help Scout. The reply will be sent to the customer via email. You can optionally CC/BCC additional recipients, save as draft, or change the conversation status.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to reply to',
          longDesc:
            'Select or enter the ID of the conversation you want to reply to.',
        },
        customerId: {
          displayName: 'Customer',
          shortDesc: 'The customer being replied to',
          longDesc:
            'Select the customer who will receive this reply. This should match the customer associated with the conversation.',
        },
        text: {
          displayName: 'Reply Text',
          shortDesc: 'The content of the reply',
          longDesc:
            'The text content of the reply message. This can include HTML formatting. The reply will be sent to the customer via email.',
        },
        user: {
          displayName: 'User',
          shortDesc: 'The user sending the reply',
          longDesc:
            'The Help Scout user sending the reply. If not specified, defaults to the authenticated user.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Change the conversation status',
          longDesc:
            'Optionally change the conversation status after sending the reply. For example, set to closed after resolving an issue.',
        },
        draft: {
          displayName: 'Save as Draft',
          shortDesc: 'Save the reply as a draft',
          longDesc:
            'When set to true, the reply is saved as a draft and not sent to the customer. You can review and send it later from Help Scout.',
        },
        cc: {
          displayName: 'CC',
          shortDesc: 'Carbon copy email addresses',
          longDesc:
            'A list of email addresses to CC on the reply. These recipients will receive a copy of the email.',
        },
        bcc: {
          displayName: 'BCC',
          shortDesc: 'Blind carbon copy email addresses',
          longDesc:
            'A list of email addresses to BCC on the reply. These recipients will receive a copy of the email without other recipients knowing.',
        },
        assignTo: {
          displayName: 'Assign To',
          shortDesc: 'Assign the conversation after replying',
          longDesc:
            'Optionally assign the conversation to a different Help Scout user after sending the reply.',
        },
      },
    },
    list_customers: {
      groups: ['Customers'],
      displayName: 'List Customers',
      shortDesc: 'Retrieve a list of customers',
      longDesc:
        'Retrieve a list of customers from Help Scout. You can filter customers by mailbox, name, email, or modification date. Results can be sorted and paginated.',
      options: {
        mailbox: {
          displayName: 'Mailbox',
          shortDesc: 'Filter by mailbox',
          longDesc:
            'Only return customers associated with conversations in this mailbox.',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'Filter by first name',
          longDesc:
            'Only return customers with this first name.',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'Filter by last name',
          longDesc:
            'Only return customers with this last name.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'Filter by email address',
          longDesc:
            'Only return customers with this email address.',
        },
        modifiedSince: {
          displayName: 'Modified Since',
          shortDesc: 'Filter by modification date',
          longDesc:
            'Only return customers modified on or after this date.',
        },
        sortField: {
          displayName: 'Sort Field',
          shortDesc: 'Field to sort by',
          longDesc:
            'The field to sort results by: createdAt, firstName, lastName, or modifiedAt.',
        },
        sortOrder: {
          displayName: 'Sort Order',
          shortDesc: 'Sort order direction',
          longDesc:
            'The direction to sort results: desc (newest first) or asc (oldest first).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of customers to return',
          longDesc:
            'The maximum number of customer records to return. Default is 50.',
        },
      },
    },
    list_conversations: {
      groups: ['Conversations'],
      displayName: 'List Conversations',
      shortDesc: 'Retrieve a list of conversations',
      longDesc:
        'Retrieve a list of conversations from Help Scout. You can filter by mailbox, status, assignee, tags, and more. Results can be sorted and paginated.',
      options: {
        mailbox: {
          displayName: 'Mailbox',
          shortDesc: 'Filter by mailbox',
          longDesc:
            'Only return conversations from this mailbox.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by conversation status',
          longDesc:
            'Only return conversations with this status: all, active, closed, open, pending, or spam.',
        },
        assignedTo: {
          displayName: 'Assigned To',
          shortDesc: 'Filter by assignee',
          longDesc:
            'Only return conversations assigned to this user.',
        },
        tag: {
          displayName: 'Tag',
          shortDesc: 'Filter by tag',
          longDesc:
            'Only return conversations with this tag. You can specify multiple tags separated by commas.',
        },
        modifiedSince: {
          displayName: 'Modified Since',
          shortDesc: 'Filter by modification date',
          longDesc:
            'Only return conversations modified on or after this date.',
        },
        sortField: {
          displayName: 'Sort Field',
          shortDesc: 'Field to sort by',
          longDesc:
            'The field to sort results by: createdAt, customerEmail, customerName, mailboxid, modifiedAt, number, status, or subject.',
        },
        sortOrder: {
          displayName: 'Sort Order',
          shortDesc: 'Sort order direction',
          longDesc:
            'The direction to sort results: desc (newest first) or asc (oldest first).',
        },
        query: {
          displayName: 'Query',
          shortDesc: 'Advanced search query',
          longDesc:
            'An advanced search query using Help Scout query syntax. For example: (subject:"billing issue") AND (status:active)',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of conversations to return',
          longDesc:
            'The maximum number of conversation records to return. Default is 50.',
        },
      },
    },
    find_mailbox: {
      groups: ['Mailboxes'],
      displayName: 'Find Mailbox by Name',
      shortDesc: 'Find a mailbox by its name',
      longDesc:
        'Search for a mailbox in Help Scout by its name. Returns the mailbox details if found. The search is case-insensitive and supports partial matching.',
      options: {
        name: {
          displayName: 'Mailbox Name',
          shortDesc: 'The name of the mailbox to find',
          longDesc:
            'The name of the mailbox to search for. The search is case-insensitive and will match partial names or slugs.',
        },
      },
    },
    list_users: {
      groups: ['Users'],
      displayName: 'List Users',
      shortDesc: 'Retrieve a list of Help Scout users',
      longDesc:
        'Retrieve a list of users from your Help Scout account. You can filter users by email address or mailbox. Returns all user types including those who have not yet accepted their invitations.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Filter by email address',
          longDesc:
            'Only return users with this exact email address.',
        },
        mailbox: {
          displayName: 'Mailbox',
          shortDesc: 'Filter by mailbox',
          longDesc:
            'Only return users associated with this mailbox.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of users to return',
          longDesc:
            'The maximum number of user records to return. Default is 50.',
        },
      },
    },
    get_company_report: {
      groups: ['Reports'],
      displayName: 'Get Company Report',
      shortDesc: 'Get company-wide performance report',
      longDesc:
        'Retrieve a company-wide performance report from Help Scout. Includes metrics like customers helped, closed conversations, total replies, and happiness scores. Only available on Plus and Pro plans.',
      options: {
        start: {
          displayName: 'Start Date',
          shortDesc: 'Start of the reporting period',
          longDesc:
            'The start date and time for the reporting period in ISO 8601 format.',
        },
        end: {
          displayName: 'End Date',
          shortDesc: 'End of the reporting period',
          longDesc:
            'The end date and time for the reporting period in ISO 8601 format.',
        },
        previousStart: {
          displayName: 'Previous Start',
          shortDesc: 'Start of the comparison period',
          longDesc:
            'The start date for a previous period to compare against. Used to calculate deltas.',
        },
        previousEnd: {
          displayName: 'Previous End',
          shortDesc: 'End of the comparison period',
          longDesc:
            'The end date for a previous period to compare against. Used to calculate deltas.',
        },
        mailboxes: {
          displayName: 'Mailboxes',
          shortDesc: 'Filter by mailbox IDs',
          longDesc:
            'Comma-separated list of mailbox IDs to filter the report by.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tag IDs',
          longDesc:
            'Comma-separated list of tag IDs to filter the report by.',
        },
        types: {
          displayName: 'Types',
          shortDesc: 'Filter by conversation types',
          longDesc:
            'Filter by conversation type: email, chat, or phone.',
        },
        folders: {
          displayName: 'Folders',
          shortDesc: 'Filter by folder IDs',
          longDesc:
            'Comma-separated list of folder IDs to filter the report by.',
        },
      },
    },
    get_email_report: {
      groups: ['Reports'],
      displayName: 'Get Email Report',
      shortDesc: 'Get email channel performance report',
      longDesc:
        'Retrieve an email channel performance report from Help Scout. Includes volume metrics, resolution times, response times, and time distribution data. Only available on Plus and Pro plans.',
      options: {
        start: {
          displayName: 'Start Date',
          shortDesc: 'Start of the reporting period',
          longDesc:
            'The start date and time for the reporting period in ISO 8601 format.',
        },
        end: {
          displayName: 'End Date',
          shortDesc: 'End of the reporting period',
          longDesc:
            'The end date and time for the reporting period in ISO 8601 format.',
        },
        previousStart: {
          displayName: 'Previous Start',
          shortDesc: 'Start of the comparison period',
          longDesc:
            'The start date for a previous period to compare against. Used to calculate deltas.',
        },
        previousEnd: {
          displayName: 'Previous End',
          shortDesc: 'End of the comparison period',
          longDesc:
            'The end date for a previous period to compare against. Used to calculate deltas.',
        },
        mailboxes: {
          displayName: 'Mailboxes',
          shortDesc: 'Filter by mailbox IDs',
          longDesc:
            'Comma-separated list of mailbox IDs to filter the report by.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Filter by tag IDs',
          longDesc:
            'Comma-separated list of tag IDs to filter the report by.',
        },
        folders: {
          displayName: 'Folders',
          shortDesc: 'Filter by folder IDs',
          longDesc:
            'Comma-separated list of folder IDs to filter the report by.',
        },
        officeHours: {
          displayName: 'Office Hours',
          shortDesc: 'Consider office hours in calculations',
          longDesc:
            'When set to true, time-based metrics will only consider office hours. Defaults to false.',
        },
      },
    },
    get_conversation: {
      groups: ['Conversations'],
      displayName: 'Get Conversation',
      shortDesc: 'Retrieve a single conversation by ID',
      longDesc:
        'Retrieve the full details of a specific conversation from Help Scout by its ID. Returns all conversation data including subject, status, customer information, tags, and custom fields.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to retrieve',
          longDesc:
            'Select or enter the ID of the conversation you want to retrieve.',
        },
      },
    },
    update_conversation: {
      groups: ['Conversations'],
      displayName: 'Update Conversation',
      shortDesc: 'Update an existing conversation',
      longDesc:
        'Update the properties of an existing conversation in Help Scout. You can change the subject, status, or assignee. At least one field must be provided to update.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to update',
          longDesc:
            'Select or enter the ID of the conversation you want to update.',
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'The new subject line',
          longDesc:
            'Update the subject line of the conversation. This will be visible to the customer in email communications.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The new conversation status',
          longDesc:
            'Update the status of the conversation. Options include active, closed, or pending.',
        },
        assignTo: {
          displayName: 'Assign To',
          shortDesc: 'Assign to a user',
          longDesc:
            'Assign or reassign the conversation to a specific Help Scout user.',
        },
      },
    },
    delete_conversation: {
      groups: ['Conversations'],
      displayName: 'Delete Conversation',
      shortDesc: 'Delete a conversation',
      longDesc:
        'Delete a conversation from Help Scout. This action moves the conversation to the trash. Be cautious as this action may be irreversible depending on your Help Scout settings.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to delete',
          longDesc:
            'Select or enter the ID of the conversation you want to delete.',
        },
      },
    },
    add_tags: {
      groups: ['Conversations'],
      displayName: 'Add Tags to Conversation',
      shortDesc: 'Add tags to a conversation',
      longDesc:
        'Add one or more tags to an existing conversation in Help Scout. Tags help organize and categorize conversations for easier filtering, reporting, and workflow automation.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to add tags to',
          longDesc:
            'Select or enter the ID of the conversation you want to add tags to.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags to add',
          longDesc:
            'A list of tag names to add to the conversation. Tags are case-insensitive and will be created if they do not already exist.',
        },
      },
    },
    list_threads: {
      groups: ['Threads'],
      displayName: 'List Threads',
      shortDesc: 'List all threads in a conversation',
      longDesc:
        'Retrieve all threads (messages) within a specific conversation. Threads include customer messages, agent replies, notes, and other conversation activities.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to list threads from',
          longDesc:
            'Select or enter the ID of the conversation whose threads you want to retrieve.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of threads to return',
          longDesc:
            'The maximum number of thread records to return. Default is 50.',
        },
      },
    },
    get_thread: {
      groups: ['Threads'],
      displayName: 'Get Thread',
      shortDesc: 'Retrieve a specific thread by ID',
      longDesc:
        'Retrieve the full details of a specific thread (message) within a conversation. Returns the thread content, type, status, and metadata.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation containing the thread',
          longDesc:
            'Select or enter the ID of the conversation that contains the thread.',
        },
        threadId: {
          displayName: 'Thread ID',
          shortDesc: 'The thread to retrieve',
          longDesc:
            'Enter the ID of the specific thread you want to retrieve.',
        },
      },
    },
    get_customer: {
      groups: ['Customers'],
      displayName: 'Get Customer',
      shortDesc: 'Retrieve a single customer by ID',
      longDesc:
        'Retrieve the full details of a specific customer from Help Scout by their ID. Returns all customer data including contact information, organization, and custom fields.',
      options: {
        customerId: {
          displayName: 'Customer',
          shortDesc: 'The customer to retrieve',
          longDesc:
            'Select or enter the ID of the customer whose profile you want to retrieve.',
        },
      },
    },
    delete_customer: {
      groups: ['Customers'],
      displayName: 'Delete Customer',
      shortDesc: 'Delete a customer',
      longDesc:
        'Delete a customer profile from Help Scout. Be cautious as this action may affect conversation history and is typically irreversible.',
      options: {
        customerId: {
          displayName: 'Customer',
          shortDesc: 'The customer to delete',
          longDesc:
            'Select or enter the ID of the customer you want to delete.',
        },
      },
    },
    search_customers: {
      groups: ['Customers'],
      displayName: 'Search Customers',
      shortDesc: 'Search for customers using a query',
      longDesc:
        'Search for customers in Help Scout using a query string. You can search by email, name, phone number, or other customer properties using Help Scout query syntax.',
      options: {
        query: {
          displayName: 'Query',
          shortDesc: 'Search query',
          longDesc:
            'The search query using Help Scout query syntax. Examples: (email:"john@example.com"), (firstName:"John"), (phone:"555-1234"). You can combine multiple conditions with AND/OR operators.',
        },
        sortField: {
          displayName: 'Sort Field',
          shortDesc: 'Field to sort by',
          longDesc:
            'The field to sort results by: createdAt, firstName, lastName, or modifiedAt.',
        },
        sortOrder: {
          displayName: 'Sort Order',
          shortDesc: 'Sort order direction',
          longDesc:
            'The direction to sort results: desc (newest first) or asc (oldest first).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of customers to return',
          longDesc:
            'The maximum number of customer records to return. Default is 50.',
        },
      },
    },
    list_saved_replies: {
      groups: ['Saved Replies'],
      displayName: 'List Saved Replies',
      shortDesc: 'List saved replies for a mailbox',
      longDesc:
        'Retrieve a list of saved reply templates for a specific mailbox. Saved replies are pre-written response templates that agents can use to quickly respond to common questions.',
      options: {
        mailboxId: {
          displayName: 'Mailbox',
          shortDesc: 'The mailbox to list saved replies from',
          longDesc:
            'Select the mailbox whose saved replies you want to retrieve. Saved replies are specific to each mailbox.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of saved replies to return',
          longDesc:
            'The maximum number of saved reply records to return. Default is 50.',
        },
      },
    },
    new_customer: {
      groups: ['Customers'],
      displayName: 'New Customer',
      shortDesc: 'Triggers when a new customer is created',
      longDesc:
        'This trigger fires whenever a new customer is created in Help Scout. It provides the full customer profile including contact information, organization, and custom fields.',
      options: {},
    },
    updated_customer: {
      groups: ['Customers'],
      displayName: 'Updated Customer',
      shortDesc: 'Triggers when a customer is updated',
      longDesc:
        'This trigger fires whenever a customer profile is updated in Help Scout. It provides the updated customer data including any changed fields.',
      options: {},
    },
    new_organization: {
      groups: ['Organizations'],
      displayName: 'New Organization',
      shortDesc: 'Triggers when a new organization is created',
      longDesc:
        'This trigger fires whenever a new organization is created in Help Scout. Organizations help group customers from the same company.',
      options: {},
    },
    new_conversation: {
      groups: ['Conversations'],
      displayName: 'New Conversation',
      shortDesc: 'Triggers when a new conversation is created',
      longDesc:
        'This trigger fires whenever a new conversation (support ticket) is created in Help Scout. You can optionally filter by mailbox to only receive events from specific inboxes.',
      options: {
        mailboxId: {
          displayName: 'Mailbox',
          shortDesc: 'Filter by mailbox',
          longDesc:
            'Optionally filter to only trigger for conversations in a specific mailbox. Leave empty to trigger for all mailboxes.',
        },
      },
    },
    assigned_conversation: {
      groups: ['Conversations'],
      displayName: 'Assigned Conversation',
      shortDesc: 'Triggers when a conversation is assigned',
      longDesc:
        'This trigger fires whenever a conversation is assigned to a user in Help Scout. This includes both new assignments and reassignments.',
      options: {
        mailboxId: {
          displayName: 'Mailbox',
          shortDesc: 'Filter by mailbox',
          longDesc:
            'Optionally filter to only trigger for conversations in a specific mailbox. Leave empty to trigger for all mailboxes.',
        },
      },
    },
  },
};

export default HelpScoutAppEn;
