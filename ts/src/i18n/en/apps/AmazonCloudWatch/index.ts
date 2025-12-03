/* eslint-disable max-len */
const AmazonCloudWatchAppEn = {
  displayName: 'Amazon CloudWatch',
  groups: ['DevOps & Cloud Infrastructure'],
  shortDesc:
    'Monitor AWS resources and applications with comprehensive alarm management and real-time state tracking.',
  longDesc:
    'The Amazon CloudWatch integration provides complete access to AWS monitoring and alerting capabilities. Monitor alarm state changes, manage alarm actions, retrieve detailed alarm information, and automate responses to infrastructure events. Perfect for maintaining system reliability, implementing automated incident response, and ensuring optimal AWS resource performance.',
  triggers: {
    new_alarm: {
      displayName: 'New Alarm',
      shortDesc: 'Triggers when a new CloudWatch alarm is created',
      longDesc:
        'Monitors your AWS account for newly created CloudWatch alarms, allowing you to automatically respond to new monitoring configurations. Useful for audit trails, notification setups, and automated alarm configuration workflows.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to monitor for new alarms',
          longDesc:
            'Specify the AWS region where you want to monitor for new CloudWatch alarms. Defaults to us-east-1 if not specified.',
        },
        alarm_name_prefix: {
          displayName: 'Alarm Name Prefix',
          shortDesc: 'Filter alarms by name prefix',
          longDesc:
            'Optional filter to only monitor alarms whose names start with the specified prefix. Leave empty to monitor all alarms.',
        },
      },
    },
    alarm_state_change: {
      displayName: 'Alarm State Change',
      shortDesc: 'Triggers when an alarm changes state',
      longDesc:
        'Monitors CloudWatch alarms for state changes between OK, ALARM, and INSUFFICIENT_DATA states. Essential for automated incident response, escalation workflows, and real-time monitoring notifications.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to monitor for state changes',
          longDesc:
            'Specify the AWS region where you want to monitor alarm state changes. Defaults to us-east-1 if not specified.',
        },
        alarm_name_prefix: {
          displayName: 'Alarm Name Prefix',
          shortDesc: 'Filter alarms by name prefix',
          longDesc:
            'Optional filter to only monitor alarms whose names start with the specified prefix. Leave empty to monitor all alarms.',
        },
        state_filter: {
          displayName: 'State Filter',
          shortDesc: 'Filter by specific alarm state',
          longDesc:
            'Optional filter to only trigger on alarms in a specific state (OK, ALARM, or INSUFFICIENT_DATA). Leave empty to monitor all state changes.',
        },
      },
    },
  },

  actions: {
    disable_alarm_actions: {
      displayName: 'Disable Alarm Actions',
      shortDesc: 'Disable actions for one or more CloudWatch alarms',
      longDesc:
        'Temporarily disable actions (notifications, auto-scaling, etc.) for specified CloudWatch alarms. Useful during maintenance windows, testing periods, or when you need to suppress alarm notifications without deleting the alarms.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region containing the alarms',
          longDesc:
            'Specify the AWS region where the target alarms are located. Defaults to us-east-1 if not specified.',
        },
        alarm_names: {
          displayName: 'Alarm Names',
          shortDesc: 'List of alarm names to disable actions for',
          longDesc:
            'Select one or more CloudWatch alarms to disable actions for. Actions include SNS notifications, Auto Scaling policies, and EC2 actions.',
        },
      },
    },
    enable_alarm_actions: {
      displayName: 'Enable Alarm Actions',
      shortDesc: 'Enable actions for one or more CloudWatch alarms',
      longDesc:
        'Re-enable actions (notifications, auto-scaling, etc.) for specified CloudWatch alarms. Use this to restore alarm functionality after maintenance or testing periods.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region containing the alarms',
          longDesc:
            'Specify the AWS region where the target alarms are located. Defaults to us-east-1 if not specified.',
        },
        alarm_names: {
          displayName: 'Alarm Names',
          shortDesc: 'List of alarm names to enable actions for',
          longDesc:
            'Select one or more CloudWatch alarms to enable actions for. This will restore SNS notifications, Auto Scaling policies, and EC2 actions.',
        },
      },
    },
    set_alarm_state: {
      displayName: 'Set Alarm State',
      shortDesc: 'Manually set the state of a CloudWatch alarm',
      longDesc:
        'Override the current state of a CloudWatch alarm by manually setting it to OK, ALARM, or INSUFFICIENT_DATA. Useful for testing alarm workflows, clearing false alarms, or forcing specific alarm states for operational purposes.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region containing the alarm',
          longDesc:
            'Specify the AWS region where the target alarm is located. Defaults to us-east-1 if not specified.',
        },
        alarm_name: {
          displayName: 'Alarm Name',
          shortDesc: 'The name of the alarm to update',
          longDesc: 'Select the CloudWatch alarm whose state you want to manually set.',
        },
        state_value: {
          displayName: 'State Value',
          shortDesc: 'The new state for the alarm',
          longDesc:
            'Choose the desired state: OK (normal operation), ALARM (threshold breached), or INSUFFICIENT_DATA (not enough data to evaluate).',
        },
        state_reason: {
          displayName: 'State Reason',
          shortDesc: 'Reason for the state change',
          longDesc:
            'Provide a human-readable reason for manually setting the alarm state. This appears in CloudWatch logs and alarm history.',
        },
      },
    },
    get_alarm: {
      displayName: 'Get Alarm',
      shortDesc: 'Retrieve detailed information about a CloudWatch alarm',
      longDesc:
        'Fetch comprehensive details about a specific CloudWatch alarm including its current state, configuration, thresholds, dimensions, and actions. Perfect for alarm auditing, troubleshooting, and configuration verification.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region containing the alarm',
          longDesc:
            'Specify the AWS region where the target alarm is located. Defaults to us-east-1 if not specified.',
        },
        alarm_name: {
          displayName: 'Alarm Name',
          shortDesc: 'The name of the alarm to retrieve',
          longDesc: 'Select the CloudWatch alarm whose details you want to retrieve.',
        },
      },
    },
    list_alarms: {
      displayName: 'List Alarms',
      shortDesc: 'List CloudWatch alarms with optional filtering',
      longDesc:
        'Retrieve a list of CloudWatch alarms in your AWS account with optional filtering by state, name prefix, and action status. Includes summary statistics and detailed alarm information for monitoring and management purposes.',
      options: {
        region: {
          displayName: 'AWS Region',
          shortDesc: 'The AWS region to list alarms from',
          longDesc:
            'Specify the AWS region where you want to list CloudWatch alarms. Defaults to us-east-1 if not specified.',
        },
        alarm_name_prefix: {
          displayName: 'Alarm Name Prefix',
          shortDesc: 'Filter alarms by name prefix',
          longDesc:
            'Optional filter to only return alarms whose names start with the specified prefix. Leave empty to list all alarms.',
        },
        state_filter: {
          displayName: 'State Filter',
          shortDesc: 'Filter by alarm state',
          longDesc:
            'Optional filter to only return alarms in a specific state (OK, ALARM, or INSUFFICIENT_DATA). Leave empty to include all states.',
        },
        max_records: {
          displayName: 'Maximum Records',
          shortDesc: 'Maximum number of alarms to return',
          longDesc:
            'Limit the number of alarms returned in the response. Default is 50, maximum is 100.',
        },
      },
    },
  },
};

export default AmazonCloudWatchAppEn;
