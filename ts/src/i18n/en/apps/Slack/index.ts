import type { TAppGroups } from '../../../groups';

const SlackAppEn = {
  displayName: 'Slack',
  groups: ['Messaging & Real-time Communication'] satisfies TAppGroups,
  shortDesc:
    'Connect with Slack to send messages, manage channels, and automate team communication',
  longDesc:
    'Integrate with Slack to automate team communication and collaboration. Slack is a channel-based messaging platform that brings teams together. This integration enables you to send messages to channels and users, create channels, manage reactions, upload files, search messages, and monitor for new messages and events.',
  actions: {
    // Message actions
    send_message: {
      groups: ['Messages'],
      displayName: 'Send Message to Channel',
      shortDesc: 'Send a message to a Slack channel',
      longDesc:
        'Post a message to a specific channel in your Slack workspace. Supports text, attachments, and Block Kit blocks for rich formatting.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The channel to send the message to',
          longDesc:
            'Select the channel where you want to post the message. Make sure the bot is a member of the channel.',
        },
        text: {
          displayName: 'Message Text',
          shortDesc: 'The text content of the message',
          longDesc: 'The main text content of your message. Supports Slack markdown formatting.',
        },
        username: {
          displayName: 'Bot Username',
          shortDesc: 'Custom username for the bot',
          longDesc: 'Override the default bot username for this message.',
        },
        iconUrl: {
          displayName: 'Icon URL',
          shortDesc: 'Custom icon URL for the bot',
          longDesc: 'Override the default bot icon with a custom image URL.',
        },
        threadTs: {
          displayName: 'Thread Timestamp',
          shortDesc: 'Reply to a thread',
          longDesc:
            'Provide the timestamp of a parent message to post this message as a reply in a thread.',
        },
        blocks: {
          displayName: 'Blocks',
          shortDesc: 'Block Kit blocks for rich content',
          longDesc:
            'Add Block Kit blocks for rich, interactive content. See https://api.slack.com/block-kit for specs.',
        },
      },
    },
    send_direct_message: {
      groups: ['Messages'],
      displayName: 'Send Direct Message',
      shortDesc: 'Send a direct message to a user',
      longDesc: 'Send a private message directly to a user in your Slack workspace.',
      options: {
        userId: {
          displayName: 'User',
          shortDesc: 'The user to send the message to',
          longDesc: 'Select the user who should receive the direct message.',
        },
        text: {
          displayName: 'Message Text',
          shortDesc: 'The text content of the message',
          longDesc: 'The main text content of your direct message.',
        },
        username: {
          displayName: 'Bot Username',
          shortDesc: 'Custom username for the bot',
          longDesc: 'Override the default bot username for this message.',
        },
        iconUrl: {
          displayName: 'Icon URL',
          shortDesc: 'Custom icon URL for the bot',
          longDesc: 'Override the default bot icon with a custom image URL.',
        },
        blocks: {
          displayName: 'Blocks',
          shortDesc: 'Block Kit blocks for rich content',
          longDesc: 'Add Block Kit blocks for rich, interactive content.',
        },
      },
    },
    update_message: {
      groups: ['Messages'],
      displayName: 'Update Message',
      shortDesc: 'Update an existing message',
      longDesc:
        'Update the content of an existing message in a channel. You need the message timestamp to identify which message to update.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The channel containing the message',
          longDesc: 'Select the channel where the message was posted.',
        },
        timestamp: {
          displayName: 'Message Timestamp',
          shortDesc: 'Timestamp of the message to update',
          longDesc:
            'The timestamp (ts) of the message you want to update. You can also paste a Slack message link.',
        },
        text: {
          displayName: 'New Text',
          shortDesc: 'The updated message text',
          longDesc: 'The new text content for the message.',
        },
        blocks: {
          displayName: 'Blocks',
          shortDesc: 'Updated Block Kit blocks',
          longDesc: 'New Block Kit blocks for the message.',
        },
      },
    },
    get_channel_history: {
      groups: ['Messages'],
      displayName: 'Get Channel History',
      shortDesc: 'Retrieve messages from a channel',
      longDesc:
        'Fetch the message history of a channel. You can filter by time range and control the number of messages returned.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The channel to get history from',
          longDesc: 'Select the channel to retrieve messages from.',
        },
        oldest: {
          displayName: 'Oldest Timestamp',
          shortDesc: 'Only messages after this time',
          longDesc: 'Unix timestamp. Only messages after this time will be included.',
        },
        latest: {
          displayName: 'Latest Timestamp',
          shortDesc: 'Only messages before this time',
          longDesc:
            'Unix timestamp. Only messages before this time will be included. Default is current time.',
        },
        inclusive: {
          displayName: 'Inclusive',
          shortDesc: 'Include boundary timestamps',
          longDesc: 'Include messages with oldest or latest timestamps in results.',
        },
        includeAllMetadata: {
          displayName: 'Include All Metadata',
          shortDesc: 'Return full message metadata',
          longDesc: 'Return all metadata associated with each message.',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum messages to return',
          longDesc: 'The maximum number of messages to retrieve. Default is 200.',
        },
      },
    },
    search_messages: {
      groups: ['Messages'],
      displayName: 'Search Messages',
      shortDesc: 'Search for messages in the workspace',
      longDesc:
        'Search for messages matching a query across your Slack workspace. Requires user token authentication.',
      options: {
        query: {
          displayName: 'Search Query',
          shortDesc: 'The search query',
          longDesc:
            'Enter your search query. Supports Slack search operators like "from:", "in:", etc.',
        },
        count: {
          displayName: 'Count',
          shortDesc: 'Results per page',
          longDesc: 'Number of results to return per page. Default is 100.',
        },
      },
    },
    // Channel actions
    create_channel: {
      groups: ['Channels'],
      displayName: 'Create Channel',
      shortDesc: 'Create a new Slack channel',
      longDesc: 'Create a new public or private channel in your Slack workspace.',
      options: {
        channelName: {
          displayName: 'Channel Name',
          shortDesc: 'Name for the new channel',
          longDesc:
            'The name for the new channel. Must be unique and follow Slack naming rules (lowercase, no spaces).',
        },
        isPrivate: {
          displayName: 'Private Channel',
          shortDesc: 'Make the channel private',
          longDesc: 'If enabled, create a private channel instead of a public one.',
        },
      },
    },
    // Reaction actions
    add_reaction: {
      groups: ['Reactions'],
      displayName: 'Add Reaction',
      shortDesc: 'Add an emoji reaction to a message',
      longDesc: 'Add an emoji reaction to a specific message in a channel.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The channel containing the message',
          longDesc: 'Select the channel where the message is located.',
        },
        timestamp: {
          displayName: 'Message Timestamp',
          shortDesc: 'Timestamp of the message',
          longDesc:
            'The timestamp (ts) of the message to react to. You can also paste a Slack message link.',
        },
        reaction: {
          displayName: 'Reaction',
          shortDesc: 'Emoji name to add',
          longDesc: 'The emoji name without colons (e.g., "thumbsup", "fire", "smile").',
        },
      },
    },
    // User actions
    find_user_by_email: {
      groups: ['Users'],
      displayName: 'Find User by Email',
      shortDesc: 'Find a Slack user by their email address',
      longDesc:
        'Look up a Slack user using their email address. Returns the user profile if found.',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Email address to search for',
          longDesc: 'The email address of the user you want to find.',
        },
      },
    },
    update_profile: {
      groups: ['Users'],
      displayName: 'Update Profile',
      shortDesc: 'Update user profile information',
      longDesc:
        'Update basic profile fields such as name or title. Requires user token authentication.',
      options: {
        firstName: {
          displayName: 'First Name',
          shortDesc: 'User first name',
          longDesc: 'The first name to set in the profile.',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'User last name',
          longDesc: 'The last name to set in the profile.',
        },
        email: {
          displayName: 'Email',
          shortDesc: 'User email address',
          longDesc:
            'The email address to set. Changing email will send notifications to both old and new addresses.',
        },
        userId: {
          displayName: 'User ID',
          shortDesc: 'Target user (admin only)',
          longDesc: 'ID of user to update. Only admins on paid teams can update other users.',
        },
      },
    },
    // File actions
    upload_file: {
      groups: ['Files'],
      displayName: 'Upload File',
      shortDesc: 'Upload a file to Slack',
      longDesc:
        'Upload a file to a Slack channel. Supports various file types and optional initial comment.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'Channel to upload to',
          longDesc: 'Select the channel where the file should be uploaded.',
        },
        file: {
          displayName: 'File',
          shortDesc: 'The file to upload',
          longDesc: 'The file to upload to the Slack channel.',
        },
        filename: {
          displayName: 'Filename',
          shortDesc: 'Name for the file',
          longDesc: 'The filename to use when uploading.',
        },
        comment: {
          displayName: 'Initial Comment',
          shortDesc: 'Comment with the file',
          longDesc: 'An optional comment to include when sharing the file.',
        },
      },
    },
    // Action button messages
    request_action_message: {
      groups: ['Messages'],
      displayName: 'Send Action Message to Channel',
      shortDesc: 'Send a message with action buttons',
      longDesc: 'Send a message to a channel with interactive action buttons that link to URLs.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The channel to send to',
          longDesc: 'Select the channel where the action message should be posted.',
        },
        text: {
          displayName: 'Message Text',
          shortDesc: 'The message content',
          longDesc: 'The text content displayed above the action buttons.',
        },
        actions: {
          displayName: 'Action Buttons',
          shortDesc: 'Buttons to display',
          longDesc:
            'Define the action buttons with titles and URLs. Each button links to a specific URL when clicked.',
          type: {
            element_type: {
              fields: {
                title: {
                  displayName: 'Button Title',
                  shortDesc: 'Text displayed on the button',
                  longDesc: 'The text that will be shown on the action button.',
                },
                url: {
                  displayName: 'Button URL',
                  shortDesc: 'URL the button links to',
                  longDesc: 'The URL that will be opened when the button is clicked.',
                },
              },
            },
          },
        },
        username: {
          displayName: 'Bot Username',
          shortDesc: 'Custom bot name',
          longDesc: 'Override the default bot username.',
        },
        iconUrl: {
          displayName: 'Icon URL',
          shortDesc: 'Custom bot icon',
          longDesc: 'Override the default bot icon.',
        },
      },
    },
    request_action_dm: {
      groups: ['Messages'],
      displayName: 'Send Action Message to User',
      shortDesc: 'Send a direct message with action buttons',
      longDesc:
        'Send a direct message to a user with interactive action buttons that link to URLs.',
      options: {
        userId: {
          displayName: 'User',
          shortDesc: 'The user to message',
          longDesc: 'Select the user to receive the action message.',
        },
        text: {
          displayName: 'Message Text',
          shortDesc: 'The message content',
          longDesc: 'The text content displayed above the action buttons.',
        },
        actions: {
          displayName: 'Action Buttons',
          shortDesc: 'Buttons to display',
          longDesc: 'Define the action buttons with titles and URLs.',
          type: {
            element_type: {
              fields: {
                title: {
                  displayName: 'Button Title',
                  shortDesc: 'Text displayed on the button',
                  longDesc: 'The text that will be shown on the action button.',
                },
                url: {
                  displayName: 'Button URL',
                  shortDesc: 'URL the button links to',
                  longDesc: 'The URL that will be opened when the button is clicked.',
                },
              },
            },
          },
        },
        username: {
          displayName: 'Bot Username',
          shortDesc: 'Custom bot name',
          longDesc: 'Override the default bot username.',
        },
        iconUrl: {
          displayName: 'Icon URL',
          shortDesc: 'Custom bot icon',
          longDesc: 'Override the default bot icon.',
        },
      },
    },
  },
  triggers: {
    new_message: {
      groups: ['Messages'],
      displayName: 'New Message',
      shortDesc: 'Triggers when a new message is posted to a channel',
      longDesc:
        'This trigger fires whenever a new message is posted to the specified channel. Use this to react to incoming messages.',
      options: {
        channel: {
          displayName: 'Channel',
          shortDesc: 'The channel to monitor',
          longDesc:
            'Select the channel to monitor for new messages. Make sure the bot is a member of the channel.',
        },
      },
    },
    new_reaction: {
      groups: ['Reactions'],
      displayName: 'New Reaction',
      shortDesc: 'Triggers when a reaction is added to a message',
      longDesc:
        'This trigger fires whenever a reaction is added to any message. You can filter by specific emojis or channels.',
      options: {
        emojis: {
          displayName: 'Emojis',
          shortDesc: 'Filter by specific emojis',
          longDesc:
            'Optionally specify emoji names to trigger on (e.g., "fire", "thumbsup"). Leave empty for all reactions.',
        },
        channel: {
          displayName: 'Channel',
          shortDesc: 'Filter by channel',
          longDesc:
            'Optionally select a specific channel to monitor. Leave empty to monitor all channels.',
        },
      },
    },
    channel_created: {
      groups: ['Channels'],
      displayName: 'Channel Created',
      shortDesc: 'Triggers when a new channel is created',
      longDesc:
        'This trigger fires whenever a new public or private channel is created in the workspace.',
      options: {},
    },
  },
};

export default SlackAppEn;
