/* eslint-disable max-len */
const ActiveCampaignAppEn = {
  displayName: 'ActiveCampaign',
  groups: ['Email & Email Marketing'],
  shortDesc: 'Email marketing automation and CRM platform',
  longDesc: `Connect your ActiveCampaign account to automate email marketing campaigns, manage contacts, and track customer interactions. Create and send targeted email campaigns, manage contact lists, set up automation workflows, and analyze campaign performance all from within Qore.`,
  connectionMessage: {
    title: 'Connect to ActiveCampaign',
    content: `To connect your ActiveCampaign account, you will need your **Instance URL** and **API Key**.

## How to Get Your Credentials

### Instance URL
Your ActiveCampaign account instance URL (e.g., \`https://<your_account>.activehosted.com\`)

1. Go to your ActiveCampaign account settings
2. Navigate to Developer settings
3. Copy the URL value

### API Key
Your ActiveCampaign account API key for authentication

1. Go to your ActiveCampaign account settings
2. Navigate to Developer settings
3. Copy the API Key value

Both credentials can be found in the same location within your ActiveCampaign Developer settings.`,
  },
  triggers: {
    contact_added_to_list: {
      displayName: 'Contact Added to List',
      shortDesc: 'Triggers when a contact is added to a list',
      longDesc:
        'This trigger fires when a contact subscribes or is added to a specific list in ActiveCampaign',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The list to monitor for new contacts',
          longDesc: 'Select the specific list that you want to monitor for new contact additions',
        },
      },
    },
    updated_contact: {
      displayName: 'Contact Updated',
      shortDesc: 'Triggers when a contact is updated',
      longDesc: 'This trigger fires when any contact information is updated in ActiveCampaign',
    },
    new_campaign_bounce: {
      displayName: 'New Campaign Bounce',
      shortDesc: 'Triggers when a campaign email bounces',
      longDesc:
        'This trigger fires when an email from a campaign bounces, indicating delivery failure',
    },
    new_campaign_link_click: {
      displayName: 'New Campaign Link Click',
      shortDesc: 'Triggers when a link in a campaign is clicked',
      longDesc: 'This trigger fires when a recipient clicks on a link within a campaign email',
    },
    new_campaign_reply: {
      displayName: 'New Campaign Reply',
      shortDesc: 'Triggers when someone replies to a campaign',
      longDesc: 'This trigger fires when a recipient replies to a campaign email',
    },
    new_contact_note: {
      displayName: 'New Contact Note',
      shortDesc: 'Triggers when a note is added to a contact',
      longDesc: 'This trigger fires when a note is added to a contact in a specific list',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The list to monitor for new contact notes',
          longDesc: 'Select the specific list to monitor for when notes are added to contacts',
        },
      },
    },
    new_contact: {
      displayName: 'New Contact',
      shortDesc: 'Triggers when a new contact is created',
      longDesc: 'This trigger fires when a new contact subscribes or is created in ActiveCampaign',
    },
    deal_note_added: {
      displayName: 'Deal Note Added',
      shortDesc: 'Triggers when a note is added to a deal',
      longDesc: 'This trigger fires when a note is added to a deal for contacts in a specific list',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The list to monitor for deal note additions',
          longDesc: 'Select the specific list to monitor for when notes are added to deals',
        },
      },
    },
    new_deal: {
      displayName: 'New Deal',
      shortDesc: 'Triggers when a new deal is created',
      longDesc: 'This trigger fires when a new deal is created for contacts in a specific list',
      options: {
        list: {
          displayName: 'List',
          shortDesc: 'The list to monitor for new deals',
          longDesc: 'Select the specific list to monitor for when new deals are created',
        },
      },
    },
  },
  actions: {
    add_contact_note: {
      groups: ['Contact Management'],
      displayName: 'Add Contact Note',
      shortDesc: 'Add a note to a contact',
      longDesc: 'Add a new note to a specific contact in ActiveCampaign',
      options: {
        note: {
          displayName: 'Note',
          shortDesc: 'The note content to add',
          longDesc: 'The text content of the note that will be added to the contact',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to add the note to',
          longDesc: 'Select the contact that you want to add the note to',
        },
      },
    },
    add_contact_to_account: {
      groups: ['Account Management'],
      displayName: 'Add Contact to Account',
      shortDesc: 'Associate a contact with an account',
      longDesc: 'Create an association between a contact and an account in ActiveCampaign',
      options: {
        account: {
          displayName: 'Account',
          shortDesc: 'The account to associate the contact with',
          longDesc: 'Select the account that you want to associate the contact with',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to associate with the account',
          longDesc: 'Select the contact that you want to associate with the account',
        },
        jobTitle: {
          displayName: 'Job Title',
          shortDesc: "The contact's job title at this account",
          longDesc: 'Optional job title or role of the contact within the account',
        },
      },
    },
    add_deal_note: {
      groups: ['Deal Management'],
      displayName: 'Add Deal Note',
      shortDesc: 'Add a note to a deal',
      longDesc: 'Add a new note to a specific deal in ActiveCampaign',
      options: {
        note: {
          displayName: 'Note',
          shortDesc: 'The note content to add',
          longDesc: 'The text content of the note that will be added to the deal',
        },
        deal: {
          displayName: 'Deal',
          shortDesc: 'The deal to add the note to',
          longDesc: 'Select the deal that you want to add the note to',
        },
      },
    },
    add_tag_to_contact: {
      groups: ['Contact Management'],
      displayName: 'Add Tag to Contact',
      shortDesc: 'Add a tag to a contact',
      longDesc:
        'Apply a tag to a specific contact in ActiveCampaign for organization and segmentation',
      options: {
        tag: {
          displayName: 'Tag',
          shortDesc: 'The tag to add to the contact',
          longDesc: 'Select the tag that you want to apply to the contact',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to add the tag to',
          longDesc: 'Select the contact that you want to add the tag to',
        },
      },
    },
    create_account: {
      groups: ['Account Management'],
      displayName: 'Create Account',
      shortDesc: 'Create a new account',
      longDesc: 'Create a new account (company/organization) in ActiveCampaign',
      options: {
        name: {
          displayName: 'Account Name',
          shortDesc: 'The name of the account',
          longDesc: 'The name of the company or organization account',
        },
        accountUrl: {
          displayName: 'Account URL',
          shortDesc: 'The website URL of the account',
          longDesc: 'Optional website URL or domain for the account',
        },
        owner: {
          displayName: 'Account Owner',
          shortDesc: 'The user who will own this account',
          longDesc: 'Select the user who will be responsible for managing this account',
        },
        fieldOptions: {
          displayName: 'Custom Fields',
          shortDesc: 'Custom field values for the account',
          longDesc: 'Set values for any custom fields configured for accounts',
        },
      },
    },
    create_contact: {
      groups: ['Contact Management'],
      displayName: 'Create Contact',
      shortDesc: 'Create a new contact',
      longDesc:
        'Create a new contact in ActiveCampaign with basic information and custom field values',
      options: {
        email: {
          displayName: 'Email Address',
          shortDesc: "The contact's email address",
          longDesc: 'The primary email address for the contact (required)',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: "The contact's first name",
          longDesc: 'The first name of the contact',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: "The contact's last name",
          longDesc: 'The last name of the contact',
        },
        phone: {
          displayName: 'Phone Number',
          shortDesc: "The contact's phone number",
          longDesc: 'The phone number for the contact',
        },
        fieldValues: {
          displayName: 'Custom Field Values',
          shortDesc: 'Values for custom fields',
          longDesc: 'Set values for any custom fields configured for contacts',
        },
      },
    },
    create_deal: {
      groups: ['Deal Management'],
      displayName: 'Create Deal',
      shortDesc: 'Create a new deal',
      longDesc: 'Create a new sales deal in ActiveCampaign with all relevant details',
      options: {
        title: {
          displayName: 'Deal Title',
          shortDesc: 'The title of the deal',
          longDesc: 'A descriptive title for the deal',
        },
        account: {
          displayName: 'Account',
          shortDesc: 'The account associated with this deal',
          longDesc: 'Select the account/company that this deal is associated with',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The primary contact for this deal',
          longDesc: 'Select the main contact person for this deal',
        },
        value: {
          displayName: 'Deal Value',
          shortDesc: 'The monetary value of the deal',
          longDesc: 'The total value or amount of the deal',
        },
        currency: {
          displayName: 'Currency',
          shortDesc: 'The currency for the deal value',
          longDesc: 'Select the currency that the deal value is denominated in',
        },
        stage: {
          displayName: 'Deal Stage',
          shortDesc: 'The current stage of the deal',
          longDesc: 'Select the pipeline stage that represents the current status of the deal',
        },
        group: {
          displayName: 'Pipeline Group',
          shortDesc: 'The pipeline group for the deal',
          longDesc: 'Select the pipeline group that this deal belongs to',
        },
        owner: {
          displayName: 'Deal Owner',
          shortDesc: 'The user responsible for this deal',
          longDesc: 'Select the user who will be responsible for managing this deal',
        },
        percent: {
          displayName: 'Completion Percentage',
          shortDesc: 'The percentage completion of the deal',
          longDesc: 'A percentage value representing how close the deal is to completion',
        },
        description: {
          displayName: 'Deal Description',
          shortDesc: 'Additional description or notes',
          longDesc: 'Optional description or additional details about the deal',
        },
        status: {
          displayName: 'Deal Status',
          shortDesc: 'The current status of the deal',
          longDesc: 'Select whether the deal is open, won, or lost',
        },
      },
    },
    get_account: {
      groups: ['Data Retrieval'],
      displayName: 'Get Account',
      shortDesc: 'Retrieve account details',
      longDesc: 'Retrieve detailed information about a specific account in ActiveCampaign',
      options: {
        id: {
          displayName: 'Account ID',
          shortDesc: 'The ID of the account to retrieve',
          longDesc: 'Select the account that you want to get detailed information for',
        },
      },
    },
    get_campaign: {
      groups: ['Data Retrieval'],
      displayName: 'Get Campaign',
      shortDesc: 'Retrieve campaign details',
      longDesc: 'Retrieve detailed information about a specific campaign in ActiveCampaign',
      options: {
        id: {
          displayName: 'Campaign ID',
          shortDesc: 'The ID of the campaign to retrieve',
          longDesc: 'Select the campaign that you want to get detailed information for',
        },
      },
    },
    get_contact: {
      groups: ['Data Retrieval'],
      displayName: 'Get Contact',
      shortDesc: 'Retrieve contact details',
      longDesc:
        'Retrieve detailed information about a specific contact in ActiveCampaign including custom fields, automations, and related data',
      options: {
        id: {
          displayName: 'Contact ID',
          shortDesc: 'The ID of the contact to retrieve',
          longDesc: 'Select the contact that you want to get detailed information for',
        },
      },
    },
    get_deal: {
      groups: ['Data Retrieval'],
      displayName: 'Get Deal',
      shortDesc: 'Retrieve deal details',
      longDesc: 'Retrieve detailed information about a specific deal in ActiveCampaign',
      options: {
        id: {
          displayName: 'Deal ID',
          shortDesc: 'The ID of the deal to retrieve',
          longDesc: 'Select the deal that you want to get detailed information for',
        },
      },
    },
    get_form: {
      groups: ['Data Retrieval'],
      displayName: 'Get Form',
      shortDesc: 'Retrieve form details',
      longDesc:
        'Retrieve detailed information about a specific form in ActiveCampaign including styling and field configuration',
      options: {
        id: {
          displayName: 'Form ID',
          shortDesc: 'The ID of the form to retrieve',
          longDesc: 'Select the form that you want to get detailed information for',
        },
      },
    },
    get_list: {
      groups: ['Data Retrieval'],
      displayName: 'Get List',
      shortDesc: 'Retrieve list details',
      longDesc:
        'Retrieve detailed information about a specific list in ActiveCampaign including settings and configuration',
      options: {
        id: {
          displayName: 'List ID',
          shortDesc: 'The ID of the list to retrieve',
          longDesc: 'Select the list that you want to get detailed information for',
        },
      },
    },
    get_task: {
      groups: ['Data Retrieval'],
      displayName: 'Get Task',
      shortDesc: 'Retrieve task details',
      longDesc: 'Retrieve detailed information about a specific deal task in ActiveCampaign',
      options: {
        id: {
          displayName: 'Task ID',
          shortDesc: 'The ID of the task to retrieve',
          longDesc: 'Select the task that you want to get detailed information for',
        },
      },
    },
    get_user: {
      groups: ['Data Retrieval'],
      displayName: 'Get User',
      shortDesc: 'Retrieve user details',
      longDesc: 'Retrieve detailed information about a specific user in ActiveCampaign',
      options: {
        id: {
          displayName: 'User ID',
          shortDesc: 'The ID of the user to retrieve',
          longDesc: 'Select the user that you want to get detailed information for',
        },
      },
    },
    list_accounts: {
      groups: ['Data Retrieval'],
      displayName: 'List Accounts',
      shortDesc: 'Retrieve a list of accounts',
      longDesc:
        'Retrieve a paginated list of accounts in ActiveCampaign with optional search and filtering',
      options: {
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter accounts',
          longDesc: 'Search for accounts by name or other searchable fields',
        },
        count_deals: {
          displayName: 'Count Deals',
          shortDesc: 'Include deal count for each account',
          longDesc:
            'Whether to include the number of deals associated with each account in the response',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of accounts to return',
          longDesc: 'The maximum number of accounts to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of accounts to skip',
          longDesc: 'The number of accounts to skip for pagination',
        },
      },
    },
    list_campaigns: {
      groups: ['Data Retrieval'],
      displayName: 'List Campaigns',
      shortDesc: 'Retrieve a list of campaigns',
      longDesc: 'Retrieve a paginated list of campaigns in ActiveCampaign',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of campaigns to return',
          longDesc: 'The maximum number of campaigns to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of campaigns to skip',
          longDesc: 'The number of campaigns to skip for pagination',
        },
      },
    },
    list_contacts: {
      groups: ['Data Retrieval'],
      displayName: 'List Contacts',
      shortDesc: 'Retrieve a list of contacts',
      longDesc:
        'Retrieve a paginated list of contacts in ActiveCampaign with extensive filtering and sorting options',
      options: {
        email: {
          displayName: 'Email',
          shortDesc: 'Exact email address to search for',
          longDesc: 'Filter contacts by exact email address match',
        },
        email_like: {
          displayName: 'Email Like',
          shortDesc: 'Partial email address to search for',
          longDesc: 'Filter contacts by partial email address match',
        },
        phone: {
          displayName: 'Phone',
          shortDesc: 'Phone number to search for',
          longDesc: 'Filter contacts by phone number',
        },
        search: {
          displayName: 'Search',
          shortDesc: 'General search term',
          longDesc: 'Search for contacts by name, email, or other searchable fields',
        },
        status: {
          displayName: 'Status',
          shortDesc: 'Contact status filter',
          longDesc: 'Filter contacts by their subscription status',
        },
        formid: {
          displayName: 'Form ID',
          shortDesc: 'Filter by form subscription',
          longDesc: 'Filter contacts who subscribed through a specific form',
        },
        listid: {
          displayName: 'List ID',
          shortDesc: 'Filter by list membership',
          longDesc: 'Filter contacts who are members of a specific list',
        },
        sort: {
          displayName: 'Sort Options',
          shortDesc: 'Sorting configuration',
          longDesc: 'Configure how to sort the contact results',
          type: {
            fields: {
              field: {
                displayName: 'Sort Field',
                shortDesc: 'Field to sort by',
                longDesc: 'The field to use for sorting the contacts',
              },
              order: {
                displayName: 'Sort Order',
                shortDesc: 'Sort direction',
                longDesc: 'Whether to sort in ascending or descending order',
              },
            },
          },
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of contacts to return',
          longDesc: 'The maximum number of contacts to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of contacts to skip',
          longDesc: 'The number of contacts to skip for pagination',
        },
      },
    },
    list_deals: {
      groups: ['Data Retrieval'],
      displayName: 'List Deals',
      shortDesc: 'Retrieve a list of deals',
      longDesc:
        'Retrieve a paginated list of deals in ActiveCampaign with optional search functionality',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of deals to return',
          longDesc: 'The maximum number of deals to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of deals to skip',
          longDesc: 'The number of deals to skip for pagination',
        },
        search: {
          displayName: 'Search Options',
          shortDesc: 'Search configuration for deals',
          longDesc: 'Configure how to search for deals by different fields',
          type: {
            fields: {
              field: {
                displayName: 'Search Field',
                shortDesc: 'Field to search in',
                longDesc: 'The field to search in (title, contact, organization, or all)',
              },
              value: {
                displayName: 'Search Value',
                shortDesc: 'Value to search for',
                longDesc: 'The search term to look for in the specified field',
              },
            },
          },
        },
      },
    },
    list_deal_stages: {
      groups: ['Data Retrieval'],
      displayName: 'List Deal Stages',
      shortDesc: 'Retrieve a list of deal stages',
      longDesc: 'Retrieve a paginated list of deal stages (pipeline stages) in ActiveCampaign',
      options: {
        title: {
          displayName: 'Title',
          shortDesc: 'Filter by stage title',
          longDesc: 'Filter deal stages by their title',
        },
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of stages to return',
          longDesc: 'The maximum number of deal stages to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of stages to skip',
          longDesc: 'The number of deal stages to skip for pagination',
        },
      },
    },
    list_forms: {
      groups: ['Data Retrieval'],
      displayName: 'List Forms',
      shortDesc: 'Retrieve a list of forms',
      longDesc: 'Retrieve a paginated list of forms in ActiveCampaign',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of forms to return',
          longDesc: 'The maximum number of forms to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of forms to skip',
          longDesc: 'The number of forms to skip for pagination',
        },
      },
    },
    list_lists: {
      groups: ['Data Retrieval'],
      displayName: 'List Lists',
      shortDesc: 'Retrieve a list of lists',
      longDesc:
        'Retrieve a paginated list of contact lists in ActiveCampaign with optional name filtering',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of lists to return',
          longDesc: 'The maximum number of lists to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of lists to skip',
          longDesc: 'The number of lists to skip for pagination',
        },
        name: {
          displayName: 'Name',
          shortDesc: 'Filter by list name',
          longDesc: 'Filter lists by their name',
        },
      },
    },
    list_tags: {
      groups: ['Data Retrieval'],
      displayName: 'List Tags',
      shortDesc: 'Retrieve a list of tags',
      longDesc:
        'Retrieve a paginated list of tags in ActiveCampaign with optional search functionality',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of tags to return',
          longDesc: 'The maximum number of tags to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of tags to skip',
          longDesc: 'The number of tags to skip for pagination',
        },
        search: {
          displayName: 'Search',
          shortDesc: 'Search term to filter tags',
          longDesc: 'Search for tags by name or description',
        },
      },
    },
    list_tasks: {
      groups: ['Data Retrieval'],
      displayName: 'List Tasks',
      shortDesc: 'Retrieve a list of tasks',
      longDesc: 'Retrieve a paginated list of deal tasks in ActiveCampaign with filtering options',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of tasks to return',
          longDesc: 'The maximum number of tasks to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of tasks to skip',
          longDesc: 'The number of tasks to skip for pagination',
        },
        assignee: {
          displayName: 'Assignee',
          shortDesc: 'Filter by task assignee',
          longDesc: 'Filter tasks by the user they are assigned to',
        },
        userid: {
          displayName: 'User ID',
          shortDesc: 'Filter by task creator',
          longDesc: 'Filter tasks by the user who created them',
        },
        title: {
          displayName: 'Title',
          shortDesc: 'Filter by task title',
          longDesc: 'Filter tasks by their title',
        },
      },
    },
    list_users: {
      groups: ['Data Retrieval'],
      displayName: 'List Users',
      shortDesc: 'Retrieve a list of users',
      longDesc: 'Retrieve a paginated list of users in ActiveCampaign',
      options: {
        limit: {
          displayName: 'Limit',
          shortDesc: 'Maximum number of users to return',
          longDesc: 'The maximum number of users to return per page (default: 20)',
        },
        offset: {
          displayName: 'Offset',
          shortDesc: 'Number of users to skip',
          longDesc: 'The number of users to skip for pagination',
        },
      },
    },
    remove_tag_from_contact: {
      groups: ['Contact Management'],
      displayName: 'Remove Tag from Contact',
      shortDesc: 'Remove a tag from a contact',
      longDesc: 'Remove a specific tag from a contact in ActiveCampaign',
      options: {
        tag: {
          displayName: 'Tag',
          shortDesc: 'The tag to remove from the contact',
          longDesc: 'Select the tag that you want to remove from the contact',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The contact to remove the tag from',
          longDesc: 'Select the contact that you want to remove the tag from',
        },
      },
    },
    update_account: {
      groups: ['Account Management'],
      displayName: 'Update Account',
      shortDesc: 'Update an existing account',
      longDesc: 'Update the information of an existing account in ActiveCampaign',
      options: {
        id: {
          displayName: 'Account ID',
          shortDesc: 'The ID of the account to update',
          longDesc: 'Select the account that you want to update',
        },
        name: {
          displayName: 'Account Name',
          shortDesc: 'The updated name of the account',
          longDesc: 'The new name for the company or organization account',
        },
        accountUrl: {
          displayName: 'Account URL',
          shortDesc: 'The updated website URL of the account',
          longDesc: 'The new website URL or domain for the account',
        },
        owner: {
          displayName: 'Account Owner',
          shortDesc: 'The updated owner of the account',
          longDesc: 'Select the user who will be responsible for managing this account',
        },
        fieldOptions: {
          displayName: 'Custom Fields',
          shortDesc: 'Updated custom field values for the account',
          longDesc: 'Update values for any custom fields configured for accounts',
        },
      },
    },
    update_contact: {
      groups: ['Contact Management'],
      displayName: 'Update Contact',
      shortDesc: 'Update an existing contact',
      longDesc:
        'Update the information of an existing contact in ActiveCampaign including basic information and custom field values',
      options: {
        id: {
          displayName: 'Contact ID',
          shortDesc: 'The ID of the contact to update',
          longDesc: 'Select the contact that you want to update',
        },
        email: {
          displayName: 'Email Address',
          shortDesc: 'The updated email address',
          longDesc: 'The new email address for the contact',
        },
        firstName: {
          displayName: 'First Name',
          shortDesc: 'The updated first name',
          longDesc: 'The new first name of the contact',
        },
        lastName: {
          displayName: 'Last Name',
          shortDesc: 'The updated last name',
          longDesc: 'The new last name of the contact',
        },
        phone: {
          displayName: 'Phone Number',
          shortDesc: 'The updated phone number',
          longDesc: 'The new phone number for the contact',
        },
        fieldValues: {
          displayName: 'Custom Field Values',
          shortDesc: 'Updated values for custom fields',
          longDesc: 'Update values for any custom fields configured for contacts',
        },
      },
    },
    update_deal: {
      groups: ['Deal Management'],
      displayName: 'Update Deal',
      shortDesc: 'Update an existing deal',
      longDesc: 'Update the information of an existing sales deal in ActiveCampaign',
      options: {
        id: {
          displayName: 'Deal ID',
          shortDesc: 'The ID of the deal to update',
          longDesc: 'Select the deal that you want to update',
        },
        title: {
          displayName: 'Deal Title',
          shortDesc: 'The updated title of the deal',
          longDesc: 'The new descriptive title for the deal',
        },
        account: {
          displayName: 'Account',
          shortDesc: 'The updated account associated with this deal',
          longDesc: 'Select the new account/company that this deal is associated with',
        },
        contact: {
          displayName: 'Contact',
          shortDesc: 'The updated primary contact for this deal',
          longDesc: 'Select the new main contact person for this deal',
        },
        value: {
          displayName: 'Deal Value',
          shortDesc: 'The updated monetary value of the deal',
          longDesc: 'The new total value or amount of the deal',
        },
        currency: {
          displayName: 'Currency',
          shortDesc: 'The updated currency for the deal value',
          longDesc: 'Select the new currency that the deal value is denominated in',
        },
        stage: {
          displayName: 'Deal Stage',
          shortDesc: 'The updated stage of the deal',
          longDesc: 'Select the new pipeline stage that represents the current status of the deal',
        },
        group: {
          displayName: 'Pipeline Group',
          shortDesc: 'The updated pipeline group for the deal',
          longDesc: 'Select the new pipeline group that this deal belongs to',
        },
        owner: {
          displayName: 'Deal Owner',
          shortDesc: 'The updated user responsible for this deal',
          longDesc: 'Select the new user who will be responsible for managing this deal',
        },
        percent: {
          displayName: 'Completion Percentage',
          shortDesc: 'The updated percentage completion of the deal',
          longDesc: 'The new percentage value representing how close the deal is to completion',
        },
        description: {
          displayName: 'Deal Description',
          shortDesc: 'Updated description or notes',
          longDesc: 'New description or additional details about the deal',
        },
        status: {
          displayName: 'Deal Status',
          shortDesc: 'The updated status of the deal',
          longDesc: 'Select whether the deal is open, won, or lost',
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
};

export default ActiveCampaignAppEn;
