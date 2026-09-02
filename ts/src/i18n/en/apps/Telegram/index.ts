/* eslint-disable max-len */
const TelegramAppEn = {
  displayName: 'Telegram',
  groups: ['Messaging & Real-time Communication'],
  shortDesc: 'Connect and interact with Telegram via a bot',
  longDesc:
    'Connect a Telegram Bot using its Bot Token to send messages and handle incoming updates. Authentication is done solely with the Bot Token issued by @BotFather; no user login is required.',
  connectionMessage: {
    title: 'Connect to Telegram',
    content: `To connect to Telegram, you will need your **Bot Token** from BotFather.

## Creating a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Start a chat and send the command \`/newbot\`
3. Follow the prompts to:
   - Choose a **display name** for your bot (e.g., "My Automation Bot")
   - Choose a **username** for your bot (must end in "bot", e.g., "my_automation_bot")
4. BotFather will respond with your **Bot Token**
5. Copy the token (format: \`123456789:ABCdefGHIjklMNOpqrsTUVwxyz\`)

## Managing Existing Bots

To get the token for an existing bot:
1. Open [@BotFather](https://t.me/BotFather)
2. Send \`/mybots\`
3. Select your bot
4. Click **API Token** to view or regenerate the token

## Connection Details

### Bot Token
Your Telegram Bot Token in the format \`123456789:ABCdefGHIjklMNOpqrsTUVwxyz\`. This token authenticates your bot with the Telegram API.

**Note:** Keep your bot token secure and never share it publicly. Anyone with your token can control your bot. If compromised, regenerate it immediately via BotFather.`,
  },
  actions: {
    send_message: {
      displayName: 'Send Message',
      shortDesc: 'Send a text message to a chat',
      longDesc:
        'Send a text message with optional formatting to any chat, group, or channel accessible by your bot',
      groups: ['Messaging'],
      options: {
        chat: {
          displayName: 'Chat',
          shortDesc: 'The chat to send the message to',
          longDesc: 'Select the chat, group, or channel where you want to send the message',
        },
        format: {
          displayName: 'Text Format',
          shortDesc: 'How to format the message text',
          longDesc:
            'Choose the formatting mode for the message (plain text, Markdown, Markdown V2, or HTML)',
        },
        message: {
          displayName: 'Message Text',
          shortDesc: 'The text content of the message',
          longDesc:
            'The message content to send. Can include formatting depending on the selected format mode',
        },
        disable_link_preview: {
          displayName: 'Disable Link Preview',
          shortDesc: 'Disable automatic link previews',
          longDesc: 'If enabled, links in the message will not show automatic previews',
        },
        disable_notification: {
          displayName: 'Send Silently',
          shortDesc: 'Send the message without notification sound',
          longDesc: 'If enabled, users will receive the message without notification sound',
        },
      },
    },
    send_photo: {
      displayName: 'Send Photo',
      shortDesc: 'Send a photo with optional caption to a chat',
      longDesc:
        'Upload and send an image file to any chat, group, or channel with optional caption and formatting',
      groups: ['Messaging'],
      options: {
        chat: {
          displayName: 'Chat',
          shortDesc: 'The chat to send the photo to',
          longDesc: 'Select the chat, group, or channel where you want to send the photo',
        },
        photo: {
          displayName: 'Photo File',
          shortDesc: 'The image file to send',
          longDesc: 'Upload the image file (JPG, PNG, GIF, etc.) to send to the chat',
        },
        caption_format: {
          displayName: 'Caption Format',
          shortDesc: 'How to format the caption text',
          longDesc: 'Choose the formatting mode for the photo caption',
        },
        caption: {
          displayName: 'Photo Caption',
          shortDesc: 'Optional caption for the photo',
          longDesc: 'Text description or caption to accompany the photo',
        },
        protect_content: {
          displayName: 'Protect Content',
          shortDesc: 'Protect content from forwarding and saving',
          longDesc: 'If enabled, the photo cannot be forwarded or saved by users',
        },
        disable_notification: {
          displayName: 'Send Silently',
          shortDesc: 'Send the photo without notification sound',
          longDesc: 'If enabled, users will receive the photo without notification sound',
        },
      },
    },
    send_poll: {
      displayName: 'Send Poll',
      shortDesc: 'Create and send a poll or quiz to a chat',
      longDesc:
        'Create interactive polls or quizzes with multiple answer options, perfect for gathering feedback or testing knowledge',
      groups: ['Messaging'],
      options: {
        chat: {
          displayName: 'Chat',
          shortDesc: 'The chat to send the poll to',
          longDesc: 'Select the chat, group, or channel where you want to send the poll',
        },
        question: {
          displayName: 'Poll Question',
          shortDesc: 'The main question for the poll',
          longDesc: 'The question that users will answer in the poll',
        },
        answers: {
          displayName: 'Answer Options',
          shortDesc: 'List of possible answers (2-10 options)',
          longDesc:
            'The answer choices that users can select from. Must have between 2 and 10 options',
        },
        is_anonymous: {
          displayName: 'Anonymous Poll',
          shortDesc: 'Should the poll be anonymous?',
          longDesc:
            'If enabled, user votes will be anonymous. If disabled, votes will be visible to other users',
        },
        poll_type: {
          displayName: 'Poll Type',
          shortDesc: 'Regular poll or quiz with correct answers',
          longDesc: 'Choose between a regular poll or a quiz where you can specify correct answers',
        },
        allows_multiple_answers: {
          displayName: 'Multiple Answers',
          shortDesc: 'Allow users to select multiple options',
          longDesc:
            'If enabled, users can select more than one answer option (only for regular polls)',
        },
        correct_option_id: {
          displayName: 'Correct Answer',
          shortDesc: 'The correct answer for quiz polls',
          longDesc: 'Select which answer option is correct (zero-based index, only for quiz polls)',
        },
        explanation: {
          displayName: 'Explanation',
          shortDesc: 'Explanation text for the correct answer',
          longDesc: 'Optional explanation that appears when users answer the quiz',
        },
        explanation_parse_mode: {
          displayName: 'Explanation Format',
          shortDesc: 'How to format the explanation text',
          longDesc: 'Choose the formatting mode for the explanation text',
        },
        open_period: {
          displayName: 'Open Period',
          shortDesc: 'How long the poll stays open (in seconds)',
          longDesc: 'Duration in seconds that the poll will accept votes (5-600 seconds)',
        },
        close_date: {
          displayName: 'Close Date',
          shortDesc: 'Specific date/time to close the poll',
          longDesc: 'Unix timestamp for when the poll should automatically close',
        },
        is_closed: {
          displayName: 'Send Closed Poll',
          shortDesc: 'Send the poll in a closed state',
          longDesc: 'If enabled, the poll will be sent already closed (for demonstration purposes)',
        },
        disable_notification: {
          displayName: 'Send Silently',
          shortDesc: 'Send the poll without notification sound',
          longDesc: 'If enabled, users will receive the poll without notification sound',
        },
        protect_content: {
          displayName: 'Protect Content',
          shortDesc: 'Protect content from forwarding and saving',
          longDesc: 'If enabled, the poll cannot be forwarded by users',
        },
      },
    },
    edit_message: {
      displayName: 'Edit Message',
      shortDesc: 'Edit the text of a previously sent message',
      longDesc:
        'Modify the text content of a message that was previously sent by the bot. Only works with text messages sent by the bot.',
      groups: ['Message Management'],
      options: {
        chat: {
          displayName: 'Chat',
          shortDesc: 'The chat containing the message to edit',
          longDesc: 'Select the chat where the message to be edited is located',
        },
        message_id: {
          displayName: 'Message ID',
          shortDesc: 'The ID of the message to edit',
          longDesc: 'The unique identifier of the message that should be edited',
        },
        text: {
          displayName: 'New Text',
          shortDesc: 'The new text content for the message',
          longDesc: 'The updated text that will replace the current message content',
        },
        parse_mode: {
          displayName: 'Text Format',
          shortDesc: 'How to format the new message text',
          longDesc:
            'Choose the formatting mode for the text (plain text, Markdown, Markdown V2, or HTML)',
        },
        disable_web_page_preview: {
          displayName: 'Disable Web Page Preview',
          shortDesc: 'Disable automatic link previews',
          longDesc: 'If enabled, links in the message will not show automatic previews',
        },
      },
    },
    pin_chat_message: {
      displayName: 'Pin Message',
      shortDesc: 'Pin a message in a group or channel',
      longDesc:
        'Pin an important message to the top of a group or channel chat for all members to see',
      groups: ['Message Management'],
      options: {
        chat: {
          displayName: 'Chat',
          shortDesc: 'The chat where the message should be pinned',
          longDesc: 'Select the group or channel where you want to pin the message',
        },
        message_id: {
          displayName: 'Message ID',
          shortDesc: 'The ID of the message to pin',
          longDesc: 'The unique identifier of the message that should be pinned',
        },
        disable_notification: {
          displayName: 'Pin Silently',
          shortDesc: 'Pin the message without notification',
          longDesc:
            'If enabled, the message will be pinned without sending a notification to group members',
        },
      },
    },
    unpin_chat_message: {
      displayName: 'Unpin Message',
      shortDesc: 'Unpin a specific message or all pinned messages',
      longDesc:
        'Remove a pinned message from a group or channel, or unpin all currently pinned messages',
      groups: ['Message Management'],
      options: {
        chat: {
          displayName: 'Chat',
          shortDesc: 'The chat where the message should be unpinned',
          longDesc: 'Select the group or channel where you want to unpin messages',
        },
        message_id: {
          displayName: 'Message ID',
          shortDesc: 'The ID of the message to unpin (leave empty to unpin all)',
          longDesc:
            'The unique identifier of the specific message to unpin. Leave empty to unpin all pinned messages',
        },
      },
    },
    delete_message: {
      displayName: 'Delete Message',
      shortDesc: 'Delete a specific message from a chat',
      longDesc:
        'Remove a message from the chat. The bot can delete its own messages and messages from other users if it has admin privileges.',
      groups: ['Message Management'],
      options: {
        chat: {
          displayName: 'Chat',
          shortDesc: 'The chat where the message should be deleted',
          longDesc: 'Select the chat where the message to be deleted is located',
        },
        message_id: {
          displayName: 'Message ID',
          shortDesc: 'The ID of the message to delete',
          longDesc: 'The unique identifier of the message that should be deleted from the chat',
        },
      },
    },
    list_chats: {
      displayName: 'List Recent Chats',
      shortDesc: 'Get a list of recent chats the bot has interacted with',
      longDesc:
        'Retrieve a list of chats, groups, and channels where the bot has recently received messages or interactions',
      groups: ['Chat Information'],
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of chats to return',
          longDesc: 'The maximum number of recent chats to retrieve (default: 10)',
        },
      },
    },
    get_file: {
      displayName: 'Get File',
      shortDesc: 'Download a file received by or sent through the bot',
      longDesc:
        'Downloads a photo, voice message, audio file, document, video or video note by its Telegram file ID and returns it as a file (name, MIME type and base64 content) together with the Telegram file metadata. The Telegram Bot API can only serve files up to 20 MB this way.',
      groups: ['Message Management'],
      options: {
        file_id: {
          displayName: 'File ID',
          shortDesc: 'The Telegram file identifier of the file to download',
          longDesc:
            'Take the value from the **New Message** trigger payload: `voice.file_id`, `audio.file_id`, `document.file_id`, `video.file_id`, `video_note.file_id`, or `photo[<n>].file_id` (the last element of `photo` is the largest size), or from the `photo` list in the **Send Photo** response. Files larger than 20 MB cannot be downloaded through the Bot API.',
        },
      },
    },
  },
  triggers: {
    new_message: {
      displayName: 'New Message',
      shortDesc: 'Triggers when a new message is received in a specific chat',
      longDesc:
        'Monitors a chat for new incoming messages and triggers automation workflows when messages are received from users or other bots',
      options: {
        chat: {
          displayName: 'Chat to Monitor',
          shortDesc: 'The chat to monitor for new messages',
          longDesc:
            'Select the specific chat, group, or channel where you want to detect new incoming messages',
        },
      },
    },
  },
};

export default TelegramAppEn;
