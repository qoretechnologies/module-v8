/* eslint-disable max-len */
const GoogleChatAppEn = {
  displayName: 'Google Chat',
  groups: ['Team Communication & Chat', 'Google Workspace Suite'],
  shortDesc: 'Send messages and manage conversations in Google Chat',
  longDesc:
    'Connect to Google Chat to send direct messages, post to spaces, manage conversations, and interact with your team collaboration platform. Automate notifications, respond to messages, and streamline your Google Workspace communication workflows.',
  triggers: {
    new_message: {
      options: {
        spaceId: {
          displayName: 'Space ID',
          shortDesc: 'The Google Chat space to monitor for new messages',
          longDesc:
            'Select the Google Chat space where you want to monitor for new messages. The trigger will fire whenever a new message is posted in this space.',
        },
      },
    },
  },
  actions: {
    list_spaces: {
      options: {
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of spaces to return per page',
          longDesc: 'The maximum number of spaces to return in a single page. Default is 20.',
        },
        pageToken: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'A page token, received from a previous list spaces call. Provide this to retrieve the subsequent page.',
        },
        spaceType: {
          displayName: 'Space Type',
          shortDesc: 'Filter spaces by type',
          longDesc:
            'Filter the list of spaces by their type: Space, Group Chat, or Direct Message.',
        },
      },
    },
    get_space: {
      options: {
        id: {
          displayName: 'Space ID',
          shortDesc: 'The ID of the space to retrieve',
          longDesc:
            'The unique identifier of the Google Chat space you want to get information about.',
        },
      },
    },
    list_members: {
      options: {
        spaceId: {
          displayName: 'Space ID',
          shortDesc: 'The ID of the space to list members from',
          longDesc:
            'The unique identifier of the Google Chat space whose members you want to list.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of members to return per page',
          longDesc: 'The maximum number of members to return in a single page. Default is 20.',
        },
        pageToken: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'A page token, received from a previous list members call. Provide this to retrieve the subsequent page.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter members by field and value',
          longDesc:
            'Filter the list of members by a specific field and value, such as role or member type.',
          type: {
            fields: {
              field: {
                displayName: 'Filter Field',
                shortDesc: 'The field to filter by',
                longDesc: 'Choose the field to filter members by: role or member type.',
              },
              value: {
                displayName: 'Filter Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The specific value to filter members by, based on the selected field.',
              },
            },
          },
        },
        showGroups: {
          displayName: 'Show Groups',
          shortDesc: 'Include group memberships in results',
          longDesc: 'Whether to include group memberships in the results.',
        },
        showInvited: {
          displayName: 'Show Invited',
          shortDesc: 'Include invited members in results',
          longDesc: 'Whether to include members who have been invited but not yet joined.',
        },
        useAdminAccess: {
          displayName: 'Use Admin Access',
          shortDesc: 'Use admin privileges for the request',
          longDesc: 'Whether to use admin access privileges when listing members.',
        },
      },
    },
    get_member: {
      options: {
        spaceId: {
          displayName: 'Space ID',
          shortDesc: 'The ID of the space',
          longDesc: 'The unique identifier of the Google Chat space.',
        },
        memberId: {
          displayName: 'Member ID',
          shortDesc: 'The ID of the member to retrieve',
          longDesc: 'The unique identifier of the member you want to get information about.',
        },
      },
    },
    list_messages: {
      options: {
        spaceId: {
          displayName: 'Space ID',
          shortDesc: 'The ID of the space to list messages from',
          longDesc:
            'The unique identifier of the Google Chat space whose messages you want to list.',
        },
        pageSize: {
          displayName: 'Page Size',
          shortDesc: 'Number of messages to return per page',
          longDesc: 'The maximum number of messages to return in a single page. Default is 25.',
        },
        pageToken: {
          displayName: 'Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'A page token, received from a previous list messages call. Provide this to retrieve the subsequent page.',
        },
        filter: {
          displayName: 'Filter',
          shortDesc: 'Filter messages by field and value',
          longDesc:
            'Filter the list of messages by a specific field and value, such as create time or thread.',
          type: {
            fields: {
              field: {
                displayName: 'Filter Field',
                shortDesc: 'The field to filter by',
                longDesc: 'Choose the field to filter messages by: create time or thread name.',
              },
              value: {
                displayName: 'Filter Value',
                shortDesc: 'The value to filter by',
                longDesc: 'The specific value to filter messages by, based on the selected field.',
              },
            },
          },
        },
        showDeleted: {
          displayName: 'Show Deleted',
          shortDesc: 'Include deleted messages in results',
          longDesc: 'Whether to include deleted messages in the results.',
        },
        sortOrder: {
          displayName: 'Sort Order',
          shortDesc: 'Order to sort messages by create time',
          longDesc: 'The order to sort messages by their creation time: ascending or descending.',
        },
      },
    },
    get_message: {
      options: {
        spaceId: {
          displayName: 'Space ID',
          shortDesc: 'The ID of the space',
          longDesc: 'The unique identifier of the Google Chat space.',
        },
        messageId: {
          displayName: 'Message ID',
          shortDesc: 'The ID of the message to retrieve',
          longDesc: 'The unique identifier of the message you want to get information about.',
        },
      },
    },
    delete_message: {
      options: {
        spaceId: {
          displayName: 'Space ID',
          shortDesc: 'The ID of the space',
          longDesc: 'The unique identifier of the Google Chat space.',
        },
        messageId: {
          displayName: 'Message ID',
          shortDesc: 'The ID of the message to delete',
          longDesc: 'The unique identifier of the message you want to delete.',
        },
        force: {
          displayName: 'Force Delete',
          shortDesc: 'Force deletion of the message',
          longDesc: 'Whether to force delete the message even if it cannot be normally deleted.',
        },
      },
    },
    send_message: {
      options: {
        spaceId: {
          displayName: 'Space ID',
          shortDesc: 'The ID of the space to send the message to',
          longDesc:
            'The unique identifier of the Google Chat space where you want to send the message.',
        },
        text: {
          displayName: 'Text',
          shortDesc: 'Plain text content of the message',
          longDesc:
            'The plain text content of the message. This is the main text that will be displayed in the chat.',
        },
        formattedText: {
          displayName: 'Formatted Text',
          shortDesc: 'Formatted text content using markdown',
          longDesc:
            'Rich text content formatted with markdown syntax. This allows for bold, italic, links, and other formatting.',
        },
        messageId: {
          displayName: 'Message ID',
          shortDesc: 'ID for message replies or updates',
          longDesc:
            'The ID of an existing message to reply to or update. Leave empty to send a new message.',
        },
        cardTitle: {
          displayName: 'Card Title',
          shortDesc: 'Title for the message card',
          longDesc:
            'The title to display in the card header. This creates a visually prominent header for your message.',
        },
        cardSubtitle: {
          displayName: 'Card Subtitle',
          shortDesc: 'Subtitle for the message card',
          longDesc:
            'The subtitle to display below the card title. This provides additional context or description.',
        },
        cardImageUrl: {
          displayName: 'Card Image URL',
          shortDesc: 'Image URL to display in the card header',
          longDesc:
            'A URL pointing to an image that will be displayed in the card header. The image should be publicly accessible.',
        },
        buttonText: {
          displayName: 'Button Text',
          shortDesc: 'Text to display on the action button',
          longDesc: 'The text that will appear on the clickable button in the message card.',
        },
        buttonUrl: {
          displayName: 'Button URL',
          shortDesc: 'URL that the button will open when clicked',
          longDesc:
            'The web address that will be opened when users click the button. Required if button text is provided.',
        },
      },
    },
  },
};

export default GoogleChatAppEn;
