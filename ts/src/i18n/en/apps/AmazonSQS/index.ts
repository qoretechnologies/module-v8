/* eslint-disable max-len */
const AmazonSQSAppEn = {
  displayName: 'AWS SQS',
  groups: ['DevOps & Cloud Infrastructure', 'Messaging & Real-time Communication'],
  shortDesc:
    'Connect to Amazon Simple Queue Service to manage message queues and automate message processing workflows.',
  longDesc:
    'The AWS SQS integration provides comprehensive queue management and message handling capabilities for Amazon Simple Queue Service. Create and manage queues, send messages (including JSON), receive messages with polling triggers, and automate your message-driven architectures with reliable, scalable queue operations.',
  triggers: {
    new_message: {
      displayName: 'New Message',
      shortDesc: 'Triggers when a new message is received in an SQS queue',
      longDesc:
        'Monitors an Amazon SQS queue for new messages and triggers when messages are available. Supports long polling and message attributes retrieval.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the SQS queue is located',
          longDesc:
            'Select the AWS region where your SQS queue is hosted. This determines the endpoint used for API calls.',
        },
        queue_url: {
          displayName: 'Queue URL',
          shortDesc: 'The URL of the SQS queue to monitor',
          longDesc: 'The complete URL of the Amazon SQS queue from which to receive messages.',
        },
        wait_time_seconds: {
          displayName: 'Wait Time (Seconds)',
          shortDesc: 'Long polling wait time in seconds',
          longDesc:
            'The duration (0-20 seconds) for which the call waits for a message to arrive in the queue before returning.',
        },
        max_messages: {
          displayName: 'Max Messages',
          shortDesc: 'Maximum number of messages to receive per poll',
          longDesc:
            'The maximum number of messages to return (1-10). Note that fewer messages might be returned.',
        },
      },
    },
    new_json_message: {
      displayName: 'New JSON Message',
      shortDesc: 'Triggers when a new JSON message is received in an SQS queue',
      longDesc:
        'Monitors an Amazon SQS queue for new messages containing valid JSON data. Only triggers for messages with parseable JSON content.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the SQS queue is located',
          longDesc:
            'Select the AWS region where your SQS queue is hosted. This determines the endpoint used for API calls.',
        },
        queue_url: {
          displayName: 'Queue URL',
          shortDesc: 'The URL of the SQS queue to monitor',
          longDesc: 'The complete URL of the Amazon SQS queue from which to receive JSON messages.',
        },
        wait_time_seconds: {
          displayName: 'Wait Time (Seconds)',
          shortDesc: 'Long polling wait time in seconds',
          longDesc:
            'The duration (0-20 seconds) for which the call waits for a message to arrive in the queue before returning.',
        },
        max_messages: {
          displayName: 'Max Messages',
          shortDesc: 'Maximum number of messages to receive per poll',
          longDesc:
            'The maximum number of messages to return (1-10). Note that fewer messages might be returned.',
        },
      },
    },
    new_queue: {
      displayName: 'New Queue',
      shortDesc: 'Triggers when a new SQS queue is created',
      longDesc:
        'Monitors for newly created Amazon SQS queues in the specified region and triggers when new queues are detected.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to monitor for new queues',
          longDesc: 'Select the AWS region where you want to monitor for newly created SQS queues.',
        },
      },
    },
  },
  actions: {
    create_message: {
      displayName: 'Create Message',
      shortDesc: 'Send a text message to an SQS queue',
      longDesc:
        'Send a text message to an Amazon SQS queue with optional message attributes, delay settings, and FIFO queue parameters.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the SQS queue is located',
          longDesc: 'Select the AWS region where your target SQS queue is hosted.',
        },
        queue_url: {
          displayName: 'Queue URL',
          shortDesc: 'The URL of the target SQS queue',
          longDesc: 'The complete URL of the Amazon SQS queue where the message will be sent.',
        },
        message_body: {
          displayName: 'Message Body',
          shortDesc: 'The text content of the message',
          longDesc:
            'The message content to send. Can be plain text or any string format up to 256 KB.',
        },
        delay_seconds: {
          displayName: 'Delay (Seconds)',
          shortDesc: 'Number of seconds to delay message delivery',
          longDesc:
            'The length of time (0-900 seconds) for which to delay delivery of the message.',
        },
        message_attributes: {
          displayName: 'Message Attributes',
          shortDesc: 'Additional metadata for the message',
          longDesc: 'Custom attributes to include with the message for filtering and processing.',
        },
        message_group_id: {
          displayName: 'Message Group ID',
          shortDesc: 'Group ID for FIFO queues',
          longDesc:
            'The tag that specifies that a message belongs to a specific message group (FIFO queues only).',
        },
        message_deduplication_id: {
          displayName: 'Message Deduplication ID',
          shortDesc: 'Deduplication ID for FIFO queues',
          longDesc: 'The token used for deduplication of sent messages (FIFO queues only).',
        },
      },
    },
    create_json_message: {
      displayName: 'Create JSON Message',
      shortDesc: 'Send a JSON message to an SQS queue',
      longDesc:
        'Send structured JSON data to an Amazon SQS queue. The JSON object will be automatically serialized into the message body.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the SQS queue is located',
          longDesc: 'Select the AWS region where your target SQS queue is hosted.',
        },
        queue_url: {
          displayName: 'Queue URL',
          shortDesc: 'The URL of the target SQS queue',
          longDesc: 'The complete URL of the Amazon SQS queue where the JSON message will be sent.',
        },
        message_data: {
          displayName: 'Message Data',
          shortDesc: 'The JSON object to send',
          longDesc:
            'The structured data object that will be serialized to JSON and sent as the message body.',
        },
        delay_seconds: {
          displayName: 'Delay (Seconds)',
          shortDesc: 'Number of seconds to delay message delivery',
          longDesc:
            'The length of time (0-900 seconds) for which to delay delivery of the message.',
        },
        message_attributes: {
          displayName: 'Message Attributes',
          shortDesc: 'Additional metadata for the message',
          longDesc: 'Custom attributes to include with the message for filtering and processing.',
        },
        message_group_id: {
          displayName: 'Message Group ID',
          shortDesc: 'Group ID for FIFO queues',
          longDesc:
            'The tag that specifies that a message belongs to a specific message group (FIFO queues only).',
        },
        message_deduplication_id: {
          displayName: 'Message Deduplication ID',
          shortDesc: 'Deduplication ID for FIFO queues',
          longDesc: 'The token used for deduplication of sent messages (FIFO queues only).',
        },
      },
    },
    create_queue: {
      displayName: 'Create Queue',
      shortDesc: 'Create a new SQS queue',
      longDesc:
        'Create a new Amazon SQS queue with configurable settings including FIFO capabilities, dead letter queues, and encryption options.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the queue will be created',
          longDesc: 'Select the AWS region where you want to create the new SQS queue.',
        },
        queue_name: {
          displayName: 'Queue Name',
          shortDesc: 'The name of the new queue',
          longDesc: 'The name for the queue. FIFO queue names must end with .fifo suffix.',
        },
        fifo_queue: {
          displayName: 'FIFO Queue',
          shortDesc: 'Create as a FIFO (First-In-First-Out) queue',
          longDesc:
            'Whether to create a FIFO queue that ensures messages are processed exactly once in the exact order sent.',
        },
        content_based_deduplication: {
          displayName: 'Content-Based Deduplication',
          shortDesc: 'Enable automatic deduplication based on message content',
          longDesc:
            'For FIFO queues, enables deduplication using a SHA-256 hash of the message body.',
        },
        visibility_timeout: {
          displayName: 'Visibility Timeout (Seconds)',
          shortDesc: 'Time a message is invisible after being received',
          longDesc:
            'The length of time (0-43200 seconds) that a message is invisible to other consumers after being received.',
        },
        message_retention_period: {
          displayName: 'Message Retention Period (Seconds)',
          shortDesc: 'How long messages are retained in the queue',
          longDesc:
            'The length of time (60-1209600 seconds) that messages are retained in the queue.',
        },
        delay_seconds: {
          displayName: 'Delay (Seconds)',
          shortDesc: 'Default delay for new messages',
          longDesc: 'The default delay (0-900 seconds) for messages added to this queue.',
        },
        receive_message_wait_time_seconds: {
          displayName: 'Receive Wait Time (Seconds)',
          shortDesc: 'Long polling wait time for receive operations',
          longDesc:
            'The time (0-20 seconds) for which ReceiveMessage calls wait for messages to arrive.',
        },
        max_receive_count: {
          displayName: 'Max Receive Count',
          shortDesc: 'Maximum receives before moving to dead letter queue',
          longDesc:
            'The number of times a message can be received before being moved to the dead letter queue.',
        },
        dead_letter_queue_url: {
          displayName: 'Dead Letter Queue URL',
          shortDesc: 'URL of the dead letter queue',
          longDesc:
            'The URL of the queue to use as a dead letter queue for failed message processing.',
        },
        kms_master_key_id: {
          displayName: 'KMS Master Key ID',
          shortDesc: 'KMS key for server-side encryption',
          longDesc: 'The ID of an AWS KMS key for server-side encryption of queue messages.',
        },
        kms_data_key_reuse_period_seconds: {
          displayName: 'KMS Data Key Reuse Period (Seconds)',
          shortDesc: 'How long to reuse KMS data keys',
          longDesc:
            'The length of time (60-86400 seconds) for which Amazon SQS can reuse a data key.',
        },
      },
    },
    list_queues: {
      displayName: 'List Queues',
      shortDesc: 'List all SQS queues in a region',
      longDesc:
        'Retrieve a list of all Amazon SQS queues in the specified region with optional filtering and detailed queue attributes.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to list queues from',
          longDesc: 'Select the AWS region from which to retrieve the list of SQS queues.',
        },
        queue_name_prefix: {
          displayName: 'Queue Name Prefix',
          shortDesc: 'Filter queues by name prefix',
          longDesc:
            'Optional prefix to filter queue names. Only queues with names starting with this prefix will be returned.',
        },
        max_results: {
          displayName: 'Max Results',
          shortDesc: 'Maximum number of queues to return',
          longDesc: 'The maximum number of queue results to return (1-1000).',
        },
        include_attributes: {
          displayName: 'Include Attributes',
          shortDesc: 'Include detailed queue attributes in the response',
          longDesc:
            'Whether to include detailed queue attributes like message counts, timestamps, and configuration settings.',
        },
      },
    },
    list_messages: {
      displayName: 'List Messages',
      shortDesc: 'Receive messages from an SQS queue',
      longDesc:
        'Retrieve messages from an Amazon SQS queue with configurable polling options and message attribute retrieval.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the SQS queue is located',
          longDesc: 'Select the AWS region where your SQS queue is hosted.',
        },
        queue_url: {
          displayName: 'Queue URL',
          shortDesc: 'The URL of the SQS queue to read from',
          longDesc: 'The complete URL of the Amazon SQS queue from which to receive messages.',
        },
        max_number_of_messages: {
          displayName: 'Max Number of Messages',
          shortDesc: 'Maximum messages to receive (1-10)',
          longDesc: 'The maximum number of messages to return in a single request (1-10).',
        },
        wait_time_seconds: {
          displayName: 'Wait Time (Seconds)',
          shortDesc: 'Long polling wait time',
          longDesc: 'The duration (0-20 seconds) for which the call waits for messages to arrive.',
        },
        visibility_timeout: {
          displayName: 'Visibility Timeout (Seconds)',
          shortDesc: 'Override the queue default visibility timeout',
          longDesc:
            'The duration for which received messages are hidden from subsequent retrieve requests.',
        },
        message_attribute_names: {
          displayName: 'Message Attribute Names',
          shortDesc: 'List of message attribute names to retrieve',
          longDesc:
            'The names of message attributes to return. Use "All" to return all attributes.',
        },
        attribute_names: {
          displayName: 'Attribute Names',
          shortDesc: 'List of message system attribute names to retrieve',
          longDesc:
            'The names of system attributes to return with each message. Use "All" to return all attributes.',
        },
      },
    },
    get_queue: {
      displayName: 'Get Queue',
      shortDesc: 'Get details about a specific SQS queue',
      longDesc:
        'Retrieve detailed information and attributes for a specific Amazon SQS queue including configuration, message counts, and timestamps.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the SQS queue is located',
          longDesc: 'Select the AWS region where your SQS queue is hosted.',
        },
        queue_url: {
          displayName: 'Queue URL',
          shortDesc: 'The URL of the SQS queue to inspect',
          longDesc: 'The complete URL of the Amazon SQS queue to retrieve information about.',
        },
        attribute_names: {
          displayName: 'Attribute Names',
          shortDesc: 'List of queue attributes to retrieve',
          longDesc:
            'The names of queue attributes to return. Use "All" to return all available attributes.',
        },
      },
    },
  },
};

export default AmazonSQSAppEn;
