const IntercomAppEn = {
  displayName: 'Intercom',
  groups: ['Customer Support & Helpdesk'],
  shortDesc: 'Interact with Intercom customer messaging platform',
  longDesc:
    'Connect with Intercom to manage contacts, companies, conversations, and events. This integration allows you to both perform actions and respond to events in your Intercom workspace, enabling you to automate customer communications and data management workflows.',
  triggers: {
    'new-contact': {
      displayName: 'New Contact',
      shortDesc: 'Triggers when a new contact is created in Intercom',
      longDesc:
        'This trigger fires whenever a new contact is created in your Intercom account. You can filter by role (user, lead, or both).',
      options: {
        role: {
          displayName: 'Contact Role',
          shortDesc: 'Filter contacts by role',
          longDesc:
            'Choose whether to trigger for users, leads, or both types of contacts. Default is "contact" (both).',
        },
      },
    },
    'new-conversation': {
      displayName: 'New Conversation',
      shortDesc: 'Triggers when a new conversation is created in Intercom',
      longDesc:
        'This trigger fires whenever a new conversation is created in your Intercom account. It monitors for conversation creation events and provides all conversation details.',
    },
  },
  actions: {
    listArticles: {
      groups: ['Articles'],
      displayName: 'List All Articles',
    },
    createArticle: {
      groups: ['Articles'],
      displayName: 'Create an Article',
    },
    createOrUpdateCompany: {
      groups: ['Companies'],
      displayName: 'Create or Update a Company',
    },
    listAllCompanies: {
      groups: ['Companies'],
      displayName: 'List All Companies',
    },
    SearchContacts: {
      groups: ['Contacts'],
      displayName: 'Search Contacts',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'Query to search for contacts',
          longDesc: 'Query to search for contacts',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to search in',
                longDesc: 'Field to search in',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Operator to use for the search',
                longDesc: 'Operator to use for the search',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to search for',
                longDesc: 'Value to search for',
              },
            },
          },
        },
      },
    },
    attachTagToContact: {
      groups: ['Contacts'],
      displayName: 'Add Tag to a Contact',
    },
    detachTagFromContact: {
      groups: ['Contacts'],
      displayName: 'Remove Tag from a Contact',
    },
    createNote: {
      groups: ['Contacts'],
      displayName: 'Add Note to Contact',
      options: {
        id: {
          displayName: 'Contact ID',
          shortDesc: 'ID of the contact to add a note to',
          longDesc: 'ID of the contact to add a note to',
        },
        body: {
          displayName: 'Note Body',
          shortDesc: 'Content of the note to add',
          longDesc: 'Content of the note to add',
        },
      },
    },
    createConversation: {
      groups: ['Conversations'],
      displayName: 'Create Conversation',
    },
    searchConversations: {
      groups: ['Conversations'],
      displayName: 'Search Conversations',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'Query to search for conversations',
          longDesc: 'Query to search for conversations',
          type: {
            fields: {
              field: {
                displayName: 'Field',
                shortDesc: 'Field to search in',
                longDesc: 'Field to search in',
              },
              operator: {
                displayName: 'Operator',
                shortDesc: 'Operator to use for the search',
                longDesc: 'Operator to use for the search',
              },
              value: {
                displayName: 'Value',
                shortDesc: 'Value to search for',
                longDesc: 'Value to search for',
              },
            },
          },
        },
      },
    },
    replyConversation: {
      groups: ['Conversations'],
      displayName: 'Reply to a Conversation',
    },
    lisDataEvents: {
      groups: ['Events'],
      displayName: 'List All Data Events',
      options: {
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter field for the data event',
          longDesc: 'Filter field for the data event',
        },
        value: {
          displayName: 'Value',
          shortDesc: 'Value for the filter field',
          longDesc: 'Value for the filter field',
        },
      },
    },
    createDataEvent: {
      groups: ['Events'],
      displayName: 'Submit a Data Event',
    },
    createMessage: {
      groups: ['Messages'],
      displayName: 'Create a Message',
      options: {
        from: {
          displayName: 'Sender',
          shortDesc: 'Sender of the message',
          longDesc: 'Sender of the message',
        },
        to: {
          displayName: 'Recipient',
          shortDesc: 'Recipient of the message',
          longDesc: 'Recipient of the message',
        },
      },
    },
    listTags: {
      groups: ['Tags'],
      displayName: 'List All Tags',
    },
  },
};

export default IntercomAppEn;
