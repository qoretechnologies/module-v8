/* eslint-disable max-len */
const AmazonSNSAppEn = {
  displayName: 'AWS SNS',
  groups: ['DevOps & Cloud Infrastructure', 'Messaging & Real-time Communication'],
  shortDesc: 'Send notifications and messages through Amazon Simple Notification Service.',
  longDesc:
    'The Amazon SNS integration enables you to create topics, send messages, manage subscribers, and monitor notifications through Amazon Simple Notification Service. Perfect for building scalable messaging systems, sending alerts, and coordinating distributed applications with reliable message delivery.',
  triggers: {
    new_message: {
      displayName: 'New Message',
      shortDesc: 'Triggers when a new message is published to an SNS topic.',
      longDesc:
        'This trigger subscribes to an Amazon SNS topic and fires when a new message is published. It automatically handles subscription management and provides the complete message payload.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region where the SNS topic is located.',
          longDesc:
            'Specify the AWS region where your SNS topic is hosted. If not provided, defaults to us-east-1.',
        },
        topic_arn: {
          displayName: 'Topic ARN',
          shortDesc: 'The Amazon Resource Name (ARN) of the SNS topic to subscribe to.',
          longDesc:
            'The full ARN of the SNS topic you want to monitor for new messages. The format should be: arn:aws:sns:region:account-id:topic-name.',
        },
      },
    },
    new_topic: {
      displayName: 'New Topic',
      shortDesc: 'Triggers when a new SNS topic is created',
      longDesc:
        'Monitors your Amazon SNS service for newly created topics and triggers when a new topic is detected in your specified region.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to monitor for new topics',
          longDesc:
            'The AWS region where you want to monitor for new SNS topics. If not specified, defaults to us-east-1.',
        },
      },
    },
  },
  actions: {
    create_topic: {
      displayName: 'Create Topic',
      shortDesc: 'Create a new SNS topic',
      longDesc:
        'Creates a new Amazon SNS topic with optional configuration for FIFO topics, encryption, and delivery policies.',
      options: {
        topic_name: {
          displayName: 'Topic Name',
          shortDesc: 'Name for the new topic',
          longDesc:
            'The name for the SNS topic. For FIFO topics, the name must end with .fifo suffix.',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region for the topic',
          longDesc:
            'The AWS region where the topic will be created. Defaults to us-east-1 if not specified.',
        },
        display_name: {
          displayName: 'Display Name',
          shortDesc: 'Human-readable name for the topic',
          longDesc:
            'A human-readable name for the topic that appears in email notifications and other contexts.',
        },
        delivery_policy: {
          displayName: 'Delivery Policy',
          shortDesc: 'JSON delivery policy for the topic',
          longDesc:
            'A JSON string that defines the delivery policy for the topic, controlling retry behavior and delivery settings.',
        },
        policy: {
          displayName: 'Policy',
          shortDesc: 'Access policy for the topic',
          longDesc:
            'A JSON string that defines the access policy for the topic, controlling who can publish to or subscribe to the topic.',
        },
        kms_master_key_id: {
          displayName: 'KMS Master Key ID',
          shortDesc: 'KMS key for topic encryption',
          longDesc:
            'The ID of an AWS KMS key to use for encrypting messages published to this topic.',
        },
        fifo_topic: {
          displayName: 'FIFO Topic',
          shortDesc: 'Create as FIFO topic',
          longDesc:
            'Whether to create a FIFO (First-In-First-Out) topic that preserves message ordering and prevents duplicates.',
        },
        content_based_deduplication: {
          displayName: 'Content-Based Deduplication',
          shortDesc: 'Enable content-based deduplication',
          longDesc:
            'Whether to enable content-based deduplication for FIFO topics, which prevents duplicate messages based on message content.',
        },
      },
    },
    create_message: {
      displayName: 'Create Message',
      shortDesc: 'Send a message to an SNS topic',
      longDesc:
        'Publishes a text message to an Amazon SNS topic, which will be delivered to all subscribers of the topic.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region of the topic',
          longDesc: 'The AWS region where the target topic is located.',
        },
        topic_arn: {
          displayName: 'Topic ARN',
          shortDesc: 'ARN of the target topic',
          longDesc:
            'The Amazon Resource Name (ARN) of the SNS topic where the message will be published.',
        },
        message: {
          displayName: 'Message',
          shortDesc: 'Message content to send',
          longDesc: 'The text content of the message to be sent to all topic subscribers.',
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'Message subject line',
          longDesc:
            'An optional subject line for the message, used primarily for email notifications.',
        },
        message_attributes: {
          displayName: 'Message Attributes',
          shortDesc: 'Additional message metadata',
          longDesc:
            'A hash of additional attributes to include with the message for filtering and routing purposes.',
        },
        message_deduplication_id: {
          displayName: 'Message Deduplication ID',
          shortDesc: 'Deduplication ID for FIFO topics',
          longDesc:
            'A unique identifier for message deduplication in FIFO topics. Required for FIFO topics without content-based deduplication.',
        },
        message_group_id: {
          displayName: 'Message Group ID',
          shortDesc: 'Group ID for FIFO topics',
          longDesc:
            'A tag that specifies that messages belong to a specific message group for FIFO topics. Required for FIFO topics.',
        },
      },
    },
    create_json_message: {
      displayName: 'Create JSON Message',
      shortDesc: 'Send a structured JSON message to an SNS topic',
      longDesc:
        'Publishes a JSON-structured message to an Amazon SNS topic, allowing for rich content and structured data delivery to subscribers.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region of the topic',
          longDesc: 'The AWS region where the target topic is located.',
        },
        topic_arn: {
          displayName: 'Topic ARN',
          shortDesc: 'ARN of the target topic',
          longDesc:
            'The Amazon Resource Name (ARN) of the SNS topic where the JSON message will be published.',
        },
        json_message: {
          displayName: 'JSON Message',
          shortDesc: 'JSON object to send',
          longDesc:
            'The JSON object containing the structured data to be sent to all topic subscribers.',
        },
        subject: {
          displayName: 'Subject',
          shortDesc: 'Message subject line',
          longDesc:
            'An optional subject line for the message, used primarily for email notifications.',
        },
        message_attributes: {
          displayName: 'Message Attributes',
          shortDesc: 'Additional message metadata',
          longDesc:
            'A hash of additional attributes to include with the message for filtering and routing purposes.',
        },
        message_deduplication_id: {
          displayName: 'Message Deduplication ID',
          shortDesc: 'Deduplication ID for FIFO topics',
          longDesc:
            'A unique identifier for message deduplication in FIFO topics. Required for FIFO topics without content-based deduplication.',
        },
        message_group_id: {
          displayName: 'Message Group ID',
          shortDesc: 'Group ID for FIFO topics',
          longDesc:
            'A tag that specifies that messages belong to a specific message group for FIFO topics. Required for FIFO topics.',
        },
      },
    },
    list_topics: {
      displayName: 'List Topics',
      shortDesc: 'List all SNS topics',
      longDesc:
        'Retrieves a list of all Amazon SNS topics in the specified region, optionally including detailed attributes for each topic.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to list topics from',
          longDesc: 'The AWS region from which to retrieve the list of SNS topics.',
        },
        include_attributes: {
          displayName: 'Include Attributes',
          shortDesc: 'Include detailed topic attributes',
          longDesc:
            'Whether to include detailed attributes for each topic, such as subscription counts and policies.',
        },
        next_token: {
          displayName: 'Next Token',
          shortDesc: 'Pagination token',
          longDesc:
            'A token for paginating through large lists of topics. Use the token returned from a previous call.',
        },
      },
    },
    get_topic: {
      displayName: 'Get Topic',
      shortDesc: 'Get details of a specific SNS topic',
      longDesc:
        'Retrieves detailed information about a specific Amazon SNS topic, including attributes, subscription statistics, and configuration details.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region of the topic',
          longDesc: 'The AWS region where the topic is located.',
        },
        topic_arn: {
          displayName: 'Topic ARN',
          shortDesc: 'ARN of the topic to retrieve',
          longDesc: 'The Amazon Resource Name (ARN) of the SNS topic to get details for.',
        },
      },
    },
    add_subscriber: {
      displayName: 'Add Subscriber',
      shortDesc: 'Add a subscriber to an SNS topic',
      longDesc:
        'Creates a new subscription to an Amazon SNS topic, allowing the specified endpoint to receive messages published to the topic.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region of the topic',
          longDesc: 'The AWS region where the target topic is located.',
        },
        topic_arn: {
          displayName: 'Topic ARN',
          shortDesc: 'ARN of the topic to subscribe to',
          longDesc: 'The Amazon Resource Name (ARN) of the SNS topic to create a subscription for.',
        },
        protocol: {
          displayName: 'Protocol',
          shortDesc: 'Subscription protocol type',
          longDesc:
            'The protocol to use for delivering messages to the subscriber (HTTP, HTTPS, Email, SMS, SQS, Lambda, or Application).',
        },
        endpoint: {
          displayName: 'Endpoint',
          shortDesc: 'Subscriber endpoint',
          longDesc:
            'The endpoint that will receive the messages. Format depends on the protocol (URL for HTTP/HTTPS, email address for email, phone number for SMS, etc.).',
        },
      },
    },
  },
};

export default AmazonSNSAppEn;
