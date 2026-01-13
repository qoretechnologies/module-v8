/* eslint-disable max-len */
const Messenger360AppEn = {
  displayName: '360 Messenger for WhatsApp',
  groups: ['Messaging & Real-time Communication'],
  shortDesc: 'Automate and send personalized WhatsApp messages using 360 Messenger.',
  longDesc:
    '360 Messenger for WhatsApp enables you to send automated and personalized messages directly through WhatsApp Business accounts. Ideal for customer engagement, notifications, and support workflows, this integration ensures fast and reliable communication at scale via WhatsApp.',
  connectionMessage: {
    title: 'Connect to 360 Messenger',
    content: `To connect to 360 Messenger for WhatsApp, you will need your **API Key**.

## Getting Your API Key

1. Sign in to your [360 Messenger Dashboard](https://360messenger.com/)
2. Navigate to **Settings** or **API Settings**
3. Locate your API key or generate a new one
4. Copy the API key for use in your integration

## Connection Details

### API Key
Your 360 Messenger API key that authenticates requests to send and receive WhatsApp messages through the platform.

**Note:** Keep your API key secure and never share it publicly. Your API key grants full access to send messages on behalf of your WhatsApp Business account.`,
  },
  actions: {
    get_contacts: {
      displayName: 'Get WhatsApp Contacts',
      shortDesc: 'Retrieve all WhatsApp contacts from your account.',
      longDesc:
        'Fetches a complete list of WhatsApp contacts including their details such as phone numbers, business status, and contact information.',
      options: {},
    },

    get_chats: {
      displayName: 'Get WhatsApp Chats',
      shortDesc: 'Retrieve all WhatsApp chat conversations.',
      longDesc:
        'Fetches a list of all WhatsApp chat conversations including chat details, last messages, unread counts, and chat metadata such as pinned and archived status.',
      options: {},
    },

    get_groups: {
      displayName: 'Get WhatsApp Groups',
      shortDesc: 'Retrieve all WhatsApp group chats.',
      longDesc:
        'Fetches a list of all WhatsApp group conversations that you are a member of, including group IDs and names.',
      options: {},
    },

    send_text_message: {
      displayName: 'Send WhatsApp Text Message',
      shortDesc: 'Send a text message to a WhatsApp contact.',
      longDesc:
        'Sends a text message to a specific WhatsApp contact by phone number. Optionally include a URL link and schedule the message for later delivery.',
      options: {
        phonenumber: {
          displayName: 'Phone Number',
          shortDesc: "The recipient's phone number",
          longDesc:
            'The phone number of the WhatsApp contact to send the message to. Should include country code.',
        },
        text: {
          displayName: 'Message Text',
          shortDesc: 'The text content of the message',
          longDesc: 'The text content that will be sent as the WhatsApp message.',
        },
        url: {
          displayName: 'URL Link',
          shortDesc: 'Optional URL to include in the message',
          longDesc: 'An optional URL that can be included with the text message for sharing links.',
        },
        delay: {
          displayName: 'Scheduled Time',
          shortDesc: 'Optional time to schedule the message',
          longDesc:
            'Optional date and time to schedule when the message should be sent. If not provided, the message will be sent immediately.',
        },
      },
    },

    send_group_text_message: {
      displayName: 'Send WhatsApp Group Message',
      shortDesc: 'Send a text message to a WhatsApp group.',
      longDesc:
        'Sends a text message to a specific WhatsApp group. Optionally include a URL link and schedule the message for later delivery.',
      options: {
        groupId: {
          displayName: 'Group ID',
          shortDesc: 'The WhatsApp group identifier',
          longDesc: 'The unique identifier of the WhatsApp group where the message will be sent.',
        },
        text: {
          displayName: 'Message Text',
          shortDesc: 'The text content of the message',
          longDesc: 'The text content that will be sent as the WhatsApp group message.',
        },
        url: {
          displayName: 'URL Link',
          shortDesc: 'Optional URL to include in the message',
          longDesc: 'An optional URL that can be included with the text message for sharing links.',
        },
        delay: {
          displayName: 'Scheduled Time',
          shortDesc: 'Optional time to schedule the message',
          longDesc:
            'Optional date and time to schedule when the message should be sent. If not provided, the message will be sent immediately.',
        },
      },
    },
  },
  triggers: {
    new_message: {
      displayName: 'New WhatsApp Message',
      shortDesc: 'Triggers when a new WhatsApp message is received.',
      longDesc:
        'This webhook trigger activates whenever a new WhatsApp message is received in any chat or group conversation. It captures message details including sender, recipient, message content, and metadata.',
      options: {},
    },
  },
};

export default Messenger360AppEn;
