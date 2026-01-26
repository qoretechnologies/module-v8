/* eslint-disable max-len */
const AmazonEc2AppEn = {
  displayName: 'AWS EC2',
  groups: ['DevOps & Cloud Infrastructure'],
  shortDesc: 'Connect to Amazon EC2 to manage and automate your cloud infrastructure operations.',
  longDesc:
    'The Amazon EC2 integration provides comprehensive actions and triggers to interact with Amazon Elastic Compute Cloud services. Manage instances, volumes, security groups, snapshots, and other EC2 resources to automate your cloud infrastructure workflows and monitoring.',
  connectionMessage: {
    title: 'Connect to AWS EC2',
    content: `To connect to Amazon EC2, you will need your **AWS Access Key ID**, **Secret Access Key**, and **Region**.

## Creating AWS Credentials

1. Sign in to the [AWS Management Console](https://console.aws.amazon.com/iam/)
2. Navigate to **IAM** → **Users** → **Create user**
3. Enter a username and click **Next**
4. Attach the **AmazonEC2FullAccess** policy (or create a custom policy with minimum required permissions)
5. Click **Create user**
6. Select the user → **Security credentials** tab → **Create access key**
7. Choose **Third-party service** and create the key
8. Save your **Access Key ID** and **Secret Access Key** securely

## Connection Details

### Access Key ID
Your AWS access key ID (starts with \`AKIA\`)

### Secret Access Key
Your AWS secret access key (only shown once when created)

### Region
The AWS region for your EC2 operations (e.g., \`us-east-1\`, \`eu-west-1\`)

**Note:** For security, create a dedicated IAM user with only the permissions needed for your use case. Avoid using root account credentials.`,
  },
  triggers: {
    new_instance: {
      displayName: 'New Instance',
      shortDesc: 'Triggers when a new EC2 instance is created or reaches a specified state',
      longDesc:
        'This trigger monitors for newly created EC2 instances or instances that have transitioned to specific states like pending or running. It provides comprehensive instance information including networking details, tags, and configuration.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to monitor for new instances',
          longDesc:
            'The AWS region where you want to monitor for new EC2 instances. Defaults to us-east-1 if not specified.',
        },
        instance_states: {
          displayName: 'Instance States',
          shortDesc: 'Instance states to monitor',
          longDesc:
            'List of EC2 instance states to monitor. The trigger will fire when instances are in any of these states. Common states include pending, running, stopping, stopped, shutting-down, and terminated.',
        },
      },
    },
    new_scheduled_event: {
      displayName: 'New Scheduled Event',
      shortDesc: 'Triggers when a new scheduled maintenance event is detected on EC2 instances',
      longDesc:
        'This trigger monitors for new scheduled events on EC2 instances such as system reboots, maintenance windows, or instance retirements. It helps you stay informed about upcoming AWS-initiated actions on your infrastructure.',
      options: {
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to monitor for scheduled events',
          longDesc:
            'The AWS region where you want to monitor for scheduled events on EC2 instances.',
        },
        instance_ids: {
          displayName: 'Instance IDs',
          shortDesc: 'Specific instances to monitor (optional)',
          longDesc:
            'Optional list of specific EC2 instance IDs to monitor. If left empty, all instances in the region will be monitored for scheduled events.',
        },
        event_types: {
          displayName: 'Event Types',
          shortDesc: 'Types of scheduled events to monitor',
          longDesc:
            'List of scheduled event types to monitor, such as system-reboot, system-maintenance, instance-retirement, or instance-stop.',
        },
      },
    },
  },
  actions: {
    start_instance: {
      displayName: 'Start Instance',
      shortDesc: 'Start one or more stopped EC2 instances',
      longDesc:
        'Starts one or more Amazon EC2 instances that are currently in a stopped state. The instances will transition from stopped to pending and then to running state.',
      options: {
        instance_ids: {
          displayName: 'Instance IDs',
          shortDesc: 'List of instance IDs to start',
          longDesc:
            'One or more EC2 instance IDs that you want to start. These instances must be in a stopped state.',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region containing the instances',
          longDesc: 'The AWS region where the EC2 instances are located.',
        },
      },
    },
    stop_instance: {
      displayName: 'Stop Instance',
      shortDesc: 'Stop one or more running EC2 instances',
      longDesc:
        'Stops one or more Amazon EC2 instances. The instances will transition from running to stopping and then to stopped state. You can optionally force stop instances.',
      options: {
        instance_ids: {
          displayName: 'Instance IDs',
          shortDesc: 'List of instance IDs to stop',
          longDesc:
            'One or more EC2 instance IDs that you want to stop. These instances should be in a running state.',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region containing the instances',
          longDesc: 'The AWS region where the EC2 instances are located.',
        },
        force: {
          displayName: 'Force Stop',
          shortDesc: 'Force stop the instances',
          longDesc:
            'When enabled, forces the instances to stop immediately. This is equivalent to pulling the power plug on a physical computer.',
        },
      },
    },
    reboot_instance: {
      displayName: 'Reboot Instance',
      shortDesc: 'Reboot one or more running EC2 instances',
      longDesc:
        'Performs a reboot of one or more Amazon EC2 instances. This is equivalent to performing a restart from within the operating system.',
      options: {
        instance_ids: {
          displayName: 'Instance IDs',
          shortDesc: 'List of instance IDs to reboot',
          longDesc:
            'One or more EC2 instance IDs that you want to reboot. These instances should be in a running state.',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region containing the instances',
          longDesc: 'The AWS region where the EC2 instances are located.',
        },
      },
    },
    describe_instances: {
      displayName: 'Describe Instances',
      shortDesc: 'Get detailed information about EC2 instances',
      longDesc:
        'Retrieves comprehensive information about one or more EC2 instances including their state, configuration, networking details, and tags.',
      options: {
        instance_ids: {
          displayName: 'Instance IDs',
          shortDesc: 'Specific instance IDs to describe (optional)',
          longDesc:
            'Optional list of specific EC2 instance IDs to describe. If not provided, information about all instances in the region will be returned.',
        },
        region: {
          displayName: 'Region',
          shortDesc: 'AWS region to query',
          longDesc: 'The AWS region where you want to retrieve instance information.',
        },
        max_results: {
          displayName: 'Max Results',
          shortDesc: 'Maximum number of instances to return',
          longDesc:
            'The maximum number of instances to return in a single request. Defaults to 100.',
        },
        next_page_token: {
          displayName: 'Next Page Token',
          shortDesc: 'Token for pagination',
          longDesc:
            'Token used for pagination to retrieve the next set of results when there are more instances than the max results limit.',
        },
      },
    },
    describe_regions: {
      displayName: 'Describe Regions',
      shortDesc: 'Get information about available AWS regions',
      longDesc:
        'Retrieves information about available AWS regions including their endpoints and opt-in status.',
      options: {
        all_regions: {
          displayName: 'All Regions',
          shortDesc: 'Include all regions including opt-in regions',
          longDesc:
            'When enabled, includes all AWS regions including those that require you to opt-in before you can use them.',
        },
      },
    },
  },
};

export default AmazonEc2AppEn;
