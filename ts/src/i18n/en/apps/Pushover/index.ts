
/* eslint-disable max-len */
const PushoverAppEn = {
  displayName: 'Pushover',
  groups: ['Notifications & Alerts'],
  shortDesc: 'Send push notifications to mobile devices and desktops',
  longDesc:
    'Pushover makes it easy to get real-time notifications on your Android, iPhone, iPad, and Desktop. Send notifications for urgent alerts, system monitoring, or any automated messaging needs.',
  connectionMessage: {
    title: 'Connect to Pushover',
    content: `To connect your Pushover account, you will need your **Application API Token** and **User Key**.

1. Create an application at https://pushover.net/apps/build to get your API token
2. Find your User Key on your Pushover dashboard at https://pushover.net

Both values are 30-character alphanumeric strings.`,
  },
  actions: {
    push_notification: {
      displayName: 'Push Notification',
      shortDesc: 'Send a push notification to a user or group',
      longDesc:
        'Send a push notification with customizable priority, sound, and formatting. Supports priorities from lowest (no alert) to high (bypasses quiet hours).',
      groups: ['Notifications'],
      options: {
        message: {
          displayName: 'Message',
          shortDesc: 'The notification message content',
          longDesc: 'The main text of the notification. Maximum 1024 characters.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Optional title for the notification',
          longDesc:
            'The title displayed above the message. Maximum 250 characters. Defaults to your application name if not specified.',
        },
        device: {
          displayName: 'Device',
          shortDesc: 'Target specific device(s)',
          longDesc:
            'Send to a specific device name, or leave blank to send to all devices. Multiple devices can be separated by commas.',
        },
        priority: {
          displayName: 'Priority',
          shortDesc: 'Notification priority level',
          longDesc:
            'Controls how the notification is delivered. Lowest shows no alert, Low is quiet, Normal is default, High bypasses quiet hours.',
        },
        sound: {
          displayName: 'Sound',
          shortDesc: 'Notification sound',
          longDesc:
            'The sound to play when the notification arrives. Choose from predefined Pushover sounds.',
        },
        format: {
          displayName: 'Message Format',
          shortDesc: 'Text formatting style',
          longDesc:
            'Plain text (default), HTML for basic formatting (<b>, <i>, <u>, <a>), or Monospace for code-style text.',
        },
        url: {
          displayName: 'URL',
          shortDesc: 'Supplementary URL',
          longDesc: 'A URL to include with the notification. Maximum 512 characters.',
        },
        url_title: {
          displayName: 'URL Title',
          shortDesc: 'Title for the URL',
          longDesc: 'Display text for the URL link. Maximum 100 characters.',
        },
        timestamp: {
          displayName: 'Timestamp',
          shortDesc: 'Override message timestamp',
          longDesc:
            'Unix timestamp to display as the message time, useful for delayed or batched notifications.',
        },
        ttl: {
          displayName: 'Time to Live',
          shortDesc: 'Message expiration time in seconds',
          longDesc:
            'Number of seconds before the message is automatically deleted from devices. Useful for time-sensitive notifications.',
        },
      },
    },
    push_emergency_notification: {
      displayName: 'Push Emergency Notification',
      shortDesc: 'Send a high-priority emergency notification with acknowledgment tracking',
      longDesc:
        'Send an emergency notification that requires acknowledgment. The notification will repeat at specified intervals until acknowledged or expired. Returns a receipt ID for tracking.',
      groups: ['Notifications'],
      options: {
        message: {
          displayName: 'Message',
          shortDesc: 'The emergency notification message',
          longDesc: 'The main text of the emergency notification. Maximum 1024 characters.',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Optional title for the notification',
          longDesc: 'The title displayed above the message. Maximum 250 characters.',
        },
        retry: {
          displayName: 'Retry Interval',
          shortDesc: 'Seconds between retries (minimum 30)',
          longDesc:
            'How often (in seconds) Pushover will resend the notification until acknowledged. Minimum 30 seconds.',
        },
        expire: {
          displayName: 'Expiration Time',
          shortDesc: 'Seconds until notification stops retrying (maximum 10800)',
          longDesc:
            'How long (in seconds) the notification will continue retrying. Maximum 10800 seconds (3 hours).',
        },
        device: {
          displayName: 'Device',
          shortDesc: 'Target specific device(s)',
          longDesc: 'Send to a specific device name, or leave blank to send to all devices.',
        },
        sound: {
          displayName: 'Sound',
          shortDesc: 'Notification sound',
          longDesc:
            'The sound to play. Long sounds like "persistent" or "siren" work well for emergencies.',
        },
        format: {
          displayName: 'Message Format',
          shortDesc: 'Text formatting style',
          longDesc: 'Plain text, HTML, or Monospace formatting.',
        },
        url: {
          displayName: 'URL',
          shortDesc: 'Supplementary URL',
          longDesc: 'A URL to include with the notification.',
        },
        url_title: {
          displayName: 'URL Title',
          shortDesc: 'Title for the URL',
          longDesc: 'Display text for the URL link.',
        },
        callback: {
          displayName: 'Callback URL',
          shortDesc: 'URL to call when acknowledged',
          longDesc:
            'Pushover will POST to this URL when the notification is acknowledged by the user.',
        },
        tags: {
          displayName: 'Tags',
          shortDesc: 'Tags for bulk cancellation',
          longDesc:
            'Comma-separated tags that can be used to cancel multiple emergency notifications at once.',
        },
      },
    },
    validate_user: {
      displayName: 'Validate User',
      shortDesc: 'Validate a user or group key and list devices',
      longDesc:
        'Verify that a user or group key is valid and retrieve the list of registered devices. Useful for confirming credentials before sending notifications.',
      groups: ['User Management'],
      options: {
        device: {
          displayName: 'Device',
          shortDesc: 'Validate a specific device',
          longDesc: 'Optionally specify a device name to validate that it exists for this user.',
        },
      },
    },
  },
};

export default PushoverAppEn;
