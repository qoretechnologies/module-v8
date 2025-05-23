

const MailchimpAppEn = {
  displayName: 'Mailchimp',
  shortDesc: 'Email marketing, automation, and analytics platform',
  longDesc:
    'Connect with Mailchimp to create and manage email campaigns, track subscriber activities, and automate marketing workflows.',
  triggers: {
    email_opened: {
      displayName: 'Email Opened',
      shortDesc: 'Triggers when a subscriber opens an email',
      longDesc:
        'This trigger fires whenever a subscriber opens an email from your campaigns or automation workflows.',
      options: {
        audience: {
          displayName: 'Audience',
          shortDesc: 'Select the audience to monitor',
          longDesc: 'Choose which Mailchimp audience (mailing list) to track for email opens.',
        },
        campaign_type: {
          displayName: 'Campaign Type',
          shortDesc: 'Type of campaign to monitor',
          longDesc: 'Specify whether to track regular campaigns, automations.',
        },
        trigger_on_subscriber: {
          displayName: 'Trigger on Subscriber',
          shortDesc: 'Trigger for specific subscribers only',
          longDesc:
            'Optionally specify one or more email addresses to only trigger for these specific subscribers.',
        },
        campaign: {
          displayName: 'Campaign',
          shortDesc: 'Select a specific campaign',
          longDesc:
            'Choose a specific campaign to monitor for opens. Leave blank to monitor all campaigns.',
        },
        workflow_id: {
          displayName: 'Workflow ID',
          shortDesc: 'Automation workflow ID',
          longDesc: 'If monitoring an automation, specify the workflow ID to track.',
        },
        automation_email: {
          displayName: 'Automation Email',
          shortDesc: 'Specific automation email',
          longDesc: 'Select a specific email within an automation workflow to monitor.',
        },
      },
    },
    new_unsubscriber: {
      displayName: 'New Unsubscriber',
      shortDesc: 'Triggers when someone unsubscribes',
      longDesc: 'This trigger fires whenever a contact unsubscribes from your Mailchimp audience.',
      options: {
        audience: {
          displayName: 'Audience',
          shortDesc: 'Select the audience to monitor',
          longDesc: 'Choose which Mailchimp audience to track for unsubscribes.',
        },
      },
    },
    new_subscriber: {
      displayName: 'New Subscriber',
      shortDesc: 'Triggers when a new subscriber joins',
      longDesc: 'This trigger fires whenever a new contact subscribes to your Mailchimp audience.',
      options: {
        audience: {
          displayName: 'Audience',
          shortDesc: 'Select the audience to monitor',
          longDesc: 'Choose which Mailchimp audience to track for new subscribers.',
        },
      },
    },
  },
};

export default MailchimpAppEn;
