const FrontAppEn = {
  displayName: 'Front',
  groups: ['Customer Support', 'Communication'],
  connectionMessage: {
    title: 'OAuth Connection',
    content:
      'Front uses OAuth 2.0 for authentication. You will be redirected to Front to authorize access to your account.',
  },
  shortDesc: 'Connect with Front to manage shared inboxes, contacts, and customer communications',
  longDesc:
    'Integrate with Front to manage your team shared inboxes, contacts, accounts, and customer conversations. Front is a customer communication platform that brings email and messaging into a shared inbox. This integration enables you to automate contact management, organize accounts, and streamline team collaboration.',
  actions: {
    // Account actions
    list_accounts: {
      groups: ['Accounts'],
      displayName: 'List Accounts',
      shortDesc: 'Retrieve a list of accounts',
      longDesc:
        'Retrieve a list of all accounts in your Front workspace. Accounts represent companies or organizations that your contacts belong to. Use accounts to group contacts and track interactions at the company level.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of accounts to return',
          longDesc:
            'The maximum number of account records to return. Default is 50. Use pagination for larger datasets.',
        },
      },
    },
    get_account: {
      groups: ['Accounts'],
      displayName: 'Get Account',
      shortDesc: 'Retrieve a single account by ID',
      longDesc:
        'Retrieve the full details of a specific account from Front by its ID. Returns all account data including name, description, domains, external ID, and custom fields.',
      options: {
        accountId: {
          displayName: 'Account',
          shortDesc: 'The account to retrieve',
          longDesc:
            'Select or enter the ID of the account you want to retrieve. Account IDs start with "acc_".',
        },
      },
    },
    create_account: {
      groups: ['Accounts'],
      displayName: 'Create Account',
      shortDesc: 'Create a new account',
      longDesc:
        'Create a new account in Front. Accounts represent companies or organizations and can be used to group related contacts together. You can associate domains with accounts to automatically link contacts.',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'The account name',
          longDesc:
            'The name of the account, typically the company or organization name. This is a required field.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'A description of the account',
          longDesc:
            'An optional description providing additional context about the account, such as the type of business or relationship.',
        },
        domains: {
          displayName: 'Domains',
          shortDesc: 'Email domains associated with the account',
          longDesc:
            'A list of email domains (e.g., "example.com") associated with this account. Contacts with email addresses from these domains can be automatically linked to the account.',
        },
        externalId: {
          displayName: 'External ID',
          shortDesc: 'External system identifier',
          longDesc:
            'An optional external ID to link this account to a record in another system, such as a CRM or billing platform.',
        },
        customFields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc:
            'An object containing custom field values for the account. The keys should match your configured custom field names.',
        },
      },
    },
    update_account: {
      groups: ['Accounts'],
      displayName: 'Update Account',
      shortDesc: 'Update an existing account',
      longDesc:
        'Update the properties of an existing account in Front. You can modify the name, description, domains, external ID, or custom fields. At least one field must be provided to update.',
      options: {
        accountId: {
          displayName: 'Account',
          shortDesc: 'The account to update',
          longDesc: 'Select or enter the ID of the account you want to update.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'The new account name',
          longDesc: 'Update the name of the account.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'The new description',
          longDesc: 'Update the description of the account.',
        },
        domains: {
          displayName: 'Domains',
          shortDesc: 'The new list of domains',
          longDesc:
            'Update the list of email domains associated with this account. This will replace the existing domains.',
        },
        externalId: {
          displayName: 'External ID',
          shortDesc: 'The new external ID',
          longDesc: 'Update the external system identifier for this account.',
        },
        customFields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom field values',
          longDesc: 'Update custom field values for the account.',
        },
      },
    },
    delete_account: {
      groups: ['Accounts'],
      displayName: 'Delete Account',
      shortDesc: 'Delete an account',
      longDesc:
        'Delete an account from Front. This action is permanent. Contacts associated with the account will not be deleted but will no longer be linked to this account.',
      options: {
        accountId: {
          displayName: 'Account',
          shortDesc: 'The account to delete',
          longDesc: 'Select or enter the ID of the account you want to delete.',
        },
      },
    },
    // Account-Contact actions
    list_account_contacts: {
      groups: ['Accounts'],
      displayName: 'List Account Contacts',
      shortDesc: 'List contacts associated with an account',
      longDesc:
        'Retrieve a list of all contacts that are associated with a specific account. This helps you see all the people from a particular company or organization.',
      options: {
        accountId: {
          displayName: 'Account',
          shortDesc: 'The account to list contacts from',
          longDesc: 'Select or enter the ID of the account whose contacts you want to retrieve.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of contacts to return',
          longDesc: 'The maximum number of contact records to return. Default is 50.',
        },
      },
    },
    add_contact_to_account: {
      groups: ['Accounts'],
      displayName: 'Add Contact to Account',
      shortDesc: 'Add contacts to an account',
      longDesc:
        'Add one or more contacts to an account in Front. This creates an association between the contacts and the account, helping you organize contacts by company or organization.',
      options: {
        accountId: {
          displayName: 'Account',
          shortDesc: 'The account to add contacts to',
          longDesc: 'Select or enter the ID of the account where you want to add contacts.',
        },
        contactIds: {
          displayName: 'Contacts',
          shortDesc: 'The contacts to add',
          longDesc:
            'Select one or more contacts to add to the account. Contact IDs start with "crd_".',
        },
      },
    },
    remove_contact_from_account: {
      groups: ['Accounts'],
      displayName: 'Remove Contact from Account',
      shortDesc: 'Remove contacts from an account',
      longDesc:
        'Remove one or more contacts from an account in Front. This removes the association between the contacts and the account but does not delete the contacts themselves.',
      options: {
        accountId: {
          displayName: 'Account',
          shortDesc: 'The account to remove contacts from',
          longDesc: 'Select or enter the ID of the account from which you want to remove contacts.',
        },
        contactIds: {
          displayName: 'Contacts',
          shortDesc: 'The contacts to remove',
          longDesc: 'Select one or more contacts to remove from the account.',
        },
      },
    },
    // Contact actions
    list_contacts: {
      groups: ['Contacts'],
      displayName: 'List Contacts',
      shortDesc: 'Retrieve a list of contacts',
      longDesc:
        'Retrieve a list of all contacts in your Front workspace. Contacts represent the people you communicate with. Results can be sorted by creation or update date.',
      options: {
        sortBy: {
          displayName: 'Sort By',
          shortDesc: 'Field to sort by',
          longDesc: 'The field to sort results by: created_at or updated_at.',
        },
        sortOrder: {
          displayName: 'Sort Order',
          shortDesc: 'Sort order direction',
          longDesc: 'The direction to sort results: desc (newest first) or asc (oldest first).',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of contacts to return',
          longDesc: 'The maximum number of contact records to return. Default is 50.',
        },
      },
    },
    get_contact: {
      groups: ['Contacts'],
      displayName: 'Get Contact',
      shortDesc: 'Retrieve a single contact by ID',
      longDesc:
        'Retrieve the full details of a specific contact from Front by their ID. Returns all contact data including name, handles (email, phone, etc.), groups, links, and custom fields.',
      options: {
        contactId: {
          displayName: 'Contact',
          shortDesc: 'The contact to retrieve',
          longDesc:
            'Select or enter the ID of the contact you want to retrieve. Contact IDs start with "crd_".',
        },
      },
    },
    create_contact: {
      groups: ['Contacts'],
      displayName: 'Create Contact',
      shortDesc: 'Create a new contact',
      longDesc:
        'Create a new contact in Front. Contacts represent the people you communicate with. A contact must have at least one handle (email, phone, etc.) to be created.',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'The contact name',
          longDesc:
            'The display name of the contact. This is optional but recommended for easier identification.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'A description of the contact',
          longDesc:
            'An optional description or notes about the contact. This can include any relevant context about the person.',
        },
        handles: {
          displayName: 'Handles',
          shortDesc: 'Contact handles (email, phone, etc.)',
          longDesc:
            'A list of handles for the contact. Each handle consists of a handle value (e.g., email address) and a source type (email, phone, twitter, etc.). At least one handle is required.',
          type: {
            element_type: {
              fields: {
                handle: {
                  displayName: 'Handle',
                  shortDesc: 'The handle value',
                  longDesc:
                    'The actual handle value, such as an email address, phone number, or social media username.',
                },
                source: {
                  displayName: 'Source',
                  shortDesc: 'The type of handle',
                  longDesc:
                    'The type of handle: email, phone, twitter, facebook, intercom, front_chat, or custom.',
                },
              },
            },
          },
        },
        links: {
          displayName: 'Links',
          shortDesc: 'Associated URLs',
          longDesc:
            'A list of URLs associated with this contact, such as social media profiles or company websites.',
        },
        groupNames: {
          displayName: 'Group Names',
          shortDesc: 'Groups to add the contact to',
          longDesc:
            'A list of group names to add the contact to. Groups help organize contacts into categories.',
        },
        customFields: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values',
          longDesc:
            'An object containing custom field values for the contact. The keys should match your configured custom field names.',
        },
      },
    },
    update_contact: {
      groups: ['Contacts'],
      displayName: 'Update Contact',
      shortDesc: 'Update an existing contact',
      longDesc:
        'Update the properties of an existing contact in Front. You can modify the name, description, links, or custom fields. At least one field must be provided to update.',
      options: {
        contactId: {
          displayName: 'Contact',
          shortDesc: 'The contact to update',
          longDesc: 'Select or enter the ID of the contact you want to update.',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'The new contact name',
          longDesc: 'Update the display name of the contact.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'The new description',
          longDesc:
            'Update the description or notes about the contact. This can include any relevant context about the person.',
        },
        links: {
          displayName: 'Links',
          shortDesc: 'Associated URLs',
          longDesc:
            'A list of URLs associated with this contact, such as social media profiles or company websites.',
        },
        customFields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom field values',
          longDesc: 'Update custom field values for the contact.',
        },
      },
    },
    delete_contact: {
      groups: ['Contacts'],
      displayName: 'Delete Contact',
      shortDesc: 'Delete a contact',
      longDesc:
        'Delete a contact from Front. This action is permanent and will remove all associated data. Conversations with this contact will remain but will no longer be linked to the contact.',
      options: {
        contactId: {
          displayName: 'Contact',
          shortDesc: 'The contact to delete',
          longDesc: 'Select or enter the ID of the contact you want to delete.',
        },
      },
    },
    list_contact_conversations: {
      groups: ['Contacts'],
      displayName: 'List Contact Conversations',
      shortDesc: 'List conversations for a contact',
      longDesc:
        'Retrieve a list of all conversations associated with a specific contact. Conversations are returned in reverse chronological order (newest first). This helps you see the full communication history with a contact.',
      options: {
        contactId: {
          displayName: 'Contact',
          shortDesc: 'The contact to list conversations for',
          longDesc:
            'Select or enter the ID of the contact whose conversations you want to retrieve.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of conversations to return',
          longDesc: 'The maximum number of conversation records to return. Default is 50.',
        },
      },
    },
    // Contact Notes actions
    list_contact_notes: {
      groups: ['Contacts', 'Notes'],
      displayName: 'List Contact Notes',
      shortDesc: 'List notes for a contact',
      longDesc:
        'Retrieve all notes that have been added to a specific contact. Notes are internal annotations visible only to your team, useful for documenting important information about contacts.',
      options: {
        contactId: {
          displayName: 'Contact',
          shortDesc: 'The contact to list notes for',
          longDesc: 'Select or enter the ID of the contact whose notes you want to retrieve.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of notes to return',
          longDesc: 'The maximum number of note records to return. Default is 50.',
        },
      },
    },
    add_contact_note: {
      groups: ['Contacts', 'Notes'],
      displayName: 'Add Note to Contact',
      shortDesc: 'Add a note to a contact',
      longDesc:
        'Add a new note to a contact in Front. Notes are internal annotations that are only visible to your team members. Use notes to document important information, context, or reminders about a contact.',
      options: {
        contactId: {
          displayName: 'Contact',
          shortDesc: 'The contact to add the note to',
          longDesc: 'Select or enter the ID of the contact you want to add a note to.',
        },
        body: {
          displayName: 'Note Body',
          shortDesc: 'The content of the note',
          longDesc:
            'The text content of the note. This will be visible to all team members who can access the contact.',
        },
        authorId: {
          displayName: 'Author',
          shortDesc: 'The teammate who authored the note',
          longDesc:
            'Select the teammate who will be recorded as the author of this note. This is a required field.',
        },
      },
    },
    // Contact Lists actions
    list_contact_lists: {
      groups: ['Contact Lists'],
      displayName: 'List Contact Lists',
      shortDesc: 'Retrieve all contact lists',
      longDesc:
        'Retrieve a list of all contact lists in your Front workspace. Contact lists are used to organize contacts into groups for easier management, such as for marketing campaigns or customer segments.',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of contact lists to return',
          longDesc: 'The maximum number of contact list records to return. Default is 50.',
        },
      },
    },
    create_contact_list: {
      groups: ['Contact Lists'],
      displayName: 'Create Contact List',
      shortDesc: 'Create a new contact list',
      longDesc:
        'Create a new contact list in Front. Contact lists help you organize contacts into logical groups. The list will be created in the oldest active workspace that your token has access to.',
      options: {
        name: {
          displayName: 'Name',
          shortDesc: 'The contact list name',
          longDesc:
            'The name of the contact list. Choose a descriptive name that clearly identifies the purpose of the list.',
        },
        description: {
          displayName: 'Description',
          shortDesc: 'A description of the contact list',
          longDesc:
            'An optional description explaining the purpose of the contact list or the criteria for contacts in it.',
        },
      },
    },
    delete_contact_list: {
      groups: ['Contact Lists'],
      displayName: 'Delete Contact List',
      shortDesc: 'Delete a contact list',
      longDesc:
        'Delete a contact list from Front. This removes the list but does not delete the contacts that were in it. The contacts will remain in your workspace.',
      options: {
        contactListId: {
          displayName: 'Contact List',
          shortDesc: 'The contact list to delete',
          longDesc: 'Select or enter the ID of the contact list you want to delete.',
        },
      },
    },
    list_contacts_in_contact_list: {
      groups: ['Contact Lists'],
      displayName: 'List Contacts in Contact List',
      shortDesc: 'List contacts in a specific contact list',
      longDesc:
        'Retrieve all contacts that belong to a specific contact list. This helps you see which contacts are included in a particular list or segment.',
      options: {
        contactListId: {
          displayName: 'Contact List',
          shortDesc: 'The contact list to retrieve contacts from',
          longDesc: 'Select or enter the ID of the contact list whose contacts you want to see.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of contacts to return',
          longDesc: 'The maximum number of contact records to return. Default is 50.',
        },
      },
    },
    add_contacts_to_contact_list: {
      groups: ['Contact Lists'],
      displayName: 'Add Contacts to Contact List',
      shortDesc: 'Add contacts to a contact list',
      longDesc:
        'Add one or more contacts to a contact list in Front. This helps you organize contacts into logical groups for easier management and targeted communication.',
      options: {
        contactListId: {
          displayName: 'Contact List',
          shortDesc: 'The contact list to add contacts to',
          longDesc: 'Select or enter the ID of the contact list where you want to add contacts.',
        },
        contactIds: {
          displayName: 'Contacts',
          shortDesc: 'The contacts to add',
          longDesc: 'Select one or more contacts to add to the contact list.',
        },
      },
    },
    remove_contacts_from_contact_list: {
      groups: ['Contact Lists'],
      displayName: 'Remove Contacts from Contact List',
      shortDesc: 'Remove contacts from a contact list',
      longDesc:
        'Remove one or more contacts from a contact list in Front. This removes the contacts from the list but does not delete the contacts themselves.',
      options: {
        contactListId: {
          displayName: 'Contact List',
          shortDesc: 'The contact list to remove contacts from',
          longDesc:
            'Select or enter the ID of the contact list from which you want to remove contacts.',
        },
        contactIds: {
          displayName: 'Contacts',
          shortDesc: 'The contacts to remove',
          longDesc: 'Select one or more contacts to remove from the contact list.',
        },
      },
    },
    // Conversation actions
    list_conversations: {
      groups: ['Conversations'],
      displayName: 'List Conversations',
      shortDesc: 'Retrieve a list of conversations',
      longDesc:
        'Retrieve a list of conversations in your Front workspace. Conversations are returned in reverse chronological order (most recently updated first). You can filter by inbox or status.',
      options: {
        inboxId: {
          displayName: 'Inbox',
          shortDesc: 'Filter by inbox',
          longDesc:
            'Optionally filter conversations to a specific inbox. Leave empty to retrieve conversations from all inboxes.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by conversation status',
          longDesc:
            'Optionally filter conversations by their status: open, archived, deleted, or spam.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of conversations to return',
          longDesc: 'The maximum number of conversation records to return. Default is 50.',
        },
      },
    },
    get_conversation: {
      groups: ['Conversations'],
      displayName: 'Get Conversation',
      shortDesc: 'Retrieve a single conversation by ID',
      longDesc:
        'Retrieve the full details of a specific conversation from Front by its ID. Returns all conversation data including subject, status, assignee, tags, and custom fields.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to retrieve',
          longDesc:
            'Select or enter the ID of the conversation you want to retrieve. Conversation IDs start with "cnv_".',
        },
      },
    },
    search_conversations: {
      groups: ['Conversations'],
      displayName: 'Search Conversations',
      shortDesc: 'Search for conversations',
      longDesc:
        'Search for conversations in Front using a search query. Returns matching conversations in descending order by last activity along with a count of total matches.',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'The search query',
          longDesc:
            'The search query to find conversations. You can search by keywords, email addresses, or use Front search syntax for advanced queries.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of conversations to return',
          longDesc: 'The maximum number of conversation records to return. Default is 25.',
        },
      },
    },
    update_conversation: {
      groups: ['Conversations'],
      displayName: 'Update Conversation',
      shortDesc: 'Update a conversation',
      longDesc:
        'Update the properties of an existing conversation in Front. You can change the status, move to a different inbox, or update custom fields.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to update',
          longDesc: 'Select or enter the ID of the conversation you want to update.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'The new status',
          longDesc:
            'Update the conversation status to open, archived, deleted, or spam.',
        },
        inboxId: {
          displayName: 'Inbox',
          shortDesc: 'Move to inbox',
          longDesc: 'Move the conversation to a different inbox.',
        },
        customFields: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom field values',
          longDesc: 'Update custom field values for the conversation.',
        },
      },
    },
    update_conversation_assignee: {
      groups: ['Conversations'],
      displayName: 'Update Conversation Assignee',
      shortDesc: 'Assign or unassign a conversation',
      longDesc:
        'Assign a conversation to a teammate or unassign it. Assigning conversations helps route work to the right team members and track ownership.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to update',
          longDesc: 'Select or enter the ID of the conversation you want to assign.',
        },
        assigneeId: {
          displayName: 'Assignee',
          shortDesc: 'The teammate to assign',
          longDesc:
            'Select a teammate to assign the conversation to. Leave empty to unassign the conversation.',
        },
      },
    },
    add_conversation_tag: {
      groups: ['Conversations', 'Tags'],
      displayName: 'Add Tag to Conversation',
      shortDesc: 'Add tags to a conversation',
      longDesc:
        'Add one or more tags to a conversation in Front. Tags help categorize and organize conversations for easier filtering and reporting.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to tag',
          longDesc: 'Select or enter the ID of the conversation you want to add tags to.',
        },
        tagIds: {
          displayName: 'Tags',
          shortDesc: 'The tags to add',
          longDesc: 'Select one or more tags to add to the conversation.',
        },
      },
    },
    remove_conversation_tag: {
      groups: ['Conversations', 'Tags'],
      displayName: 'Remove Tag from Conversation',
      shortDesc: 'Remove tags from a conversation',
      longDesc:
        'Remove one or more tags from a conversation in Front. This removes the tag association but does not delete the tags themselves.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to remove tags from',
          longDesc: 'Select or enter the ID of the conversation you want to remove tags from.',
        },
        tagIds: {
          displayName: 'Tags',
          shortDesc: 'The tags to remove',
          longDesc: 'Select one or more tags to remove from the conversation.',
        },
      },
    },
    add_conversation_followers: {
      groups: ['Conversations'],
      displayName: 'Add Conversation Followers',
      shortDesc: 'Add followers to a conversation',
      longDesc:
        'Add teammates as followers to a conversation. Followers receive notifications about conversation updates without being the assignee.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to add followers to',
          longDesc: 'Select or enter the ID of the conversation you want to add followers to.',
        },
        teammateIds: {
          displayName: 'Teammates',
          shortDesc: 'The teammates to add as followers',
          longDesc: 'Select one or more teammates to add as followers to the conversation.',
        },
      },
    },
    // Message actions
    get_message: {
      groups: ['Messages'],
      displayName: 'Get Message',
      shortDesc: 'Retrieve a single message by ID',
      longDesc:
        'Retrieve the full details of a specific message from Front by its ID. Returns all message data including content, author, recipients, and attachments.',
      options: {
        messageId: {
          displayName: 'Message ID',
          shortDesc: 'The message to retrieve',
          longDesc:
            'Enter the ID of the message you want to retrieve. Message IDs start with "msg_".',
        },
      },
    },
    list_conversation_messages: {
      groups: ['Conversations', 'Messages'],
      displayName: 'List Conversation Messages',
      shortDesc: 'List messages in a conversation',
      longDesc:
        'Retrieve a list of all messages in a specific conversation. Messages are returned in reverse chronological order (newest first). This provides the full message history of a conversation.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to list messages from',
          longDesc: 'Select or enter the ID of the conversation whose messages you want to retrieve.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of messages to return',
          longDesc: 'The maximum number of message records to return. Default is 50.',
        },
      },
    },
    create_message_reply: {
      groups: ['Conversations', 'Messages'],
      displayName: 'Reply to Conversation',
      shortDesc: 'Send a reply message to a conversation',
      longDesc:
        'Reply to a conversation by sending a message. The message will be appended to the conversation and sent to the recipients. You can optionally save it as a draft instead of sending immediately.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to reply to',
          longDesc: 'Select or enter the ID of the conversation you want to reply to.',
        },
        body: {
          displayName: 'Message Body',
          shortDesc: 'The content of the reply',
          longDesc:
            'The HTML content of the reply message. This is the main body text that will be sent to recipients.',
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'Optional subject line',
          longDesc:
            'An optional subject line for the reply. If not provided, the original conversation subject may be used.',
        },
        to: {
          displayName: 'To',
          shortDesc: 'Additional recipients',
          longDesc:
            'A list of email addresses to send the reply to. These are added to the existing conversation recipients.',
        },
        cc: {
          displayName: 'CC',
          shortDesc: 'CC recipients',
          longDesc: 'A list of email addresses to CC on the reply.',
        },
        bcc: {
          displayName: 'BCC',
          shortDesc: 'BCC recipients',
          longDesc: 'A list of email addresses to BCC on the reply.',
        },
        isDraft: {
          displayName: 'Save as Draft',
          shortDesc: 'Save as draft instead of sending',
          longDesc:
            'If true, the message will be saved as a draft instead of being sent immediately. Default is false.',
        },
      },
    },
    // Comment actions
    add_conversation_comment: {
      groups: ['Conversations', 'Comments'],
      displayName: 'Add Comment to Conversation',
      shortDesc: 'Add an internal comment to a conversation',
      longDesc:
        'Add an internal comment to a conversation in Front. Comments are private messages visible only to your teammates and are never sent to external contacts. Use comments for internal notes, discussions, or context sharing.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to add a comment to',
          longDesc: 'Select or enter the ID of the conversation you want to add a comment to.',
        },
        body: {
          displayName: 'Comment Body',
          shortDesc: 'The content of the comment',
          longDesc:
            'The text content of the internal comment. This will be visible to all teammates who can access the conversation.',
        },
      },
    },
    list_conversation_comments: {
      groups: ['Conversations', 'Comments'],
      displayName: 'List Conversation Comments',
      shortDesc: 'List comments in a conversation',
      longDesc:
        'Retrieve a list of all internal comments in a specific conversation. Comments are returned in reverse chronological order (newest first). This provides the full internal discussion history of a conversation.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to list comments from',
          longDesc: 'Select or enter the ID of the conversation whose comments you want to retrieve.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of comments to return',
          longDesc: 'The maximum number of comment records to return. Default is 50.',
        },
      },
    },
  },
  triggers: {
    new_conversation: {
      groups: ['Conversations'],
      displayName: 'New Conversation',
      shortDesc: 'Triggers when a new conversation is created',
      longDesc:
        'This trigger fires whenever a new conversation is created in Front. You can optionally filter by inbox or status to only trigger for specific types of conversations.',
      options: {
        inboxId: {
          displayName: 'Inbox',
          shortDesc: 'Filter by inbox',
          longDesc:
            'Optionally filter to only trigger for conversations in a specific inbox. Leave empty to trigger for all inboxes.',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Filter by conversation status',
          longDesc:
            'Optionally filter to only trigger for conversations with a specific status: open, archived, deleted, or spam.',
        },
      },
    },
    new_contact: {
      groups: ['Contacts'],
      displayName: 'New Contact',
      shortDesc: 'Triggers when a new contact is created',
      longDesc:
        'This trigger fires whenever a new contact is created in Front. Use this to automate workflows when new contacts are added to your workspace.',
      options: {},
    },
    new_contact_note: {
      groups: ['Contacts', 'Notes'],
      displayName: 'New Contact Note',
      shortDesc: 'Triggers when a new note is added to a contact',
      longDesc:
        'This trigger fires whenever a new note is added to a specific contact in Front. You must specify which contact to monitor for new notes.',
      options: {
        contactId: {
          displayName: 'Contact',
          shortDesc: 'The contact to monitor',
          longDesc:
            'Select or enter the ID of the contact you want to monitor for new notes. The trigger will fire whenever a new note is added to this contact.',
        },
      },
    },
    new_comment: {
      groups: ['Conversations', 'Comments'],
      displayName: 'New Comment',
      shortDesc: 'Triggers when a new comment is added to a conversation',
      longDesc:
        'This trigger fires whenever a new internal comment is added to a specific conversation in Front. Comments are private messages visible only to teammates. You must specify which conversation to monitor for new comments.',
      options: {
        conversationId: {
          displayName: 'Conversation',
          shortDesc: 'The conversation to monitor',
          longDesc:
            'Select or enter the ID of the conversation you want to monitor for new comments. The trigger will fire whenever a new comment is added to this conversation.',
        },
      },
    },
  },
};

export default FrontAppEn;
