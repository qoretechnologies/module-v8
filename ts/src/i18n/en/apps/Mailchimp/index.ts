/* eslint-disable max-len */
const MailchimpAppEn = {
  displayName: 'Mailchimp',
  groups: ['Email & Email Marketing'],
  shortDesc: 'Email marketing, automation, and analytics platform',
  longDesc:
    'Connect with Mailchimp to create and manage email campaigns, track subscriber activities, and automate marketing workflows.',
  actions: {
    getCampaigns: {
      groups: ['Campaigns'],
      displayName: 'Get Campaigns',
      shortDesc: 'Retrieve a list of email campaigns',
      longDesc:
        'Fetches all email campaigns from your Mailchimp account with their details including status, settings, and performance metrics.',
    },
    postCampaigns: {
      groups: ['Campaigns'],
      displayName: 'Create Campaign',
      shortDesc: 'Create a new email campaign',
      longDesc:
        'Creates a new email campaign in Mailchimp with specified settings, content, and audience targeting options.',
    },
    postCampaignsIdActionsSend: {
      groups: ['Campaigns'],
      displayName: 'Send Campaign',
      shortDesc: 'Send an email campaign',
      longDesc:
        'Sends a previously created email campaign to its targeted audience immediately or schedules it for later delivery.',
    },
    postLists: {
      groups: ['Audiences'],
      displayName: 'Create Audience',
      shortDesc: 'Create a new audience',
      longDesc:
        'Creates a new audience (mailing list) in Mailchimp with specified settings and configuration options.',
    },
    searchTagsByName: {
      groups: ['Tags'],
      displayName: 'Search Tags by Name',
      shortDesc: 'Search for tags by name',
      longDesc:
        'Searches for subscriber tags by name to help organize and segment your audience members.',
    },
    getListsIdMembers: {
      groups: ['Members'],
      displayName: 'Get Audience Members',
      shortDesc: 'Retrieve members from an audience',
      longDesc:
        'Fetches all members (subscribers) from a specific audience with their contact information and subscription details.',
    },
    postListsIdMembers: {
      groups: ['Members'],
      displayName: 'Add Audience Member',
      shortDesc: 'Add a new member to an audience',
      longDesc:
        'Adds a new subscriber to a specific audience with their contact information and subscription preferences.',
    },
    getListsIdMembersId: {
      groups: ['Members'],
      displayName: 'Get Audience Member',
      shortDesc: 'Retrieve a specific audience member',
      longDesc:
        'Fetches detailed information about a specific member (subscriber) from an audience including their profile and activity data.',
    },
    putListsIdMembersId: {
      groups: ['Members'],
      displayName: 'Update Audience Member',
      shortDesc: 'Update an audience member',
      longDesc:
        'Updates the information and subscription preferences of an existing member in an audience.',
    },
    deleteListsIdMembersId: {
      groups: ['Members'],
      displayName: 'Remove Audience Member',
      shortDesc: 'Remove a member from an audience',
      longDesc:
        'Removes a subscriber from an audience while preserving their data for compliance purposes.',
    },
    postListMemberTags: {
      groups: ['Tags'],
      displayName: 'Add Member Tags',
      shortDesc: 'Add tags to audience members',
      longDesc:
        'Adds one or more tags to audience members for better segmentation and organization.',
    },
    postListMemberEvents: {
      groups: ['Events'],
      displayName: 'Add Member Events',
      shortDesc: 'Add events to audience members',
      longDesc:
        'Records custom events for audience members to track their behavior and interactions with your brand.',
    },
    postListsIdMembersIdNotes: {
      groups: ['Notes'],
      displayName: 'Add Member Note',
      shortDesc: 'Add a note to an audience member',
      longDesc:
        'Adds a note to a specific audience member for internal tracking and customer relationship management.',
    },
    patchListsIdMembersIdNotesId: {
      groups: ['Notes'],
      displayName: 'Update Member Note',
      shortDesc: 'Update an audience member note',
      longDesc:
        'Updates an existing note attached to an audience member with new information or corrections.',
    },
    deleteListsIdMembersIdNotesId: {
      groups: ['Notes'],
      displayName: 'Delete Member Note',
      shortDesc: 'Delete an audience member note',
      longDesc: "Permanently removes a note from an audience member's profile.",
    },
    postListsIdMembersHashActionsDeletePermanent: {
      groups: ['Members'],
      displayName: 'Permanently Delete Member',
      shortDesc: 'Permanently delete an audience member',
      longDesc:
        'Permanently removes an audience member and all their associated data from Mailchimp. This action cannot be undone.',
    },
    getReports: {
      groups: ['Campaigns'],
      displayName: 'Get Campaign Reports',
      shortDesc: 'Retrieve campaign performance reports',
      longDesc:
        'Fetches performance reports for your email campaigns including open rates, click rates, and engagement metrics.',
    },
    getReportsId: {
      groups: ['Campaigns'],
      displayName: 'Get Campaign Report',
      shortDesc: 'Retrieve a specific campaign report',
      longDesc: 'Fetches detailed performance metrics and analytics for a specific email campaign.',
    },
    getReportsIdClickDetails: {
      groups: ['Campaigns'],
      displayName: 'Get Campaign Click Details',
      shortDesc: 'Retrieve click details for a campaign',
      longDesc:
        'Fetches detailed information about clicks in a specific campaign including which links were clicked and by whom.',
    },
    getEcommerceStoresIdCustomersId: {
      groups: ['Store'],
      displayName: 'Get Store Customer',
      shortDesc: 'Retrieve a specific store customer',
      longDesc:
        'Fetches detailed information about a specific customer from your connected e-commerce store.',
    },
    getSearchCampaigns: {
      groups: ['Campaigns'],
      displayName: 'Search Campaigns',
      shortDesc: 'Search for campaigns',
      longDesc:
        'Searches through your email campaigns using various criteria to find specific campaigns quickly.',
    },
    getSearchMembers: {
      groups: ['Members'],
      displayName: 'Search Audience Members',
      shortDesc: 'Search for audience members',
      longDesc:
        'Searches through audience members using various criteria such as email, name, or tags to find specific subscribers.',
    },
  },
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
  expressions: {
    '&&': {
      displayName: 'And',
      shortDesc: 'Logical AND operator',
      longDesc: 'Combines multiple conditions where all must be true',
    },
    '||': {
      displayName: 'Or',
      shortDesc: 'Logical OR operator',
      longDesc: 'Combines multiple conditions where at least one must be true',
    },
    '==': {
      displayName: 'Equals',
      shortDesc: 'Field equals value',
      longDesc: 'Matches records where the field equals the specified value',
    },
    '!=': {
      displayName: 'Not Equals',
      shortDesc: 'Field does not equal value',
      longDesc: 'Matches records where the field does not equal the specified value',
    },
    '>': {
      displayName: 'Greater Than',
      shortDesc: 'Field is greater than value',
      longDesc: 'Matches records where the field value is greater than the specified value',
    },
    '>=': {
      displayName: 'Greater Than or Equal',
      shortDesc: 'Field is greater than or equal to value',
      longDesc: 'Matches records where the field value is greater than or equal to the specified value',
    },
    '<': {
      displayName: 'Less Than',
      shortDesc: 'Field is less than value',
      longDesc: 'Matches records where the field value is less than the specified value',
    },
    '<=': {
      displayName: 'Less Than or Equal',
      shortDesc: 'Field is less than or equal to value',
      longDesc: 'Matches records where the field value is less than or equal to the specified value',
    },
    'is-set': {
      displayName: 'Is Set',
      shortDesc: 'Field has a value',
      longDesc: 'Matches records where the field has a value (is not empty)',
    },
    'is-not-set': {
      displayName: 'Is Not Set',
      shortDesc: 'Field has no value',
      longDesc: 'Matches records where the field has no value (is empty)',
    },
    contains: {
      displayName: 'Contains',
      shortDesc: 'Field contains value',
      longDesc: 'Matches records where the field contains the specified substring',
    },
  },
  searchOptions: {
    orderBy: {
      displayName: 'Order By',
      shortDesc: 'Sort results by a specific field',
      longDesc: 'Define the field and direction to sort search results',
      type: {
        fields: {
          field: {
            displayName: 'Field',
            shortDesc: 'The field to sort by',
            longDesc: 'The name of the field to use for sorting results',
          },
          direction: {
            displayName: 'Direction',
            shortDesc: 'Sort direction',
            longDesc: 'The direction to sort results (ascending or descending)',
          },
        },
      },
    },
  },
};

export default MailchimpAppEn;
